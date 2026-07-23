"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, type AuthState } from "../actions";

const initialState: AuthState = { error: null };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-heading-3">회원가입</h1>

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
        <span className="text-caption text-ink-muted">비밀번호 (8자 이상)</span>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-ink-muted">닉네임</span>
        <Input name="display_name" placeholder="지우" required />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-ink-muted">학년</span>
        <select
          name="grade"
          required
          defaultValue=""
          className="w-full rounded-xs border border-[#dddddd] bg-surface p-1.5 text-body-sm text-ink focus:shadow-l1 focus:outline-none"
        >
          <option value="" disabled>
            학년을 선택해 주세요
          </option>
          <option value="1">중1</option>
          <option value="2">중2</option>
          <option value="3">중3</option>
        </select>
      </label>

      {state.error && (
        <p role="alert" className="text-caption text-accent-orange-deep">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "가입 중…" : "가입하기"}
      </Button>

      <p className="text-caption text-ink-muted">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="text-primary">
          로그인
        </Link>
      </p>
    </form>
  );
}
