"use client";

import { CategoryScore } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface GiftCardProps {
  title: string;
  items: CategoryScore[];
  color: string;
}

export function GiftCard({ title, items, color }: GiftCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, idx) => (
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
                      width: `${(item.score / 5) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                {item.score}/5
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
