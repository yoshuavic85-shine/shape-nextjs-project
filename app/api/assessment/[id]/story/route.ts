import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  OPEN_ENDED_PROMPTS,
  missingOpenEndedKeys,
} from "@/lib/constants/open-ended";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const assessment = await db.assessment.findFirst({
    where: { id, userId: user.id },
    include: { openEnded: true },
  });
  if (!assessment) {
    return NextResponse.json(
      { error: "Assessment tidak ditemukan" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    answers: Object.fromEntries(
      assessment.openEnded.map((r) => [r.promptKey, r.text]),
    ),
  });
}

export async function PATCH(
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
    const { promptKey, text } = body as { promptKey?: string; text?: string };

    if (!promptKey || typeof text !== "string") {
      return NextResponse.json(
        { error: "promptKey dan text wajib diisi" },
        { status: 400 },
      );
    }

    if (!OPEN_ENDED_PROMPTS.some((p) => p.key === promptKey)) {
      return NextResponse.json(
        { error: "Pertanyaan cerita tidak valid" },
        { status: 400 },
      );
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

    await db.openEndedResponse.upsert({
      where: {
        assessmentId_promptKey: { assessmentId: id, promptKey },
      },
      update: { text },
      create: { assessmentId: id, promptKey, text },
    });

    const all = await db.openEndedResponse.findMany({
      where: { assessmentId: id },
    });
    const answers = Object.fromEntries(all.map((r) => [r.promptKey, r.text]));
    const missing = missingOpenEndedKeys(answers);

    return NextResponse.json({ saved: true, missing });
  } catch (error) {
    console.error("Story autosave error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
