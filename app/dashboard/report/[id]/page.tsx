import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateShapeProfile } from "@/lib/scoring";
import {
  toShapeProfileData,
  toShapeProfileJson,
} from "@/lib/profile-mapper";
import { canViewAssessment, canMentorAssessment } from "@/lib/access";
import { ReportClient } from "./report-client";

const reportInclude = {
  shapeProfile: true,
  aiInsight: true,
  callingProfile: true,
  openEnded: true,
  responses: { include: { question: true } },
  user: { select: { id: true, name: true, email: true, churchId: true } },
} as const;

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let assessment = await db.assessment.findFirst({
    where: { id },
    include: reportInclude,
  });

  if (!assessment || !canViewAssessment(user, assessment)) {
    redirect(user.role === "ADMIN" ? "/admin/reports" : "/dashboard");
  }

  if (assessment.status === "IN_PROGRESS") {
    if (assessment.userId !== user.id) {
      redirect(user.role === "LEADER" ? "/church/members" : "/dashboard");
    }
    redirect(`/dashboard/assessment/${id}`);
  }

  if (!assessment.shapeProfile && assessment.responses.length > 0) {
    const profileData = calculateShapeProfile(assessment.responses);
    await db.shapeProfile.create({
      data: {
        assessmentId: id,
        ...toShapeProfileJson(profileData),
      },
    });
    assessment = (await db.assessment.findFirst({
      where: { id },
      include: reportInclude,
    }))!;
  }

  const profile = assessment.shapeProfile
    ? toShapeProfileData(assessment.shapeProfile)
    : null;

  const aiInsight = assessment.aiInsight
    ? {
        summary: assessment.aiInsight.summary,
        strengths: assessment.aiInsight.strengths as unknown as string[],
        ministryRecommendations: assessment.aiInsight
          .ministryRecommendations as unknown as string[],
        growthSuggestions: assessment.aiInsight
          .growthSuggestions as unknown as string[],
        reflectionQuestions: assessment.aiInsight
          .reflectionQuestions as unknown as string[],
      }
    : null;

  const callingProfile = assessment.callingProfile
    ? {
        designSummary: assessment.callingProfile.designSummary,
        callingClusters: assessment.callingProfile
          .callingClusters as unknown as string[],
        environmentalFit: assessment.callingProfile
          .environmentalFit as unknown as string[],
        lifePatternInsight: assessment.callingProfile.lifePatternInsight,
        reflectionQuestions: assessment.callingProfile
          .reflectionQuestions as unknown as string[],
        developmentPath: assessment.callingProfile
          .developmentPath as unknown as string[],
      }
    : null;

  const isOwner = assessment.userId === user.id;
  const canMentor = canMentorAssessment(user, assessment);

  const siblings = await db.assessment.findMany({
    where: {
      userId: assessment.userId,
      status: { in: ["COMPLETED", "ANALYZED"] },
    },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const other = siblings.filter((s) => s.id !== id);
  const compareHref =
    other.length > 0
      ? `/dashboard/compare?a=${siblings[0].id}&b=${siblings[siblings.length - 1].id}`
      : null;

  return (
    <ReportClient
      assessmentId={id}
      profile={profile}
      aiInsight={aiInsight}
      callingProfile={callingProfile}
      autoGenerate={isOwner}
      subjectName={!isOwner ? assessment.user.name : null}
      stories={assessment.openEnded.map((s) => ({
        promptKey: s.promptKey,
        text: s.text,
      }))}
      canMentor={canMentor}
      isOwner={isOwner}
      compareHref={compareHref}
    />
  );
}
