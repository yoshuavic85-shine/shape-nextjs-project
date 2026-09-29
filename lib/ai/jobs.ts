import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { generateWithRetry } from "@/lib/ai/ollama";
import {
  buildAnalysisPrompt,
  buildCallingPrompt,
  buildFullReportPrompt,
} from "@/lib/ai/analysis-prompt";
import { loadStories } from "@/lib/ai/load-stories";
import {
  AiInsightSchema,
  CallingProfileSchema,
  FullReportSchema,
} from "@/lib/ai/schemas";
import { toShapeProfileData } from "@/lib/profile-mapper";

const STALE_MS = 90 * 1000;

async function persistInsight(
  assessmentId: string,
  parsed: {
    summary: string;
    strengths: string[];
    ministryRecommendations: string[];
    growthSuggestions: string[];
    reflectionQuestions: string[];
  },
  rawResponse: string,
) {
  await db.aiInsight.upsert({
    where: { assessmentId },
    update: {
      summary: parsed.summary,
      strengths: parsed.strengths as unknown as Prisma.InputJsonValue,
      ministryRecommendations:
        parsed.ministryRecommendations as unknown as Prisma.InputJsonValue,
      growthSuggestions:
        parsed.growthSuggestions as unknown as Prisma.InputJsonValue,
      reflectionQuestions:
        parsed.reflectionQuestions as unknown as Prisma.InputJsonValue,
      rawResponse,
    },
    create: {
      assessmentId,
      summary: parsed.summary,
      strengths: parsed.strengths as unknown as Prisma.InputJsonValue,
      ministryRecommendations:
        parsed.ministryRecommendations as unknown as Prisma.InputJsonValue,
      growthSuggestions:
        parsed.growthSuggestions as unknown as Prisma.InputJsonValue,
      reflectionQuestions:
        parsed.reflectionQuestions as unknown as Prisma.InputJsonValue,
      rawResponse,
    },
  });
}

async function persistCalling(
  assessmentId: string,
  parsed: {
    designSummary: string;
    callingClusters: string[];
    environmentalFit: string[];
    lifePatternInsight: string;
    reflectionQuestions: string[];
    developmentPath: string[];
  },
  rawResponse: string,
) {
  await db.callingProfile.upsert({
    where: { assessmentId },
    update: {
      designSummary: parsed.designSummary,
      callingClusters: parsed.callingClusters as unknown as Prisma.InputJsonValue,
      environmentalFit:
        parsed.environmentalFit as unknown as Prisma.InputJsonValue,
      lifePatternInsight: parsed.lifePatternInsight,
      reflectionQuestions:
        parsed.reflectionQuestions as unknown as Prisma.InputJsonValue,
      developmentPath: parsed.developmentPath as unknown as Prisma.InputJsonValue,
      rawResponse,
    },
    create: {
      assessmentId,
      designSummary: parsed.designSummary,
      callingClusters: parsed.callingClusters as unknown as Prisma.InputJsonValue,
      environmentalFit:
        parsed.environmentalFit as unknown as Prisma.InputJsonValue,
      lifePatternInsight: parsed.lifePatternInsight,
      reflectionQuestions:
        parsed.reflectionQuestions as unknown as Prisma.InputJsonValue,
      developmentPath: parsed.developmentPath as unknown as Prisma.InputJsonValue,
      rawResponse,
    },
  });
}

