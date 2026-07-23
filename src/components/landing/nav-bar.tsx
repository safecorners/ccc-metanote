import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 32 32"
            className="shrink-0"
          >
            <rect width="32" height="32" rx="7" fill="var(--color-primary)" />
            <path
              d="M8 23 V10 L16 18.5 L24 10 V23"
              fill="none"
              stroke="#fff"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[17px] font-bold tracking-[-0.25px] text-ink">
            MetaNote
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center text-body-sm text-ink-secondary"
          >
            로그인
          </Link>
          <LinkButton
            variant="utility"
            href="/login"
            className="min-h-11 sm:min-h-9"
          >
            무료로 시작하기
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
