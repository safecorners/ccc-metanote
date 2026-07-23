"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, type AuthState } from "../actions";

const initialState: AuthState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-heading-3">로그인</h1>

      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-ink-muted">이메일</span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-ink-muted">비밀번호</span>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      {state.error && (
        <p role="alert" className="text-caption text-accent-orange-deep">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "로그인 중…" : "로그인"}
      </Button>

      <p className="text-caption text-ink-muted">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="text-primary">
          회원가입
        </Link>
      </p>
    </form>
  );
}
