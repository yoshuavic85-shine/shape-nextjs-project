import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ShapeProfileData, CategoryScore } from "@/types";

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

    // Get all completed assessments with profiles for church members
    const members = await db.user.findMany({
      where: { churchId: user.churchId },
      include: {
        assessments: {
          where: { status: { in: ["COMPLETED", "ANALYZED"] } },
          include: { shapeProfile: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Aggregate spiritual gifts distribution
    const giftDistribution: Record<string, number> = {};
    const abilityDistribution: Record<string, number> = {};
    const heartDistribution: Record<string, number> = {};
    let totalProfiles = 0;
    const potentialLeaders: {
      name: string;
      id: string;
      topGifts: string[];
      leadershipScore: number;
    }[] = [];

    for (const member of members) {
      const assessment = member.assessments[0];
      if (!assessment?.shapeProfile) continue;

      totalProfiles++;
      const profile = assessment.shapeProfile;

      // Aggregate gifts
      const gifts =
        profile.spiritualGifts as unknown as ShapeProfileData["spiritualGifts"];
      if (gifts?.top) {
        for (const gift of gifts.top as CategoryScore[]) {
          giftDistribution[gift.category] =
            (giftDistribution[gift.category] || 0) + 1;
        }
      }

      // Aggregate abilities
      const abilities =
        profile.abilities as unknown as ShapeProfileData["abilities"];
      if (abilities?.top) {
        for (const ability of abilities.top as CategoryScore[]) {
          abilityDistribution[ability.category] =
            (abilityDistribution[ability.category] || 0) + 1;
        }
      }

      // Aggregate heart
      const heart = profile.heart as unknown as ShapeProfileData["heart"];
      if (heart?.top) {
        for (const h of heart.top as CategoryScore[]) {
          heartDistribution[h.category] =
            (heartDistribution[h.category] || 0) + 1;
        }
      }

      // Identify potential leaders with topGifts and leadershipScore
      const giftScore = gifts?.scores?.LEADERSHIP ?? 0;
      const abilityScore = abilities?.scores?.LEADERSHIP_ABILITY ?? 0;
      if (giftScore >= 4 || abilityScore >= 4) {
        const topGifts = (gifts?.top as CategoryScore[] | undefined)?.map(
          (g) => g.label ?? g.category,
        ) ?? [];
        const leadershipScore = Math.max(giftScore, abilityScore);
        potentialLeaders.push({
          name: member.name,
          id: member.id,
          topGifts,
          leadershipScore,
        });
      }
    }

    return NextResponse.json({
      totalMembers: members.length,
      totalProfiles,
      giftDistribution,
      abilityDistribution,
      heartDistribution,
      potentialLeaders,
    });
  } catch (error) {
    console.error("Church analytics error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
