import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/** Admin: hapus semua data AI (insight + calling) untuk setiap assessment user ini. Status assessment di-set ke COMPLETED agar bisa generate ulang. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    const assessments = await db.assessment.findMany({
      where: { userId },
      select: { id: true },
    });

    for (const a of assessments) {
      await db.$transaction([
        db.aiInsight.deleteMany({ where: { assessmentId: a.id } }),
        db.callingProfile.deleteMany({ where: { assessmentId: a.id } }),
        db.assessment.update({
          where: { id: a.id },
          data: { status: "COMPLETED" },
        }),
      ]);
    }

    return NextResponse.json({
      ok: true,
      message: `Data AI untuk ${assessments.length} assessment telah dihapus. User bisa buka laporan lagi untuk generate ulang.`,
    });
  } catch (error) {
    console.error("Admin clear-ai error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
