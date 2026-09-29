"use client";

import { ShapeProfileData } from "@/types";
import { CATEGORY_LABELS } from "@/lib/constants/category-labels";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ObserverRating {
  raterName: string;
  raterRelation: string;
  gifts: Record<string, number>;
  heart: Record<string, number>;
  abilities: Record<string, number>;
  note?: string | null;
}

interface ObserverGapProps {
  profile: ShapeProfileData;
  ratings: ObserverRating[];
}

function averageMaps(maps: Record<string, number>[]): Record<string, number> {
  const acc: Record<string, number[]> = {};
  for (const m of maps) {
    for (const [k, v] of Object.entries(m)) {
      if (!acc[k]) acc[k] = [];
      acc[k].push(v);
    }
  }
  const out: Record<string, number> = {};
  for (const [k, vals] of Object.entries(acc)) {
    out[k] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }
  return out;
}

function GapList({
  title,
  selfMeans,
  otherMeans,
}: {
  title: string;
  selfMeans: Record<string, number>;
  otherMeans: Record<string, number>;
}) {
  const keys = Object.keys(selfMeans);
  const rows = keys
    .map((k) => {
      const self = selfMeans[k] ?? 0;
      const other = otherMeans[k];
      return {
        key: k,
        label: CATEGORY_LABELS[k] || k,
        self,
        other,
        gap: other == null ? null : Math.round((other - self) * 10) / 10,
      };
    })
    .filter((r) => r.other != null)
    .sort((a, b) => Math.abs(b.gap ?? 0) - Math.abs(a.gap ?? 0))
    .slice(0, 6);

  if (rows.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.key} className="text-sm flex justify-between gap-3">
            <span>{r.label}</span>
            <span className="text-muted-foreground whitespace-nowrap">
              diri {r.self} · orang lain {r.other}
              {r.gap != null && r.gap !== 0
                ? ` (${r.gap > 0 ? "+" : ""}${r.gap})`
                : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ObserverGap({ profile, ratings }: ObserverGapProps) {
  if (ratings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada pengamat yang mengisi. Undang 2–3 orang yang mengenal Anda
        di tab Pendampingan.
      </p>
    );
  }

  const giftAvg = averageMaps(ratings.map((r) => r.gifts));
  const heartAvg = averageMaps(ratings.map((r) => r.heart));
  const abilityAvg = averageMaps(ratings.map((r) => r.abilities));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diri vs orang lain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Berdasarkan {ratings.length} pengamat. Selisih besar patut dibahas
          dengan mentor — mungkin Anda meremehkan atau melebihkan suatu pola.
        </p>
        <GapList
          title="Karunia"
          selfMeans={profile.spiritualGifts.rawMeans ?? profile.spiritualGifts.scores}
          otherMeans={giftAvg}
        />
        <GapList
          title="Passion"
          selfMeans={profile.heart.rawMeans ?? profile.heart.scores}
          otherMeans={heartAvg}
        />
        <GapList
          title="Kemampuan"
          selfMeans={profile.abilities.rawMeans ?? profile.abilities.scores}
          otherMeans={abilityAvg}
        />
        {ratings.some((r) => r.note) && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Catatan pengamat</h4>
            <ul className="space-y-2">
              {ratings
                .filter((r) => r.note)
                .map((r) => (
                  <li key={r.raterName} className="text-sm p-3 rounded-xl bg-background">
                    <p className="font-medium">
                      {r.raterName} · {r.raterRelation}
                    </p>
                    <p className="text-muted-foreground mt-1">{r.note}</p>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
