"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GapEntry } from "@/lib/aggregate";

/** 예상(회색) vs 실제(블루) — 점수는 데이터 팔레트가 아닌 구조 색으로 표현 */
export function GapScore({ entries }: { entries: GapEntry[] }) {
  const data = entries.map((e) => ({
    name: e.examName,
    예상: e.predicted,
    실제: e.actual,
  }));

  return (
    <div className="flex flex-col gap-2">
      <div className="h-52 w-full" role="img" aria-label="시험별 예상 점수와 실제 점수 비교 차트">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e6e6e6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#615d59" }}
              axisLine={{ stroke: "#e6e6e6" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              width={32}
              tick={{ fontSize: 12, fill: "#615d59" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.03)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e6e6e6",
                fontSize: 13,
              }}
            />
            <Bar dataKey="예상" fill="#a39e98" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="실제" fill="#0075de" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex gap-4 text-eyebrow text-ink-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-ink-faint" />
          예상 점수
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-primary" />
          실제 점수
        </li>
      </ul>
    </div>
  );
}
