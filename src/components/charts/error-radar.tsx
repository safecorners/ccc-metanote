"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { TypeCount } from "@/lib/aggregate";

type TickProps = {
  x?: number | string;
  y?: number | string;
  textAnchor?: "inherit" | "middle" | "start" | "end";
  payload?: { value?: unknown };
};

/** 축 레이블 앞에 해당 유형의 카테고리 색 도트를 붙인다 (색↔유형 매핑 유지) */
function makeAxisTick(colorByLabel: Map<string, string>) {
  return function AxisTick({ x, y, textAnchor, payload }: TickProps) {
    const label = String(payload?.value ?? "");
    return (
      <text
        x={x}
        y={y}
        dy={4}
        textAnchor={textAnchor}
        fill="#615d59"
        fontSize={12}
      >
        <tspan fill={colorByLabel.get(label)}>● </tspan>
        <tspan>{label}</tspan>
      </text>
    );
  };
}

export function ErrorRadar({ data }: { data: TypeCount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const colorByLabel = new Map(data.map((d) => [d.label, d.color]));

  return (
    <div className="h-64 w-full" role="img" aria-label="오류 유형별 오답 분포 레이더 차트">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="68%">
          <PolarGrid stroke="#e6e6e6" />
          <PolarAngleAxis dataKey="label" tick={makeAxisTick(colorByLabel)} />
          <PolarRadiusAxis domain={[0, max]} tick={false} axisLine={false} />
          <Radar
            dataKey="count"
            stroke="#0075de"
            strokeWidth={2}
            fill="#0075de"
            fillOpacity={0.15}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
