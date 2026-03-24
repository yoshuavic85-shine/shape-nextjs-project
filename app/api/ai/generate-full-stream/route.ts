import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateWithRetry } from "@/lib/ai/ollama";
import { buildAnalysisPrompt } from "@/lib/ai/analysis-prompt";
import { buildCallingPrompt } from "@/lib/ai/calling-prompt";
import type { ShapeProfileData } from "@/types";
import { Prisma } from "@prisma/client";
import { AiInsightSchema, CallingProfileSchema } from "@/lib/ai/schemas";

export const maxDuration = 600;

function sendSSE(
  controller: ReadableStreamDefaultController<Uint8Array>,
  data: object,
): boolean {
  try {
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`),
    );
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = err && typeof (err as { code?: string }).code === "string" ? (err as { code: string }).code : "";
    if (msg.includes("closed") || code === "ERR_INVALID_STATE") {
      return false;
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let body: { assessmentId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "assessmentId wajib diisi" }),
      { status: 400 },
    );
  }

  const { assessmentId } = body;
  if (!assessmentId) {
    return new Response(JSON.stringify({ error: "assessmentId wajib diisi" }), {
      status: 400,
    });
  }

  const assessment = await db.assessment.findFirst({
    where: { id: assessmentId, userId: user.id },
    include: { shapeProfile: true },
  });

  if (!assessment) {
    return new Response(
      JSON.stringify({ error: "Assessment tidak ditemukan" }),
      { status: 404 },
    );
  }

  if (!assessment.shapeProfile) {
    return new Response(
      JSON.stringify({
        error:
          "Profil SHAPE belum tersedia. Silakan selesaikan assessment terlebih dahulu.",
      }),
      { status: 400 },
    );
  }

  const profileData = assessment.shapeProfile as unknown as ShapeProfileData;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Phase 1: Analysis
        sendSSE(controller, {
          phase: "analyze",
          status: "started",
          progress: 0,
          label: "Menganalisis profil SHAPE...",
        });

        const analysisResult = await generateWithRetry(
          buildAnalysisPrompt(profileData),
          AiInsightSchema,
          { maxTokens: 2000 },
        );

        sendSSE(controller, {
          phase: "analyze",
          status: "done",
          progress: 50,
          label: "Analisis profil selesai.",
        });

        // Phase 2: Calling
        sendSSE(controller, {
          phase: "calling",
          status: "started",
          progress: 50,
          label: "Membuat arah panggilan...",
        });

        const callingResult = await generateWithRetry(
          buildCallingPrompt(profileData),
          CallingProfileSchema,
          { maxTokens: 2000 },
        );

        sendSSE(controller, {
          phase: "calling",
          status: "done",
          progress: 90,
          label: "Arah panggilan selesai.",
        });

        // Phase 3: Save to DB
        const parsedAnalysis = analysisResult.data;
        const parsedCalling = callingResult.data;

        const [aiInsight, callingProfile] = await Promise.all([
          db.aiInsight.upsert({
            where: { assessmentId },
            update: {
              summary: parsedAnalysis.summary,
              strengths:
                parsedAnalysis.strengths as unknown as Prisma.InputJsonValue,
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
              strengths:
                parsedAnalysis.strengths as unknown as Prisma.InputJsonValue,
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

        sendSSE(controller, {
          phase: "done",
          progress: 100,
          label: "Selesai.",
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
      } catch (err) {
        console.error("AI generate-full-stream error:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Gagal menghasilkan insight AI. Silakan coba lagi.";
        sendSSE(controller, {
          phase: "error",
          progress: 0,
          label: "Gagal",
          message,
        });
      } finally {
        try {
          controller.close();
        } catch {
          // Stream mungkin sudah ditutup (client putus)
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache",
      Connection: "keep-alive",
    },
  });
}
