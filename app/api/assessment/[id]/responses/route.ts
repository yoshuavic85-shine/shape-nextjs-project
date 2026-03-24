import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateShapeProfile } from "@/lib/scoring";
import { runFullAnalysis } from "@/lib/ai/run-in-background";
import { ShapeSection } from "@/types";
import { Prisma } from "@prisma/client";

const SECTION_ORDER: ShapeSection[] = [
  "SPIRITUAL_GIFTS",
  "HEART",
  "ABILITIES",
  "PERSONALITY",
  "EXPERIENCE",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { responses } = body as {
      responses: { questionId: string; value: number }[];
    };

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Responses harus berupa array" },
        { status: 400 },
      );
    }

    // Validate values are between 1-5
    for (const r of responses) {
      if (r.value < 1 || r.value > 5) {
        return NextResponse.json(
          { error: "Nilai harus antara 1 dan 5" },
          { status: 400 },
        );
      }
    }

    const assessment = await db.assessment.findFirst({
      where: { id, userId: user.id },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment tidak ditemukan" },
        { status: 404 },
      );
    }

    if (assessment.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Assessment sudah selesai" },
        { status: 400 },
      );
    }

    // Upsert responses
    for (const r of responses) {
      await db.response.upsert({
        where: {
          assessmentId_questionId: {
            assessmentId: id,
            questionId: r.questionId,
          },
        },
        update: { value: r.value },
        create: {
          assessmentId: id,
          questionId: r.questionId,
          value: r.value,
        },
      });
    }

    const currentIdx = SECTION_ORDER.indexOf(
      assessment.currentSection as ShapeSection,
    );
    const nextIdx = currentIdx + 1;

    if (nextIdx < SECTION_ORDER.length) {
      await db.assessment.update({
        where: { id },
        data: { currentSection: SECTION_ORDER[nextIdx] },
      });
    } else {
      const withResponses = await db.assessment.findUnique({
        where: { id },
        include: { responses: { include: { question: true } } },
      });
      if (withResponses?.responses.length) {
        const profileData = calculateShapeProfile(withResponses.responses);
        await db.shapeProfile.upsert({
          where: { assessmentId: id },
          update: {
            spiritualGifts: JSON.parse(
              JSON.stringify(profileData.spiritualGifts),
            ) as Prisma.InputJsonValue,
            heart: JSON.parse(JSON.stringify(profileData.heart)) as Prisma.InputJsonValue,
            abilities: JSON.parse(
              JSON.stringify(profileData.abilities),
            ) as Prisma.InputJsonValue,
            personality: JSON.parse(
              JSON.stringify(profileData.personality),
            ) as Prisma.InputJsonValue,
            experience: JSON.parse(
              JSON.stringify(profileData.experience),
            ) as Prisma.InputJsonValue,
          },
          create: {
            assessmentId: id,
            spiritualGifts: JSON.parse(
              JSON.stringify(profileData.spiritualGifts),
            ) as Prisma.InputJsonValue,
            heart: JSON.parse(JSON.stringify(profileData.heart)) as Prisma.InputJsonValue,
            abilities: JSON.parse(
              JSON.stringify(profileData.abilities),
            ) as Prisma.InputJsonValue,
            personality: JSON.parse(
              JSON.stringify(profileData.personality),
            ) as Prisma.InputJsonValue,
            experience: JSON.parse(
              JSON.stringify(profileData.experience),
            ) as Prisma.InputJsonValue,
          },
        });
      }
      await db.assessment.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
      after(() => runFullAnalysis(id));
    }

    const updated = await db.assessment.findUnique({
      where: { id },
      include: { _count: { select: { responses: true } } },
    });

    return NextResponse.json({ assessment: updated });
  } catch (error) {
    console.error("Save responses error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
