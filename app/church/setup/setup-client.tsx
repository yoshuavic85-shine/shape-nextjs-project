"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Church, Key, Loader2 } from "lucide-react";

export function ChurchSetupClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftarkan gereja");
      }
      setCreatedCode(data.church.code);
      setTimeout(() => {
        router.push("/church/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  };

  if (createdCode) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <Card>
          <CardContent className="text-center py-10 space-y-4">
            <Key className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">
              Gereja berhasil didaftarkan
            </h2>
            <p className="text-muted-foreground text-sm">
              Bagikan kode ini kepada anggota jemaat saat registrasi:
            </p>
            <p className="text-3xl font-mono font-bold tracking-wider text-foreground">
              {createdCode}
            </p>
            <p className="text-xs text-muted-foreground">
              Mengalihkan ke dashboard gereja…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <div className="mb-8 text-center">
        <Church className="w-12 h-12 text-primary mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-foreground">
          Daftarkan Gereja Anda
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Buat profil gereja untuk mendapatkan kode/token undangan anggota.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Gereja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Gereja *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: GBI Shape Jakarta"
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Singkat tentang gereja Anda"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Daftar &amp; Buat Kode Gereja
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
