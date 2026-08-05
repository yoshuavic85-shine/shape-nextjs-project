"use client";

import { LIKERT_OPTIONS, FREQUENCY_OPTIONS, ShapeSection } from "@/types";
import { cn } from "@/lib/utils";

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  /** EXPERIENCE uses frequency / formative-impact anchors */
  section?: ShapeSection;
  name?: string;
}

export function LikertScale({
  value,
  onChange,
  disabled,
  section,
  name = "likert",
}: LikertScaleProps) {
  const options =
    section === "EXPERIENCE" ? FREQUENCY_OPTIONS : LIKERT_OPTIONS;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    optionValue: number,
  ) => {
    if (disabled) return;
    const idx = options.findIndex((o) => o.value === optionValue);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = options[Math.min(idx + 1, options.length - 1)];
      onChange(next.value);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = options[Math.max(idx - 1, 0)];
      onChange(prev.value);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(options[0].value);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(options[options.length - 1].value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex justify-between gap-2"
        role="radiogroup"
        aria-label="Skala jawaban"
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              name={name}
              aria-checked={selected}
              aria-label={`${option.value}: ${option.label}`}
              tabIndex={selected || (value == null && option.value === 3) ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              className={cn(
                "flex-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer",
                selected
                  ? "bg-primary text-primary-foreground shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]"
                  : "bg-surface shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)] hover:shadow-[1px_1px_3px_var(--shadow-dark),-1px_-1px_3px_var(--shadow-light)] text-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <span className="block text-lg font-bold mb-1">{option.value}</span>
              <span className="hidden sm:block leading-tight">
                {option.label}
              </span>
              <span className="sm:hidden sr-only">{option.label}</span>
            </button>
          );
        })}
      </div>
      <p className="sm:hidden text-center text-[11px] text-muted-foreground">
        1 ={" "}
        {section === "EXPERIENCE" ? "Tidak pernah" : "Sangat tidak setuju"} · 5
        = {section === "EXPERIENCE" ? "Sangat sering" : "Sangat setuju"}
      </p>
    </div>
  );
}
