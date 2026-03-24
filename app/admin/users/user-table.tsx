"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, UserCog, Trash2, MoreHorizontal, Sparkles, KeyRound } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  churchId: string | null;
  church: { name: string } | null;
  createdAt: Date;
  _count: { assessments: number };
}

interface Church {
  id: string;
  name: string;
}

interface UserTableProps {
  users: User[];
  churches: Church[];
}

export function UserTable({ users, churches }: UserTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(false);
      setEditingUser(null);
    }
  };

  const handleChurchChange = async (
    userId: string,
    churchId: string | null,
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating church:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userName}"?`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAI = async () => {
    if (!actionUser) return;
    if (!confirm(`Hapus semua data AI (insight & panggilan) untuk ${actionUser.name}? Mereka bisa buka laporan lagi untuk generate ulang.`)) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/users/${actionUser.id}/clear-ai`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setActionUser(null);
        router.refresh();
      } else {
        setActionError(data.error || "Gagal menghapus data AI");
      }
    } catch (e) {
      setActionError("Terjadi kesalahan jaringan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!actionUser) return;
    if (!confirm(`Reset password ${actionUser.name} ke default (12345678)?`)) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/users/${actionUser.id}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setActionUser(null);
        router.refresh();
      } else {
        setActionError(data.error || "Gagal reset password");
      }
    } catch (e) {
      setActionError("Terjadi kesalahan jaringan");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="ALL">Semua Role</option>
          <option value="USER">User</option>
          <option value="LEADER">Leader</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Nama
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Gereja
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Assessment
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border/50 hover:bg-muted/30"
              >
                <td className="py-3 px-2 font-medium">{user.name}</td>
                <td className="py-3 px-2 text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="py-3 px-2">
                  {editingUser === user.id ? (
                    <select
                      defaultValue={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={loading}
                      className="px-2 py-1 rounded border border-input bg-background text-xs"
                    >
                      <option value="USER">USER</option>
                      <option value="LEADER">LEADER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-amber-500/20 text-amber-500"
                          : user.role === "LEADER"
                            ? "bg-purple-500/20 text-purple-500"
                            : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <select
                    value={user.churchId || ""}
                    onChange={(e) =>
                      handleChurchChange(user.id, e.target.value || null)
                    }
                    disabled={loading}
                    className="px-2 py-1 rounded border border-input bg-background text-xs max-w-[150px]"
                  >
                    <option value="">Tidak ada</option>
                    {churches.map((church) => (
                      <option key={church.id} value={church.id}>
                        {church.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-2 text-sm text-center">
                  {user._count.assessments}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingUser(editingUser === user.id ? null : user.id)
                      }
                      className="h-8 w-8 p-0"
                      title="Edit role & gereja"
                    >
                      <UserCog className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id, user.name)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={loading}
                      title="Hapus user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActionUser(user)}
                      className="h-8 w-8 p-0"
                      title="Hapus AI generated, Reset password"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Tidak ada pengguna yang ditemukan
        </div>
      )}

      {/* Dialog Aksi: Hapus AI / Reset password */}
      <Dialog open={!!actionUser} onOpenChange={(open) => !open && setActionUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aksi untuk {actionUser?.name}</DialogTitle>
          </DialogHeader>
          {actionError && (
            <p className="text-sm text-destructive">{actionError}</p>
          )}
          <div className="flex flex-col gap-2 py-2">
            <Button
              variant="outline"
              onClick={handleClearAI}
              disabled={actionLoading}
              className="justify-start gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Hapus Generate AI Profile
            </Button>
            <p className="text-xs text-muted-foreground px-1">
              Hapus insight & panggilan AI. User bisa buka laporan lagi untuk generate ulang.
            </p>
            <Button
              variant="outline"
              onClick={handleResetPassword}
              disabled={actionLoading}
              className="justify-start gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Reset password ke default (12345678)
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionUser(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
