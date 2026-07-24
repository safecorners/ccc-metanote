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

/** 사진 경로는 클라이언트가 업로드 후 넘긴다 — 본인 폴더({uid}/) 밖이면 거부 */
function isForeignImagePath(path: string | null, userId: string) {
  return path !== null && !path.startsWith(`${userId}/`);
}

export async function createMistake(
  prev: MistakeFormState,
  formData: FormData,
): Promise<MistakeFormState> {
  const { user } = await verifySession();

  const parsed = parseMistakeForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error, saved: prev.saved };
  }
  if (isForeignImagePath(parsed.data.image_path, user.id)) {
    return { error: "사진 정보가 올바르지 않아요", saved: prev.saved };
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

export async function updateMistake(
  id: string,
  prev: MistakeFormState,
  formData: FormData,
): Promise<MistakeFormState> {
  const { user } = await verifySession();

  const parsed = parseMistakeForm(formData);
  if (!parsed.ok) {
    return { error: parsed.error, saved: prev.saved };
  }

  const { image_path: uploadedPath, ...rest } = parsed.data;
  if (isForeignImagePath(uploadedPath, user.id)) {
    return { error: "사진 정보가 올바르지 않아요", saved: prev.saved };
  }

  const supabase = await createClient();

  // 본인 행 여부는 RLS가 보장 — 남의 id면 0행 조회로 끝난다
  const { data: existing } = await supabase
    .from("mistakes")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return { error: "기록을 찾을 수 없어요", saved: prev.saved };
  }

  // 새 업로드 > 삭제 요청 > 기존 유지 순
  const removeRequested = formData.get("image_remove") === "1";
  const image_path =
    uploadedPath ?? (removeRequested ? null : existing.image_path);

  const { error } = await supabase
    .from("mistakes")
    .update({ ...rest, image_path })
    .eq("id", id);

  if (error) {
    return {
      error: "저장에 실패했어요. 잠시 후 다시 시도해 주세요",
      saved: prev.saved,
    };
  }

  // 교체·삭제로 더는 참조되지 않는 옛 사진 정리 (베스트에포트)
  if (existing.image_path && existing.image_path !== image_path) {
    await supabase.storage.from("mistake-images").remove([existing.image_path]);
  }

  revalidatePath("/mistakes");
  revalidatePath(`/mistakes/${id}`);
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

  const { data: deleted, error } = await supabase
    .from("mistakes")
    .delete()
    .eq("id", id)
    .select("image_path")
    .maybeSingle();

  if (error) throw new Error(`오답 삭제 실패: ${error.message}`);

  // 딸린 사진 정리 (베스트에포트 — 실패해도 비공개 버킷이라 노출 없음)
  if (deleted?.image_path) {
    await supabase.storage.from("mistake-images").remove([deleted.image_path]);
  }

  revalidatePath("/mistakes");
  revalidatePath("/dashboard");
}
