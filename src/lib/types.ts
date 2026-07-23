import type { ErrorTypeId } from "./taxonomy";

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
