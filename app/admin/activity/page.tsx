import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, UserPlus, ClipboardCheck, Church, Clock } from "lucide-react";

export default async function AdminActivityPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get recent activities from different sources
  const [recentUsers, recentAssessments, recentChurches] = await Promise.all([
    db.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        church: { select: { name: true } },
      },
    }),
    db.assessment.findMany({
      take: 20,
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    db.church.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { members: true } },
      },
    }),
  ]);

  // Combine and sort activities
  type ActivityItem = {
    id: string;
    type: "user" | "assessment" | "church";
    title: string;
    description: string;
    timestamp: Date;
    icon: "user" | "assessment" | "church";
  };

  const activities: ActivityItem[] = [
    ...recentUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "user" as const,
      title: "Pengguna Baru",
      description: `${u.name} (${u.email}) telah mendaftar${u.church ? ` - ${u.church.name}` : ""}`,
      timestamp: u.createdAt,
      icon: "user" as const,
    })),
    ...recentAssessments.map((a) => ({
      id: `assessment-${a.id}`,
      type: "assessment" as const,
      title: a.status === "COMPLETED" ? "Assessment Selesai" : "Assessment Diperbarui",
      description: `${a.user.name} - Status: ${a.status}`,
      timestamp: a.updatedAt,
      icon: "assessment" as const,
    })),
    ...recentChurches.map((c) => ({
      id: `church-${c.id}`,
      type: "church" as const,
      title: "Gereja Baru",
      description: `${c.name} telah ditambahkan`,
      timestamp: c.createdAt,
      icon: "church" as const,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "user":
        return <UserPlus className="w-4 h-4" />;
      case "assessment":
        return <ClipboardCheck className="w-4 h-4" />;
      case "church":
        return <Church className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "user":
        return "bg-blue-500/20 text-blue-500";
      case "assessment":
        return "bg-green-500/20 text-green-500";
      case "church":
        return "bg-purple-500/20 text-purple-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          Log Aktivitas
        </h1>
        <p className="text-muted-foreground mt-1">
          Pantau semua aktivitas terbaru dalam sistem
        </p>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.slice(0, 30).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className={`p-2 rounded-full ${getIconColor(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                Belum ada aktivitas
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

