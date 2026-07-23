import { describe, expect, it } from "vitest";
import {
  ERROR_TYPES,
  ERROR_TYPE_IDS,
  getErrorType,
  isErrorTypeId,
} from "./taxonomy";

// PLAN.md "확정된 오답 분류 체계" 표 + DESIGN.md 색 매핑의 사본.
// 여기가 깨지면 taxonomy.ts가 문서와 어긋난 것이다.
const EXPECTED = [
  { id: "misread", label: "문제 해석 오류", color: "#62aef0" },
  { id: "no_concept", label: "개념 이해 부족", color: "#dd5b00" },
  { id: "calc_error", label: "계산 실수", color: "#ff64c8" },
  { id: "careless", label: "부주의", color: "#2a9d99" },
  { id: "time_pressure", label: "시간 부족", color: "#d6b6f6" },
];

describe("ERROR_TYPES", () => {
  it("PLAN.md 표와 동일한 5종을 같은 순서로 정의한다", () => {
    expect(ERROR_TYPES).toHaveLength(5);
    expect(
      ERROR_TYPES.map(({ id, label, color }) => ({ id, label, color })),
    ).toEqual(EXPECTED);
  });

  it("id와 색이 각각 유일하다", () => {
    expect(new Set(ERROR_TYPES.map((t) => t.id)).size).toBe(5);
    expect(new Set(ERROR_TYPES.map((t) => t.color)).size).toBe(5);
  });

  it("극복 완료(green)·일러스트(brown) 색을 오류 유형에 쓰지 않는다", () => {
    const reserved = ["#1aae39", "#523410"];
    for (const t of ERROR_TYPES) {
      expect(reserved).not.toContain(t.color);
    }
  });

  it("모든 유형이 태그 스타일 클래스를 갖는다", () => {
    for (const t of ERROR_TYPES) {
      expect(t.dotClassName).toMatch(/^bg-accent-/);
      expect(t.selectedClassName).toMatch(/^bg-accent-/);
    }
  });

  it("ERROR_TYPE_IDS는 DB CHECK·zod enum에 쓸 문자열 배열이다", () => {
    expect(ERROR_TYPE_IDS).toEqual([
      "misread",
      "no_concept",
      "calc_error",
      "careless",
      "time_pressure",
    ]);
  });
});

describe("getErrorType", () => {
  it("id로 정의를 찾는다", () => {
    expect(getErrorType("calc_error").label).toBe("계산 실수");
    expect(getErrorType("calc_error").color).toBe("#ff64c8");
  });
});

describe("isErrorTypeId", () => {
  it("정의된 id만 통과시킨다", () => {
    expect(isErrorTypeId("misread")).toBe(true);
    expect(isErrorTypeId("MISREAD")).toBe(false);
    expect(isErrorTypeId("unknown")).toBe(false);
    expect(isErrorTypeId("")).toBe(false);
  });
});
