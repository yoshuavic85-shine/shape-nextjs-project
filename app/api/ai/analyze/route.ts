import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateWithRetry } from "@/lib/ai/ollama";
import { buildAnalysisPrompt } from "@/lib/ai/analysis-prompt";
import { toShapeProfileData } from "@/lib/profile-mapper";
import { AiInsightSchema } from "@/lib/ai/schemas";

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
            "Profil SHAPE belum dihitung. Silakan hitung profil terlebih dahulu.",
        },
        { status: 400 },
      );
    }

    const profileData = toShapeProfileData(assessment.shapeProfile);

    const prompt = buildAnalysisPrompt(profileData);
    const { data: validated, rawResponse } = await generateWithRetry(
      prompt,
      AiInsightSchema,
      { maxTokens: 2000 },
    );

    const aiInsight = await db.aiInsight.upsert({
      where: { assessmentId },
      update: {
        summary: validated.summary,
        strengths: validated.strengths,
        ministryRecommendations: validated.ministryRecommendations,
        growthSuggestions: validated.growthSuggestions,
        reflectionQuestions: validated.reflectionQuestions,
        rawResponse,
      },
      create: {
        assessmentId,
        summary: validated.summary,
        strengths: validated.strengths,
        ministryRecommendations: validated.ministryRecommendations,
        growthSuggestions: validated.growthSuggestions,
        reflectionQuestions: validated.reflectionQuestions,
        rawResponse,
      },
    });

    await db.assessment.update({
      where: { id: assessmentId },
      data: { status: "ANALYZED" },
    });

    return NextResponse.json({ aiInsight }, { status: 201 });
  } catch (error) {
    console.error("AI analyze error:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menganalisis. Silakan coba lagi.",
      },
      { status: 500 },
    );
  }
}
