import "server-only";
import { cache } from "react";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { MistakeWithUnit, Profile, Unit } from "@/lib/types";

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
