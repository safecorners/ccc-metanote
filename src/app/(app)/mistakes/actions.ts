"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { parseMistakeForm } from "@/lib/mistake-form";
import { createClient } from "@/lib/supabase/server";

export type MistakeFormState = {
  error: string | null;
  /** 성공할 때마다 1씩 증가 — 클라이언트가 토스트·태그 초기화 트리거로 쓴다 */
  saved: number;
};

export async function createMistake(
  prev: MistakeFormState,
  formData: FormData,
): Promise<MistakeFormState> {
  const { user } = await verifySession();

  const parsed = parseMistakeForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error, saved: prev.saved };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("mistakes")
    .insert({ user_id: user.id, ...parsed.data });

  if (error) {
    return {
      error: "저장에 실패했어요. 잠시 후 다시 시도해 주세요",
      saved: prev.saved,
    };
  }

  revalidatePath("/mistakes");
  revalidatePath("/dashboard");
  return { error: null, saved: prev.saved + 1 };
}

export async function toggleMistakeResolved(id: string, resolved: boolean) {
  await verifySession();
  const supabase = await createClient();

  // 본인 행 여부는 RLS가 보장 — 남의 id면 0건 업데이트로 끝난다
  const { error } = await supabase
    .from("mistakes")
    .update({ resolved })
    .eq("id", id);

  if (error) throw new Error(`극복 상태 변경 실패: ${error.message}`);

  revalidatePath("/mistakes");
  revalidatePath("/dashboard");
}

export async function deleteMistake(id: string) {
  await verifySession();
  const supabase = await createClient();

  const { error } = await supabase.from("mistakes").delete().eq("id", id);

  if (error) throw new Error(`오답 삭제 실패: ${error.message}`);

  revalidatePath("/mistakes");
  revalidatePath("/dashboard");
}
