import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loadAuthorizedAssessment } from "@/lib/access";

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

  const notes = await db.mentorNote.findMany({
    where: { assessmentId: id },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notes, canWrite: access.canMentor });
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
  if (!access?.canMentor) {
    return NextResponse.json(
      { error: "Hanya mentor/pemimpin gereja yang dapat menulis catatan" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (content.length < 3) {
    return NextResponse.json(
      { error: "Catatan terlalu singkat" },
      { status: 400 },
    );
  }

  const note = await db.mentorNote.create({
    data: { assessmentId: id, authorId: user.id, content },
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ note }, { status: 201 });
}