export async function enqueueAiJob(
  assessmentId: string,
  opts?: { force?: boolean },
) {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: { shapeProfile: true, aiInsight: true, callingProfile: true },
  });
  if (!assessment?.shapeProfile) {
    throw new Error(
      "Profil SHAPE belum tersedia. Silakan selesaikan assessment terlebih dahulu.",
    );
  }

  if (
    !opts?.force &&
    assessment.aiInsight &&
    assessment.callingProfile
  ) {
    const existing = await db.aiJob.findFirst({
      where: { assessmentId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });
    return {
      job:
        existing ??
        (await db.aiJob.create({
          data: {
            assessmentId,
            status: "COMPLETED",
            phase: "done",
            completedAt: new Date(),
          },
        })),
      alreadyDone: true as const,
    };
  }

  const latest = await db.aiJob.findFirst({
    where: { assessmentId },
    orderBy: { createdAt: "desc" },
  });

  const staleBefore = new Date(Date.now() - STALE_MS);
  const latestIsActive =
    latest &&
    (latest.status === "PENDING" ||
      (latest.status === "PROCESSING" && latest.updatedAt > staleBefore));

  if (latestIsActive && !opts?.force) {
    return { job: latest, alreadyDone: false as const };
  }

  const job = await db.aiJob.create({
    data: {
      assessmentId,
      status: "PENDING",
      retryCount: latest ? latest.retryCount + 1 : 0,
    },
  });

  return { job, alreadyDone: false as const };
}

/**
 * Claim and run a job. Safe to call concurrently: only one worker wins the claim.
 * Persists analysis before calling so a killed function can resume.
 */
export async function processAiJob(jobId: string): Promise<void> {
  const staleBefore = new Date(Date.now() - STALE_MS);
  const claimed = await db.aiJob.updateMany({
    where: {
      id: jobId,
      OR: [
        { status: "PENDING" },
        { status: "PROCESSING", updatedAt: { lt: staleBefore } },
      ],
    },
    data: {
      status: "PROCESSING",
      startedAt: new Date(),
      error: null,
    },
  });

  if (claimed.count === 0) {
    return;
  }

  const job = await db.aiJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  try {
    const assessment = await db.assessment.findUnique({
      where: { id: job.assessmentId },
      include: { shapeProfile: true, aiInsight: true, callingProfile: true },
    });
    if (!assessment?.shapeProfile) {
      throw new Error("Profil SHAPE belum tersedia.");
    }

    const profileData = toShapeProfileData(assessment.shapeProfile);
    const stories = await loadStories(job.assessmentId);
    const needInsight = !assessment.aiInsight;
    const needCalling = !assessment.callingProfile;

    if (needInsight && needCalling) {
      await db.aiJob.update({
        where: { id: jobId },
        data: { phase: "report" },
      });
      const full = await generateWithRetry(
        buildFullReportPrompt(profileData, stories),
        FullReportSchema,
        { maxTokens: 1100 },
      );
      await persistInsight(job.assessmentId, full.data.insight, full.rawResponse);
      await persistCalling(job.assessmentId, full.data.calling, full.rawResponse);
    } else if (needInsight) {
      await db.aiJob.update({
        where: { id: jobId },
        data: { phase: "analysis" },
      });
      const analysisResult = await generateWithRetry(
        buildAnalysisPrompt(profileData, stories),
        AiInsightSchema,
        { maxTokens: 700 },
      );
      await persistInsight(
        job.assessmentId,
        analysisResult.data,
        analysisResult.rawResponse,
      );
    } else if (needCalling) {
      await db.aiJob.update({
        where: { id: jobId },
        data: { phase: "calling" },
      });
      const callingResult = await generateWithRetry(
        buildCallingPrompt(profileData, stories),
        CallingProfileSchema,
        { maxTokens: 700 },
      );
      await persistCalling(
        job.assessmentId,
        callingResult.data,
        callingResult.rawResponse,
      );
    }

    await db.assessment.update({
      where: { id: job.assessmentId },
      data: { status: "ANALYZED" },
    });
    await db.aiJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        phase: "done",
        completedAt: new Date(),
        error: null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[processAiJob]", jobId, message);
    await db.aiJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: message.slice(0, 2000) },
    });
  }
}

export async function processDueAiJobs(limit = 3): Promise<number> {
  const staleBefore = new Date(Date.now() - STALE_MS);
  const due = await db.aiJob.findMany({
    where: {
      OR: [
        { status: "PENDING" },
        { status: "PROCESSING", updatedAt: { lt: staleBefore } },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });

  for (const row of due) {
    await processAiJob(row.id);
  }
  return due.length;
}
