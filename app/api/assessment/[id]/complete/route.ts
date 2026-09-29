import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateShapeProfile } from "@/lib/scoring";
import { toShapeProfileJson } from "@/lib/profile-mapper";
import { missingOpenEndedKeys } from "@/lib/constants/open-ended";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const assessment = await db.assessment.findFirst({
      where: { id, userId: user.id },
      include: {
        responses: { include: { question: true } },
        openEnded: true,
      },
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

    const allQuestions = await db.question.findMany({ select: { id: true } });
    const answeredIds = new Set(assessment.responses.map((r) => r.questionId));
    const missingLikert = allQuestions.filter((q) => !answeredIds.has(q.id));
    if (missingLikert.length > 0) {
      return NextResponse.json(
        {
          error: `Masih ada ${missingLikert.length} pertanyaan skala belum dijawab.`,
        },
        { status: 400 },
      );
    }

    const answers = Object.fromEntries(
      assessment.openEnded.map((r) => [r.promptKey, r.text]),
    );
    const missingStory = missingOpenEndedKeys(answers);
    if (missingStory.length > 0) {
      return NextResponse.json(
        {
          error:
            "Lengkapi cerita hidup yang wajib sebelum menyelesaikan assessment.",
          missingStory,
        },
        { status: 400 },
      );
    }

    const profileData = calculateShapeProfile(assessment.responses);
    const jsonData = toShapeProfileJson(profileData);
    await db.shapeProfile.upsert({
      where: { assessmentId: id },
      update: jsonData,
      create: { assessmentId: id, ...jsonData },
    });
    await db.assessment.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({ completed: true });
  } catch (error) {
    console.error("Complete assessment error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
