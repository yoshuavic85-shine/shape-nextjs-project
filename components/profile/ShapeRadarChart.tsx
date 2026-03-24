"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface ShapeRadarChartProps {
  data: { category: string; score: number; label: string }[];
  color?: string;
  title?: string;
}

export function ShapeRadarChart({
  data,
  color = "#8B6F47",
  title,
}: ShapeRadarChartProps) {
  const chartData = data.map((d) => ({
    subject: d.label,
    score: d.score,
    fullMark: 5,
  }));

  return (
    <div className="neo-card">
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="var(--muted)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--foreground)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 5]}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          />
          <Radar
            name="Skor"
            dataKey="score"
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
