import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateShapeProfile } from "@/lib/scoring";
import {
  toShapeProfileData,
  toShapeProfileJson,
} from "@/lib/profile-mapper";
import { ReportClient } from "@/app/dashboard/report/[id]/report-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  let assessment = await db.assessment.findFirst({
    where: { id },
    include: {
      shapeProfile: true,
      aiInsight: true,
      callingProfile: true,
      responses: { include: { question: true } },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          church: { select: { name: true } },
        },
      },
    },
  });

  if (!assessment) redirect("/admin/reports");

  if (assessment.status === "IN_PROGRESS") {
    redirect("/admin/reports");
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
      include: {
        shapeProfile: true,
        aiInsight: true,
        callingProfile: true,
        responses: { include: { question: true } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            church: { select: { name: true } },
          },
        },
      },
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

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link href="/admin/reports">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke daftar
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            {assessment.user.email}
            {assessment.user.church?.name
              ? ` · ${assessment.user.church.name}`
              : ""}
            {" · "}
            Diperbarui {formatDate(assessment.updatedAt)}
          </p>
        </div>
        {!aiInsight || !callingProfile ? (
          <p className="text-xs text-muted-foreground max-w-sm">
            Analisis AI belum tersedia. User dapat membuka laporan mereka untuk
            menghasilkan insight, atau gunakan regenerasi dari sisi user.
          </p>
        ) : null}
      </div>

      <ReportClient
        assessmentId={id}
        profile={profile}
        aiInsight={aiInsight}
        callingProfile={callingProfile}
        autoGenerate={false}
        subjectName={assessment.user.name}
      />
    </div>
  );
}
