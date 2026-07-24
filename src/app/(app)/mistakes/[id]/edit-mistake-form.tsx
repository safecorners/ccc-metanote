"use client";

import { Camera, X } from "lucide-react";
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
import { removeMistakeImage, uploadMistakeImage } from "@/lib/mistake-image";
import { ERROR_TYPES, type ErrorTypeId } from "@/lib/taxonomy";
import type { MistakeWithUnit, Unit } from "@/lib/types";
import { updateMistake, type MistakeFormState } from "../actions";

const GRADES = [1, 2, 3] as const;

const initialState: MistakeFormState = { error: null, saved: 0 };

export function EditMistakeForm({
  mistake,
  units,
  imageUrl,
}: {
  mistake: MistakeWithUnit;
  units: Unit[];
  /** 기존 문제 사진의 signed URL (없으면 null) */
  imageUrl: string | null;
}) {
  const [grade, setGrade] = useState(mistake.unit.grade);
  const [unitId, setUnitId] = useState(String(mistake.unit_id));
  const [errorType, setErrorType] = useState<ErrorTypeId | null>(
    mistake.error_type,
  );
  const [newImage, setNewImage] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function selectImage(file: File | null) {
    if (newImage) URL.revokeObjectURL(newImage.previewUrl);
    if (!file && fileInputRef.current) fileInputRef.current.value = "";
    setNewImage(file ? { file, previewUrl: URL.createObjectURL(file) } : null);
  }

  const [state, formAction, pending] = useActionState(
    async (prev: MistakeFormState, formData: FormData) => {
      // 사진은 서버 액션을 거치지 않고 여기서 직접 업로드하고 경로만 넘긴다
      let uploadedPath: string | null = null;
      if (newImage) {
        const uploaded = await uploadMistakeImage(newImage.file);
        if ("error" in uploaded) {
          return { error: uploaded.error, saved: prev.saved };
        }
        uploadedPath = uploaded.path;
        formData.set("image_path", uploadedPath);
      }

      const result = await updateMistake(mistake.id, prev, formData);
      if (result.saved > prev.saved) {
        toast.success("수정 내용을 저장했어요");
        selectImage(null);
        setRemoveExisting(false);
      } else if (uploadedPath) {
        // 저장 실패 — 방금 올린 사진 롤백 (사진 state는 남겨 재시도 가능)
        void removeMistakeImage(uploadedPath);
      }
      return result;
    },
    initialState,
  );

  const gradeUnits = units.filter((u) => u.grade === grade);
  const showExistingImage = imageUrl !== null && !removeExisting && !newImage;

  return (
    <Card className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="unit_id" value={unitId} />
        <input type="hidden" name="error_type" value={errorType ?? ""} />
        <input
          type="hidden"
          name="image_remove"
          value={removeExisting && !newImage ? "1" : ""}
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

        <div className="flex flex-col gap-4 border-t border-hairline pt-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-caption text-ink-muted">문제 사진</span>
            {newImage ? (
              <div className="flex items-center gap-3">
                {/* 미리보기는 blob URL이라 next/image 대상이 아니다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={newImage.previewUrl}
                  alt="새 문제 사진 미리보기"
                  className="max-h-60 rounded-xs border border-hairline object-contain"
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
            ) : showExistingImage ? (
              <div className="flex flex-col gap-2">
                {/* signed URL은 만료되는 값이라 next/image 캐시 대상이 아니다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="문제 사진"
                  className="max-h-60 self-start rounded-xs border border-hairline object-contain"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex min-h-11 items-center gap-1.5 text-button text-ink-secondary"
                  >
                    <Camera aria-hidden className="size-4" />
                    사진 바꾸기
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveExisting(true)}
                    className="inline-flex min-h-11 items-center gap-1 text-button text-ink-secondary"
                  >
                    <X aria-hidden className="size-4" />
                    사진 삭제
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 self-start rounded-md border border-hairline bg-surface px-3.5 text-button text-ink"
                >
                  <Camera aria-hidden className="size-4" />
                  사진 추가
                </button>
                {removeExisting && imageUrl && (
                  <button
                    type="button"
                    onClick={() => setRemoveExisting(false)}
                    className="inline-flex min-h-11 items-center text-button text-ink-secondary"
                  >
                    삭제 취소
                  </button>
                )}
              </div>
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

          <label className="flex flex-col gap-1.5">
            <span className="text-caption text-ink-muted">문제 본문</span>
            <textarea
              name="problem_text"
              rows={3}
              defaultValue={mistake.problem_text ?? ""}
              placeholder="예: 2x + 3 = 7일 때 x의 값을 구하시오"
              className="w-full rounded-xs border border-[#dddddd] bg-surface p-1.5 text-body-sm text-ink placeholder:text-ink-faint focus:shadow-l1 focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">내가 쓴 답</span>
              <Input
                name="my_answer"
                defaultValue={mistake.my_answer ?? ""}
                placeholder="예: 3"
                autoComplete="off"
                className="min-h-11"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">정답</span>
              <Input
                name="correct_answer"
                defaultValue={mistake.correct_answer ?? ""}
                placeholder="예: 2"
                autoComplete="off"
                className="min-h-11"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">출처</span>
              <Input
                name="source"
                defaultValue={mistake.source ?? ""}
                placeholder="예: 중간고사"
                autoComplete="off"
                className="min-h-11"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-caption text-ink-muted">문제 번호</span>
              <Input
                name="problem_ref"
                defaultValue={mistake.problem_ref ?? ""}
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
              defaultValue={mistake.memo ?? ""}
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
          {pending ? "저장 중…" : "수정 저장"}
        </Button>
      </form>
    </Card>
  );
}
