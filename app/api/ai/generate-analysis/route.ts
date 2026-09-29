import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateWithRetry } from "@/lib/ai/ollama";
import { buildAnalysisPrompt } from "@/lib/ai/analysis-prompt";
import { loadStories } from "@/lib/ai/load-stories";
import { toShapeProfileData } from "@/lib/profile-mapper";
import { loadAuthorizedAssessment } from "@/lib/access";
import { Prisma } from "@prisma/client";
import { AiInsightSchema } from "@/lib/ai/schemas";
import { NextResponse } from "next/server";

/**
 * POST /api/ai/generate-analysis
 *
 * Generates ONLY the aiInsight (SHAPE Analysis) for an assessment.
 * One Mistral call — stays well under Vercel Hobby 60s limit.
 *
 * Designed to be called from the frontend BEFORE generate-calling,
 * so each request is short enough to complete within Vercel constraints.
 */
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { assessmentId?: string; force?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "assessmentId wajib diisi" },
        { status: 400 },
      );
    }

    const { assessmentId, force } = body;
    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId wajib diisi" },
        { status: 400 },
      );
    }

    const access = await loadAuthorizedAssessment(assessmentId, user);
    if (!access) {
      return NextResponse.json(
        { error: "Assessment tidak ditemukan" },
        { status: 404 },
      );
    }

    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: { shapeProfile: true, aiInsight: true },
    });

    if (!assessment?.shapeProfile) {
      return NextResponse.json(
        {
          error:
            "Profil SHAPE belum tersedia. Silakan selesaikan assessment terlebih dahulu.",
        },
        { status: 400 },
      );
    }

    // Fast path — already generated
    if (!force && assessment.aiInsight) {
      return NextResponse.json({
        done: true,
        cached: true,
        aiInsight: {
          summary: assessment.aiInsight.summary,
          strengths: assessment.aiInsight.strengths,
          ministryRecommendations: assessment.aiInsight.ministryRecommendations,
          growthSuggestions: assessment.aiInsight.growthSuggestions,
          reflectionQuestions: assessment.aiInsight.reflectionQuestions,
        },
      });
    }

    const profileData = toShapeProfileData(assessment.shapeProfile);
    const stories = await loadStories(assessmentId);

    // Single Mistral call — well within 60s Hobby limit
    const result = await generateWithRetry(
      buildAnalysisPrompt(profileData, stories),
      AiInsightSchema,
      { maxTokens: 700 },
    );

    const parsed = result.data;

    const aiInsight = await db.aiInsight.upsert({
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
        rawResponse: result.rawResponse,
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
        rawResponse: result.rawResponse,
      },
    });

    return NextResponse.json({
      done: true,
      cached: false,
      aiInsight: {
        summary: aiInsight.summary,
        strengths: aiInsight.strengths,
        ministryRecommendations: aiInsight.ministryRecommendations,
        growthSuggestions: aiInsight.growthSuggestions,
        reflectionQuestions: aiInsight.reflectionQuestions,
      },
    });
  } catch (error) {
    console.error("[generate-analysis] error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal membuat analisis AI.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
