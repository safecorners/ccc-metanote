import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({
  elevated = false,
  className,
  ...props
}: ComponentProps<"div"> & { elevated?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface p-6 text-ink",
        elevated ? "border border-transparent shadow-l1" : "border border-hairline",
        className,
      )}
      {...props}
    />
  );
}
