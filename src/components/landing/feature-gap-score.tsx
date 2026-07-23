import { Card } from "@/components/ui/card";

export function FeatureGapScore() {
  return (
    <section id="gap-score" className="scroll-mt-16">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 md:grid md:grid-cols-2 md:items-center md:gap-12 md:py-24">
        <div className="md:order-2">
          <h2 className="text-heading-2 md:text-heading-1">
            아는 것과 안다고 느끼는 것
          </h2>
          <p className="mt-4 max-w-[40ch] text-body-md text-ink-muted">
            시험 전 예상 점수와 실제 점수를 나란히 두면, 그 거리가 착각점수가
            됩니다. 기록할수록 자기 평가가 정확해져요.
          </p>
        </div>
        <div inert className="mt-8 md:order-1 md:mt-0">
          <Card elevated className="max-w-md">
            <span className="text-caption text-ink-faint">중간고사 수학</span>
            <div className="mt-4 flex flex-col gap-3 tabular-nums">
              <div>
                <div className="flex items-baseline justify-between text-caption text-ink-muted">
                  <span>예상</span>
                  <span>85점</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-canvas-soft">
                  <div className="h-2 w-[85%] rounded-full bg-ink-faint/40" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-caption text-ink-muted">
                  <span>실제</span>
                  <span>73점</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-canvas-soft">
                  <div className="h-2 w-[73%] rounded-full bg-primary" />
                </div>
              </div>
            </div>
            <p className="mt-5 text-heading-3">착각점수 -12</p>
            <p className="mt-1 text-caption text-ink-muted">
              예상보다 12점 낮았어요. 아는 것과 안다고 느끼는 것의 차이예요.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
