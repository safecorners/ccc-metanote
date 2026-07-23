import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas-soft">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-5 py-10 text-caption text-ink-secondary sm:flex-row sm:items-center sm:justify-between sm:px-8 md:py-12">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-ink">MetaNote</span>
          <span className="text-ink-muted">
            오답의 원인을 아는 메타인지 오답노트
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">로그인</Link>
          <Link href="/signup">회원가입</Link>
          <span className="text-ink-faint">© 2026 MetaNote</span>
        </div>
      </div>
    </footer>
  );
}
