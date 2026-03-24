import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
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
        responses: {
          include: { question: true },
        },
        shapeProfile: true,
        aiInsight: true,
        callingProfile: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error("Get assessment error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
