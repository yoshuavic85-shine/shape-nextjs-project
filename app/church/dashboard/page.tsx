import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Church, Key } from "lucide-react";

export default async function ChurchDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "LEADER" || !user.churchId) {
    redirect("/dashboard");
  }

  const church = await db.church.findUnique({
    where: { id: user.churchId },
    include: { _count: { select: { members: true } } },
  });

  if (!church) redirect("/dashboard");

  const completedAssessments = await db.assessment.count({
    where: {
      user: { churchId: church.id },
      status: { in: ["COMPLETED", "ANALYZED"] },
    },
  });

  const profilesCount = await db.shapeProfile.count({
    where: {
      assessment: { user: { churchId: church.id } },
    },
  });

  const stats = [
    {
      label: "Total Anggota",
      value: church._count.members,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Assessment Selesai",
      value: completedAssessments,
      icon: ClipboardCheck,
      color: "text-secondary",
    },
    {
      label: "Profil Tersedia",
      value: profilesCount,
      icon: Church,
      color: "text-accent",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{church.name}</h1>
        <p className="text-muted-foreground mt-1">Dashboard Gereja</p>
      </div>

      {/* Church Code */}
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 py-4">
          <Key className="w-6 h-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Kode Gereja</p>
            <p className="text-xl font-mono font-bold text-foreground tracking-wider">
              {church.code}
            </p>
          </div>
          <p className="text-xs text-muted-foreground ml-auto max-w-xs text-right">
            Bagikan kode ini kepada anggota jemaat agar mereka bisa bergabung
            saat registrasi.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 py-6">
                <div className="neo-raised p-3 rounded-xl">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/church/members">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Daftar Anggota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Lihat daftar anggota dan profil SHAPE mereka.
              </p>
            </CardContent>
          </Card>
        </a>
        <a href="/church/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-secondary" />
                Analitik Gereja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Distribusi karunia, analisis gap, dan potensi pemimpin.
              </p>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  );
}
