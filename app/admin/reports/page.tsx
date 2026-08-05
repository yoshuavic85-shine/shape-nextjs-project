import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, FileText, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TOTAL_QUESTION_COUNT } from "@/types";
import { ReportsFilter } from "./reports-filter";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { q, status } = await searchParams;
  const query = q?.trim() ?? "";
  const statusFilter = status?.trim() ?? "";

  const assessments = await db.assessment.findMany({
    where: {
      ...(statusFilter
        ? { status: statusFilter as "IN_PROGRESS" | "COMPLETED" | "ANALYZED" }
        : {}),
      ...(query
        ? {
            user: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          church: { select: { name: true } },
        },
      },
      shapeProfile: { select: { id: true, quality: true } },
      aiInsight: { select: { id: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const completed = assessments.filter(
    (a) => a.status === "COMPLETED" || a.status === "ANALYZED",
  ).length;
  const analyzed = assessments.filter((a) => a.status === "ANALYZED").length;
  const inProgress = assessments.filter(
    (a) => a.status === "IN_PROGRESS",
  ).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Laporan Assessment
        </h1>
        <p className="text-muted-foreground mt-1">
          Lihat hasil assessment SHAPE per pengguna
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{assessments.length}</p>
            <p className="text-sm text-muted-foreground">Ditampilkan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-blue-500">{inProgress}</p>
            <p className="text-sm text-muted-foreground">Berjalan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-amber-500">{completed}</p>
            <p className="text-sm text-muted-foreground">Selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-600">{analyzed}</p>
            <p className="text-sm text-muted-foreground">Sudah AI</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="w-4 h-4" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReportsFilter initialQ={query} initialStatus={statusFilter} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Daftar Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              Tidak ada assessment yang cocok.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-3 pr-4 font-medium">Pengguna</th>
                    <th className="py-3 pr-4 font-medium">Gereja</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Jawaban</th>
                    <th className="py-3 pr-4 font-medium">Diperbarui</th>
                    <th className="py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => {
                    const quality = a.shapeProfile?.quality as
                      | { overallConfidence?: string }
                      | null
                      | undefined;
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-border/60 hover:bg-muted/20"
                      >
                        <td className="py-3 pr-4">
                          <p className="font-medium text-foreground">
                            {a.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.user.email}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {a.user.church?.name ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={
                              a.status === "ANALYZED"
                                ? "text-green-600"
                                : a.status === "COMPLETED"
                                  ? "text-amber-600"
                                  : "text-blue-500"
                            }
                          >
                            {a.status === "ANALYZED"
                              ? "Dianalisis"
                              : a.status === "COMPLETED"
                                ? "Selesai"
                                : "Berjalan"}
                          </span>
                          {quality?.overallConfidence && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Kualitas: {quality.overallConfidence}
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {a._count.responses}/{TOTAL_QUESTION_COUNT}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(a.updatedAt)}
                        </td>
                        <td className="py-3">
                          {a.status === "IN_PROGRESS" ? (
                            <span className="text-xs text-muted-foreground">
                              Belum selesai
                            </span>
                          ) : (
                            <Link href={`/admin/reports/${a.id}`}>
                              <Button size="sm" variant="outline">
                                Lihat Laporan
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
