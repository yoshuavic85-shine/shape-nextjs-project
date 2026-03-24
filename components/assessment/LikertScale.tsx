"use client";

import { LIKERT_OPTIONS } from "@/types";
import { cn } from "@/lib/utils";

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2">
        {LIKERT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer",
              value === option.value
                ? "bg-primary text-primary-foreground shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]"
                : "bg-surface shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] hover:shadow-[1px_1px_3px_var(--shadow-dark),-1px_-1px_3px_var(--shadow-light)] text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <span className="block text-lg font-bold mb-1">{option.value}</span>
            <span className="hidden sm:block leading-tight">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
