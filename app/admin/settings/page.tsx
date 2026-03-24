import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Database, Shield, Bell, Info } from "lucide-react";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Pengaturan Sistem
        </h1>
        <p className="text-muted-foreground mt-1">
          Konfigurasi dan pengaturan aplikasi SHAPE Compass
        </p>
      </div>

      <div className="space-y-6">
        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Informasi Sistem
            </CardTitle>
            <CardDescription>
              Detail tentang instalasi SHAPE Compass Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Versi Aplikasi</p>
                <p className="font-mono font-medium">1.0.0</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Environment</p>
                <p className="font-mono font-medium">{process.env.NODE_ENV || "development"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="font-mono font-medium">PostgreSQL</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Framework</p>
                <p className="font-mono font-medium">Next.js 15</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database
            </CardTitle>
            <CardDescription>
              Kelola database dan data sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Backup Database</p>
                  <p className="text-sm text-muted-foreground">
                    Buat backup manual database
                  </p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                  Backup
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div>
                  <p className="font-medium text-amber-500">Clear AI Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Hapus semua data AI insight (untuk regenerasi)
                  </p>
                </div>
                <button className="px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600 transition-colors">
                  Clear
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Keamanan
            </CardTitle>
            <CardDescription>
              Pengaturan keamanan sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Waktu sesi pengguna aktif: 7 hari
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Password Hashing</p>
                  <p className="text-sm text-muted-foreground">
                    Menggunakan bcrypt dengan 12 rounds
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                  Aktif
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifikasi
            </CardTitle>
            <CardDescription>
              Pengaturan notifikasi sistem (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Fitur notifikasi akan segera hadir
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

