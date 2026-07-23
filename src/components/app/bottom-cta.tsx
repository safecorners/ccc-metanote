"use client";

import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/link-button";

/** 모바일 하단 고정 "오답 기록" CTA — 입력 폼 자신 위에서는 숨긴다 */
export function BottomCta() {
  const pathname = usePathname();
  if (pathname === "/mistakes/new") return null;

  return (
    <div
      data-testid="bottom-cta"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-hairline bg-canvas/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      <LinkButton href="/mistakes/new" className="min-h-12 w-full">
        오답 기록
      </LinkButton>
    </div>
  );
}
