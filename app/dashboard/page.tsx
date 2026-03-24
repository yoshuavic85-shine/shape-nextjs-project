import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ClipboardList,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const assessments = await db.assessment.findMany({
    where: { userId: user.id },
    include: {
      shapeProfile: true,
      aiInsight: true,
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const completedCount = assessments.filter(
    (a: { status: string }) =>
      a.status === "COMPLETED" || a.status === "ANALYZED",
  ).length;
  const inProgressCount = assessments.filter(
    (a: { status: string }) => a.status === "IN_PROGRESS",
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Selamat datang, {user.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Mulai perjalanan untuk memahami desain unik Anda.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 pt-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {assessments.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Assessment</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-0">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {completedCount}
              </p>
              <p className="text-sm text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-0">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {inProgressCount}
              </p>
              <p className="text-sm text-muted-foreground">Sedang Berjalan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <Link href="/dashboard/assessment">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Mulai Assessment Baru
          </Button>
        </Link>
      </div>

      {/* Assessment List */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Riwayat Assessment
        </h2>
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Belum ada assessment
              </h3>
              <p className="text-muted-foreground mb-4">
                Mulai assessment pertama Anda untuk menemukan desain unik Anda.
              </p>
              <Link href="/dashboard/assessment">
                <Button>Mulai Sekarang</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Assessment #{assessment.id.slice(-6).toUpperCase()}
                    </CardTitle>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assessment.status === "ANALYZED"
                          ? "bg-secondary/20 text-secondary"
                          : assessment.status === "COMPLETED"
                            ? "bg-accent/20 text-accent"
                            : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {assessment.status === "ANALYZED"
                        ? "Dianalisis"
                        : assessment.status === "COMPLETED"
                          ? "Selesai"
                          : "Sedang Berjalan"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>Dibuat: {formatDate(assessment.createdAt)}</p>
                      <p>Jawaban: {assessment._count.responses}/90</p>
                    </div>
                    <div className="flex gap-2">
                      {assessment.status === "IN_PROGRESS" && (
                        <Link href={`/dashboard/assessment/${assessment.id}`}>
                          <Button variant="outline" size="sm">
                            Lanjutkan
                          </Button>
                        </Link>
                      )}
                      {(assessment.status === "COMPLETED" ||
                        assessment.status === "ANALYZED") && (
                        <Link href={`/dashboard/report/${assessment.id}`}>
                          <Button variant="default" size="sm">
                            Lihat Laporan
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
