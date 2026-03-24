import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateWithRetry } from "@/lib/ai/ollama";
import { buildCallingPrompt } from "@/lib/ai/calling-prompt";
import { ShapeProfileData } from "@/types";
import { CallingProfileSchema } from "@/lib/ai/schemas";

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
        { error: "Profil SHAPE belum dihitung." },
        { status: 400 },
      );
    }

    const profileData: ShapeProfileData = {
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
    };

    const prompt = buildCallingPrompt(profileData);
    const { data: validated, rawResponse } = await generateWithRetry(
      prompt,
      CallingProfileSchema,
      { maxTokens: 2000 },
    );

    const callingProfile = await db.callingProfile.upsert({
      where: { assessmentId },
      update: {
        designSummary: validated.designSummary,
        callingClusters: validated.callingClusters,
        environmentalFit: validated.environmentalFit,
        lifePatternInsight: validated.lifePatternInsight,
        reflectionQuestions: validated.reflectionQuestions,
        developmentPath: validated.developmentPath,
        rawResponse,
      },
      create: {
        assessmentId,
        designSummary: validated.designSummary,
        callingClusters: validated.callingClusters,
        environmentalFit: validated.environmentalFit,
        lifePatternInsight: validated.lifePatternInsight,
        reflectionQuestions: validated.reflectionQuestions,
        developmentPath: validated.developmentPath,
        rawResponse,
      },
    });

    return NextResponse.json({ callingProfile }, { status: 201 });
  } catch (error) {
    console.error("AI calling error:", error);
    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat menganalisis panggilan. Silakan coba lagi.",
      },
      { status: 500 },
    );
  }
}
