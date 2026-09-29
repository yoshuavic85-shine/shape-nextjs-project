import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loadAuthorizedAssessment } from "@/lib/access";

const MAX_INVITES = 5;
const EXPIRY_DAYS = 21;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const access = await loadAuthorizedAssessment(id, user);
  if (!access) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  const invites = await db.externalRaterInvite.findMany({
    where: { assessmentId: id },
    include: { rating: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invites });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const access = await loadAuthorizedAssessment(id, user);
  if (!access) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  const body = await request.json();
  const raterName = typeof body.raterName === "string" ? body.raterName.trim() : "";
  const raterRelation =
    typeof body.raterRelation === "string" ? body.raterRelation.trim() : "rekan";
  if (raterName.length < 2) {
    return NextResponse.json({ error: "Nama pengamat wajib diisi" }, { status: 400 });
  }

  const count = await db.externalRaterInvite.count({
    where: { assessmentId: id },
  });
  if (count >= MAX_INVITES) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_INVITES} undangan pengamat` },
      { status: 400 },
    );
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

  const invite = await db.externalRaterInvite.create({
    data: {
      assessmentId: id,
      token,
      raterName,
      raterRelation,
      expiresAt,
    },
  });

  return NextResponse.json({ invite }, { status: 201 });
}
