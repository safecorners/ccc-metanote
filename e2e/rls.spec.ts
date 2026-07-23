import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// P3-7 — 스키마·RLS 통합 테스트. 브라우저 없이 supabase-js로 직접 두 계정 세션을 만들어
// "A 세션에서 B 데이터가 보이지 않는다"를 DB 레벨에서 확인한다.
// 계정 자체는 auth.setup.ts가 보장한다 (없으면 가입).

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name}이 .env.local에 없습니다`);
  return value;
}

async function signIn(user: "A" | "B") {
  const client = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await client.auth.signInWithPassword({
    email: env(`E2E_USER_${user}_EMAIL`),
    password: env(`E2E_USER_${user}_PASSWORD`),
  });
  expect(error, `계정 ${user} 로그인 실패`).toBeNull();
  return { client, userId: data.user!.id };
}

let a: { client: SupabaseClient; userId: string };
let b: { client: SupabaseClient; userId: string };

test.beforeAll(async () => {
  [a, b] = await Promise.all([signIn("A"), signIn("B")]);
});

test.describe("units 시드", () => {
  test("2022 개정 중학 수학 단원이 학년별로 시드된다", async () => {
    const { data, error } = await a.client
      .from("units")
      .select("grade, order_no, name")
      .order("grade")
      .order("order_no");

    expect(error).toBeNull();
    expect(data!).toHaveLength(25);
    expect(data!.filter((u) => u.grade === 1)).toHaveLength(9);
    expect(data!.filter((u) => u.grade === 2)).toHaveLength(9);
    expect(data!.filter((u) => u.grade === 3)).toHaveLength(7);
    expect(data![0]).toMatchObject({ grade: 1, order_no: 1, name: "소인수분해" });
    expect(data!.at(-1)).toMatchObject({ grade: 3, name: "산포도와 상관관계" });

    // 학년 안에서 order_no가 1..n 연속인지
    for (const grade of [1, 2, 3]) {
      const inGrade = data!.filter((u) => u.grade === grade);
      expect(inGrade.map((u) => u.order_no)).toEqual(
        inGrade.map((_, i) => i + 1),
      );
    }
  });

  test("학생은 단원을 추가할 수 없다 (read-only)", async () => {
    const { error } = await a.client
      .from("units")
      .insert({ grade: 1, order_no: 99, name: "몰래 추가한 단원" });

    expect(error).not.toBeNull();
  });
});

test.describe("mistakes RLS 격리", () => {
  let unitId: number;
  const createdIds: string[] = [];

  test.beforeAll(async () => {
    const { data } = await a.client.from("units").select("id").limit(1).single();
    unitId = data!.id;
  });

  test.afterAll(async () => {
    if (createdIds.length) {
      await a.client.from("mistakes").delete().in("id", createdIds);
    }
  });

  test("A가 만든 오답은 A만 조회·수정·삭제할 수 있다", async () => {
    const { data: inserted, error: insertError } = await a.client
      .from("mistakes")
      .insert({
        user_id: a.userId,
        unit_id: unitId,
        error_type: "calc_error",
        problem_ref: "RLS-테스트",
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    createdIds.push(inserted!.id);

    // 기본값 확인
    expect(inserted!.resolved).toBe(false);
    expect(inserted!.mistake_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const mine = await a.client
      .from("mistakes")
      .select("id")
      .eq("id", inserted!.id);
    expect(mine.data).toHaveLength(1);

    // B에게는 존재하지 않는 행이다 — 조회/수정/삭제 모두 0건
    const theirs = await b.client
      .from("mistakes")
      .select("id")
      .eq("id", inserted!.id);
    expect(theirs.error).toBeNull();
    expect(theirs.data).toHaveLength(0);

    const theirUpdate = await b.client
      .from("mistakes")
      .update({ resolved: true })
      .eq("id", inserted!.id)
      .select();
    expect(theirUpdate.data).toHaveLength(0);

    const theirDelete = await b.client
      .from("mistakes")
      .delete()
      .eq("id", inserted!.id)
      .select();
    expect(theirDelete.data).toHaveLength(0);

    // 여전히 A에게 그대로 남아 있다
    const still = await a.client
      .from("mistakes")
      .select("resolved")
      .eq("id", inserted!.id)
      .single();
    expect(still.data!.resolved).toBe(false);
  });

  test("남의 user_id로는 기록을 만들 수 없다", async () => {
    const { error } = await a.client.from("mistakes").insert({
      user_id: b.userId,
      unit_id: unitId,
      error_type: "misread",
    });

    expect(error).not.toBeNull();
  });

  test("정의되지 않은 오류 유형은 CHECK 제약에 걸린다", async () => {
    const { error } = await a.client.from("mistakes").insert({
      user_id: a.userId,
      unit_id: unitId,
      error_type: "typo",
    });

    expect(error).not.toBeNull();
  });
});

test.describe("profiles", () => {
  test("가입 시 프로필이 생성되고 본인 것만 보인다", async () => {
    const mine = await a.client.from("profiles").select("*").eq("id", a.userId);
    expect(mine.data).toHaveLength(1);
    expect(mine.data![0].display_name).toBeTruthy();
    expect([1, 2, 3]).toContain(mine.data![0].grade);

    const theirs = await b.client
      .from("profiles")
      .select("*")
      .eq("id", a.userId);
    expect(theirs.data).toHaveLength(0);
  });
});

test.describe("score_predictions RLS 격리", () => {
  test("A의 점수 기록은 B에게 보이지 않는다", async () => {
    const { data: inserted, error } = await a.client
      .from("score_predictions")
      .insert({
        user_id: a.userId,
        exam_name: "RLS-테스트",
        predicted: 85,
        actual: 73,
      })
      .select()
      .single();

    expect(error).toBeNull();

    const theirs = await b.client
      .from("score_predictions")
      .select("id")
      .eq("id", inserted!.id);
    expect(theirs.data).toHaveLength(0);

    await a.client.from("score_predictions").delete().eq("id", inserted!.id);
  });
});
