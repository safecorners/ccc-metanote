import { z } from "zod";
import {
  ERROR_TYPE_IDS,
  isErrorSubtypeId,
  isErrorTypeId,
  type ErrorSubtypeId,
  type ErrorTypeId,
} from "./taxonomy";

// 오답 입력 폼 검증 — 필수는 단원 + 오류 유형 2개뿐 (시나리오 1).
// 서버 액션(createMistake)과 단위 테스트가 함께 쓰는 순수 로직.

const optionalText = (max: number, error: string) =>
  z
    .string()
    .trim()
    .max(max, { error })
    .transform((v) => (v === "" ? null : v));

// AI 제안 hidden input용 — 빈 값은 null, 값이 있으면 enum 강제
const optionalId = <T extends string>(
  guard: (value: string) => value is T,
  error: string,
) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine((v): v is T | null => v === null || guard(v), { error });

export const mistakeInputSchema = z.object({
  unit_id: z.coerce
    .number({ error: "단원을 선택해 주세요" })
    .int({ error: "단원을 선택해 주세요" })
    .positive({ error: "단원을 선택해 주세요" }),
  error_type: z.enum(ERROR_TYPE_IDS as [ErrorTypeId, ...ErrorTypeId[]], {
    error: "왜 틀렸는지 태그를 골라 주세요",
  }),
  source: optionalText(100, "출처는 100자까지 적을 수 있어요"),
  problem_ref: optionalText(100, "문제 번호는 100자까지 적을 수 있어요"),
  memo: optionalText(500, "메모는 500자까지 적을 수 있어요"),
  problem_text: optionalText(2000, "문제 본문은 2000자까지 적을 수 있어요"),
  my_answer: optionalText(200, "내가 쓴 답은 200자까지 적을 수 있어요"),
  correct_answer: optionalText(200, "정답은 200자까지 적을 수 있어요"),
  image_path: optionalText(300, "사진 정보가 올바르지 않아요"),
  ai_suggested_type: optionalId<ErrorTypeId>(
    isErrorTypeId,
    "AI 제안 정보가 올바르지 않아요",
  ),
  ai_suggested_subtype: optionalId<ErrorSubtypeId>(
    isErrorSubtypeId,
    "AI 제안 정보가 올바르지 않아요",
  ),
});

export type MistakeInput = z.infer<typeof mistakeInputSchema> & {
  /** 최종 error_type이 AI 제안과 일치했는가 — 제안 없으면 null (서버 파생, 클라이언트 미신뢰) */
  ai_agreement: boolean | null;
};

export type ParsedMistakeForm =
  | { ok: true; data: MistakeInput }
  | { ok: false; error: string };

export function parseMistakeForm(formData: FormData): ParsedMistakeForm {
  const result = mistakeInputSchema.safeParse({
    unit_id: String(formData.get("unit_id") ?? ""),
    error_type: String(formData.get("error_type") ?? ""),
    source: String(formData.get("source") ?? ""),
    problem_ref: String(formData.get("problem_ref") ?? ""),
    memo: String(formData.get("memo") ?? ""),
    problem_text: String(formData.get("problem_text") ?? ""),
    my_answer: String(formData.get("my_answer") ?? ""),
    correct_answer: String(formData.get("correct_answer") ?? ""),
    image_path: String(formData.get("image_path") ?? ""),
    ai_suggested_type: String(formData.get("ai_suggested_type") ?? ""),
    ai_suggested_subtype: String(formData.get("ai_suggested_subtype") ?? ""),
  });

  if (!result.success) {
    return { ok: false, error: result.error.issues[0].message };
  }

  // 유형 제안 없이 서브 유형만 올 수 없다 — 둘은 항상 함께 온다
  const suggested = result.data.ai_suggested_type;
  return {
    ok: true,
    data: {
      ...result.data,
      ai_suggested_subtype:
        suggested === null ? null : result.data.ai_suggested_subtype,
      ai_agreement:
        suggested === null ? null : suggested === result.data.error_type,
    },
  };
}
