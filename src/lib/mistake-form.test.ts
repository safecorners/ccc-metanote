import { describe, expect, it } from "vitest";
import { ERROR_TYPE_IDS } from "./taxonomy";
import { parseMistakeForm } from "./mistake-form";

function form(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

describe("parseMistakeForm", () => {
  it("필수 2개(단원·오류 유형)만으로 유효하다 — 시나리오 1의 최소 입력", () => {
    const result = parseMistakeForm(
      form({ unit_id: "12", error_type: "calc_error" }),
    );

    expect(result).toEqual({
      ok: true,
      data: {
        unit_id: 12,
        error_type: "calc_error",
        source: null,
        problem_ref: null,
        memo: null,
        problem_text: null,
        my_answer: null,
        correct_answer: null,
        image_path: null,
        ai_suggested_type: null,
        ai_suggested_subtype: null,
        ai_agreement: null,
      },
    });
  });

  it("선택 입력은 앞뒤 공백을 잘라 저장하고, 빈 값은 null이 된다", () => {
    const result = parseMistakeForm(
      form({
        unit_id: "3",
        error_type: "misread",
        source: "  중간고사  ",
        problem_ref: " 12번 ",
        memo: "   ",
      }),
    );

    expect(result).toEqual({
      ok: true,
      data: {
        unit_id: 3,
        error_type: "misread",
        source: "중간고사",
        problem_ref: "12번",
        memo: null,
        problem_text: null,
        my_answer: null,
        correct_answer: null,
        image_path: null,
        ai_suggested_type: null,
        ai_suggested_subtype: null,
        ai_agreement: null,
      },
    });
  });

  it.each(ERROR_TYPE_IDS)("오류 유형 %s 를 허용한다", (id) => {
    const result = parseMistakeForm(form({ unit_id: "1", error_type: id }));
    expect(result.ok).toBe(true);
  });

  it("단원이 없으면 실패한다", () => {
    const result = parseMistakeForm(form({ error_type: "careless" }));
    expect(result).toEqual({ ok: false, error: "단원을 선택해 주세요" });
  });

  it.each(["0", "-1", "abc", "1.5"])(
    "단원 id가 양의 정수가 아니면(%s) 실패한다",
    (unitId) => {
      const result = parseMistakeForm(
        form({ unit_id: unitId, error_type: "careless" }),
      );
      expect(result).toEqual({ ok: false, error: "단원을 선택해 주세요" });
    },
  );

  it("오류 유형이 없으면 실패한다", () => {
    const result = parseMistakeForm(form({ unit_id: "1" }));
    expect(result).toEqual({
      ok: false,
      error: "왜 틀렸는지 태그를 골라 주세요",
    });
  });

  it("정의되지 않은 오류 유형은 거부한다", () => {
    const result = parseMistakeForm(
      form({ unit_id: "1", error_type: "typo" }),
    );
    expect(result).toEqual({
      ok: false,
      error: "왜 틀렸는지 태그를 골라 주세요",
    });
  });

  it("단원·유형이 둘 다 없으면 단원 안내를 먼저 보여준다", () => {
    const result = parseMistakeForm(form({}));
    expect(result).toEqual({ ok: false, error: "단원을 선택해 주세요" });
  });

  it("메모가 500자를 넘으면 실패한다", () => {
    const result = parseMistakeForm(
      form({ unit_id: "1", error_type: "careless", memo: "가".repeat(501) }),
    );
    expect(result).toEqual({
      ok: false,
      error: "메모는 500자까지 적을 수 있어요",
    });
  });

  it("출처·문제번호가 100자를 넘으면 실패한다", () => {
    for (const field of ["source", "problem_ref"] as const) {
      const result = parseMistakeForm(
        form({ unit_id: "1", error_type: "careless", [field]: "가".repeat(101) }),
      );
      expect(result.ok).toBe(false);
    }
  });

  it("문제 본문·답·사진 경로를 함께 받아 공백을 잘라 저장한다", () => {
    const result = parseMistakeForm(
      form({
        unit_id: "5",
        error_type: "no_concept",
        problem_text: " 2x + 3 = 7 일 때 x의 값을 구하시오 ",
        my_answer: " 3 ",
        correct_answer: " 2 ",
        image_path: "user-1/abc.jpg",
      }),
    );

    expect(result).toEqual({
      ok: true,
      data: {
        unit_id: 5,
        error_type: "no_concept",
        source: null,
        problem_ref: null,
        memo: null,
        problem_text: "2x + 3 = 7 일 때 x의 값을 구하시오",
        my_answer: "3",
        correct_answer: "2",
        image_path: "user-1/abc.jpg",
        ai_suggested_type: null,
        ai_suggested_subtype: null,
        ai_agreement: null,
      },
    });
  });

  it("문제 본문이 2000자를 넘으면 실패한다", () => {
    const result = parseMistakeForm(
      form({
        unit_id: "1",
        error_type: "careless",
        problem_text: "가".repeat(2001),
      }),
    );
    expect(result).toEqual({
      ok: false,
      error: "문제 본문은 2000자까지 적을 수 있어요",
    });
  });

  it("내가 쓴 답·정답이 200자를 넘으면 실패한다", () => {
    for (const field of ["my_answer", "correct_answer"] as const) {
      const result = parseMistakeForm(
        form({ unit_id: "1", error_type: "careless", [field]: "가".repeat(201) }),
      );
      expect(result.ok).toBe(false);
    }
  });
});

describe("parseMistakeForm — AI 제안 필드 (Phase 7)", () => {
  const withAi = (entries: Record<string, string>) =>
    form({ unit_id: "1", ...entries });

  it("제안과 최종 태그가 같으면 ai_agreement=true", () => {
    const result = parseMistakeForm(
      withAi({
        error_type: "no_concept",
        ai_suggested_type: "no_concept",
        ai_suggested_subtype: "distorted_theorem",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ai_suggested_type).toBe("no_concept");
      expect(result.data.ai_suggested_subtype).toBe("distorted_theorem");
      expect(result.data.ai_agreement).toBe(true);
    }
  });

  it("제안을 받고 다른 태그를 고르면 ai_agreement=false — 제안은 보존된다", () => {
    const result = parseMistakeForm(
      withAi({
        error_type: "calc_error",
        ai_suggested_type: "no_concept",
        ai_suggested_subtype: "distorted_theorem",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ai_suggested_type).toBe("no_concept");
      expect(result.data.ai_agreement).toBe(false);
    }
  });

  it("제안 없이(빈 값) 저장하면 3필드 모두 null", () => {
    const result = parseMistakeForm(
      withAi({
        error_type: "careless",
        ai_suggested_type: "",
        ai_suggested_subtype: "",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ai_suggested_type).toBeNull();
      expect(result.data.ai_suggested_subtype).toBeNull();
      expect(result.data.ai_agreement).toBeNull();
    }
  });

  it("유형 제안 없이 서브 유형만 오면 둘 다 null로 정리한다", () => {
    const result = parseMistakeForm(
      withAi({
        error_type: "careless",
        ai_suggested_subtype: "distorted_theorem",
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ai_suggested_type).toBeNull();
      expect(result.data.ai_suggested_subtype).toBeNull();
      expect(result.data.ai_agreement).toBeNull();
    }
  });

  it.each([
    ["ai_suggested_type", "lazy"],
    ["ai_suggested_subtype", "no_concept"],
  ])("enum 밖 %s(%s)은 거부한다", (field, value) => {
    const result = parseMistakeForm(
      withAi({
        error_type: "careless",
        ai_suggested_type: "careless",
        [field]: value,
      }),
    );
    expect(result).toEqual({
      ok: false,
      error: "AI 제안 정보가 올바르지 않아요",
    });
  });
});
