import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "utility";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary rounded-full px-6 py-2.5 min-h-11 active:bg-primary-active active:scale-[0.97]",
  secondary:
    "bg-surface text-ink rounded-full px-6 py-2.5 min-h-11 shadow-l1 active:scale-[0.97]",
  utility: "bg-surface text-ink rounded-md border border-hairline px-3.5 py-1",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center text-button transition disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
