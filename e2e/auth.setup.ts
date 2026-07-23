import { expect, test as setup, type Page } from "@playwright/test";

type Credentials = {
  email: string;
  password: string;
  displayName: string;
  grade: string;
};

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name}이 .env.local에 없습니다`);
  }
  return value;
}

// 로그인 시도 → 실패하면 가입 (원격 프로젝트 공용이라 계정은 최초 1회만 생성됨)
async function ensureSession(
  page: Page,
  { email, password, displayName, grade }: Credentials,
  statePath: string,
) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();

  const loginError = page.getByRole("alert");
  await expect(
    page
      .getByRole("heading", { name: "대시보드" })
      .or(loginError)
      .first(),
  ).toBeVisible({ timeout: 15_000 });

  if (await loginError.isVisible().catch(() => false)) {
    await page.goto("/signup");
    await page.getByLabel("이메일").fill(email);
    await page.getByLabel("비밀번호 (8자 이상)").fill(password);
    await page.getByLabel("닉네임").fill(displayName);
    await page.getByLabel("학년").selectOption(grade);
    await page.getByRole("button", { name: "가입하기" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  } else {
    await expect(page).toHaveURL(/\/dashboard/);
  }

  await page.context().storageState({ path: statePath });
}

setup("계정 A 세션 준비", async ({ page }) => {
  await ensureSession(
    page,
    {
      email: env("E2E_USER_A_EMAIL"),
      password: env("E2E_USER_A_PASSWORD"),
      displayName: "테스트A",
      grade: "2",
    },
    "e2e/.auth/user-a.json",
  );
});

setup("계정 B 세션 준비", async ({ page }) => {
  await ensureSession(
    page,
    {
      email: env("E2E_USER_B_EMAIL"),
      password: env("E2E_USER_B_PASSWORD"),
      displayName: "테스트B",
      grade: "3",
    },
    "e2e/.auth/user-b.json",
  );
});
