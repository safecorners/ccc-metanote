import { LinkButton } from "@/components/ui/link-button";

export function ClosingCta() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 md:py-28">
        <h2 className="text-heading-1 md:text-display-2">
          오늘의 오답이 내일의 실력
        </h2>
        <LinkButton href="/login">무료로 시작하기</LinkButton>
        <p className="text-caption text-ink-muted">
          이메일 하나면 바로 시작할 수 있어요.
        </p>
      </div>
    </section>
  );
}
