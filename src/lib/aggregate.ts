import { ERROR_TYPES, ERROR_TYPE_IDS, type ErrorTypeId } from "./taxonomy";
import type { ScorePrediction } from "./types";

// 대시보드 집계 — 전부 순수 함수 (P5-1 TDD 대상).
// 날짜는 "YYYY-MM-DD" 문자열만 다뤄 타임존 이슈를 차단한다.

type MistakeForCount = { error_type: ErrorTypeId };
type MistakeForMatrix = MistakeForCount & {
  unit: { id: number; name: string; grade: number };
};
type MistakeForTrend = MistakeForCount & { mistake_date: string };

export type TypeCount = {
  id: ErrorTypeId;
  label: string;
  color: string;
  count: number;
};

export function countByErrorType(mistakes: MistakeForCount[]): TypeCount[] {
  return ERROR_TYPES.map((type) => ({
    id: type.id,
    label: type.label,
    color: type.color,
    count: mistakes.filter((m) => m.error_type === type.id).length,
  }));
}

function zeroCounts(): Record<ErrorTypeId, number> {
  return Object.fromEntries(ERROR_TYPE_IDS.map((id) => [id, 0])) as Record<
    ErrorTypeId,
    number
  >;
}

export type UnitRow = {
  unitId: number;
  unitName: string;
  grade: number;
  counts: Record<ErrorTypeId, number>;
  total: number;
};

export function unitTypeMatrix(mistakes: MistakeForMatrix[]): UnitRow[] {
  const byUnit = new Map<number, UnitRow>();

  for (const m of mistakes) {
    let row = byUnit.get(m.unit.id);
    if (!row) {
      row = {
        unitId: m.unit.id,
        unitName: m.unit.name,
        grade: m.unit.grade,
        counts: zeroCounts(),
        total: 0,
      };
      byUnit.set(m.unit.id, row);
    }
    row.counts[m.error_type] += 1;
    row.total += 1;
  }

  return [...byUnit.values()].sort(
    (a, b) =>
      b.total - a.total ||
      a.grade - b.grade ||
      a.unitName.localeCompare(b.unitName, "ko"),
  );
}

/** "YYYY-MM-DD" → 그 날이 속한 주의 월요일 "YYYY-MM-DD" */
function weekStartOf(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const offset = (date.getUTCDay() + 6) % 7; // 월=0 … 일=6
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

function weekLabel(weekStart: string): string {
  const [, m, d] = weekStart.split("-").map(Number);
  return `${m}/${d}`;
}

export type WeekBucket = {
  weekStart: string;
  label: string;
  counts: Record<ErrorTypeId, number>;
  total: number;
};

export function weeklyTrend(
  mistakes: MistakeForTrend[],
  today: string,
  weeks = 6,
): WeekBucket[] {
  const thisWeek = weekStartOf(today);
  const buckets = new Map<string, WeekBucket>();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addDays(thisWeek, -7 * i);
    buckets.set(weekStart, {
      weekStart,
      label: weekLabel(weekStart),
      counts: zeroCounts(),
      total: 0,
    });
  }

  for (const m of mistakes) {
    const bucket = buckets.get(weekStartOf(m.mistake_date));
    if (!bucket) continue; // 범위 밖 기록
    bucket.counts[m.error_type] += 1;
    bucket.total += 1;
  }

  return [...buckets.values()];
}

export type GapEntry = {
  id: string;
  examName: string;
  examDate: string;
  predicted: number;
  actual: number;
  gap: number;
};

export function computeGapEntries(predictions: ScorePrediction[]): GapEntry[] {
  return predictions
    .filter(
      (p): p is ScorePrediction & { predicted: number; actual: number } =>
        p.predicted !== null && p.actual !== null,
    )
    .map((p) => ({
      id: p.id,
      examName: p.exam_name,
      examDate: p.exam_date,
      predicted: p.predicted,
      actual: p.actual,
      gap: p.actual - p.predicted,
    }))
    .sort((a, b) => a.examDate.localeCompare(b.examDate));
}

export function gapComment(gap: number): string {
  if (gap < 0) {
    return `예상보다 ${-gap}점 낮았어요 — 아는 것과 안다고 느끼는 것의 차이예요`;
  }
  if (gap > 0) {
    return `예상보다 ${gap}점 높았어요 — 실력보다 스스로를 낮게 봤어요`;
  }
  return "예상과 실제가 일치했어요 — 자기 평가가 정확해요";
}
