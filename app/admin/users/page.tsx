import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search } from "lucide-react";
import { UserTable } from "./user-table";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      churchId: true,
      church: { select: { name: true } },
      createdAt: true,
      _count: { select: { assessments: true } },
    },
  });

  const churches = await db.church.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const leaderCount = users.filter((u) => u.role === "LEADER").length;
  const userCount = users.filter((u) => u.role === "USER").length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Manajemen Pengguna
        </h1>
        <p className="text-muted-foreground mt-1">
          Kelola semua pengguna sistem SHAPE Compass
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{totalUsers}</p>
            <p className="text-sm text-muted-foreground">Total Pengguna</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-amber-500">{adminCount}</p>
            <p className="text-sm text-muted-foreground">Admin</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-purple-500">{leaderCount}</p>
            <p className="text-sm text-muted-foreground">Leader</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-blue-500">{userCount}</p>
            <p className="text-sm text-muted-foreground">User</p>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Daftar Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable users={users} churches={churches} />
        </CardContent>
      </Card>
    </div>
  );
}

