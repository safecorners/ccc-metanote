"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorTag } from "@/components/ui/error-tag";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ERROR_TYPES, type ErrorTypeId } from "@/lib/taxonomy";
import type { Unit } from "@/lib/types";
import { createMistake, type MistakeFormState } from "../actions";

const GRADES = [1, 2, 3] as const;

const initialState: MistakeFormState = { error: null, saved: 0 };

export function MistakeForm({
  units,
  defaultGrade,
}: {
  units: Unit[];
  defaultGrade: number;
}) {
  const router = useRouter();
  const [grade, setGrade] = useState(
    GRADES.includes(defaultGrade as (typeof GRADES)[number]) ? defaultGrade : 1,
  );
  const [unitId, setUnitId] = useState("");
  const [errorType, setErrorType] = useState<ErrorTypeId | null>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: MistakeFormState, formData: FormData) => {
      const result = await createMistake(prev, formData);
      if (result.saved > prev.saved) {
        toast.success("차트가 업데이트됐어요", {
          description: "기록이 쌓일수록 나의 실수 패턴이 선명해져요",
          action: {
            label: "대시보드 보기",
            onClick: () => router.push("/dashboard"),
          },
        });
        // 같은 시험의 다음 오답을 바로 적도록 단원은 유지, 태그만 초기화
        setErrorType(null);
      }
      return result;
    },
    initialState,
  );

  const gradeUnits = units.filter((u) => u.grade === grade);

  return (
    <Card className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="unit_id" value={unitId} />
        <input type="hidden" name="error_type" value={errorType ?? ""} />

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-caption text-ink-muted">학년</legend>
          <div className="flex gap-2" role="group" aria-label="학년 필터">
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={grade === g}
                onClick={() => {
                  setGrade(g);
                  setUnitId("");
                }}
                className={
                  grade === g
                    ? "min-h-11 flex-1 rounded-md border border-primary bg-primary/5 px-3.5 py-1 text-button text-primary"
                    : "min-h-11 flex-1 rounded-md border border-hairline bg-surface px-3.5 py-1 text-button text-ink"
                }
              >
                중{g}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="unit-select" className="text-caption text-ink-muted">
            단원
          </label>
          <Select value={unitId} onValueChange={setUnitId}>
            <SelectTrigger
              id="unit-select"
              className="h-11 w-full rounded-xs border-[#dddddd] bg-surface px-2.5 text-body-sm data-placeholder:text-ink-faint"
            >
              <SelectValue placeholder="어느 단원에서 틀렸나요?" />
            </SelectTrigger>
            <SelectContent position="popper">
              {gradeUnits.map((unit) => (
                <SelectItem
                  key={unit.id}
                  value={String(unit.id)}
                  className="min-h-11 text-body-sm"
                >
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-caption text-ink-muted">
            왜 틀렸나요? <span className="text-ink-faint">(1개 선택)</span>
          </legend>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="오류 원인 태그"
          >
            {ERROR_TYPES.map((type) => (
              <ErrorTag
                key={type.id}
                label={type.label}
                selected={errorType === type.id}
                dotClassName={type.dotClassName}
                selectedClassName={type.selectedClassName}
                onClick={() =>
                  setErrorType(errorType === type.id ? null : type.id)
                }
                className="min-h-11 px-4"
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-4 border-t border-hairline pt-4">
          <p className="text-eyebrow text-ink-faint">선택 입력</p>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">출처</span>
              <Input
                name="source"
                placeholder="예: 중간고사"
                autoComplete="off"
                className="min-h-11"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">문제 번호</span>
              <Input
                name="problem_ref"
                placeholder="예: 12번"
                autoComplete="off"
                className="min-h-11"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-caption text-ink-muted">한 줄 메모</span>
            <textarea
              name="memo"
              rows={2}
              placeholder="예: 부호를 헷갈렸다"
              className="w-full rounded-xs border border-[#dddddd] bg-surface p-1.5 text-body-sm text-ink placeholder:text-ink-faint focus:shadow-l1 focus:outline-none"
            />
          </label>
        </div>

        {state.error && (
          <p role="alert" className="text-caption text-accent-orange-deep">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "저장 중…" : "저장하기"}
        </Button>
      </form>
    </Card>
  );
}
