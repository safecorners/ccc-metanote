"use client";

import { Camera, ChevronDown, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
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
import { hasClassifiableText, type AiSuggestion } from "@/lib/ai/suggestion";
import { removeMistakeImage, uploadMistakeImage } from "@/lib/mistake-image";
import {
  ERROR_TYPES,
  getErrorSubtype,
  getErrorType,
  type ErrorTypeId,
} from "@/lib/taxonomy";
import type { Unit } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  createMistake,
  suggestErrorType,
  type MistakeFormState,
} from "../actions";

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
  const [image, setImage] = useState<{ file: File; previewUrl: string } | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // AI 제안 (Phase 7) — 태그를 먼저 고른 뒤에만 요청 가능, 최종 선택은 항상 학생
  const [hasText, setHasText] = useState(false);
  const [aiPending, setAiPending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);

  function selectImage(file: File | null) {
    if (image) URL.revokeObjectURL(image.previewUrl);
    if (!file && fileInputRef.current) fileInputRef.current.value = "";
    setImage(file ? { file, previewUrl: URL.createObjectURL(file) } : null);
  }

  function readTextFields() {
    const fd = formRef.current ? new FormData(formRef.current) : new FormData();
    const read = (name: string) => String(fd.get(name) ?? "");
    return {
      problem_text: read("problem_text"),
      my_answer: read("my_answer"),
      correct_answer: read("correct_answer"),
      memo: read("memo"),
    };
  }

  // 텍스트 필드는 비제어라 폼 onChange 위임으로만 추적한다
  function syncHasText() {
    setHasText(hasClassifiableText({ unitName: "", ...readTextFields() }));
  }

  async function requestAiSuggestion() {
    if (!errorType) return;
    const unitName = units.find((u) => String(u.id) === unitId)?.name ?? "";
    setAiPending(true);
    setAiError(null);
    try {
      const result = await suggestErrorType({
        error_type: errorType,
        unit_name: unitName,
        ...readTextFields(),
      });
      if (result.ok) {
        setAiSuggestion(result.suggestion);
      } else {
        setAiError(result.error);
      }
    } catch {
      setAiError("지금은 AI 제안을 받지 못했어요. 잠시 후 다시 시도해 주세요");
    } finally {
      setAiPending(false);
    }
  }

  const [state, formAction, pending] = useActionState(
    async (prev: MistakeFormState, formData: FormData) => {
      // 사진은 서버 액션을 거치지 않고 여기서 직접 업로드하고 경로만 넘긴다
      let uploadedPath: string | null = null;
      if (image) {
        const uploaded = await uploadMistakeImage(image.file);
        if ("error" in uploaded) {
          return { error: uploaded.error, saved: prev.saved };
        }
        uploadedPath = uploaded.path;
        formData.set("image_path", uploadedPath);
      }

      const result = await createMistake(prev, formData);
      if (result.saved > prev.saved) {
        toast.success("차트가 업데이트됐어요", {
          description: "기록이 쌓일수록 나의 실수 패턴이 선명해져요",
          action: {
            label: "대시보드 보기",
            onClick: () => router.push("/dashboard"),
          },
        });
        // 같은 시험의 다음 오답을 바로 적도록 단원은 유지, 태그·사진·AI 제안만 초기화
        setErrorType(null);
        selectImage(null);
        setAiSuggestion(null);
        setAiError(null);
      } else if (uploadedPath) {
        // 저장 실패 — 방금 올린 사진 롤백 (사진 state는 남겨 재시도 가능)
        void removeMistakeImage(uploadedPath);
      }
      return result;
    },
    initialState,
  );

  const gradeUnits = units.filter((u) => u.grade === grade);

  return (
    <Card className="flex flex-col gap-6">
      <form
        ref={formRef}
        action={formAction}
        onChange={syncHasText}
        className="flex flex-col gap-6"
      >
        <input type="hidden" name="unit_id" value={unitId} />
        <input type="hidden" name="error_type" value={errorType ?? ""} />
        <input
          type="hidden"
          name="ai_suggested_type"
          value={aiSuggestion?.suggested_type ?? ""}
        />
        <input
          type="hidden"
          name="ai_suggested_subtype"
          value={aiSuggestion?.suggested_subtype ?? ""}
        />

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

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={requestAiSuggestion}
            disabled={!errorType || !unitId || !hasText || aiPending || pending}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 self-start rounded-md border border-hairline bg-surface px-3.5 text-button text-ink disabled:opacity-50"
          >
            <Sparkles aria-hidden className="size-4" />
            {aiPending ? "AI가 살펴보는 중…" : "AI 제안 받기"}
          </button>

          {!aiSuggestion && !aiError && (
            <p className="text-caption text-ink-faint">
              단원·태그를 고르고 문제 내용이나 메모를 적으면 AI가 원인을
              짚어줘요
            </p>
          )}

          {aiError && (
            <p role="alert" className="text-caption text-accent-orange-deep">
              {aiError}
            </p>
          )}

          {aiSuggestion && (
            <div
              data-testid="ai-suggestion-card"
              className="flex flex-col gap-2 rounded-md border border-hairline bg-canvas-soft p-3"
            >
              <p className="text-eyebrow text-ink-faint">AI 제안</p>
              <div className="flex flex-wrap items-center gap-2">
                <ErrorTag
                  label={getErrorType(aiSuggestion.suggested_type).label}
                  selected
                  dotClassName={
                    getErrorType(aiSuggestion.suggested_type).dotClassName
                  }
                  selectedClassName={
                    getErrorType(aiSuggestion.suggested_type).selectedClassName
                  }
                  onClick={() => setErrorType(aiSuggestion.suggested_type)}
                  className="min-h-11 px-4"
                />
                <span className="text-caption text-ink-secondary">
                  그중에서도 &lsquo;
                  {getErrorSubtype(aiSuggestion.suggested_subtype).label}&rsquo;
                  유형으로 보여요
                </span>
              </div>
              <p className="text-caption text-ink-secondary">
                {aiSuggestion.reason}
              </p>
              <p className="text-caption text-ink-faint">
                {aiSuggestion.suggested_type === errorType
                  ? "내가 고른 태그와 같아요"
                  : "제안 태그를 탭하면 선택이 바뀌어요 — 최종 선택은 언제나 내 몫"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-hairline pt-4">
          <p className="text-eyebrow text-ink-faint">선택 입력</p>

          <div className="flex flex-col gap-1.5">
            <span className="text-caption text-ink-muted">문제 사진</span>
            {image ? (
              <div className="flex items-center gap-3">
                {/* 미리보기는 blob URL이라 next/image 대상이 아니다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt="문제 사진 미리보기"
                  className="size-16 rounded-xs border border-hairline object-cover"
                />
                <button
                  type="button"
                  onClick={() => selectImage(null)}
                  className="inline-flex min-h-11 items-center gap-1 text-button text-ink-secondary"
                >
                  <X aria-hidden className="size-4" />
                  사진 빼기
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 self-start rounded-md border border-hairline bg-surface px-3.5 text-button text-ink"
              >
                <Camera aria-hidden className="size-4" />
                사진 추가
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="문제 사진 선택"
              onChange={(e) => selectImage(e.target.files?.[0] ?? null)}
            />
          </div>

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

          <button
            type="button"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
            className="inline-flex min-h-11 items-center gap-1 self-start text-button text-ink-secondary"
          >
            <ChevronDown
              aria-hidden
              className={cn(
                "size-4 transition-transform",
                detailsOpen && "rotate-180",
              )}
            />
            자세히 기록
          </button>

          {/* 접어도 입력값이 유지·제출되도록 언마운트 대신 hidden 처리 */}
          <div
            className={cn("flex-col gap-4", detailsOpen ? "flex" : "hidden")}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">문제 본문</span>
              <textarea
                name="problem_text"
                rows={3}
                placeholder="예: 2x + 3 = 7일 때 x의 값을 구하시오"
                className="w-full rounded-xs border border-[#dddddd] bg-surface p-1.5 text-body-sm text-ink placeholder:text-ink-faint focus:shadow-l1 focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-caption text-ink-muted">내가 쓴 답</span>
                <Input
                  name="my_answer"
                  placeholder="예: 3"
                  autoComplete="off"
                  className="min-h-11"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-caption text-ink-muted">정답</span>
                <Input
                  name="correct_answer"
                  placeholder="예: 2"
                  autoComplete="off"
                  className="min-h-11"
                />
              </label>
            </div>
          </div>
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
