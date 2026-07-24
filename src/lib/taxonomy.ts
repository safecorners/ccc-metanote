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

/**
 * 2층 서브 분류 — Movshovitz-Hadar·Zaslavsky·Inbar(1987) 6유형.
 * AI 보조 분류(Phase 7) 전용: DB CHECK·zod enum·프롬프트가 여기서 파생된다.
 * description은 프롬프트의 분류 기준이자 UI 툴팁 문구.
 */
export type ErrorSubtype = {
  id: string;
  label: string;
  /** 프롬프트·툴팁용 한 줄 정의 */
  description: string;
};

export const ERROR_SUBTYPES = [
  {
    id: "misused_data",
    label: "오용된 자료",
    description: "문제가 준 조건·숫자를 빠뜨리거나 다른 값으로 바꿔 사용했다",
  },
  {
    id: "misinterpreted_language",
    label: "잘못 해석된 언어",
    description: "문제의 표현·기호·용어를 다른 뜻으로 받아들였다",
  },
  {
    id: "invalid_inference",
    label: "논리적으로 부적절한 추론",
    description: "근거 없이 결론으로 건너뛰거나 성립하지 않는 논리를 폈다",
  },
  {
    id: "distorted_theorem",
    label: "정리·정의 왜곡",
    description: "개념·공식·정의를 원래와 다르게 기억하거나 적용했다",
  },
  {
    id: "unverified_solution",
    label: "검증되지 않은 해답",
    description: "구한 답이 문제 조건에 맞는지 확인하지 않고 마무리했다",
  },
  {
    id: "technical_error",
    label: "기술적 오류",
    description: "계산·이항·부호 처리 같은 절차 수행에서 실수했다",
  },
] as const satisfies readonly ErrorSubtype[];

export type ErrorSubtypeId = (typeof ERROR_SUBTYPES)[number]["id"];

export const ERROR_SUBTYPE_IDS = ERROR_SUBTYPES.map(
  (t) => t.id,
) as ErrorSubtypeId[];

const SUBTYPE_BY_ID = new Map<string, (typeof ERROR_SUBTYPES)[number]>(
  ERROR_SUBTYPES.map((t) => [t.id, t]),
);

export function getErrorSubtype(id: ErrorSubtypeId) {
  return SUBTYPE_BY_ID.get(id)!;
}

export function isErrorSubtypeId(value: string): value is ErrorSubtypeId {
  return SUBTYPE_BY_ID.has(value);
}
