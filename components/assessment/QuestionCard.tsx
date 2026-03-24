"use client";

import { Question } from "@/types";
import { LikertScale } from "./LikertScale";
import { Card } from "@/components/ui/card";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  value: number | null;
  onChange: (questionId: string, value: number) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  value,
  onChange,
}: QuestionCardProps) {
  return (
    <Card className="mb-4">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          {questionNumber}
        </div>
        <div className="flex-1">
          <p className="text-foreground font-medium mb-4 leading-relaxed">
            {question.text}
          </p>
          <LikertScale
            value={value}
            onChange={(v) => onChange(question.id, v)}
          />
        </div>
      </div>
    </Card>
  );
}
