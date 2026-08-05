"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SECTION_CONFIGS, TOTAL_QUESTION_COUNT } from "@/types";
import {
  Loader2,
  Sparkles,
  Heart,
  Zap,
  User,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Heart,
  Zap,
  User,
  BookOpen,
};

export function AssessmentStartClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assessment", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal memulai assessment");
      }
      router.push(`/dashboard/assessment/${data.assessment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Assessment SHAPE
        </h1>
        <p className="text-muted-foreground">
          Jawab {TOTAL_QUESTION_COUNT} pertanyaan untuk merefleksikan desain
          pelayanan Anda. Assessment terdiri dari 5 bagian (instrumen v2 dengan
          item yang lebih lengkap dan pemeriksaan kualitas jawaban).
        </p>
        <p className="text-xs text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
          Hasil bersifat reflektif untuk discovery pelayanan — bukan diagnosis
          psikologis. Estimasi waktu: 35–50 menit. Setiap jawaban tersimpan
          otomatis; progress juga disimpan per bagian.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {SECTION_CONFIGS.map((section, idx) => {
          const Icon = ICONS[section.icon] || Sparkles;
          return (
            <Card key={section.key}>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {idx + 1}. {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description} — {section.questionCount} pertanyaan
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <Button
          size="lg"
          onClick={handleStart}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
          Mulai Assessment
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Jawaban tersimpan otomatis. Anda dapat meninggalkan halaman dan
          melanjutkan nanti.
        </p>
      </div>
    </div>
  );
}
