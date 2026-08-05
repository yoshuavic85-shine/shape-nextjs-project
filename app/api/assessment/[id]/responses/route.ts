import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateShapeProfile } from "@/lib/scoring";
import { toShapeProfileJson } from "@/lib/profile-mapper";
import { SECTION_ORDER, ShapeSection } from "@/types";

async function upsertResponses(
  assessmentId: string,
  responses: { questionId: string; value: number }[],
) {
  for (const r of responses) {
    await db.response.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId: r.questionId,
        },
      },
      update: { value: r.value },
      create: {
        assessmentId,
        questionId: r.questionId,
        value: r.value,
      },
    });
  }
}

function validateValues(
  responses: { questionId: string; value: number }[],
): string | null {
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return "Responses harus berupa array tidak kosong";
  }
  for (const r of responses) {
    if (
      typeof r.questionId !== "string" ||
      typeof r.value !== "number" ||
      r.value < 1 ||
      r.value > 5
    ) {
      return "Nilai harus antara 1 dan 5";
    }
  }
  return null;
}

/** Autosave one or more answers without advancing section. */
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
    const { responses } = body as {
      responses: { questionId: string; value: number }[];
    };

    const valueError = validateValues(responses ?? []);
    if (valueError) {
      return NextResponse.json({ error: valueError }, { status: 400 });
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

    const questionIds = responses.map((r) => r.questionId);
    const questions = await db.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true },
    });
    if (questions.length !== new Set(questionIds).size) {
      return NextResponse.json(
        { error: "Beberapa pertanyaan tidak valid" },
        { status: 400 },
      );
    }

    await upsertResponses(id, responses);

    const updated = await db.assessment.findUnique({
      where: { id },
      include: { _count: { select: { responses: true } } },
    });

    return NextResponse.json({ assessment: updated });
  } catch (error) {
    console.error("Autosave responses error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

/** Submit a section to advance (or complete) the assessment. */
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
    const { responses, section } = body as {
      responses: { questionId: string; value: number }[];
      section: ShapeSection;
    };

    const valueError = validateValues(responses ?? []);
    if (valueError) {
      return NextResponse.json({ error: valueError }, { status: 400 });
    }

    if (!section || !SECTION_ORDER.includes(section)) {
      return NextResponse.json(
        { error: "Section tidak valid" },
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

    // Only the current DB section may advance — prevents premature completion via back-nav
    if (assessment.currentSection !== section) {
      return NextResponse.json(
        {
          error:
            "Bagagian ini sudah disimpan sebelumnya. Gunakan navigasi untuk kembali ke bagian aktif, atau simpan perubahan jawaban tanpa mengirim ulang.",
          currentSection: assessment.currentSection,
        },
        { status: 409 },
      );
    }

    const sectionQuestions = await db.question.findMany({
      where: { section },
      select: { id: true },
    });
    const sectionIds = new Set(sectionQuestions.map((q) => q.id));
    const submittedIds = new Set(responses.map((r) => r.questionId));

    for (const qid of submittedIds) {
      if (!sectionIds.has(qid)) {
        return NextResponse.json(
          { error: "Jawaban tidak sesuai dengan bagian yang dikirim" },
          { status: 400 },
        );
      }
    }

    for (const q of sectionQuestions) {
      if (!submittedIds.has(q.id)) {
        return NextResponse.json(
          { error: "Semua pertanyaan di bagian ini harus dijawab" },
          { status: 400 },
        );
      }
    }

    await upsertResponses(id, responses);

    const currentIdx = SECTION_ORDER.indexOf(
      assessment.currentSection as ShapeSection,
    );
    const nextIdx = currentIdx + 1;
    let completed = false;

    if (nextIdx < SECTION_ORDER.length) {
      await db.assessment.update({
        where: { id },
        data: { currentSection: SECTION_ORDER[nextIdx] },
      });
    } else {
      const withResponses = await db.assessment.findUnique({
        where: { id },
        include: {
          responses: { include: { question: true } },
        },
      });

      const allQuestions = await db.question.findMany({ select: { id: true } });
      const answeredIds = new Set(
        withResponses?.responses.map((r) => r.questionId) ?? [],
      );
      const missing = allQuestions.filter((q) => !answeredIds.has(q.id));
      if (missing.length > 0) {
        return NextResponse.json(
          {
            error: `Masih ada ${missing.length} pertanyaan belum dijawab. Lengkapi semua bagian sebelum menyelesaikan.`,
          },
          { status: 400 },
        );
      }

      if (withResponses?.responses.length) {
        const profileData = calculateShapeProfile(withResponses.responses);
        const jsonData = toShapeProfileJson(profileData);
        await db.shapeProfile.upsert({
          where: { assessmentId: id },
          update: jsonData,
          create: {
            assessmentId: id,
            ...jsonData,
          },
        });
      }
      await db.assessment.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
      completed = true;
      // AI analysis is triggered once by the report client stream (avoids dual race)
    }

    const updated = await db.assessment.findUnique({
      where: { id },
      include: { _count: { select: { responses: true } } },
    });

    return NextResponse.json({
      assessment: updated,
      completed,
      currentSection: updated?.currentSection,
    });
  } catch (error) {
    console.error("Save responses error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
