import { describe, expect, it } from "vitest";
import {
  FEW_SHOT_EXAMPLES,
  SUGGESTION_RESPONSE_SCHEMA,
  buildSuggestionPrompt,
  hasClassifiableText,
  parseSuggestionResponse,
  parseSuggestionRequest,
  type SuggestionInput,
} from "./suggestion";

const BASE: SuggestionInput = {
  unitName: "일차방정식",
  problem_text: "2x + 3 = 7을 풀어라",
  my_answer: "x = 5",
  correct_answer: "x = 2",
  memo: "이항할 때 부호를 안 바꿨다",
};

const EMPTY: SuggestionInput = {
  unitName: "일차방정식",
  problem_text: null,
  my_answer: null,
  correct_answer: null,
  memo: null,
};

describe("hasClassifiableText", () => {
  it("텍스트 4종이 모두 없으면 false", () => {
    expect(hasClassifiableText(EMPTY)).toBe(false);
  });

  it("공백뿐인 값은 없는 것으로 본다", () => {
    expect(hasClassifiableText({ ...EMPTY, memo: "   " })).toBe(false);
  });

  it.each([
    "problem_text",
    "my_answer",
    "correct_answer",
    "memo",
  ] as const)("%s 하나만 있어도 true", (field) => {
    expect(hasClassifiableText({ ...EMPTY, [field]: "내용" })).toBe(true);
  });
});

describe("buildSuggestionPrompt", () => {
  it("단원명과 학생이 적은 텍스트를 담는다", () => {
    const prompt = buildSuggestionPrompt(BASE);
    expect(prompt).toContain("일차방정식");
    expect(prompt).toContain("2x + 3 = 7을 풀어라");
    expect(prompt).toContain("x = 5");
    expect(prompt).toContain("이항할 때 부호를 안 바꿨다");
  });

  it("null 필드는 학생 기록 섹션에서 라벨째 생략한다", () => {
    const prompt = buildSuggestionPrompt({
      ...EMPTY,
      memo: "부호 실수",
    });
    // few-shot 예시에도 같은 라벨이 쓰이므로 [학생 기록] 이후만 본다
    const studentSection = prompt.slice(prompt.indexOf("[학생 기록]"));
    expect(studentSection).not.toContain("문제 본문:");
    expect(studentSection).not.toContain("내가 쓴 답:");
    expect(studentSection).not.toContain("정답:");
    expect(studentSection).toContain("부호 실수");
  });

  it("1층 5종·2층 6유형의 분류 기준을 모두 담는다", () => {
    const prompt = buildSuggestionPrompt(BASE);
    for (const id of [
      "misread",
      "no_concept",
      "calc_error",
      "careless",
      "time_pressure",
      "misused_data",
      "misinterpreted_language",
      "invalid_inference",
      "distorted_theorem",
      "unverified_solution",
      "technical_error",
    ]) {
      expect(prompt).toContain(id);
    }
  });

  it("few-shot 예시 3개를 담는다", () => {
    expect(FEW_SHOT_EXAMPLES).toHaveLength(3);
    const prompt = buildSuggestionPrompt(BASE);
    for (const example of FEW_SHOT_EXAMPLES) {
      expect(prompt).toContain(example.output.reason);
    }
  });

  it("학생이 고른 태그 등 여분 필드는 프롬프트에 새지 않는다", () => {
    // 일치율(70%) 지표가 오염되지 않도록 모델은 독립 분류한다 —
    // 입력 타입에 태그 필드가 없고, 실수로 넘겨도 프롬프트가 달라지지 않아야 한다.
    const withExtra = {
      ...BASE,
      error_type: "calc_error",
      email: "student@example.com",
    } as unknown as SuggestionInput;
    expect(buildSuggestionPrompt(withExtra)).toBe(buildSuggestionPrompt(BASE));
  });
});

describe("SUGGESTION_RESPONSE_SCHEMA", () => {
  it("suggested_type·suggested_subtype enum이 taxonomy에서 파생된다", () => {
    const props = SUGGESTION_RESPONSE_SCHEMA.properties;
    expect(props.suggested_type.enum).toHaveLength(5);
    expect(props.suggested_subtype.enum).toHaveLength(6);
    expect(SUGGESTION_RESPONSE_SCHEMA.required).toEqual([
      "suggested_type",
      "suggested_subtype",
      "reason",
    ]);
  });
});

describe("parseSuggestionResponse", () => {
  const valid = JSON.stringify({
    suggested_type: "no_concept",
    suggested_subtype: "distorted_theorem",
    reason: "이등변삼각형의 성질을 거꾸로 적용했어요",
  });

  it("정상 응답을 통과시킨다", () => {
    const result = parseSuggestionResponse(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.suggestion.suggested_type).toBe("no_concept");
      expect(result.suggestion.suggested_subtype).toBe("distorted_theorem");
    }
  });

  it.each([
    ["JSON이 아니면", "not-json{{"],
    ["enum 밖 유형이면", JSON.stringify({ suggested_type: "lazy", suggested_subtype: "distorted_theorem", reason: "x" })],
    ["enum 밖 서브 유형이면", JSON.stringify({ suggested_type: "no_concept", suggested_subtype: "no_concept", reason: "x" })],
    ["reason이 공백뿐이면", JSON.stringify({ suggested_type: "no_concept", suggested_subtype: "distorted_theorem", reason: "  " })],
    ["reason이 200자를 넘으면", JSON.stringify({ suggested_type: "no_concept", suggested_subtype: "distorted_theorem", reason: "가".repeat(201) })],
    ["필드가 빠지면", JSON.stringify({ suggested_type: "no_concept" })],
  ])("%s 거부한다", (_case, text) => {
    expect(parseSuggestionResponse(text).ok).toBe(false);
  });
});

describe("parseSuggestionRequest", () => {
  const base = {
    error_type: "calc_error",
    unit_name: "일차방정식",
    problem_text: "2x + 3 = 7",
    my_answer: "",
    correct_answer: "",
    memo: "부호 실수",
  };

  it("정상 요청을 통과시키고 빈 문자열을 null로 바꾼다", () => {
    const result = parseSuggestionRequest(base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.input.my_answer).toBeNull();
      expect(result.data.input.unitName).toBe("일차방정식");
      expect(result.data.error_type).toBe("calc_error");
    }
  });

  it("태그 없이(빈 값·enum 밖) 요청하면 거부한다 — 태그 먼저 원칙", () => {
    expect(parseSuggestionRequest({ ...base, error_type: "" }).ok).toBe(false);
    expect(parseSuggestionRequest({ ...base, error_type: "lazy" }).ok).toBe(
      false,
    );
  });

  it("분류할 텍스트가 하나도 없으면 거부한다", () => {
    const result = parseSuggestionRequest({
      ...base,
      problem_text: "",
      memo: "  ",
    });
    expect(result.ok).toBe(false);
  });

  it("본문 길이 제한(mistake 폼과 동일)을 넘으면 거부한다", () => {
    expect(
      parseSuggestionRequest({ ...base, problem_text: "가".repeat(2001) }).ok,
    ).toBe(false);
    expect(parseSuggestionRequest({ ...base, memo: "가".repeat(501) }).ok).toBe(
      false,
    );
  });
});
