import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Church,
  ClipboardCheck,
  TrendingUp,
  UserCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get statistics
  const [
    totalUsers,
    totalChurches,
    totalAssessments,
    completedAssessments,
    usersThisMonth,
    assessmentsThisMonth,
    recentUsers,
    recentAssessments,
  ] = await Promise.all([
    db.user.count(),
    db.church.count(),
    db.assessment.count(),
    db.assessment.count({ where: { status: "COMPLETED" } }),
    db.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)), // First day of current month
        },
      },
    }),
    db.assessment.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    db.assessment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const completionRate =
    totalAssessments > 0
      ? Math.round((completedAssessments / totalAssessments) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview sistem SHAPE Compass
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengguna
            </CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              +{usersThisMonth} bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gereja
            </CardTitle>
            <Church className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalChurches}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Gereja terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assessment
            </CardTitle>
            <ClipboardCheck className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalAssessments}</p>
            <p className="text-xs text-muted-foreground mt-1">
              +{assessmentsThisMonth} bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {completedAssessments} dari {totalAssessments}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/admin/users">
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <Users className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium text-sm">Kelola User</p>
              </div>
            </Link>
            <Link href="/admin/churches">
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <Church className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium text-sm">Kelola Gereja</p>
              </div>
            </Link>
            <Link href="/admin/analytics">
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium text-sm">Lihat Analitik</p>
              </div>
            </Link>
            <Link href="/admin/activity">
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <Clock className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium text-sm">Log Aktivitas</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Pengguna Terbaru
            </CardTitle>
            <Link
              href="/admin/users"
              className="text-sm text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      u.role === "ADMIN"
                        ? "bg-amber-500/20 text-amber-500"
                        : u.role === "LEADER"
                          ? "bg-purple-500/20 text-purple-500"
                          : "bg-blue-500/20 text-blue-500"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Assessment Terbaru
          </CardTitle>
          <Link
            href="/admin/analytics"
            className="text-sm text-primary hover:underline"
          >
            Lihat Analitik
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Pengguna
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAssessments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3 px-2">
                      <p className="font-medium text-sm">{a.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.user.email}
                      </p>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          a.status === "COMPLETED"
                            ? "bg-green-500/20 text-green-500"
                            : a.status === "ANALYZED"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-amber-500/20 text-amber-500"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString("id-ID")}
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
