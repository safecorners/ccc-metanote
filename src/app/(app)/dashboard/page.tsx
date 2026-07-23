import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorRadar } from "@/components/charts/error-radar";
import { TrendLine } from "@/components/charts/trend-line";
import { UnitHeatmap } from "@/components/charts/unit-heatmap";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import {
  computeStats,
  countByErrorType,
  unitTypeMatrix,
  weeklyTrend,
} from "@/lib/aggregate";
import { getMistakes, getScorePredictions } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { ScoreSection } from "./score-section";
import { StatTiles } from "./stat-tiles";

export const metadata: Metadata = {
  title: "대시보드",
};

/** 사용자(한국 학생) 기준 오늘 날짜 — 주별 집계의 기준점 */
function todaySeoul(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date(),
  );
}

function ChartCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-title">{title}</h2>
        <p className="text-caption text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

const ONBOARDING_STEPS = [
  { title: "기록하기", description: "틀린 문제를 단원과 함께 30초 만에 남겨요" },
  { title: "태그 고르기", description: "왜 틀렸는지 5가지 원인 중 1개만 골라요" },
  { title: "패턴 보기", description: "차트에서 나의 실수 습관을 발견해요" },
] as const;

function EmptyState({ count }: { count: number }) {
  return (
    <Card className="flex flex-col items-start gap-5 bg-canvas-soft p-8 md:col-span-2">
      <p className="text-title">
        오답을 3개만 기록하면 나의 실수 패턴이 보여요
      </p>
      {count === 0 ? (
        // P6-3 온보딩 — 첫 방문(0건)에게는 3단계 안내
        <ol className="flex flex-col gap-3">
          {ONBOARDING_STEPS.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3">
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-eyebrow text-ink-secondary"
              >
                {i + 1}
              </span>
              <span className="flex flex-col">
                <span className="text-body-sm font-medium text-ink">
                  {step.title}
                </span>
                <span className="text-caption text-ink-muted">
                  {step.description}
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-body-sm text-ink-muted">
          지금 {count}/3 — 조금만 더 기록해 볼까요?
        </p>
      )}
      <LinkButton href="/mistakes/new" className="min-h-11">
        오답 기록하기
      </LinkButton>
    </Card>
  );
}

async function DashboardContent() {
  const [mistakes, predictions] = await Promise.all([
    getMistakes(),
    getScorePredictions(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {mistakes.length > 0 && (
        <StatTiles stats={computeStats(mistakes, todaySeoul())} />
      )}
      {mistakes.length >= 3 ? (
        <>
          <ChartCard title="오류 유형 분포" subtitle="나는 주로 왜 틀릴까?">
            <ErrorRadar data={countByErrorType(mistakes)} />
          </ChartCard>
          <ChartCard
            title="단원별 취약 지점"
            subtitle="오답이 몰려 있는 단원과 원인"
          >
            <UnitHeatmap rows={unitTypeMatrix(mistakes)} />
          </ChartCard>
          <ChartCard
            title="주별 추이"
            subtitle="최근 6주, 유형별 오답 수의 변화"
            className="md:col-span-2"
          >
            <TrendLine buckets={weeklyTrend(mistakes, todaySeoul())} />
          </ChartCard>
        </>
      ) : (
        <EmptyState count={mistakes.length} />
      )}

      <ChartCard
        title="착각점수"
        subtitle="예상 점수와 실제 점수의 거리 — 자기 평가를 교정해요"
        className="md:col-span-2"
      >
        <ScoreSection predictions={predictions} />
      </ChartCard>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2" aria-hidden>
      {[0, 1].map((i) => (
        <Card key={i} className="h-80 animate-pulse bg-canvas-soft" />
      ))}
      <Card className="h-64 animate-pulse bg-canvas-soft md:col-span-2" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-2">대시보드</h1>
        <LinkButton href="/mistakes/new">오답 기록</LinkButton>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
