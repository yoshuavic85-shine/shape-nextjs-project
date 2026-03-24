import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateChurchCode } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "LEADER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const church = user.churchId
      ? await db.church.findUnique({
          where: { id: user.churchId },
          include: { _count: { select: { members: true } } },
        })
      : null;

    return NextResponse.json({ church });
  } catch (error) {
    console.error("Get church error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nama gereja wajib diisi" },
        { status: 400 },
      );
    }

    const code = generateChurchCode();

    const church = await db.church.create({
      data: { name, description, code },
    });

    // Update user to be LEADER and member of this church
    await db.user.update({
      where: { id: user.id },
      data: { role: "LEADER", churchId: church.id },
    });

    return NextResponse.json({ church }, { status: 201 });
  } catch (error) {
    console.error("Create church error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
