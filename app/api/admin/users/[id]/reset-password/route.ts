import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const DEFAULT_PASSWORD = "12345678";

/** Admin: reset password user ke default 12345678 */
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
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return NextResponse.json({
      ok: true,
      message: `Password telah direset ke default (${DEFAULT_PASSWORD}).`,
    });
  } catch (error) {
    console.error("Admin reset-password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
