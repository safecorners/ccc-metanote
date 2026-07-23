"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekBucket } from "@/lib/aggregate";
import { ERROR_TYPES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export function TrendLine({ buckets }: { buckets: WeekBucket[] }) {
  const data = buckets.map((b) => ({ label: b.label, ...b.counts }));

  return (
    <div className="flex flex-col gap-3">
      <div className="h-56 w-full" role="img" aria-label="주 단위 오류 유형별 추이 차트">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e6e6e6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#615d59" }}
              axisLine={{ stroke: "#e6e6e6" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              width={28}
              tick={{ fontSize: 12, fill: "#615d59" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e6e6e6",
                fontSize: 13,
              }}
            />
            {ERROR_TYPES.map((type) => (
              <Line
                key={type.id}
                dataKey={type.id}
                name={type.label}
                stroke={type.color}
                strokeWidth={2}
                dot={{ r: 2.5, strokeWidth: 0, fill: type.color }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {ERROR_TYPES.map((type) => (
          <li
            key={type.id}
            className="flex items-center gap-1.5 text-eyebrow text-ink-muted"
          >
            <span
              aria-hidden
              className={cn("size-2 rounded-full", type.dotClassName)}
            />
            {type.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
