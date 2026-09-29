"use client";

import { CategoryScore } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GiftCardProps {
  title: string;
  items: CategoryScore[];
  color: string;
  undifferentiated?: boolean;
}

export function GiftCard({
  title,
  items,
  color,
  undifferentiated = false,
}: GiftCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {undifferentiated ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jawaban di bagian ini hampir merata — belum ada puncak yang cukup
            jelas untuk disebut “utama”. Ini informasi yang berguna, bukan
            kegagalan. Bahas bersama mentor sebelum mengambil keputusan.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const display = item.rawMean ?? item.score;
              return (
                <div key={item.category} className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <div className="mt-1 h-2 rounded-full bg-surface shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(display / 5) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    {item.ipsative != null && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        relatif {item.ipsative > 0 ? "+" : ""}
                        {item.ipsative} vs rata-rata diri
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {display}/5
                  </span>
                </div>
              );
            })}
            <p className="text-[11px] text-muted-foreground pt-1">
              Angka adalah rata-rata jawaban Anda (1–5), bukan perbandingan
              dengan orang lain.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
