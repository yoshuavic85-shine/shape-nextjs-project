import { db } from "@/lib/db";
import { calculateShapeProfile, getSectionProfileData } from "@/lib/scoring";
import { generateWithRetry } from "@/lib/ai/ollama";
import { buildSectionInsightPrompt } from "@/lib/ai/section-prompt";
import { buildAnalysisPrompt } from "@/lib/ai/analysis-prompt";
import { buildCallingPrompt } from "@/lib/ai/calling-prompt";
import { ShapeSection } from "@/types";
import type { ShapeProfileData } from "@/types";
import { Prisma } from "@prisma/client";
import {
  AiInsightSchema,
  CallingProfileSchema,
  SectionInsightSchema,
} from "@/lib/ai/schemas";

/** Run section-specific AI insight in background (after each section submit). */
export async function runSectionInsight(
  assessmentId: string,
  section: ShapeSection,
): Promise<void> {
  try {
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: { include: { question: true } },
      },
    });
    if (!assessment || assessment.responses.length === 0) return;

    const profile = calculateShapeProfile(assessment.responses);
    const sectionData = getSectionProfileData(profile, section);
    if (!sectionData) return;

    const prompt = buildSectionInsightPrompt(section, sectionData);
    const { data: parsed, rawResponse } = await generateWithRetry(
      prompt,
      SectionInsightSchema,
      { maxTokens: 800 },
    );

    await db.aiInsightSection.upsert({
      where: {
        assessmentId_section: { assessmentId, section },
      },
      update: {
        summary: parsed.summary,
        strengths: parsed.strengths as unknown as Prisma.InputJsonValue,
        rawResponse,
      },
      create: {
        assessmentId,
        section,
        summary: parsed.summary,
        strengths: parsed.strengths as unknown as Prisma.InputJsonValue,
        rawResponse,
      },
    });
  } catch (err) {
    console.error("[runSectionInsight]", assessmentId, section, err);
  }
}

/** Run full AI analysis + calling in background (after assessment COMPLETED). */
export async function runFullAnalysis(assessmentId: string): Promise<void> {
  try {
    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId },
      include: { shapeProfile: true },
    });
    if (!assessment?.shapeProfile) {
      console.warn("[runFullAnalysis] No shapeProfile for", assessmentId);
      return;
    }

    const profileData = assessment.shapeProfile as unknown as ShapeProfileData;

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
