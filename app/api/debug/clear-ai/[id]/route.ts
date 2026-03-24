import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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
      select: { id: true, status: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment tidak ditemukan" },
        { status: 404 },
      );
    }

    await db.$transaction([
      db.aiInsight.deleteMany({ where: { assessmentId: id } }),
      db.callingProfile.deleteMany({ where: { assessmentId: id } }),
      db.assessment.update({
        where: { id },
        data: { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message:
        "Data AI untuk assessment ini sudah dihapus. Buka kembali halaman laporan untuk men-trigger analisis ulang.",
    });
  } catch (error) {
    console.error("Clear AI debug error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menghapus data AI" },
      { status: 500 },
    );
  }
}

