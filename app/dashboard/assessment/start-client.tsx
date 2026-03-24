"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SECTION_CONFIGS } from "@/types";
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

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assessment", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/assessment/${data.assessment.id}`);
      }
    } catch {
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
          Jawab 90 pertanyaan untuk memahami desain unik Anda. Assessment
          terdiri dari 5 bagian.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {SECTION_CONFIGS.map((section, idx) => {
          const Icon = ICONS[section.icon] || Sparkles;
          return (
            <Card key={section.key}>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
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
          Progress Anda akan tersimpan otomatis di setiap bagian.
        </p>
      </div>
    </div>
  );
}
