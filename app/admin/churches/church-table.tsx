"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Copy,
  Trash2,
  Edit,
  Check,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Church {
  id: string;
  name: string;
  description: string | null;
  code: string;
  createdAt: Date;
  _count: { members: number };
  leader: { name: string; email: string } | null;
}

interface ChurchTableProps {
  churches: Church[];
}

export function ChurchTable({ churches }: ChurchTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editingChurch, setEditingChurch] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create church state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChurchName, setNewChurchName] = useState("");
  const [newChurchDescription, setNewChurchDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const filteredChurches = churches.filter(
    (church) =>
      church.name.toLowerCase().includes(search.toLowerCase()) ||
      church.code.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const startEditing = (church: Church) => {
    setEditingChurch(church.id);
    setEditName(church.name);
    setEditDescription(church.description || "");
  };

  const handleUpdate = async (churchId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/churches/${churchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating church:", error);
    } finally {
      setLoading(false);
      setEditingChurch(null);
    }
  };

  const handleDelete = async (churchId: string, churchName: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus gereja "${churchName}"? Semua data anggota akan terputus dari gereja ini.`,
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/churches/${churchId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting church:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChurch = async () => {
    if (!newChurchName.trim()) {
      setCreateError("Nama gereja wajib diisi");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/churches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChurchName,
          description: newChurchDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Gagal membuat gereja");
        return;
      }
      setCreateDialogOpen(false);
      setNewChurchName("");
      setNewChurchDescription("");
      router.refresh();
    } catch (error) {
      console.error("Error creating church:", error);
      setCreateError("Terjadi kesalahan jaringan");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div>
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama gereja atau kode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Gereja
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Gereja Baru</DialogTitle>
              <DialogDescription>
                Buat gereja baru dalam sistem. Kode gereja akan di-generate
                otomatis.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {createError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="churchName">Nama Gereja *</Label>
                <Input
                  id="churchName"
                  placeholder="Masukkan nama gereja"
                  value={newChurchName}
                  onChange={(e) => setNewChurchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="churchDescription">Deskripsi (opsional)</Label>
                <Input
                  id="churchDescription"
                  placeholder="Deskripsi singkat gereja"
                  value={newChurchDescription}
                  onChange={(e) => setNewChurchDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createLoading}
              >
                Batal
              </Button>
              <Button onClick={handleCreateChurch} disabled={createLoading}>
                {createLoading && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Buat Gereja
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Nama Gereja
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Kode
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Leader
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Anggota
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredChurches.map((church) => (
              <tr
                key={church.id}
                className="border-b border-border/50 hover:bg-muted/30"
              >
                <td className="py-3 px-2">
                  {editingChurch === church.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    <div>
                      <p className="font-medium">{church.name}</p>
                      {church.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {church.description}
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {church.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(church.code)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedCode === church.code ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </td>
                <td className="py-3 px-2 text-sm">
                  {church.leader ? (
                    <div>
                      <p className="font-medium">{church.leader.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {church.leader.email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="py-3 px-2 text-sm font-medium">
                  {church._count.members}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1">
                    {editingChurch === church.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdate(church.id)}
                          disabled={loading}
                          className="h-8 w-8 p-0 text-green-500"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingChurch(null)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(church)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(church.id, church.name)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredChurches.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Tidak ada gereja yang ditemukan
        </div>
      )}
    </div>
  );
}
