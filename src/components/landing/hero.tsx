import { LinkButton } from "@/components/ui/link-button";
import { Constellation } from "./constellation";

export function Hero() {
  return (
    <section
      aria-label="히어로"
      className="relative isolate overflow-hidden bg-secondary text-on-primary"
    >
      <Constellation />
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-16 pb-20 sm:px-8 md:pt-24 md:pb-28">
        <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-[38px] leading-[1.05] font-bold tracking-[-1px] duration-700 motion-reduce:animate-none sm:text-[52px] sm:tracking-[-1.5px] md:text-display-1">
          왜 틀렸는지 아는 것이
          <br />
          진짜 공부의 시작
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-6 max-w-[34ch] text-body-md text-white/75 delay-150 duration-700 motion-reduce:animate-none md:text-title md:font-normal">
          오답의 원인을 태그 하나로 기록하면, 나만 몰랐던 실수 패턴이 보입니다.
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both mt-10 flex flex-wrap items-center gap-3 delay-300 duration-700 motion-reduce:animate-none">
          <LinkButton href="/login">무료로 시작하기</LinkButton>
          <LinkButton
            variant="secondary"
            href="#tagging"
            className="shadow-l2"
          >
            기능 둘러보기
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
