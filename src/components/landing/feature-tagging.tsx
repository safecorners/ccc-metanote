import { Card } from "@/components/ui/card";
import { ErrorTag } from "@/components/ui/error-tag";
import { ERROR_TYPES } from "@/lib/taxonomy";

export function FeatureTagging() {
  return (
    <section id="tagging" className="scroll-mt-16">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 md:grid md:grid-cols-2 md:items-center md:gap-12 md:py-24">
        <div>
          <h2 className="text-heading-2 md:text-heading-1">
            오답에 이유를 붙이세요
          </h2>
          <p className="mt-4 max-w-[40ch] text-body-md text-ink-muted">
            단원 선택, 원인 태그 한 번. 탭 두 번이면 기록이 끝나요. 시험 직후
            쉬는 시간이면 충분합니다.
          </p>
        </div>
        <div inert className="mt-8 md:mt-0">
          <Card elevated className="max-w-md">
            <div className="flex items-baseline justify-between">
              <span className="text-title">일차방정식 12번</span>
              <span className="text-caption text-ink-faint">5월 21일</span>
            </div>
            <p className="mt-3 text-body-sm text-ink-secondary">왜 틀렸을까?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ERROR_TYPES.map((t) => (
                <ErrorTag
                  key={t.id}
                  label={t.label}
                  dotClassName={t.dotClassName}
                  selected={t.id === "no_concept"}
                  selectedClassName={t.selectedClassName}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
