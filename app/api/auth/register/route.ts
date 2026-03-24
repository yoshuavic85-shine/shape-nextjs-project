import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, churchCode } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, nama, dan password wajib diisi" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 },
      );
    }

    let churchId: string | undefined;
    if (churchCode) {
      const church = await db.church.findUnique({
        where: { code: churchCode },
      });
      if (!church) {
        return NextResponse.json(
          { error: "Kode gereja tidak ditemukan" },
          { status: 404 },
        );
      }
      churchId = church.id;
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        churchId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        churchId: true,
      },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith("https") ?? false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
