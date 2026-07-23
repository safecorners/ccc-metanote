import { expect, test } from "@playwright/test";

// P6-6 — 오답 0건 계정(B)의 온보딩. 읽기 전용이라 데스크톱·모바일 양쪽에서 돈다.
// 계정 B는 어떤 spec도 오답을 만들지 않으므로 항상 0건이다.

test.use({ storageState: "e2e/.auth/user-b.json" });

test("오답 0건이면 대시보드에 3단계 안내 카드가 보인다", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(
    page.getByText("오답을 3개만 기록하면 나의 실수 패턴이 보여요"),
  ).toBeVisible();
  for (const step of ["기록하기", "태그 고르기", "패턴 보기"]) {
    await expect(page.getByText(step, { exact: true })).toBeVisible();
  }
});

test("안내 카드 CTA가 오답 입력 폼으로 이어진다", async ({ page }) => {
  await page.goto("/dashboard");

  await page.getByRole("link", { name: "오답 기록하기" }).click();
  await expect(page).toHaveURL(/\/mistakes\/new/);
  await expect(
    page.getByRole("heading", { name: "오답 기록" }),
  ).toBeVisible();
});

test("모바일 하단 고정 CTA — 대시보드에선 보이고 입력 폼에선 숨는다", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "모바일 전용 UI");

  await page.goto("/dashboard");
  const bottomCta = page.getByTestId("bottom-cta");
  await expect(bottomCta).toBeVisible();

  await bottomCta.getByRole("link", { name: "오답 기록" }).click();
  await expect(page).toHaveURL(/\/mistakes\/new/);
  await expect(page.getByTestId("bottom-cta")).toHaveCount(0);
});
