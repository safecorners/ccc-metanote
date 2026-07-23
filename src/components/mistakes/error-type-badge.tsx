import { getErrorType, type ErrorTypeId } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/** 표시 전용 오류 유형 배지 — ErrorTag(버튼)와 동일한 크롬의 span 버전 */
export function ErrorTypeBadge({
  errorType,
  className,
}: {
  errorType: ErrorTypeId;
  className?: string;
}) {
  const type = getErrorType(errorType);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-2.5 py-1 text-eyebrow text-ink-secondary",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", type.dotClassName)}
      />
      {type.label}
    </span>
  );
}
