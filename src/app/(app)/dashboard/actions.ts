"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type ScoreFormState = {
  error: string | null;
  /** 성공할 때마다 1씩 증가 — 클라이언트 폼 리셋 트리거 */
  saved: number;
};

function parseScore(
  value: FormDataEntryValue | null,
): number | null | "invalid" {
  const raw = String(value ?? "").trim();
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 100) return "invalid";
  return n;
}

export async function createScorePrediction(
  prev: ScoreFormState,
  formData: FormData,
): Promise<ScoreFormState> {
  const { user } = await verifySession();

  const examName = String(formData.get("exam_name") ?? "").trim();
  const examDate = String(formData.get("exam_date") ?? "").trim();
  const predicted = parseScore(formData.get("predicted"));
  const actual = parseScore(formData.get("actual"));

  if (!examName || examName.length > 50) {
    return { error: "시험 이름을 입력해 주세요", saved: prev.saved };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) {
    return { error: "시험 날짜를 선택해 주세요", saved: prev.saved };
  }
  if (predicted === null || predicted === "invalid") {
    return { error: "예상 점수를 0~100 사이로 입력해 주세요", saved: prev.saved };
  }
  if (actual === "invalid") {
    return { error: "실제 점수는 0~100 사이로 입력해 주세요", saved: prev.saved };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("score_predictions").insert({
    user_id: user.id,
    exam_name: examName,
    exam_date: examDate,
    predicted,
    actual,
  });

  if (error) {
    return {
      error: "저장에 실패했어요. 잠시 후 다시 시도해 주세요",
      saved: prev.saved,
    };
  }

  revalidatePath("/dashboard");
  return { error: null, saved: prev.saved + 1 };
}

export async function recordActualScore(
  id: string,
  prev: ScoreFormState,
  formData: FormData,
): Promise<ScoreFormState> {
  await verifySession();

  const actual = parseScore(formData.get("actual"));
  if (actual === null || actual === "invalid") {
    return { error: "실제 점수를 0~100 사이로 입력해 주세요", saved: prev.saved };
  }

  const supabase = await createClient();
  // 본인 행 여부는 RLS가 보장한다
  const { error } = await supabase
    .from("score_predictions")
    .update({ actual })
    .eq("id", id);

  if (error) {
    return {
      error: "저장에 실패했어요. 잠시 후 다시 시도해 주세요",
      saved: prev.saved,
    };
  }

  revalidatePath("/dashboard");
  return { error: null, saved: prev.saved + 1 };
}
