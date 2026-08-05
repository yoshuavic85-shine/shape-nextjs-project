"use client";

import { SECTION_CONFIGS, SECTION_ORDER, ShapeSection } from "@/types";
import { cn } from "@/lib/utils";
import { Sparkles, Heart, Zap, User, BookOpen, Check } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  Sparkles,
  Heart,
  Zap,
  User,
  BookOpen,
};

interface SectionProgressProps {
  currentSection: ShapeSection;
  completedSections: ShapeSection[];
  onSectionClick?: (section: ShapeSection) => void;
  maxReachableSection?: ShapeSection;
}

export function SectionProgress({
  currentSection,
  completedSections,
  onSectionClick,
  maxReachableSection,
}: SectionProgressProps) {
  const maxIdx = maxReachableSection
    ? SECTION_ORDER.indexOf(maxReachableSection)
    : SECTION_ORDER.length - 1;

  return (
    <div className="flex flex-col gap-2">
      {SECTION_CONFIGS.map((section, idx) => {
        const Icon = ICONS[section.icon] || Sparkles;
        const isCompleted = completedSections.includes(section.key);
        const isCurrent = currentSection === section.key;
        const reachable = idx <= maxIdx;
        const clickable = Boolean(onSectionClick) && reachable && !isCurrent;

        const content = (
          <>
            <div className="flex-shrink-0">
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{section.title}</p>
            </div>
            <span className="text-xs opacity-70">{idx + 1}/5</span>
          </>
        );

        const className = cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left",
          isCurrent
            ? "bg-primary text-primary-foreground shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
            : isCompleted
              ? "bg-secondary/20 text-secondary"
              : reachable
                ? "bg-surface text-muted-foreground shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)]"
                : "bg-surface/50 text-muted-foreground/50",
          clickable && "cursor-pointer hover:opacity-90",
          !reachable && "cursor-not-allowed",
        );

        if (clickable) {
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => onSectionClick?.(section.key)}
              className={className}
            >
              {content}
            </button>
          );
        }

        return (
          <div key={section.key} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
