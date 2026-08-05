import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateShapeProfile } from "@/lib/scoring";
import {
  toShapeProfileData,
  toShapeProfileJson,
} from "@/lib/profile-mapper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assessmentId } = await params;

    const profile = await db.shapeProfile.findUnique({
      where: { assessmentId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil belum tersedia" },
        { status: 404 },
      );
    }

    return NextResponse.json({ profile: toShapeProfileData(profile) });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assessmentId } = await params;

    const assessment = await db.assessment.findFirst({
      where: { id: assessmentId, userId: user.id },
      include: {
        responses: {
          include: { question: true },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment tidak ditemukan" },
        { status: 404 },
      );
    }

    if (assessment.status === "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Assessment belum selesai" },
        { status: 400 },
      );
    }

    const profileData = calculateShapeProfile(assessment.responses);
    const jsonData = toShapeProfileJson(profileData);

    const profile = await db.shapeProfile.upsert({
      where: { assessmentId },
      update: jsonData,
      create: {
        assessmentId,
        ...jsonData,
      },
    });

    return NextResponse.json(
      { profile: toShapeProfileData(profile) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
