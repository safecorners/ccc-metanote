import { expect, test, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// P4-5 — 시나리오 1: 시험 직후 30초 오답 기록 (모바일 프로젝트 전용).
// 같은 계정을 쓰는 프로젝트 간 데이터 경합을 피하려고 playwright.config에서
// desktop은 이 spec을 제외한다. 파일 안에서는 흐름 순서를 보장해야 하므로 serial.

test.use({ storageState: "e2e/.auth/user-a.json" });
test.describe.configure({ mode: "serial" });

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name}이 .env.local에 없습니다`);
  return value;
}

// 이전 실행이 남긴 E2E- 기록 제거 (idempotent) — 딸린 문제 사진도 함께 정리
test.beforeAll(async () => {
  const client = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await client.auth.signInWithPassword({
    email: env("E2E_USER_A_EMAIL"),
    password: env("E2E_USER_A_PASSWORD"),
  });
  expect(error).toBeNull();

  const { data: rows } = await client
    .from("mistakes")
    .select("image_path")
    .like("problem_ref", "E2E-%");
  const imagePaths = (rows ?? [])
    .map((row) => row.image_path)
    .filter((path): path is string => Boolean(path));
  if (imagePaths.length > 0) {
    await client.storage.from("mistake-images").remove(imagePaths);
  }

  await client.from("mistakes").delete().like("problem_ref", "E2E-%");
});

async function recordMistake(
  page: Page,
  {
    unit,
    tag,
    problemRef,
    grade,
  }: { unit: string; tag: string; problemRef: string; grade?: string },
) {
  if (grade) {
    await page.getByRole("button", { name: grade, exact: true }).click();
  }
  await page.getByLabel("단원").click();
  await page.getByRole("option", { name: unit }).click();
  await page.getByRole("button", { name: tag }).click();
  await page.getByLabel("문제 번호").fill(problemRef);
  await page.getByRole("button", { name: "저장하기" }).click();
  await expect(
    page.getByText("차트가 업데이트됐어요").first(),
  ).toBeVisible({ timeout: 15_000 });
}

test("오답 3건을 연달아 기록한다 — 저장마다 토스트가 뜬다", async ({ page }) => {
  await page.goto("/mistakes/new");

  // 계정 A는 2학년 — 학년 필터 기본값이 중2다
  await expect(
    page.getByRole("button", { name: "중2", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  await recordMistake(page, {
    unit: "일차부등식",
    tag: "계산 실수",
    problemRef: "E2E-1",
  });
  await recordMistake(page, {
    unit: "일차함수와 그래프",
    tag: "문제 해석 오류",
    problemRef: "E2E-2",
  });
  // 학년 필터를 바꿔 다른 학년 단원도 기록
  await recordMistake(page, {
    unit: "일차방정식",
    tag: "개념 이해 부족",
    problemRef: "E2E-3",
    grade: "중1",
  });
});

test("목록에 3건이 모두 보인다", async ({ page }) => {
  await page.goto("/mistakes");

  for (const ref of ["E2E-1", "E2E-2", "E2E-3"]) {
    await expect(page.getByText(ref).first()).toBeVisible();
  }
  await expect(page.getByText("계산 실수").first()).toBeVisible();
});

test("극복 완료를 토글한다", async ({ page }) => {
  await page.goto("/mistakes");

  const card = page.locator("li", { hasText: "E2E-1" });
  await card.getByRole("button", { name: "극복하기" }).click();
  await expect(
    card.getByRole("button", { name: "극복 완료" }),
  ).toBeVisible({ timeout: 15_000 });
});

test("삭제 확인 다이얼로그를 거쳐 기록을 지운다", async ({ page }) => {
  await page.goto("/mistakes");

  await page
    .locator("li", { hasText: "E2E-3" })
    .getByRole("button", { name: "삭제" })
    .click();
  await expect(page.getByText("오답 기록을 삭제할까요?")).toBeVisible();
  await page.getByRole("button", { name: "삭제하기" }).click();

  await expect(page.getByText("E2E-3")).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByText("E2E-1").first()).toBeVisible();
});

test("계정 B에게는 A의 기록이 보이지 않는다", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: "e2e/.auth/user-b.json",
    baseURL: "http://localhost:3000",
  });
  const page = await context.newPage();

  await page.goto("/mistakes");
  await expect(page.getByRole("heading", { name: "오답 목록" })).toBeVisible();
  await expect(page.getByText("E2E-")).toHaveCount(0);

  await context.close();
});

// ── 문제/문항 기록 — 사진 + 본문 + 답, 상세 페이지 ──

// serial 흐름 안에서 "상세로 이동" 테스트가 기록해 두는 상세 페이지 URL
let detailUrl: string;

test("사진과 상세 내용을 포함해 기록한다", async ({ page }) => {
  await page.goto("/mistakes/new");

  await page.getByLabel("단원").click();
  await page.getByRole("option", { name: "일차부등식" }).click();
  await page.getByRole("button", { name: "계산 실수" }).click();
  await page.getByLabel("문제 번호").fill("E2E-4");

  await page
    .getByLabel("문제 사진 선택")
    .setInputFiles("e2e/fixtures/problem.jpg");
  await expect(page.getByAltText("문제 사진 미리보기")).toBeVisible();

  await page.getByRole("button", { name: "자세히 기록" }).click();
  await page.getByLabel("문제 본문").fill("E2E 문제 본문: 2x + 3 = 7");
  await page.getByLabel("내가 쓴 답").fill("3");
  await page.getByLabel("정답").fill("2");

  await page.getByRole("button", { name: "저장하기" }).click();
  await expect(
    page.getByText("차트가 업데이트됐어요").first(),
  ).toBeVisible({ timeout: 15_000 });
});

test("목록에서 상세로 이동해 전체 내용을 본다", async ({ page }) => {
  await page.goto("/mistakes");

  await page
    .locator("li", { hasText: "E2E-4" })
    .getByRole("link")
    .first()
    .click();

  await expect(
    page.getByRole("heading", { name: "일차부등식" }),
  ).toBeVisible();
  await expect(page.getByLabel("문제 본문")).toHaveValue(
    "E2E 문제 본문: 2x + 3 = 7",
  );
  await expect(page.getByLabel("내가 쓴 답")).toHaveValue("3");
  await expect(page.getByLabel("정답")).toHaveValue("2");

  // 비공개 버킷의 signed URL이 실제 이미지를 서빙하는지 확인
  const image = page.getByAltText("문제 사진");
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);

  detailUrl = page.url();
});

test("계정 B는 A의 상세 페이지에 접근할 수 없다", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: "e2e/.auth/user-b.json",
    baseURL: "http://localhost:3000",
  });
  const page = await context.newPage();

  // RLS로 0행 조회 → 404. 셸이 스트리밍(loading.tsx)이라 HTTP 상태 대신 화면으로 확인한다
  await page.goto(detailUrl);
  await expect(page.getByText("This page could not be found")).toBeVisible();
  await expect(page.getByText("E2E 문제 본문")).toHaveCount(0);

  await context.close();
});

test("상세에서 수정한다 — 답 변경 + 사진 삭제", async ({ page }) => {
  await page.goto(detailUrl);

  await page.getByLabel("내가 쓴 답").fill("5");
  await page.getByRole("button", { name: "사진 삭제" }).click();
  await page.getByRole("button", { name: "수정 저장" }).click();
  await expect(
    page.getByText("수정 내용을 저장했어요").first(),
  ).toBeVisible({ timeout: 15_000 });

  // 새로고침해도 수정 내용이 유지되고 사진은 사라져 있어야 한다
  await page.reload();
  await expect(page.getByLabel("내가 쓴 답")).toHaveValue("5");
  await expect(page.getByAltText("문제 사진")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "사진 추가" })).toBeVisible();
});
