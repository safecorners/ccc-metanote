"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않아요" };
  }

  redirect("/dashboard");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const grade = Number(formData.get("grade"));

  if (!email) return { error: "이메일을 입력해 주세요" };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 해요" };
  if (!displayName) return { error: "닉네임을 입력해 주세요" };
  if (![1, 2, 3].includes(grade)) return { error: "학년을 선택해 주세요" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // profiles 테이블은 Phase 3 — 그때까지 user_metadata에 보관 후 백필
      data: { display_name: displayName, grade },
    },
  });

  if (error) {
    return { error: "가입에 실패했어요. 이메일을 확인하거나 잠시 후 다시 시도해 주세요" };
  }
  if (!data.session) {
    // Supabase 대시보드에서 Confirm email이 켜져 있으면 세션 없이 가입된다
    return { error: "이메일 확인이 필요한 상태예요. 관리자에게 문의해 주세요" };
  }

  redirect("/dashboard");
}

export async function signOut() {
  await verifySession();
  const supabase = await createClient();
  // scope: global이 기본값 — 전 기기 세션을 폐기하므로 local로 제한
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
