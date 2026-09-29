import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loadAuthorizedAssessment } from "@/lib/access";
import { ActionPlanStatus } from "@prisma/client";

const STATUSES = new Set<string>(Object.values(ActionPlanStatus));

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

  const plans = await db.actionPlan.findMany({
    where: { assessmentId: id },
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ plans });
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
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const source = typeof body.source === "string" ? body.source : "manual";
  const dueDate = body.dueDate ? new Date(body.dueDate) : null;

  if (title.length < 3) {
    return NextResponse.json({ error: "Judul terlalu singkat" }, { status: 400 });
  }

  const plan = await db.actionPlan.create({
    data: {
      assessmentId: id,
      createdById: user.id,
      title,
      description,
      source,
      dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
    },
    include: { createdBy: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ plan }, { status: 201 });
}

export async function PATCH(
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
  const planId = body.planId as string | undefined;
  const status = body.status as string | undefined;
  if (!planId || !status || !STATUSES.has(status)) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const existing = await db.actionPlan.findFirst({
    where: { id: planId, assessmentId: id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Rencana tidak ditemukan" }, { status: 404 });
  }

  const plan = await db.actionPlan.update({
    where: { id: planId },
    data: { status: status as ActionPlanStatus },
    include: { createdBy: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ plan });
}
