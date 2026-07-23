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
});
