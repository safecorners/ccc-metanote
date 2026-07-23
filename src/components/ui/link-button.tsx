import Link from "next/link";
import type { ComponentProps } from "react";
import {
  buttonVariantClasses,
  type ButtonVariant,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LinkButton({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center text-button transition",
        buttonVariantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
