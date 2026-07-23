import { Card } from "@/components/ui/card";
import { ErrorTag } from "@/components/ui/error-tag";

// Phase 3: src/lib/taxonomy.ts로 대체
const LANDING_ERROR_TYPES = [
  { label: "문제 해석 오류", dot: "bg-accent-sky" },
  {
    label: "개념 이해 부족",
    dot: "bg-accent-orange",
    selected: true,
    selectedClassName: "bg-accent-orange/10 text-accent-orange-deep",
  },
  { label: "계산 실수", dot: "bg-accent-pink" },
  { label: "부주의", dot: "bg-accent-teal" },
  { label: "시간 부족", dot: "bg-accent-purple" },
];

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
              {LANDING_ERROR_TYPES.map((t) => (
                <ErrorTag
                  key={t.label}
                  label={t.label}
                  dotClassName={t.dot}
                  selected={t.selected}
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
