import { expect, test } from "@playwright/test";

test("루트가 렌더되고 히어로 헤드라인이 보인다", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /왜 틀렸는지/ }),
  ).toBeVisible();
});

test("핵심 섹션 3개와 실제 컴포넌트 프리뷰가 노출된다", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /오답에 이유를/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /실수에도 패턴이/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /아는 것과 안다고/ }),
  ).toBeVisible();
  // 프리뷰 래퍼가 inert라 role 조회 불가 — 텍스트로 단언
  await expect(page.getByText("계산 실수")).toBeVisible();
});

test("네비 CTA가 /login으로 이동한다", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("banner")
    .getByRole("link", { name: "무료로 시작하기" })
    .click();
  await expect(page).toHaveURL(/\/login/);
});

test("히어로 primary CTA가 /login으로 이동한다", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("region", { name: "히어로" })
    .getByRole("link", { name: "무료로 시작하기" })
    .click();
  await expect(page).toHaveURL(/\/login/);
});

test("secondary CTA가 기능 섹션으로 앵커 이동한다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "기능 둘러보기" }).click();
  await expect(page).toHaveURL(/#tagging/);
  await expect(
    page.getByRole("heading", { name: /오답에 이유를/ }),
  ).toBeInViewport();
});

test("가로 스크롤 오버플로가 없다", async ({ page }) => {
  await page.goto("/");
  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(noOverflow).toBe(true);
});
