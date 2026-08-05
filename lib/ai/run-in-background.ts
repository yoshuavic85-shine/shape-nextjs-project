import { db } from "@/lib/db";
import { generateWithRetry } from "@/lib/ai/ollama";
import { buildAnalysisPrompt } from "@/lib/ai/analysis-prompt";
import { buildCallingPrompt } from "@/lib/ai/calling-prompt";
import { Prisma } from "@prisma/client";
import { AiInsightSchema, CallingProfileSchema } from "@/lib/ai/schemas";
import { toShapeProfileData } from "@/lib/profile-mapper";

/**
 * Full AI analysis + calling (non-streaming).
 * Prefer /api/ai/generate-full-stream for user-facing progress.
 * Kept for admin/ops recompute without SSE.
 */
export async function runFullAnalysis(assessmentId: string): Promise<void> {
  try {
    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId },
      include: {
        shapeProfile: true,
        aiInsight: true,
        callingProfile: true,
      },
    });
    if (!assessment?.shapeProfile) {
      console.warn("[runFullAnalysis] No shapeProfile for", assessmentId);
      return;
    }

    // Skip if already complete (idempotent)
    if (assessment.aiInsight && assessment.callingProfile) {
      if (assessment.status !== "ANALYZED") {
        await db.assessment.update({
          where: { id: assessmentId },
          data: { status: "ANALYZED" },
        });
      }
      return;
    }

    const profileData = toShapeProfileData(assessment.shapeProfile);

    const [analysisResult, callingResult] = await Promise.all([
      generateWithRetry(buildAnalysisPrompt(profileData), AiInsightSchema, {
        maxTokens: 2000,
      }),
      generateWithRetry(buildCallingPrompt(profileData), CallingProfileSchema, {
        maxTokens: 2000,
      }),
    ]);

    const parsedAnalysis = analysisResult.data;
    const parsedCalling = callingResult.data;

    await db.aiInsight.upsert({
      where: { assessmentId },
      update: {
        summary: parsedAnalysis.summary,
        strengths: parsedAnalysis.strengths as unknown as Prisma.InputJsonValue,
        ministryRecommendations:
          parsedAnalysis.ministryRecommendations as unknown as Prisma.InputJsonValue,
        growthSuggestions:
          parsedAnalysis.growthSuggestions as unknown as Prisma.InputJsonValue,
        reflectionQuestions:
          parsedAnalysis.reflectionQuestions as unknown as Prisma.InputJsonValue,
        rawResponse: analysisResult.rawResponse,
      },
      create: {
        assessmentId,
        summary: parsedAnalysis.summary,
        strengths: parsedAnalysis.strengths as unknown as Prisma.InputJsonValue,
        ministryRecommendations:
          parsedAnalysis.ministryRecommendations as unknown as Prisma.InputJsonValue,
        growthSuggestions:
          parsedAnalysis.growthSuggestions as unknown as Prisma.InputJsonValue,
        reflectionQuestions:
          parsedAnalysis.reflectionQuestions as unknown as Prisma.InputJsonValue,
        rawResponse: analysisResult.rawResponse,
      },
    });

    await db.callingProfile.upsert({
      where: { assessmentId },
      update: {
        designSummary: parsedCalling.designSummary,
        callingClusters:
          parsedCalling.callingClusters as unknown as Prisma.InputJsonValue,
        environmentalFit:
          parsedCalling.environmentalFit as unknown as Prisma.InputJsonValue,
        lifePatternInsight: parsedCalling.lifePatternInsight,
        reflectionQuestions:
          parsedCalling.reflectionQuestions as unknown as Prisma.InputJsonValue,
        developmentPath:
          parsedCalling.developmentPath as unknown as Prisma.InputJsonValue,
        rawResponse: callingResult.rawResponse,
      },
      create: {
        assessmentId,
        designSummary: parsedCalling.designSummary,
        callingClusters:
          parsedCalling.callingClusters as unknown as Prisma.InputJsonValue,
        environmentalFit:
          parsedCalling.environmentalFit as unknown as Prisma.InputJsonValue,
        lifePatternInsight: parsedCalling.lifePatternInsight,
        reflectionQuestions:
          parsedCalling.reflectionQuestions as unknown as Prisma.InputJsonValue,
        developmentPath:
          parsedCalling.developmentPath as unknown as Prisma.InputJsonValue,
        rawResponse: callingResult.rawResponse,
      },
    });

    await db.assessment.update({
      where: { id: assessmentId },
      data: { status: "ANALYZED" },
    });
  } catch (err) {
    console.error("[runFullAnalysis]", assessmentId, err);
  }
}
