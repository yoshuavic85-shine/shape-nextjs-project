import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OBSERVER_ITEMS } from "@/lib/constants/observer-items";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const invite = await db.externalRaterInvite.findUnique({
    where: { token },
    include: {
      assessment: {
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!invite) {
    return NextResponse.json({ error: "Tautan tidak valid" }, { status: 404 });
  }
  if (invite.submittedAt) {
    return NextResponse.json({ error: "Undangan ini sudah diisi" }, { status: 409 });
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Tautan sudah kedaluwarsa" }, { status: 410 });
  }

  return NextResponse.json({
    raterName: invite.raterName,
    raterRelation: invite.raterRelation,
    subjectName: invite.assessment.user.name,
    items: OBSERVER_ITEMS,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const invite = await db.externalRaterInvite.findUnique({
    where: { token },
    include: { rating: true },
  });
  if (!invite) {
    return NextResponse.json({ error: "Tautan tidak valid" }, { status: 404 });
  }
  if (invite.submittedAt || invite.rating) {
    return NextResponse.json({ error: "Undangan ini sudah diisi" }, { status: 409 });
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Tautan sudah kedaluwarsa" }, { status: 410 });
  }

  const body = await request.json();
  const ratings = body.ratings as Record<string, number> | undefined;
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (!ratings || typeof ratings !== "object") {
    return NextResponse.json({ error: "Jawaban wajib diisi" }, { status: 400 });
  }

  const gifts: Record<string, number> = {};
  const heart: Record<string, number> = {};
  const abilities: Record<string, number> = {};

  for (const item of OBSERVER_ITEMS) {
    const value = ratings[item.category];
    if (typeof value !== "number" || value < 1 || value > 5) {
      return NextResponse.json(
        { error: `Semua butir harus diisi (1–5). Kurang: ${item.label}` },
        { status: 400 },
      );
    }
    if (item.section === "gifts") gifts[item.category] = value;
    else if (item.section === "heart") heart[item.category] = value;
    else abilities[item.category] = value;
  }

  await db.$transaction([
    db.externalRating.create({
      data: {
        inviteId: invite.id,
        gifts,
        heart,
        abilities,
        note: note || null,
      },
    }),
    db.externalRaterInvite.update({
      where: { id: invite.id },
      data: { submittedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
