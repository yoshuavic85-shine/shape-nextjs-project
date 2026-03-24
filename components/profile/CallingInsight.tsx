"use client";

import { CallingProfileData } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Compass, MapPin, Clock, HelpCircle, TrendingUp } from "lucide-react";

interface CallingInsightProps {
  calling: CallingProfileData;
}

export function CallingInsight({ calling }: CallingInsightProps) {
  return (
    <div className="space-y-6">
      {/* Design Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            Ringkasan Desain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {calling.designSummary}
          </p>
        </CardContent>
      </Card>

      {/* Calling Clusters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Kelompok Panggilan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {calling.callingClusters.map((cluster, idx) => (
              <li key={idx} className="flex gap-3 p-3 rounded-xl bg-background">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-sm text-foreground">{cluster}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Environmental Fit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Kesesuaian Lingkungan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {calling.environmentalFit.map((fit, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-background text-sm text-foreground"
              >
                {fit}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Life Pattern Insight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Pola Kehidupan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {calling.lifePatternInsight}
          </p>
        </CardContent>
      </Card>

      {/* Reflection Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-secondary" />
            Pertanyaan Refleksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside">
            {calling.reflectionQuestions.map((q, idx) => (
              <li key={idx} className="text-foreground leading-relaxed pl-2">
                {q}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Development Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Jalur Pengembangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {calling.developmentPath.map((path, idx) => (
              <li key={idx} className="flex gap-3 p-3 rounded-xl bg-background">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-sm text-foreground">{path}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
