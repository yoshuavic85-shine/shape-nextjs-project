"use client";

import { useState, useEffect, useRef } from "react";
import { ShapeProfileData, AiInsightData, CallingProfileData } from "@/types";
import { ShapeRadarChart } from "@/components/profile/ShapeRadarChart";
import { GiftCard } from "@/components/profile/GiftCard";
import { PersonalityChart } from "@/components/profile/PersonalityChart";
import { CallingInsight } from "@/components/profile/CallingInsight";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Brain,
  Compass,
  Sparkles,
  Heart,
  LightbulbIcon,
  Target,
  Sprout,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ReportClientProps {
  assessmentId: string;
  profile: ShapeProfileData | null;
  aiInsight: AiInsightData | null;
  callingProfile: CallingProfileData | null;
}

export function ReportClient({
  assessmentId,
  profile,
  aiInsight,
  callingProfile,
}: ReportClientProps) {
  const [insight, setInsight] = useState<AiInsightData | null>(aiInsight);
  const [calling, setCalling] = useState<CallingProfileData | null>(
    callingProfile,
  );
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ value: number; label: string }>({
    value: 0,
    label: "",
  });
  const [progressDone, setProgressDone] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [activeTab, setActiveTab] = useState<"profile" | "calling">("profile");
  const generatedOnce = useRef(false);

  const runGenerateFull = () => {
    if (!profile || loadingAI) return;
    setLoadingAI(true);
    setError(null);
    setProgress({ value: 0, label: "Memulai..." });
    setProgressDone("idle");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

    fetch("/api/ai/generate-full-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)) as {
                  phase: string;
                  status?: string;
                  progress?: number;
                  label?: string;
                  message?: string;
                  aiInsight?: AiInsightData;
                  callingProfile?: CallingProfileData;
                };
                if (data.progress != null)
                  setProgress({
                    value: data.progress,
                    label: data.label ?? "",
                  });
                if (data.phase === "error") {
                  const msg = data.message ?? "Gagal menghasilkan AI";
                  setError(msg);
                  setProgress({ value: 0, label: msg });
                  setProgressDone("error");
                }
                if (data.phase === "done" && data.aiInsight && data.callingProfile) {
                  setInsight(data.aiInsight);
                  setCalling(data.callingProfile);
                  setProgressDone("success");
                }
              } catch {
                // skip invalid JSON
              }
            }
          }
        }
      })
      .catch((err) => {
        const msg =
          err.name === "AbortError"
            ? "Permintaan terlalu lama. Coba lagi atau periksa koneksi."
            : err instanceof Error
              ? err.message
              : "Gagal menghasilkan AI";
        setError(msg);
        setProgressDone("error");
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoadingAI(false);
      });
  };

  useEffect(() => {
    if (
      profile &&
      (!insight || !calling) &&
      !loadingAI &&
      !generatedOnce.current
    ) {
      generatedOnce.current = true;
      runGenerateFull();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, profile]);

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Profil sedang dihitung...
        </h2>
        <p className="text-muted-foreground">Silakan refresh halaman ini.</p>
      </div>
    );
  }

  const tabs = [
    { key: "profile" as const, label: "Profil SHAPE", icon: Target },
    { key: "calling" as const, label: "Arah Panggilan", icon: Compass },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Laporan SHAPE Anda
        </h1>
        <p className="text-muted-foreground mt-1">
          Hasil assessment SHAPE yang menunjukkan desain unik Anda.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
                  : "neo-button text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* ── TAB: Profil SHAPE — Siapa Saya? ── */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Intro banner */}
          <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-primary mt-0.5 shrink-0" />
              <div>
                <h2 className="font-semibold text-foreground mb-1">Siapa Saya?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bagian ini menampilkan desain unik Anda — karunia rohani, passion,
                  kemampuan, kepribadian, dan pengalaman formatif. AI kemudian merangkum
                  semuanya menjadi insight tentang{" "}
                  <strong className="text-foreground">kekuatan dan identitas</strong> Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ShapeRadarChart
              data={Object.entries(profile.spiritualGifts.scores).map(
                ([category, score]) => ({
                  category,
                  score: score as number,
                  label:
                    profile.spiritualGifts.top.find(
                      (t) => t.category === category,
                    )?.label || category,
                }),
              )}
              color="#8B6F47"
              title="Karunia Rohani"
            />
            <ShapeRadarChart
              data={Object.entries(profile.abilities.scores).map(
                ([category, score]) => ({
                  category,
                  score: score as number,
                  label:
                    profile.abilities.top.find((t) => t.category === category)
                      ?.label || category,
                }),
              )}
              color="#6B8E5A"
              title="Kemampuan"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GiftCard
              title="Top Karunia Rohani"
              items={profile.spiritualGifts.top}
              color="#8B6F47"
            />
            <GiftCard
              title="Top Passion"
              items={profile.heart.top}
              color="#C4956A"
            />
            <GiftCard
              title="Top Kemampuan"
              items={profile.abilities.top}
              color="#6B8E5A"
            />
          </div>

          <PersonalityChart personality={profile.personality} />

          <GiftCard
            title="Pengalaman Formatif"
            items={profile.experience.top}
            color="#8B6F47"
          />

          {/* ── AI Insight: Identitas & Kekuatan ── */}
          {insight ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pt-2">
                <div className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-2 text-sm font-semibold text-primary px-3 py-1.5 rounded-full bg-primary/10">
                  <Brain className="w-4 h-4" />
                  Analisis AI — Identitas &amp; Kekuatan
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LightbulbIcon className="w-5 h-5 text-primary" />
                    Ringkasan Profil SHAPE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {insight.summary}
                  </p>
                </CardContent>
              </Card>

              {insight.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Kekuatan Utama Anda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insight.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex gap-3 p-3 rounded-xl bg-background text-sm text-foreground"
                        >
                          <span className="shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {insight.ministryRecommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-accent" />
                      Area Pelayanan yang Cocok
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insight.ministryRecommendations.map((r, i) => (
                        <li
                          key={i}
                          className="p-3 rounded-xl bg-background text-sm text-foreground"
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {insight.growthSuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-secondary" />
                      Saran Pertumbuhan Rohani
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insight.growthSuggestions.map((g, i) => (
                        <li
                          key={i}
                          className="p-3 rounded-xl bg-background text-sm text-foreground"
                        >
                          {g}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {insight.reflectionQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      Pertanyaan Refleksi Diri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3 list-decimal list-inside">
                      {insight.reflectionQuestions.map((q, i) => (
                        <li
                          key={i}
                          className="text-foreground leading-relaxed pl-2"
                        >
                          {q}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                {loadingAI ? (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {progressDone === "error" ? (
                        <XCircle className="w-12 h-12 text-destructive" />
                      ) : (
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      )}
                      <h3 className="text-lg font-semibold text-foreground">
                        {progress.label || "Menyiapkan analisis AI..."}
                      </h3>
                    </div>
                    <Progress value={progress.value} className="h-3 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {progress.value}% — Proses bisa memakan waktu 5–10 menit.
                      Jangan tutup halaman.
                    </p>
                  </>
                ) : (
                  <>
                    {progressDone === "success" ? (
                      <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500 mx-auto mb-4" />
                    ) : (
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    )}
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Analisis AI — Identitas &amp; Kekuatan
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {error ||
                        "Ringkasan kekuatan dan rekomendasi akan muncul di sini setelah selesai."}
                    </p>
                    {error && (
                      <button
                        type="button"
                        onClick={() => runGenerateFull()}
                        className="text-sm font-medium text-primary underline hover:no-underline"
                      >
                        Coba lagi
                      </button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: Arah Panggilan — Kemana Saya Dipanggil? ── */}
      {activeTab === "calling" && (
        <div className="space-y-6">
          {/* Intro banner */}
          <div className="p-5 rounded-2xl border border-secondary/20 bg-secondary/5">
            <div className="flex items-start gap-3">
              <Compass className="w-6 h-6 text-secondary mt-0.5 shrink-0" />
              <div>
                <h2 className="font-semibold text-foreground mb-1">
                  Kemana Saya Dipanggil?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Berbeda dari tab Profil SHAPE yang fokus pada identitas, bagian ini
                  mengeksplorasi{" "}
                  <strong className="text-foreground">
                    arah dan konteks pelayanan
                  </strong>{" "}
                  Anda — kelompok panggilan, lingkungan yang cocok, pola hidup,
                  dan langkah konkret pengembangan diri ke depan.
                </p>
              </div>
            </div>
          </div>

          {calling ? (
            <CallingInsight calling={calling} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                {loadingAI ? (
                  <>
                    <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Menyiapkan Arah Panggilan...
                    </h3>
                    <p className="text-muted-foreground">
                      Analisis sedang berjalan. Silakan tunggu.
                    </p>
                  </>
                ) : (
                  <>
                    <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Arah Panggilan
                    </h3>
                    <p className="text-muted-foreground">
                      {error
                        ? "Terjadi kesalahan. Gunakan tombol \u201CCoba lagi\u201D di tab Profil SHAPE."
                        : "Profil panggilan akan muncul di sini setelah analisis AI selesai."}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
