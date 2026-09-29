import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loadAuthorizedAssessment } from "@/lib/access";

export const maxDuration = 300;

/**
 * POST /api/ai/status/[assessmentId] is GET-only.
 * GET: poll job + persisted AI results. Safe for Vercel — no Mistral wait.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assessmentId } = await params;

  const access = await loadAuthorizedAssessment(assessmentId, user);
  if (!access) {
    return NextResponse.json(
      { error: "Assessment tidak ditemukan" },
      { status: 404 },
    );
  }

  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      status: true,
      aiInsight: {
        select: {
          summary: true,
          strengths: true,
          ministryRecommendations: true,
          growthSuggestions: true,
          reflectionQuestions: true,
        },
      },
      callingProfile: {
        select: {
          designSummary: true,
          callingClusters: true,
          environmentalFit: true,
          lifePatternInsight: true,
          reflectionQuestions: true,
          developmentPath: true,
        },
      },
      aiJobs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          phase: true,
          error: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json(
      { error: "Assessment tidak ditemukan" },
      { status: 404 },
    );
  }

  const job = assessment.aiJobs[0] ?? null;
  const hasInsight = !!assessment.aiInsight;
  const hasCalling = !!assessment.callingProfile;

  if (hasInsight && hasCalling) {
    return NextResponse.json({
      status: "DONE",
      jobStatus: job?.status ?? "COMPLETED",
      phase: "done",
      jobId: job?.id ?? null,
      aiInsight: assessment.aiInsight,
      callingProfile: assessment.callingProfile,
    });
  }

  if (job?.status === "FAILED") {
    return NextResponse.json({
      status: "FAILED",
      jobStatus: "FAILED",
      phase: job.phase,
      jobId: job.id,
      error: job.error,
      hasInsight,
      hasCalling,
      aiInsight: assessment.aiInsight,
      callingProfile: assessment.callingProfile,
    });
  }

  if (hasInsight || hasCalling || job?.status === "PROCESSING" || job?.status === "PENDING") {
    const phase =
      job?.phase ?? (hasInsight ? "calling" : "analysis");
    return NextResponse.json({
      status: "ANALYZING",
      jobStatus: job?.status ?? "PENDING",
      phase,
      jobId: job?.id ?? null,
      hasInsight,
      hasCalling,
    });
  }

  return NextResponse.json({
    status: "PENDING",
    jobStatus: job?.status ?? null,
    jobId: job?.id ?? null,
  });
}
