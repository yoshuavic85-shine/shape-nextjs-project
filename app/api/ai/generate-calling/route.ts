import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateWithRetry } from "@/lib/ai/ollama";
import { buildCallingPrompt } from "@/lib/ai/calling-prompt";
import { loadStories } from "@/lib/ai/load-stories";
import { toShapeProfileData } from "@/lib/profile-mapper";
import { loadAuthorizedAssessment } from "@/lib/access";
import { Prisma } from "@prisma/client";
import { CallingProfileSchema } from "@/lib/ai/schemas";
import { NextResponse } from "next/server";

/**
 * POST /api/ai/generate-calling
 *
 * Generates ONLY the callingProfile (Arah Panggilan) for an assessment.
 * One Mistral call — stays well under Vercel Hobby 60s limit.
 *
 * Call this AFTER /api/ai/generate-analysis succeeds.
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
      include: { shapeProfile: true, callingProfile: true },
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
    if (!force && assessment.callingProfile) {
      return NextResponse.json({
        done: true,
        cached: true,
        callingProfile: {
          designSummary: assessment.callingProfile.designSummary,
          callingClusters: assessment.callingProfile.callingClusters,
          environmentalFit: assessment.callingProfile.environmentalFit,
          lifePatternInsight: assessment.callingProfile.lifePatternInsight,
          reflectionQuestions: assessment.callingProfile.reflectionQuestions,
          developmentPath: assessment.callingProfile.developmentPath,
        },
      });
    }

    const profileData = toShapeProfileData(assessment.shapeProfile);
    const stories = await loadStories(assessmentId);

    // Single Mistral call — well within 60s Hobby limit
    const result = await generateWithRetry(
      buildCallingPrompt(profileData, stories),
      CallingProfileSchema,
      { maxTokens: 700 },
    );

    const parsed = result.data;

    const callingProfile = await db.callingProfile.upsert({
      where: { assessmentId },
      update: {
        designSummary: parsed.designSummary,
        callingClusters:
          parsed.callingClusters as unknown as Prisma.InputJsonValue,
        environmentalFit:
          parsed.environmentalFit as unknown as Prisma.InputJsonValue,
        lifePatternInsight: parsed.lifePatternInsight,
        reflectionQuestions:
          parsed.reflectionQuestions as unknown as Prisma.InputJsonValue,
        developmentPath:
          parsed.developmentPath as unknown as Prisma.InputJsonValue,
        rawResponse: result.rawResponse,
      },
      create: {
        assessmentId,
        designSummary: parsed.designSummary,
        callingClusters:
          parsed.callingClusters as unknown as Prisma.InputJsonValue,
        environmentalFit:
          parsed.environmentalFit as unknown as Prisma.InputJsonValue,
        lifePatternInsight: parsed.lifePatternInsight,
        reflectionQuestions:
          parsed.reflectionQuestions as unknown as Prisma.InputJsonValue,
        developmentPath:
          parsed.developmentPath as unknown as Prisma.InputJsonValue,
        rawResponse: result.rawResponse,
      },
    });

    // Mark assessment as fully analyzed when both are done
    await db.assessment.update({
      where: { id: assessmentId },
      data: { status: "ANALYZED" },
    });

    return NextResponse.json({
      done: true,
      cached: false,
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
    console.error("[generate-calling] error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal membuat profil panggilan AI.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
