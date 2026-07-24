import type { ErrorSubtypeId, ErrorTypeId } from "./taxonomy";

// supabase/migrations/0001_init.sql 의 row 타입.
// 스키마를 바꾸면 여기도 같이 고친다 (생성 타입 도입은 스키마가 굳은 뒤에).

export type Profile = {
  id: string;
  display_name: string;
  grade: number;
  created_at: string;
};

export type Unit = {
  id: number;
  subject: string;
  grade: number;
  order_no: number;
  name: string;
};

export type Mistake = {
  id: string;
  user_id: string;
  unit_id: number;
  error_type: ErrorTypeId;
  source: string | null;
  problem_ref: string | null;
  memo: string | null;
  problem_text: string | null;
  my_answer: string | null;
  correct_answer: string | null;
  /** 'mistake-images' 버킷 내 경로: {user_id}/{uuid}.jpg */
  image_path: string | null;
  /** AI 제안 3종 — 모두 null이면 AI 미사용 저장 (0004) */
  ai_suggested_type: ErrorTypeId | null;
  ai_suggested_subtype: ErrorSubtypeId | null;
  /** 최종 error_type이 제안과 일치했는가 — 제안이 있을 때만 non-null */
  ai_agreement: boolean | null;
  resolved: boolean;
  /** YYYY-MM-DD */
  mistake_date: string;
  created_at: string;
};

/** 목록·차트가 쓰는 단원명이 붙은 형태 */
export type MistakeWithUnit = Mistake & {
  unit: Pick<Unit, "id" | "name" | "grade">;
};

export type ScorePrediction = {
  id: string;
  user_id: string;
  exam_name: string;
  predicted: number | null;
  actual: number | null;
  /** YYYY-MM-DD */
  exam_date: string;
  created_at: string;
};
