"use client";

import { ShapeProfileData } from "@/types";
import { CATEGORY_LABELS } from "@/lib/constants/category-labels";
import { getPersonalityLabel } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProfileCompareProps {
  leftLabel: string;
  rightLabel: string;
  left: ShapeProfileData;
  right: ShapeProfileData;
}

function TopCol({
  title,
  items,
}: {
  title: string;
  items: { category: string; label: string; score: number; rawMean?: number }[];
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">{title}</p>
      <ul className="space-y-1">
        {items.slice(0, 3).map((item) => (
          <li key={item.category} className="text-sm">
            {item.label}{" "}
            <span className="text-muted-foreground">
              ({item.rawMean ?? item.score}/5)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProfileCompare({
  leftLabel,
  rightLabel,
  left,
  right,
}: ProfileCompareProps) {
  const dims = [
    {
      key: "introvertExtrovert" as const,
      pos: "Extrovert",
      neg: "Introvert",
    },
    { key: "taskPeople" as const, pos: "Tugas", neg: "Relasi" },
    { key: "structuredFlexible" as const, pos: "Terstruktur", neg: "Fleksibel" },
    { key: "thinkerFeeler" as const, pos: "Pemikir", neg: "Perasa" },
    { key: "leaderSupporter" as const, pos: "Pemimpin", neg: "Pendukung" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{leftLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TopCol title="Karunia" items={left.spiritualGifts.top} />
            <TopCol title="Passion" items={left.heart.top} />
            <TopCol title="Kemampuan" items={left.abilities.top} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{rightLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TopCol title="Karunia" items={right.spiritualGifts.top} />
            <TopCol title="Passion" items={right.heart.top} />
            <TopCol title="Kemampuan" items={right.abilities.top} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kepribadian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dims.map((d) => (
            <div
              key={d.key}
              className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/40 last:border-0"
            >
              <span className="text-muted-foreground">
                {d.neg}–{d.pos}
              </span>
              <span>
                {getPersonalityLabel(
                  left.personality[d.key],
                  d.pos,
                  d.neg,
                  left.personality.ambiguousDimensions?.includes(d.key),
                )}
              </span>
              <span>
                {getPersonalityLabel(
                  right.personality[d.key],
                  d.pos,
                  d.neg,
                  right.personality.ambiguousDimensions?.includes(d.key),
                )}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Bandingkan pergeseran pola, bukan “skor naik/turun”. Assessment ulang
        paling bermakna setelah beberapa bulan eksperimen pelayanan.
      </p>
      <p className="sr-only">{CATEGORY_LABELS.TEACHING}</p>
    </div>
  );
}
