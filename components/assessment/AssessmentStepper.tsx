"use client";

import { useState, useEffect, useRef } from "react";
import {
  Question,
  ShapeSection,
  SECTION_CONFIGS,
  SECTION_ORDER,
  getSectionTitle,
} from "@/types";
import { QuestionCard } from "./QuestionCard";
import { SectionProgress } from "./SectionProgress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Loader2, Clock, Eye } from "lucide-react";

interface AssessmentStepperProps {
  assessmentId: string;
  questions: Question[];
  currentSection: ShapeSection;
  existingResponses: Record<string, number>;
}

const IDLE_MS = 15 * 60 * 1000;

export function AssessmentStepper({
  assessmentId,
  questions,
  currentSection,
  existingResponses,
}: AssessmentStepperProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<ShapeSection>(currentSection);
  const [dbCurrentSection, setDbCurrentSection] =
    useState<ShapeSection>(currentSection);
  const [responses, setResponses] =
    useState<Record<string, number>>(existingResponses);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [idleWarning, setIdleWarning] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaves = useRef<Record<string, number>>({});

  const sectionQuestions = questions.filter((q) => q.section === activeSection);
  const activeIdx = SECTION_ORDER.indexOf(activeSection);
  const dbIdx = SECTION_ORDER.indexOf(dbCurrentSection);
  const isOnDbCurrent = activeSection === dbCurrentSection;
  const isLastSection = activeIdx === SECTION_ORDER.length - 1;

  // Sections before DB cursor that have all answers persisted locally
  const persistedCompleted = SECTION_ORDER.filter((section) => {
    const idx = SECTION_ORDER.indexOf(section);
    if (idx >= dbIdx) return false;
    const qs = questions.filter((q) => q.section === section);
    return qs.every((q) => responses[q.id] != null);
  });

  const allAnswered = sectionQuestions.every((q) => responses[q.id] != null);
  const answeredCount = sectionQuestions.filter(
    (q) => responses[q.id] != null,
  ).length;
  const progressPercent =
    sectionQuestions.length > 0
      ? (answeredCount / sectionQuestions.length) * 100
      : 0;
  const sectionConfig = SECTION_CONFIGS.find((s) => s.key === activeSection);

  const totalAnswered = Object.keys(responses).length;
  const totalQuestions = questions.length;
  const overallProgress =
    totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;

  const flushAutosave = async () => {
    const batch = { ...pendingSaves.current };
    pendingSaves.current = {};
    const entries = Object.entries(batch);
    if (entries.length === 0) return;

    setAutosaving(true);
    try {
      const res = await fetch(`/api/assessment/${assessmentId}/responses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: entries.map(([questionId, value]) => ({
            questionId,
            value,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menyimpan otomatis");
      }
    } catch (err) {
      // Re-queue failed saves
      for (const [k, v] of entries) {
        if (pendingSaves.current[k] == null) pendingSaves.current[k] = v;
      }
      setError(err instanceof Error ? err.message : "Gagal autosave");
    } finally {
      setAutosaving(false);
    }
  };

  const resetIdle = () => {
    setIdleWarning(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdleWarning(true), IDLE_MS);
  };

  useEffect(() => {
    resetIdle();
    const onActivity = () => resetIdle();
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pendingSaves.current).length > 0) {
        e.preventDefault();
        void flushAutosave();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    pendingSaves.current[questionId] = value;
    resetIdle();
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flushAutosave();
    }, 600);
  };

  const goToSection = (section: ShapeSection) => {
    const idx = SECTION_ORDER.indexOf(section);
    if (idx > dbIdx) return; // cannot skip ahead of DB cursor
    setReviewMode(false);
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitSection = async () => {
    if (!allAnswered) return;

    // Editing a prior section: answers already autosaved — just move forward in UI
    if (!isOnDbCurrent) {
      const nextIdx = activeIdx + 1;
      if (nextIdx <= dbIdx) {
        goToSection(SECTION_ORDER[nextIdx]);
      } else {
        goToSection(dbCurrentSection);
      }
      return;
    }

    // Last section: enter review before completing
    if (isLastSection && !reviewMode) {
      await flushAutosave();
      setReviewMode(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await flushAutosave();

      const sectionResponses = sectionQuestions.map((q) => ({
        questionId: q.id,
        value: responses[q.id],
      }));

      const res = await fetch(`/api/assessment/${assessmentId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: activeSection,
          responses: sectionResponses,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.currentSection) {
          setDbCurrentSection(data.currentSection as ShapeSection);
        }
        throw new Error(data.error || "Gagal menyimpan jawaban");
      }

      if (data.completed) {
        router.push(`/dashboard/report/${assessmentId}`);
        return;
      }

      const nextSection =
        (data.currentSection as ShapeSection) ??
        SECTION_ORDER[activeIdx + 1];
      setDbCurrentSection(nextSection);
      setActiveSection(nextSection);
      setReviewMode(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const primaryLabel = (() => {
    if (reviewMode) return "Konfirmasi & Selesaikan Assessment";
    if (!isOnDbCurrent) return "Kembali ke Bagian Berikutnya";
    if (isLastSection) return "Tinjau Jawaban";
    return "Lanjut ke Bagian Berikutnya";
  })();

  if (reviewMode) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            Tinjau Jawaban
          </h2>
          <p className="text-muted-foreground mt-1">
            Periksa ringkasan sebelum menyelesaikan. Anda masih bisa kembali ke
            bagian mana pun untuk mengubah jawaban (tersimpan otomatis).
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {SECTION_ORDER.map((section) => {
            const qs = questions.filter((q) => q.section === section);
            const done = qs.filter((q) => responses[q.id] != null).length;
            return (
              <button
                key={section}
                type="button"
                onClick={() => goToSection(section)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-surface text-left hover:bg-muted/40 transition-colors"
              >
                <span className="font-medium text-foreground">
                  {getSectionTitle(section)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {done}/{qs.length} dijawab
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={() => setReviewMode(false)}>
            Kembali ke Pengalaman
          </Button>
          <Button
            onClick={handleSubmitSection}
            disabled={saving || totalAnswered < totalQuestions}
            size="lg"
          >
            {saving && <Loader2 className="animate-spin" />}
            {primaryLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-64 shrink-0">
        <div className="neo-card sticky top-8">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Progress Keseluruhan
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {totalAnswered}/{totalQuestions} pertanyaan dijawab
            {autosaving && " · menyimpan…"}
          </p>
          <Progress value={overallProgress} className="mb-4" />
          <SectionProgress
            currentSection={activeSection}
            completedSections={persistedCompleted}
            onSectionClick={goToSection}
            maxReachableSection={dbCurrentSection}
          />
        </div>
      </div>

      <div className="flex-1 max-w-3xl">
        {idleWarning && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Sesi tampak tidak aktif</p>
              <p className="mt-1 opacity-90">
                Jawaban tersimpan otomatis. Lanjutkan kapan saja — assessment
                biasanya memakan waktu 35–50 menit.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => resetIdle()}
              >
                Saya masih di sini
              </Button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {sectionConfig?.title}
          </h2>
          <p className="text-muted-foreground mt-1">
            {sectionConfig?.description}
          </p>
          <p className="text-xs text-muted-foreground mt-2 p-3 rounded-xl bg-muted/40 leading-relaxed">
            Jawab jujur sesuai diri Anda — bukan jawaban yang “terlihat rohani”.
            Beberapa pertanyaan sengaja dibalik atau memeriksa perhatian agar
            hasil lebih akurat. Ini alat refleksi pelayanan, bukan tes klinis.
            Jawaban tersimpan otomatis.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {answeredCount}/{sectionQuestions.length}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {sectionQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              questionNumber={idx + 1}
              value={responses[q.id] ?? null}
              onChange={handleResponseChange}
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {activeIdx > 0 && (
            <Button
              variant="outline"
              onClick={() => goToSection(SECTION_ORDER[activeIdx - 1])}
            >
              Kembali
            </Button>
          )}
          <div className="ml-auto">
            <Button
              onClick={handleSubmitSection}
              disabled={!allAnswered || saving}
              size="lg"
            >
              {saving && <Loader2 className="animate-spin" />}
              {primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
