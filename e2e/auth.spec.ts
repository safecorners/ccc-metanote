import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(process.env.E2E_USER_A_EMAIL!);
  await page.getByLabel("비밀번호").fill(process.env.E2E_USER_A_PASSWORD!);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test("미인증 상태로 /dashboard 접근 시 /login으로 리다이렉트된다", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("로그인하면 대시보드로 진입한다", async ({ page }) => {
  await login(page);
  await expect(
    page.getByRole("heading", { name: "대시보드" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
});

test("새로고침해도 세션이 유지된다 (proxy 리프레시)", async ({ page }) => {
  await login(page);
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "대시보드" }),
  ).toBeVisible();
});

test("로그아웃하면 /login으로 이동하고 보호 라우트가 다시 잠긴다", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
