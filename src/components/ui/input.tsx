import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-xs border border-[#dddddd] bg-surface p-1.5 text-body-sm text-ink placeholder:text-ink-faint focus:shadow-l1 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
