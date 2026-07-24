import { z } from "zod";
import {
  ERROR_SUBTYPES,
  ERROR_SUBTYPE_IDS,
  ERROR_TYPES,
  ERROR_TYPE_IDS,
  type ErrorSubtypeId,
  type ErrorTypeId,
} from "../taxonomy";

// AI 보조 분류(Phase 7)의 순수 로직 — 네트워크 없음, 전부 단위 테스트 대상.
// 학생 텍스트만 다루고 식별 정보(이름·이메일·user_id) 필드는 두지 않는다 (미성년자 데이터 보호).
// 학생이 고른 태그도 프롬프트에 넣지 않는다 — 모델이 독립 분류해야 일치율(70%) 지표가 오염되지 않는다.

export type SuggestionInput = {
  unitName: string;
  problem_text: string | null;
  my_answer: string | null;
  correct_answer: string | null;
  memo: string | null;
};

/** 버튼 활성(클라이언트)과 요청 거부(서버)가 공유하는 단일 기준 */
export function hasClassifiableText(input: SuggestionInput): boolean {
  return [
    input.problem_text,
    input.my_answer,
    input.correct_answer,
    input.memo,
  ].some((v) => v !== null && v.trim() !== "");
}

/** 1층 유형별 분류 기준 — 프롬프트 전용 (라벨·색의 단일 소스는 taxonomy.ts) */
const TYPE_GUIDE: Record<ErrorTypeId, string> = {
  misread: "문제가 묻는 것을 잘못 읽거나 조건을 놓쳤다",
  no_concept: "개념·공식을 몰랐거나 잘못 이해한 상태로 풀었다",
  calc_error: "풀이 방향은 맞았지만 계산 과정에서 틀렸다",
  careless: "알고 있었는데 순간의 부주의로 틀렸다",
  time_pressure: "시간이 모자라 풀지 못했거나 서둘러 틀렸다",
};

export type FewShotExample = {
  input: SuggestionInput;
  output: {
    suggested_type: ErrorTypeId;
    suggested_subtype: ErrorSubtypeId;
    reason: string;
  };
};

export const FEW_SHOT_EXAMPLES: readonly FewShotExample[] = [
  {
    input: {
      unitName: "삼각형의 성질",
      problem_text:
        "이등변삼각형 ABC에서 ∠B = 50°일 때 ∠A의 크기를 구하여라 (AB = AC)",
      my_answer: "50°",
      correct_answer: "80°",
      memo: "두 밑각이 같다는 걸 꼭짓각에 적용했다",
    },
    output: {
      suggested_type: "no_concept",
      suggested_subtype: "distorted_theorem",
      reason: "이등변삼각형에서 같은 각이 어디인지 성질을 바꿔 기억한 것으로 보여요",
    },
  },
  {
    input: {
      unitName: "일차방정식",
      problem_text: "3x - 4 = 2x + 1을 풀어라",
      my_answer: "x = -5",
      correct_answer: "x = 5",
      memo: null,
    },
    output: {
      suggested_type: "calc_error",
      suggested_subtype: "technical_error",
      reason: "이항하면서 부호 처리에서 실수한 것으로 보여요",
    },
  },
  {
    input: {
      unitName: "부등식",
      problem_text: "x가 3 이상 7 미만인 자연수의 개수를 구하여라",
      my_answer: "3개",
      correct_answer: "4개",
      memo: "이상이면 3은 빼는 줄 알았다",
    },
    output: {
      suggested_type: "misread",
      suggested_subtype: "misinterpreted_language",
      reason: "'이상'이 그 수를 포함한다는 뜻을 다르게 해석한 것으로 보여요",
    },
  },
];

function renderRecord(input: SuggestionInput): string {
  const lines = [`단원: ${input.unitName}`];
  if (input.problem_text) lines.push(`문제 본문: ${input.problem_text}`);
  if (input.my_answer) lines.push(`내가 쓴 답: ${input.my_answer}`);
  if (input.correct_answer) lines.push(`정답: ${input.correct_answer}`);
  if (input.memo) lines.push(`메모: ${input.memo}`);
  return lines.join("\n");
}

