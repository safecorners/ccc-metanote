import { Fragment } from "react";
import { Card } from "@/components/ui/card";

/* 레이더 모티프 — 오각 웹 + 유형색 꼭짓점 (Phase 5 실제 차트 전 목업 그래픽, PLAN.md P2-3) */
function RadarMotif() {
  return (
    <svg aria-hidden viewBox="0 0 260 240" className="mx-auto w-full max-w-[320px]">
      {/* 웹 */}
      <polygon
        points="130,28 216,90 183,191 77,191 44,90"
        fill="none"
        stroke="var(--color-hairline)"
      />
      <polygon
        points="130,73 173,104 156,154 104,154 87,104"
        fill="none"
        stroke="var(--color-hairline)"
      />
      {/* 스포크 */}
      <path
        d="M130 118 L130 28 M130 118 L216 90 M130 118 L183 191 M130 118 L77 191 M130 118 L44 90"
        stroke="var(--color-hairline)"
      />
      {/* 데이터 폴리곤 */}
      <polygon
        points="130,40 178,103 166,168 108,149 78,101"
        fill="var(--color-accent-sky)"
        fillOpacity="0.14"
        stroke="var(--color-accent-sky)"
        strokeWidth="1.5"
      />
      {/* 꼭짓점 도트 — 유형↔색 고정 매핑 */}
      <circle cx="130" cy="40" r="4" fill="var(--color-accent-sky)" />
      <circle cx="178" cy="103" r="4" fill="var(--color-accent-orange)" />
      <circle cx="166" cy="168" r="4" fill="var(--color-accent-pink)" />
      <circle cx="108" cy="149" r="4" fill="var(--color-accent-teal)" />
      <circle cx="78" cy="101" r="4" fill="var(--color-accent-purple)" />
      {/* 축 레이블 */}
      <g fill="var(--color-ink-muted)" fontSize="11">
        <text x="130" y="18" textAnchor="middle">해석</text>
        <text x="226" y="88" textAnchor="start">개념</text>
        <text x="190" y="206" textAnchor="middle">계산</text>
        <text x="70" y="206" textAnchor="middle">부주의</text>
        <text x="34" y="88" textAnchor="end">시간</text>
      </g>
    </svg>
  );
}

/* 히트맵 모티프 — 단원 × 유형, 농도 = 카운트 */
const HEAT_LEVELS: Record<string, string[]> = {
  sky: ["bg-canvas-soft", "bg-accent-sky/15", "bg-accent-sky/40", "bg-accent-sky/70"],
  orange: ["bg-canvas-soft", "bg-accent-orange/15", "bg-accent-orange/40", "bg-accent-orange/70"],
  pink: ["bg-canvas-soft", "bg-accent-pink/15", "bg-accent-pink/40", "bg-accent-pink/70"],
  teal: ["bg-canvas-soft", "bg-accent-teal/15", "bg-accent-teal/40", "bg-accent-teal/70"],
  purple: ["bg-canvas-soft", "bg-accent-purple/15", "bg-accent-purple/40", "bg-accent-purple/70"],
};

const HEAT_COLUMNS = ["sky", "orange", "pink", "teal", "purple"];

const HEAT_ROWS: { unit: string; levels: number[] }[] = [
  { unit: "일차방정식", levels: [1, 2, 3, 0, 1] },
  { unit: "함수", levels: [3, 2, 1, 1, 0] },
  { unit: "확률", levels: [0, 1, 1, 2, 1] },
];

function HeatmapMotif() {
  return (
    <div aria-hidden className="grid grid-cols-[auto_repeat(5,1fr)] items-center gap-1">
      <span />
      {HEAT_COLUMNS.map((c) => (
        <span key={c} className="flex justify-center pb-1">
          <span className={`size-2 rounded-full ${HEAT_LEVELS[c][3]}`} />
        </span>
      ))}
      {HEAT_ROWS.map((row) => (
        <Fragment key={row.unit}>
          <span className="pr-2 text-caption text-ink-muted">{row.unit}</span>
          {row.levels.map((level, i) => (
            <span
              key={`${row.unit}-${HEAT_COLUMNS[i]}`}
              className={`aspect-square rounded-xs ${HEAT_LEVELS[HEAT_COLUMNS[i]][level]}`}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

export function FeaturePatterns() {
  return (
    <section id="patterns" className="scroll-mt-16 bg-canvas">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto max-w-[52ch] text-center">
          <h2 className="text-heading-2 md:text-heading-1">
            실수에도 패턴이 있어요
          </h2>
          <p className="mt-4 text-body-md text-ink-muted">
            기록이 쌓이면 유형별, 단원별 약점이 차트로 보여요. 예상과 다른 내
            모습을 만날 수도 있어요.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-12">
          <Card elevated className="md:col-span-7">
            <h3 className="text-heading-3">유형별 분포</h3>
            <div className="mt-4">
              <RadarMotif />
            </div>
          </Card>
          <Card elevated className="self-start md:col-span-5 md:mt-16">
            <h3 className="text-heading-3">단원 × 유형</h3>
            <div className="mt-6">
              <HeatmapMotif />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
