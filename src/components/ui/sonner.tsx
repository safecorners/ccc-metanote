"use client";

import { Toaster as SonnerToaster } from "sonner";

/** DESIGN.md ex-toast — 흰 서피스 + rounded-xl + Level-2 섀도 (라이트 전용) */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          color: "var(--color-ink)",
          border: "1px solid var(--color-hairline)",
          borderRadius: "16px",
          boxShadow: "var(--shadow-l2)",
          fontFamily: "inherit",
        },
      }}
    />
  );
}
