import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateShapeProfile } from "@/lib/scoring";
import { ShapeProfileData } from "@/types";
import { ReportClient } from "./report-client";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let assessment = await db.assessment.findFirst({
    where: { id, userId: user.id },
    include: {
      shapeProfile: true,
      aiInsight: true,
      callingProfile: true,
      responses: { include: { question: true } },
    },
  });

  if (!assessment) redirect("/dashboard");

  if (assessment.status === "IN_PROGRESS") {
    redirect(`/dashboard/assessment/${id}`);
  }

  // Calculate profile if not yet calculated
  if (!assessment.shapeProfile && assessment.responses.length > 0) {
    const profileData = calculateShapeProfile(assessment.responses);
    await db.shapeProfile.create({
      data: {
        assessmentId: id,
        spiritualGifts: JSON.parse(
          JSON.stringify(profileData.spiritualGifts),
        ) as Prisma.InputJsonValue,
        heart: JSON.parse(
          JSON.stringify(profileData.heart),
        ) as Prisma.InputJsonValue,
        abilities: JSON.parse(
          JSON.stringify(profileData.abilities),
        ) as Prisma.InputJsonValue,
        personality: JSON.parse(
          JSON.stringify(profileData.personality),
        ) as Prisma.InputJsonValue,
        experience: JSON.parse(
          JSON.stringify(profileData.experience),
        ) as Prisma.InputJsonValue,
      },
    });
    assessment = (await db.assessment.findFirst({
      where: { id, userId: user.id },
      include: {
        shapeProfile: true,
        aiInsight: true,
        callingProfile: true,
        responses: { include: { question: true } },
      },
    }))!;
  }

  const profile = assessment.shapeProfile
    ? {
        spiritualGifts: assessment.shapeProfile
          .spiritualGifts as unknown as ShapeProfileData["spiritualGifts"],
        heart: assessment.shapeProfile
          .heart as unknown as ShapeProfileData["heart"],
        abilities: assessment.shapeProfile
          .abilities as unknown as ShapeProfileData["abilities"],
        personality: assessment.shapeProfile
          .personality as unknown as ShapeProfileData["personality"],
        experience: assessment.shapeProfile
          .experience as unknown as ShapeProfileData["experience"],
      }
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

  return (
    <ReportClient
      assessmentId={id}
      profile={profile}
      aiInsight={aiInsight}
      callingProfile={callingProfile}
    />
  );
}
