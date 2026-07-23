import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 권위 있는 세션 검증 — proxy의 낙관적 체크와 달리 Auth 서버에 직접 확인한다.
// React cache()로 한 요청 안에서는 1회만 호출된다.
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { user };
});
