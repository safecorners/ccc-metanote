/**
 * 오답 분류 체계 (Newman 단순화 5종) — 단일 소스.
 * 태그 UI·차트·DB CHECK 제약·zod enum이 전부 여기서 파생된다.
 * 근거·색 매핑: docs/PLAN.md "확정된 오답 분류 체계", DESIGN.md 카테고리 팔레트.
 *
 * green(#1aae39)은 극복 완료 전용, brown은 일러스트 전용 — 오류 유형 색이 아니다.
 */
export type ErrorType = {
  id: string;
  label: string;
  /** 차트(Recharts)용 hex — CSS 변수를 못 읽는 SVG 렌더러에 직접 전달한다 */
  color: string;
  /** ErrorTag 도트 색 */
  dotClassName: string;
  /** ErrorTag 선택 상태의 옅은 틴트 + 딥 톤 텍스트 */
  selectedClassName: string;
};

export const ERROR_TYPES = [
  {
    id: "misread",
    label: "문제 해석 오류",
    color: "#62aef0",
    dotClassName: "bg-accent-sky",
    selectedClassName: "bg-accent-sky/15 text-secondary",
  },
  {
    id: "no_concept",
    label: "개념 이해 부족",
    color: "#dd5b00",
    dotClassName: "bg-accent-orange",
    selectedClassName: "bg-accent-orange/10 text-accent-orange-deep",
  },
  {
    id: "calc_error",
    label: "계산 실수",
    color: "#ff64c8",
    dotClassName: "bg-accent-pink",
    selectedClassName: "bg-accent-pink/10 text-ink",
  },
  {
    id: "careless",
    label: "부주의",
    color: "#2a9d99",
    dotClassName: "bg-accent-teal",
    selectedClassName: "bg-accent-teal/15 text-accent-teal",
  },
  {
    id: "time_pressure",
    label: "시간 부족",
    color: "#d6b6f6",
    dotClassName: "bg-accent-purple",
    selectedClassName: "bg-accent-purple/25 text-accent-purple-deep",
  },
] as const satisfies readonly ErrorType[];

export type ErrorTypeId = (typeof ERROR_TYPES)[number]["id"];

export const ERROR_TYPE_IDS = ERROR_TYPES.map((t) => t.id) as ErrorTypeId[];

const BY_ID = new Map<string, (typeof ERROR_TYPES)[number]>(
  ERROR_TYPES.map((t) => [t.id, t]),
);

export function getErrorType(id: ErrorTypeId) {
  return BY_ID.get(id)!;
}

export function isErrorTypeId(value: string): value is ErrorTypeId {
  return BY_ID.has(value);
}
