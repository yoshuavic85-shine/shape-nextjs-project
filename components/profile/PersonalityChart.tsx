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
  const ambiguous = new Set(personality.ambiguousDimensions ?? []);

  return (
    <div className="neo-card">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Profil Kepribadian
      </h3>
      <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
        Spektrum bipolar: 0 = kutub kiri, 1 = kutub kanan. Penanda menunjukkan
        posisi relatif Anda — bukan bilah kemajuan. Sinyal campuran berarti
        kedua kutub sama-sama tinggi/rendah.
      </p>
      <div className="space-y-6">
        {DIMENSIONS.map((dim) => {
          const value = personality[dim.key];
          const percentage = Math.round(value * 100);
          const markerPct = Math.min(100, Math.max(0, value * 100));
          const isAmbiguous = ambiguous.has(dim.key);

          return (
            <div key={dim.key}>
              <div className="flex justify-between mb-2 gap-2">
                <span className="text-sm font-medium text-foreground">
                  {dim.negative}
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  {getPersonalityLabel(
                    value,
                    dim.positive,
                    dim.negative,
                    isAmbiguous,
                  )}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {dim.positive}
                </span>
              </div>
              <div
                className="h-4 rounded-full bg-surface shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] relative"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                aria-label={`${dim.negative}–${dim.positive}`}
              >
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-muted-foreground/30" />
                <div
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm transition-all duration-700 ${
                    isAmbiguous ? "bg-muted-foreground/60" : "bg-primary"
                  }`}
                  style={{ left: `${markerPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
