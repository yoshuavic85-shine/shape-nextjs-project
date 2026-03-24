import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assessments = await db.assessment.findMany({
      where: { userId: user.id },
      include: {
        shapeProfile: true,
        aiInsight: true,
        callingProfile: true,
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error("Get assessments error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for existing in-progress assessment
    const existing = await db.assessment.findFirst({
      where: { userId: user.id, status: "IN_PROGRESS" },
    });

    if (existing) {
      return NextResponse.json({ assessment: existing });
    }

    const assessment = await db.assessment.create({
      data: { userId: user.id },
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    console.error("Create assessment error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
