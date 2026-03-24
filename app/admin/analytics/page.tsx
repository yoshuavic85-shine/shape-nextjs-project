import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, Users } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/scoring";

interface ShapeDataWithScores {
  scores?: Record<string, number>;
  top?: Array<{ category: string; score: number; label?: string }>;
}

function getCategoryLabel(categoryKey: string): string {
  return CATEGORY_LABELS[categoryKey] ?? categoryKey;
}

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get all shape profiles
  const shapeProfiles = await db.shapeProfile.findMany({
    include: {
      assessment: {
        include: {
          user: {
            select: { churchId: true },
          },
        },
      },
    },
  });

  // Aggregate by "top 3" per profile (sama seperti analitik gereja: setiap orang kontribusi max 3 per section)
  const spiritualGiftsCount: Record<string, number> = {};
  const heartAreasCount: Record<string, number> = {};
  const abilitiesCount: Record<string, number> = {};

  shapeProfiles.forEach((profile) => {
    const gifts = profile.spiritualGifts as ShapeDataWithScores;
    if (gifts?.top?.length) {
      for (const { category } of gifts.top) {
        spiritualGiftsCount[category] = (spiritualGiftsCount[category] || 0) + 1;
      }
    }

    const heart = profile.heart as ShapeDataWithScores;
    if (heart?.top?.length) {
      for (const { category } of heart.top) {
        heartAreasCount[category] = (heartAreasCount[category] || 0) + 1;
      }
    }

    const abilities = profile.abilities as ShapeDataWithScores;
    if (abilities?.top?.length) {
      for (const { category } of abilities.top) {
        abilitiesCount[category] = (abilitiesCount[category] || 0) + 1;
      }
    }
  });

  // Get top items
  const topGifts = Object.entries(spiritualGiftsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topHeartAreas = Object.entries(heartAreasCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topAbilities = Object.entries(abilitiesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Church comparison
  const churchStats = await db.church.findMany({
    include: {
      _count: { select: { members: true } },
    },
  });

  const churchAssessments = await Promise.all(
    churchStats.map(async (church) => {
      const count = await db.assessment.count({
        where: {
          user: { churchId: church.id },
          status: { in: ["COMPLETED", "ANALYZED"] },
        },
      });
      return {
        name: church.name,
        members: church._count.members,
        assessments: count,
      };
    }),
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Analitik Sistem
        </h1>
        <p className="text-muted-foreground mt-1">
          Insight mendalam tentang data SHAPE di seluruh sistem
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Profil SHAPE
            </CardTitle>
            <PieChart className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{shapeProfiles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Kategori Karunia (unik)
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Object.keys(spiritualGiftsCount).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              dari top-3 profil
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gereja Aktif</CardTitle>
            <Users className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{churchStats.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Spiritual Gifts & Heart Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Karunia Rohani</CardTitle>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Jumlah orang yang punya kategori ini di top-3 mereka
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topGifts.map(([gift, count], index) => (
                <div key={gift} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{getCategoryLabel(gift)}</span>
                      <span className="text-muted-foreground">
                        {count} orang
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(count / (topGifts[0]?.[1] || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {topGifts.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada data
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Passion / Heart</CardTitle>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Jumlah orang yang punya kategori ini di top-3 mereka
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topHeartAreas.map(([area, count], index) => (
                <div key={area} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-500 text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{getCategoryLabel(area)}</span>
                      <span className="text-muted-foreground">
                        {count} orang
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-1">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{
                          width: `${(count / (topHeartAreas[0]?.[1] || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {topHeartAreas.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada data
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Abilities */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top 10 Kemampuan</CardTitle>
          <p className="text-sm text-muted-foreground font-normal mt-1">
            Jumlah orang yang punya kategori ini di top-3 mereka
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topAbilities.map(([ability, count], index) => (
              <div
                key={ability}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 text-sm flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{getCategoryLabel(ability)}</p>
                  <p className="text-xs text-muted-foreground">{count} orang</p>
                </div>
              </div>
            ))}
            {topAbilities.length === 0 && (
              <p className="text-muted-foreground text-center py-4 col-span-2">
                Belum ada data
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Church Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Gereja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Gereja
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Anggota
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Assessment Selesai
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Rasio
                  </th>
                </tr>
              </thead>
              <tbody>
                {churchAssessments.map((church) => (
                  <tr key={church.name} className="border-b border-border/50">
                    <td className="py-3 px-2 font-medium">{church.name}</td>
                    <td className="py-3 px-2">{church.members}</td>
                    <td className="py-3 px-2">{church.assessments}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          church.members > 0 &&
                          church.assessments / church.members >= 0.5
                            ? "bg-green-500/20 text-green-500"
                            : "bg-amber-500/20 text-amber-500"
                        }`}
                      >
                        {church.members > 0
                          ? `${Math.round((church.assessments / church.members) * 100)}%`
                          : "0%"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
