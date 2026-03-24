import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ShapeSection } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    const where = section ? { section: section as ShapeSection } : {};

    const questions = await db.question.findMany({
      where,
      orderBy: [{ section: "asc" }, { orderIndex: "asc" }],
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
