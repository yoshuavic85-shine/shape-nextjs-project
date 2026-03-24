import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateWithRetry } from "@/lib/ai/ollama";
import { buildAnalysisPrompt } from "@/lib/ai/analysis-prompt";
import { buildCallingPrompt } from "@/lib/ai/calling-prompt";
import type { ShapeProfileData } from "@/types";
import { Prisma } from "@prisma/client";
import { AiInsightSchema, CallingProfileSchema } from "@/lib/ai/schemas";

/** Allow long-running AI generation. */
export const maxDuration = 300;

/** Run full AI analysis + calling in one request (on-demand when user opens report). */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId } = body;
    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId wajib diisi" },
        { status: 400 },
      );
    }

    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, userId: user.id },
      include: { shapeProfile: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment tidak ditemukan" },
        { status: 404 },
      );
    }

    if (!assessment.shapeProfile) {
      return NextResponse.json(
        {
          error:
            "Profil SHAPE belum tersedia. Silakan selesaikan assessment terlebih dahulu.",
        },
        { status: 400 },
      );
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

    const [aiInsight, callingProfile] = await Promise.all([
      db.aiInsight.upsert({
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
      }),
      db.callingProfile.upsert({
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
      }),
    ]);

    await db.assessment.update({
      where: { id: assessmentId },
      data: { status: "ANALYZED" },
    });

    return NextResponse.json({
      aiInsight: {
        summary: aiInsight.summary,
        strengths: aiInsight.strengths,
        ministryRecommendations: aiInsight.ministryRecommendations,
        growthSuggestions: aiInsight.growthSuggestions,
        reflectionQuestions: aiInsight.reflectionQuestions,
      },
      callingProfile: {
        designSummary: callingProfile.designSummary,
        callingClusters: callingProfile.callingClusters,
        environmentalFit: callingProfile.environmentalFit,
        lifePatternInsight: callingProfile.lifePatternInsight,
        reflectionQuestions: callingProfile.reflectionQuestions,
        developmentPath: callingProfile.developmentPath,
      },
    });
  } catch (error) {
    console.error("AI generate-full error:", error);
    return NextResponse.json(
      {
        error:
          "Gagal menghasilkan insight AI. Silakan coba lagi.",
      },
      { status: 500 },
    );
  }
}