export function buildSuggestionPrompt(input: SuggestionInput): string {
  // 알려진 필드만 골라 담는다 — 여분 필드(태그·식별 정보)가 실수로 넘어와도 프롬프트에 새지 않는다
  const record: SuggestionInput = {
    unitName: input.unitName,
    problem_text: input.problem_text,
    my_answer: input.my_answer,
    correct_answer: input.correct_answer,
    memo: input.memo,
  };

  const typeList = ERROR_TYPES.map(
    (t) => `- ${t.id} (${t.label}): ${TYPE_GUIDE[t.id]}`,
  ).join("\n");
  const subtypeList = ERROR_SUBTYPES.map(
    (t) => `- ${t.id} (${t.label}): ${t.description}`,
  ).join("\n");
  const examples = FEW_SHOT_EXAMPLES.map(
    (e) => `${renderRecord(e.input)}\n출력: ${JSON.stringify(e.output)}`,
  ).join("\n\n");

  return `너는 중학교 수학 오답의 원인을 분류하는 선생님이다. 학생이 남긴 오답 기록을 읽고 오류 원인을 분류한다.

[오류 유형 — 반드시 하나 선택]
${typeList}

[서브 유형 — 반드시 하나 선택]
${subtypeList}

[출력 규칙]
- JSON 하나만 출력한다: {"suggested_type": ..., "suggested_subtype": ..., "reason": ...}
- reason은 중학생에게 보여줄 존댓말 한 문장("~로 보여요" 톤, 100자 이내)으로 쓴다.
- 기록만으로 판단이 어려우면 가장 그럴듯한 유형을 고르고 reason에 근거를 짧게 적는다.

[예시]
${examples}

[학생 기록]
${renderRecord(record)}`;
}

/** Gemini responseJsonSchema용 — enum은 taxonomy에서 파생 */
export const SUGGESTION_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    suggested_type: { type: "string", enum: ERROR_TYPE_IDS },
    suggested_subtype: { type: "string", enum: ERROR_SUBTYPE_IDS },
    reason: {
      type: "string",
      description: "학생에게 보여줄 존댓말 한 문장 (100자 이내)",
    },
  },
  required: ["suggested_type", "suggested_subtype", "reason"],
  additionalProperties: false,
} as const;

export const aiSuggestionSchema = z.object({
  suggested_type: z.enum(ERROR_TYPE_IDS as [ErrorTypeId, ...ErrorTypeId[]]),
  suggested_subtype: z.enum(
    ERROR_SUBTYPE_IDS as [ErrorSubtypeId, ...ErrorSubtypeId[]],
  ),
  reason: z.string().trim().min(1).max(200),
});

export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;

/** 구조화 출력이 깨지거나 enum 밖 값이 와도 여기서 걸러진다 — 통과분만 저장 경로에 진입 */
export function parseSuggestionResponse(
  text: string,
): { ok: true; suggestion: AiSuggestion } | { ok: false } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false };
  }
  const result = aiSuggestionSchema.safeParse(json);
  return result.success ? { ok: true, suggestion: result.data } : { ok: false };
}

const requestText = (max: number, error: string) =>
  z
    .string()
    .trim()
    .max(max, { error })
    .transform((v) => (v === "" ? null : v));

// 길이 제한은 mistakeInputSchema와 동일 — 폼에 이미 적힌 값을 그대로 넘겨받는다
const suggestionRequestSchema = z.object({
  error_type: z.enum(ERROR_TYPE_IDS as [ErrorTypeId, ...ErrorTypeId[]], {
    error: "왜 틀렸는지 태그를 먼저 골라 주세요",
  }),
  unit_name: z
    .string()
    .trim()
    .min(1, { error: "단원을 선택해 주세요" })
    .max(100, { error: "단원 정보가 올바르지 않아요" }),
  problem_text: requestText(2000, "문제 본문은 2000자까지 적을 수 있어요"),
  my_answer: requestText(200, "내가 쓴 답은 200자까지 적을 수 있어요"),
  correct_answer: requestText(200, "정답은 200자까지 적을 수 있어요"),
  memo: requestText(500, "메모는 500자까지 적을 수 있어요"),
});

export type ParsedSuggestionRequest =
  | { ok: true; data: { error_type: ErrorTypeId; input: SuggestionInput } }
  | { ok: false; error: string };

export function parseSuggestionRequest(raw: unknown): ParsedSuggestionRequest {
  const result = suggestionRequestSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0].message };
  }

  const input: SuggestionInput = {
    unitName: result.data.unit_name,
    problem_text: result.data.problem_text,
    my_answer: result.data.my_answer,
    correct_answer: result.data.correct_answer,
    memo: result.data.memo,
  };

  if (!hasClassifiableText(input)) {
    return {
      ok: false,
      error: "문제 내용이나 메모를 적으면 AI 제안을 받을 수 있어요",
    };
  }

  return { ok: true, data: { error_type: result.data.error_type, input } };
}
