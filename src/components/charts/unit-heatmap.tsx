import type { UnitRow } from "@/lib/aggregate";
import { ERROR_TYPES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/** hex + 0~1 강도 → rgba (셀 농도) */
function tint(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** 단원×유형 히트맵 — recharts 대신 CSS grid (서버 컴포넌트) */
export function UnitHeatmap({ rows }: { rows: UnitRow[] }) {
  const max = Math.max(
    ...rows.flatMap((row) => ERROR_TYPES.map((t) => row.counts[t.id])),
    1,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[minmax(88px,1.6fr)_repeat(5,minmax(0,1fr))] gap-1">
        <span aria-hidden />
        {ERROR_TYPES.map((type) => (
          <span
            key={type.id}
            title={type.label}
            className="flex items-center justify-center py-1"
          >
            <span
              aria-hidden
              className={cn("size-2 rounded-full", type.dotClassName)}
            />
            <span className="sr-only">{type.label}</span>
          </span>
        ))}

        {rows.map((row) => (
          <div key={row.unitId} className="contents">
            <span className="flex items-center gap-1 truncate pr-1 text-caption text-ink-secondary">
              <span className="truncate">{row.unitName}</span>
              <span className="shrink-0 text-eyebrow text-ink-faint">
                중{row.grade}
              </span>
            </span>
            {ERROR_TYPES.map((type) => {
              const count = row.counts[type.id];
              return (
                <span
                  key={type.id}
                  className="flex min-h-8 items-center justify-center rounded-sm text-caption text-ink tabular-nums"
                  style={{
                    backgroundColor:
                      count === 0
                        ? "var(--color-canvas-soft)"
                        : tint(type.color, 0.15 + 0.55 * (count / max)),
                  }}
                  aria-label={`${row.unitName} ${type.label} ${count}건`}
                >
                  {count > 0 ? count : ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-eyebrow text-ink-faint">
        진할수록 그 단원·유형에서 자주 틀렸다는 뜻이에요
      </p>
    </div>
  );
}
