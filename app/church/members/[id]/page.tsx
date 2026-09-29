import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { canViewMemberProfile } from "@/lib/access";
import { MentorGuide } from "@/components/profile/MentorGuide";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { ShapeProfileData } from "@/types";

export default async function ChurchMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "LEADER" || !user.churchId) redirect("/dashboard");

  const { id } = await params;
  const member = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      churchId: true,
      assessments: {
        where: { status: { in: ["COMPLETED", "ANALYZED"] } },
        include: { shapeProfile: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!member || !canViewMemberProfile(user, member)) {
    redirect("/church/members");
  }

  const completed = member.assessments;
  const latest = completed[0];
  const compareHref =
    completed.length >= 2
      ? `/dashboard/compare?a=${completed[completed.length - 1].id}&b=${completed[0].id}`
      : null;

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/church/members">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Semua anggota
        </Button>
      </Link>
      <h1 className="text-3xl font-bold text-foreground">{member.name}</h1>
      <p className="text-muted-foreground mt-1 mb-6">{member.email}</p>

      <MentorGuide />

      {completed.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Belum ada assessment yang selesai.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {compareHref && (
            <Link href={compareHref}>
              <Button variant="outline">Bandingkan assessment</Button>
            </Link>
          )}
          {completed.map((a) => {
            const gifts = a.shapeProfile
              ? (a.shapeProfile
                  .spiritualGifts as unknown as ShapeProfileData["spiritualGifts"])
              : null;
            return (
              <Card key={a.id}>
                <CardContent className="py-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Assessment {formatDate(a.createdAt)}
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
                  <Link href={`/dashboard/report/${a.id}`}>
                    <Button size="sm">Buka laporan lengkap</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
          {latest && (
            <p className="text-xs text-muted-foreground">
              Buka laporan untuk catatan mentor, eksperimen, dan undangan
              pengamat.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
