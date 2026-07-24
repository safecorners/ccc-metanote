import "server-only";
import { cache } from "react";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type {
  MistakeWithUnit,
  Profile,
  ScorePrediction,
  Unit,
} from "@/lib/types";

// 데이터 접근 계층 — 라우트가 직접 supabase를 부르지 않고 항상 여기를 거친다.
// 각 함수는 verifySession()으로 세션을 먼저 확인하고, 행 격리는 RLS가 보장한다.

export const getUnits = cache(async (): Promise<Unit[]> => {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("grade")
    .order("order_no");

  if (error) throw new Error(`단원 조회 실패: ${error.message}`);
  return data;
});

export const getProfile = cache(async (): Promise<Profile> => {
  const { user } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(`프로필 조회 실패: ${error.message}`);
  return data;
});

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getMistake = cache(
  async (id: string): Promise<MistakeWithUnit | null> => {
    await verifySession();

    // uuid 형식이 아니면 조회 없이 없음 처리 (Postgres 캐스팅 에러 방지)
    if (!UUID_RE.test(id)) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mistakes")
      .select("*, unit:units(id, name, grade)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`오답 조회 실패: ${error.message}`);
    return data as unknown as MistakeWithUnit | null;
  },
);

/** 비공개 버킷의 문제 사진을 1시간짜리 signed URL로 발급 — 실패 시 null (페이지는 유지) */
export const getMistakeImageUrl = cache(
  async (path: string): Promise<string | null> => {
    await verifySession();
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from("mistake-images")
      .createSignedUrl(path, 3600);

    if (error) return null;
    return data.signedUrl;
  },
);

export const getMistakes = cache(async (): Promise<MistakeWithUnit[]> => {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mistakes")
    .select("*, unit:units(id, name, grade)")
    .order("mistake_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`오답 조회 실패: ${error.message}`);
  return data as unknown as MistakeWithUnit[];
});

export const getScorePredictions = cache(
  async (): Promise<ScorePrediction[]> => {
    await verifySession();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("score_predictions")
      .select("*")
      .order("exam_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw new Error(`점수 기록 조회 실패: ${error.message}`);
    return data;
  },
);
