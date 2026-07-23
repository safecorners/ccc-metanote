"use client";

import { useActionState } from "react";
import { GapScore } from "@/components/charts/gap-score";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeGapEntries, gapComment } from "@/lib/aggregate";
import type { ScorePrediction } from "@/lib/types";
import {
  createScorePrediction,
  recordActualScore,
  type ScoreFormState,
} from "./actions";

const initialState: ScoreFormState = { error: null, saved: 0 };

/** 실제 점수가 아직 없는 기록의 인라인 입력 폼 */
function PendingScoreRow({ prediction }: { prediction: ScorePrediction }) {
  const [state, formAction, pending] = useActionState(
    recordActualScore.bind(null, prediction.id),
    initialState,
  );

  return (
    <li className="flex flex-col gap-2 rounded-md border border-hairline bg-canvas-soft p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm text-ink">
          {prediction.exam_name}
          <span className="ml-1.5 text-caption text-ink-faint">
            {prediction.exam_date}
          </span>
        </span>
        <span className="text-caption text-ink-muted tabular-nums">
          예상 {prediction.predicted}점
        </span>
      </div>
      <form action={formAction} className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-eyebrow text-ink-muted">
            시험 본 후 실제 점수
          </span>
          <Input
            name="actual"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            placeholder="0~100"
            required
            className="min-h-11"
          />
        </label>
        <Button
          type="submit"
          variant="utility"
          disabled={pending}
          className="min-h-11"
        >
          {pending ? "저장 중…" : "실제 점수 저장"}
        </Button>
      </form>
      {state.error && (
        <p role="alert" className="text-caption text-accent-orange-deep">
          {state.error}
        </p>
      )}
    </li>
  );
}

function NewScoreForm() {
  const [state, formAction, pending] = useActionState(
    createScorePrediction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 border-t border-hairline pt-4"
    >
      <p className="text-body-sm text-ink-secondary">
        시험 전에 예상 점수를 적어 두고, 시험 후 실제 점수와 비교해 보세요.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          <span className="text-caption text-ink-muted">시험 이름</span>
          <Input
            name="exam_name"
            placeholder="예: 2학기 중간"
            autoComplete="off"
            required
            className="min-h-11"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-caption text-ink-muted">시험 날짜</span>
          <Input
            name="exam_date"
            type="date"
            defaultValue={new Date().toLocaleDateString("en-CA")}
            required
            className="min-h-11"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-caption text-ink-muted">예상 점수</span>
          <Input
            name="predicted"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            placeholder="0~100"
            required
            className="min-h-11"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
          <span className="text-caption text-ink-muted">
            실제 점수 <span className="text-ink-faint">(선택)</span>
          </span>
          <Input
            name="actual"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            placeholder="시험 후 입력"
            className="min-h-11"
          />
        </label>
      </div>
      {state.error && (
        <p role="alert" className="text-caption text-accent-orange-deep">
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        variant="utility"
        disabled={pending}
        className="min-h-11 self-start"
      >
        {pending ? "저장 중…" : "점수 기록하기"}
      </Button>
    </form>
  );
}

export function ScoreSection({
  predictions,
}: {
  predictions: ScorePrediction[];
}) {
  const entries = computeGapEntries(predictions);
  const latest = entries.at(-1);
  const pendingRows = predictions.filter(
    (p) => p.predicted !== null && p.actual === null,
  );

  return (
    <div className="flex flex-col gap-4">
      {latest ? (
        <div className="flex flex-col gap-1">
          <p className="text-heading-2 tabular-nums">
            {latest.gap > 0 ? `+${latest.gap}` : latest.gap}점
          </p>
          <p className="text-body-sm text-ink-secondary">
            {latest.examName} — {gapComment(latest.gap)}
          </p>
        </div>
      ) : (
        <p className="text-body-sm text-ink-muted">
          아직 비교할 기록이 없어요. 예상 점수와 실제 점수를 기록하면
          착각점수가 계산돼요.
        </p>
      )}

      {entries.length >= 2 && <GapScore entries={entries.slice(-5)} />}

      {pendingRows.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pendingRows.map((p) => (
            <PendingScoreRow key={p.id} prediction={p} />
          ))}
        </ul>
      )}

      <NewScoreForm />
    </div>
  );
}
