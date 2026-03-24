"use client";

import { ShapeProfileData } from "@/types";
import { getPersonalityLabel } from "@/lib/utils";

interface PersonalityChartProps {
  personality: ShapeProfileData["personality"];
}

const DIMENSIONS = [
  {
    positive: "Extrovert",
    negative: "Introvert",
    key: "introvertExtrovert" as const,
  },
  {
    positive: "Berorientasi Tugas",
    negative: "Berorientasi Relasi",
    key: "taskPeople" as const,
  },
  {
    positive: "Terstruktur",
    negative: "Fleksibel",
    key: "structuredFlexible" as const,
  },
  { positive: "Pemikir", negative: "Perasa", key: "thinkerFeeler" as const },
  {
    positive: "Pemimpin",
    negative: "Pendukung",
    key: "leaderSupporter" as const,
  },
];

export function PersonalityChart({ personality }: PersonalityChartProps) {
  return (
    <div className="neo-card">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Profil Kepribadian
      </h3>
      <div className="space-y-6">
        {DIMENSIONS.map((dim) => {
          const value = personality[dim.key];
          const percentage = Math.round(value * 100);

          return (
            <div key={dim.key}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {dim.positive}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getPersonalityLabel(value, dim.positive, dim.negative)}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {dim.negative}
                </span>
              </div>
              <div className="h-4 rounded-full bg-surface shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-muted-foreground/30" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
