import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama gereja harus minimal 2 karakter" },
        { status: 400 }
      );
    }

    // Generate unique church code
    const code = nanoid(8).toUpperCase();

    const church = await db.church.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        code,
      },
    });

    return NextResponse.json({ church }, { status: 201 });
  } catch (error) {
    console.error("Error creating church:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churches = await db.church.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ churches });
  } catch (error) {
    console.error("Error fetching churches:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

