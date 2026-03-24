import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Users, ClipboardCheck } from "lucide-react";
import { ChurchTable } from "./church-table";

export default async function AdminChurchesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const churches = await db.church.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true } },
      members: {
        take: 1,
        where: { role: "LEADER" },
        select: { name: true, email: true },
      },
    },
  });

  // Get assessment counts per church
  const churchIds = churches.map((c) => c.id);
  const assessmentCounts = await db.assessment.groupBy({
    by: ["userId"],
    where: {
      user: { churchId: { in: churchIds } },
      status: "COMPLETED",
    },
    _count: true,
  });

  const enrichedChurches = churches.map((church) => ({
    ...church,
    leader: church.members[0] || null,
    assessmentCount: assessmentCounts.filter((a) =>
      church.members.some((m) => m.email === a.userId)
    ).length,
  }));

  // Stats
  const totalChurches = churches.length;
  const totalMembers = churches.reduce((acc, c) => acc + c._count.members, 0);
  const avgMembersPerChurch = totalChurches > 0 
    ? Math.round(totalMembers / totalChurches) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Church className="w-8 h-8 text-primary" />
          Manajemen Gereja
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola semua gereja dalam sistem SHAPE Compass
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalChurches}</p>
            <p className="text-sm text-muted-foreground">Total Gereja</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-purple-500">{totalMembers}</p>
            <p className="text-sm text-muted-foreground">Total Anggota</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-blue-500">{avgMembersPerChurch}</p>
            <p className="text-sm text-muted-foreground">Rata-rata Anggota</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Assessment Aktif</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Church Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Daftar Gereja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChurchTable churches={enrichedChurches} />
        </CardContent>
      </Card>
    </div>
  );
}

