import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * 오류 유형 태그 — 필은 중립 배경 + 카테고리 색 8px 점.
 * 카테고리 색이 필 전체를 칠하는 건 selected 틴트뿐 (DESIGN.md 규칙).
 * 색 클래스는 호출부(taxonomy, Phase 3)가 주입한다.
 */
export function ErrorTag({
  label,
  selected = false,
  dotClassName,
  selectedClassName,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  label: string;
  selected?: boolean;
  dotClassName: string;
  selectedClassName?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-eyebrow transition",
        selected
          ? cn("text-ink", selectedClassName)
          : "bg-canvas-soft text-ink-secondary",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", dotClassName)}
      />
      {label}
    </button>
  );
}
