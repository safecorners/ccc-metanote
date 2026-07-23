import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// P5-9 — 시나리오 2(패턴 발견)·3(착각점수). 모바일 프로젝트 전용.
// mistakes.spec과 같은 계정을 쓰므로 접두사를 DASH-로 분리해 서로의 정리(cleanup)에
// 휩쓸리지 않게 한다. 차트 단언은 병렬로 늘어나는 다른 기록에 영향받지 않도록
// "존재" 기준으로만 검증한다.

test.use({ storageState: "e2e/.auth/user-a.json" });
test.describe.configure({ mode: "serial" });

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name}이 .env.local에 없습니다`);
  return value;
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

let client: SupabaseClient;
let userId: string;

test.beforeAll(async () => {
  client = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await client.auth.signInWithPassword({
    email: env("E2E_USER_A_EMAIL"),
    password: env("E2E_USER_A_PASSWORD"),
  });
  expect(error).toBeNull();
  userId = data.user!.id;

  // 이전 실행 잔여 데이터 정리 (idempotent)
  await client.from("mistakes").delete().like("problem_ref", "DASH-%");
  await client.from("score_predictions").delete().like("exam_name", "DASH-%");

  // 차트가 의미를 갖는 최소량(6건+)을 유형·단원·주차를 섞어 시드
  const { data: units } = await client
    .from("units")
    .select("id, name")
    .in("name", ["일차부등식", "일차함수와 그래프", "연립일차방정식"]);
  const unitId = (name: string) => units!.find((u) => u.name === name)!.id;

  const seed = [
    { unit: "일차부등식", error_type: "calc_error", date: daysAgo(0) },
    { unit: "일차부등식", error_type: "calc_error", date: daysAgo(1) },
    { unit: "일차부등식", error_type: "careless", date: daysAgo(2) },
    { unit: "일차함수와 그래프", error_type: "misread", date: daysAgo(7) },
    { unit: "일차함수와 그래프", error_type: "misread", date: daysAgo(8) },
    { unit: "연립일차방정식", error_type: "no_concept", date: daysAgo(9) },
    { unit: "연립일차방정식", error_type: "time_pressure", date: daysAgo(13) },
  ];
  const { error: seedError } = await client.from("mistakes").insert(
    seed.map((s, i) => ({
      user_id: userId,
      unit_id: unitId(s.unit),
      error_type: s.error_type,
      mistake_date: s.date,
      problem_ref: `DASH-${i + 1}`,
    })),
  );
  expect(seedError).toBeNull();
});

test("오답이 쌓이면 차트 4종이 렌더된다 (시나리오 2)", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", { name: "오류 유형 분포" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "오류 유형별 오답 분포 레이더 차트" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "단원별 취약 지점" }),
  ).toBeVisible();
  for (const unit of ["일차부등식", "일차함수와 그래프", "연립일차방정식"]) {
    await expect(page.getByText(unit).first()).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: "주별 추이" })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "주 단위 오류 유형별 추이 차트" }),
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: "착각점수" })).toBeVisible();
});

test("기록 직후 대시보드에 즉시 반영된다", async ({ page }) => {
  await page.goto("/mistakes/new");
  await page.getByRole("button", { name: "중3", exact: true }).click();
  await page.getByLabel("단원").click();
  await page.getByRole("option", { name: "삼각비" }).click();
  await page.getByRole("button", { name: "시간 부족" }).click();
  await page.getByLabel("문제 번호").fill("DASH-live");
  await page.getByRole("button", { name: "저장하기" }).click();
  await expect(
    page.getByText("차트가 업데이트됐어요").first(),
  ).toBeVisible({ timeout: 15_000 });

  await page.goto("/dashboard");
  await expect(page.getByText("삼각비").first()).toBeVisible();
});

test("예상·실제 점수 입력으로 착각점수가 계산된다 (시나리오 3)", async ({
  page,
}) => {
  await page.goto("/dashboard");

  // 시험 전: 예상 점수만 기록
  await page.getByLabel("시험 이름").fill("DASH-모의");
  await page.getByLabel("예상 점수").fill("85");
  await page.getByRole("button", { name: "점수 기록하기" }).click();

  const pendingRow = page.locator("li", { hasText: "DASH-모의" });
  await expect(pendingRow.getByText("예상 85점")).toBeVisible({
    timeout: 15_000,
  });

  // 시험 후: 실제 점수 입력 → 착각점수와 해석 코멘트
  await pendingRow.getByLabel("시험 본 후 실제 점수").fill("73");
  await pendingRow.getByRole("button", { name: "실제 점수 저장" }).click();

  await expect(page.getByText("-12점")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("예상보다 12점 낮았어요").first()).toBeVisible();
});

test("오답 3건 미만 계정은 빈 상태 안내를 본다", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: "e2e/.auth/user-b.json",
    baseURL: "http://localhost:3000",
  });
  const page = await context.newPage();

  await page.goto("/dashboard");
  await expect(
    page.getByText("오답을 3개만 기록하면 나의 실수 패턴이 보여요"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "오답 기록하기" }),
  ).toBeVisible();

  await context.close();
});

test("모바일에서 차트 카드가 세로로 쌓이고 가로 오버플로가 없다", async ({
  page,
}) => {
  await page.goto("/dashboard");

  const radarHeading = page.getByRole("heading", { name: "오류 유형 분포" });
  const heatmapHeading = page.getByRole("heading", {
    name: "단원별 취약 지점",
  });
  await expect(radarHeading).toBeVisible();

  const radarBox = (await radarHeading.boundingBox())!;
  const heatmapBox = (await heatmapHeading.boundingBox())!;
  expect(heatmapBox.y).toBeGreaterThan(radarBox.y);
  expect(Math.abs(heatmapBox.x - radarBox.x)).toBeLessThan(2);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
