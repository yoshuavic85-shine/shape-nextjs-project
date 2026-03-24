import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "LEADER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.churchId) {
      return NextResponse.json(
        { error: "Tidak terdaftar di gereja" },
        { status: 400 },
      );
    }

    const members = await db.user.findMany({
      where: { churchId: user.churchId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        assessments: {
          where: { status: { in: ["COMPLETED", "ANALYZED"] } },
          include: {
            shapeProfile: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
