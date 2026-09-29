import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MentorGuide } from "@/components/profile/MentorGuide";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, FileText } from "lucide-react";
import { ShapeProfileData } from "@/types";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const member = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      church: { select: { name: true } },
      assessments: {
        include: { shapeProfile: true, aiInsight: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!member) redirect("/admin/users");

  const readable = member.assessments.filter(
    (a) => a.status === "COMPLETED" || a.status === "ANALYZED",
  );

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/admin/users">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Semua pengguna
        </Button>
      </Link>

      <h1 className="text-3xl font-bold text-foreground">{member.name}</h1>
      <p className="text-muted-foreground mt-1 mb-6">
        {member.email}
        {member.church?.name ? ` · ${member.church.name}` : ""}
        {` · ${member.role}`}
      </p>

      <MentorGuide />

      {readable.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {member.assessments.length === 0
              ? "Pengguna ini belum memulai assessment."
              : "Assessment masih berjalan — laporan baru bisa dibaca setelah selesai."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Buka laporan untuk membaca profil SHAPE, cerita hidup, insight AI,
            dan catatan pendampingan.
          </p>
          {readable.map((a) => {
            const gifts = a.shapeProfile
              ? (a.shapeProfile
                  .spiritualGifts as unknown as ShapeProfileData["spiritualGifts"])
              : null;
            return (
              <Card key={a.id}>
                <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {formatDate(a.createdAt)}
                      {a.status === "ANALYZED" ? " · sudah dianalisis AI" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {gifts?.undifferentiated
                        ? "Profil belum terdiferensiasi"
                        : gifts?.top
                            ?.slice(0, 3)
                            .map((g) => g.label)
                            .join(" · ") || "Laporan tersedia"}
                    </p>
                  </div>
                  <Link href={`/admin/reports/${a.id}`}>
                    <Button size="sm" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Baca laporan lengkap
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
