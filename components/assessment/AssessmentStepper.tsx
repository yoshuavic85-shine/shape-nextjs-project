"use client";

import { useState } from "react";
import { Question, ShapeSection, SECTION_CONFIGS } from "@/types";
import { QuestionCard } from "./QuestionCard";
import { SectionProgress } from "./SectionProgress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AssessmentStepperProps {
  assessmentId: string;
  questions: Question[];
  currentSection: ShapeSection;
  existingResponses: Record<string, number>;
}

const SECTION_ORDER: ShapeSection[] = [
  "SPIRITUAL_GIFTS",
  "HEART",
  "ABILITIES",
  "PERSONALITY",
  "EXPERIENCE",
];

export function AssessmentStepper({
  assessmentId,
  questions,
  currentSection,
  existingResponses,
}: AssessmentStepperProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<ShapeSection>(currentSection);
  const [responses, setResponses] =
    useState<Record<string, number>>(existingResponses);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionQuestions = questions.filter((q) => q.section === activeSection);
  const activeIdx = SECTION_ORDER.indexOf(activeSection);
  const completedSections = SECTION_ORDER.slice(0, activeIdx);

  const allAnswered = sectionQuestions.every((q) => responses[q.id] != null);
  const answeredCount = sectionQuestions.filter(
    (q) => responses[q.id] != null,
  ).length;
  const progressPercent = (answeredCount / sectionQuestions.length) * 100;
  const sectionConfig = SECTION_CONFIGS.find((s) => s.key === activeSection);

  const totalAnswered = Object.keys(responses).length;
  const totalQuestions = questions.length;
  const overallProgress = (totalAnswered / totalQuestions) * 100;

  const handleResponseChange = (questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitSection = async () => {
    if (!allAnswered) return;
    setSaving(true);
    setError(null);

    try {
      const sectionResponses = sectionQuestions.map((q) => ({
        questionId: q.id,
        value: responses[q.id],
      }));

      const res = await fetch(`/api/assessment/${assessmentId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: sectionResponses }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan jawaban");
      }

      const nextIdx = activeIdx + 1;
      if (nextIdx < SECTION_ORDER.length) {
        setActiveSection(SECTION_ORDER[nextIdx]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push(`/dashboard/report/${assessmentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Progress */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="neo-card sticky top-8">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Progress Keseluruhan
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {totalAnswered}/{totalQuestions} pertanyaan dijawab
          </p>
          <Progress value={overallProgress} className="mb-4" />
          <SectionProgress
            currentSection={activeSection}
            completedSections={completedSections}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="flex-1 max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {sectionConfig?.title}
          </h2>
          <p className="text-muted-foreground mt-1">
            {sectionConfig?.description}
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
              onClick={() => setActiveSection(SECTION_ORDER[activeIdx - 1])}
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
              {activeIdx < SECTION_ORDER.length - 1
                ? "Lanjut ke Bagian Berikutnya"
                : "Selesaikan Assessment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
