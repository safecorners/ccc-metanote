import { expect, test, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// P7-12 — AI 보조 분류 (모바일 프로젝트 전용).
// webServer가 AI_MOCK=1로 뜨므로 Gemini를 실제로 부르지 않고 고정 제안
// (no_concept / distorted_theorem)이 돌아온다 — src/lib/ai/gemini.ts 참조.
// 주의: 로컬에서 이미 떠 있는 dev 서버를 재사용하면 AI_MOCK이 적용되지 않는다.
// 정리 접두사는 AI-% — mistakes.spec의 E2E-% 정리와 병렬 실행 시 겹치지 않게 한다.

test.use({ storageState: "e2e/.auth/user-a.json" });
test.describe.configure({ mode: "serial" });

const MOCK = {
  typeLabel: "개념 이해 부족",
  subtypeLabel: "정리·정의 왜곡",
  reason: "이등변삼각형의 성질을 거꾸로 적용한 것으로 보여요",
};

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name}이 .env.local에 없습니다`);
  return value;
}

let db: SupabaseClient;

test.beforeAll(async () => {
  db = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await db.auth.signInWithPassword({
    email: env("E2E_USER_A_EMAIL"),
    password: env("E2E_USER_A_PASSWORD"),
  });
  expect(error).toBeNull();

  await db.from("mistakes").delete().like("problem_ref", "AI-%");
});

async function fetchAiRow(ref: string) {
  const { data } = await db
    .from("mistakes")
    .select("error_type, ai_suggested_type, ai_suggested_subtype, ai_agreement")
    .eq("problem_ref", ref)
    .maybeSingle();
  return data;
}

/** 단원·태그·문제번호·메모까지 채워 AI 버튼이 활성화되는 상태를 만든다 */
async function fillRecord(page: Page, { tag, ref }: { tag: string; ref: string }) {
  await page.goto("/mistakes/new");
  await page.getByLabel("단원").click();
  await page.getByRole("option", { name: "일차부등식" }).click();
  await page.getByRole("button", { name: tag, exact: true }).click();
  await page.getByLabel("문제 번호").fill(ref);
  await page.getByLabel("한 줄 메모").fill("성질을 반대로 적용했다");
}

async function requestSuggestion(page: Page) {
  const button = page.getByRole("button", { name: "AI 제안 받기" });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByTestId("ai-suggestion-card")).toBeVisible({
    timeout: 15_000,
  });
}

async function save(page: Page) {
  await page.getByRole("button", { name: "저장하기" }).click();
  await expect(page.getByText("차트가 업데이트됐어요").first()).toBeVisible({
    timeout: 15_000,
  });
}

test("태그와 텍스트를 채워야 AI 버튼이 활성화된다", async ({ page }) => {
  await page.goto("/mistakes/new");
  const button = page.getByRole("button", { name: "AI 제안 받기" });

  await expect(button).toBeDisabled();

  await page.getByLabel("단원").click();
  await page.getByRole("option", { name: "일차부등식" }).click();
  await expect(button).toBeDisabled();

  // 태그 먼저 원칙 — 태그를 골라도 분류할 텍스트가 없으면 여전히 비활성
  await page.getByRole("button", { name: "계산 실수", exact: true }).click();
  await expect(button).toBeDisabled();

  await page.getByLabel("한 줄 메모").fill("부호 실수");
  await expect(button).toBeEnabled();
});

test("제안 카드가 유형·서브 유형·이유를 보여준다", async ({ page }) => {
  await fillRecord(page, { tag: "계산 실수", ref: "AI-0" });
  await requestSuggestion(page);

  const card = page.getByTestId("ai-suggestion-card");
  await expect(
    card.getByRole("button", { name: MOCK.typeLabel }),
  ).toBeVisible();
  await expect(card.getByText(MOCK.subtypeLabel)).toBeVisible();
  await expect(card.getByText(MOCK.reason)).toBeVisible();
});

test("제안을 수락해 저장하면 ai_agreement=true", async ({ page }) => {
  await fillRecord(page, { tag: "계산 실수", ref: "AI-1" });
  await requestSuggestion(page);

  // 제안 태그를 탭하면 선택이 바뀐다
  await page
    .getByTestId("ai-suggestion-card")
    .getByRole("button", { name: MOCK.typeLabel })
    .click();
  await expect(page.getByText("내가 고른 태그와 같아요")).toBeVisible();

  await save(page);

  await expect.poll(() => fetchAiRow("AI-1")).toEqual({
    error_type: "no_concept",
    ai_suggested_type: "no_concept",
    ai_suggested_subtype: "distorted_theorem",
    ai_agreement: true,
  });
});

test("제안을 받고도 내 태그를 유지하면 ai_agreement=false — 제안은 보존", async ({
  page,
}) => {
  await fillRecord(page, { tag: "계산 실수", ref: "AI-2" });
  await requestSuggestion(page);

  await save(page);

  await expect.poll(() => fetchAiRow("AI-2")).toEqual({
    error_type: "calc_error",
    ai_suggested_type: "no_concept",
    ai_suggested_subtype: "distorted_theorem",
    ai_agreement: false,
  });
});

test("AI를 쓰지 않고 저장하면 세 컬럼 모두 null", async ({ page }) => {
  await fillRecord(page, { tag: "부주의", ref: "AI-3" });

  await save(page);

  await expect.poll(() => fetchAiRow("AI-3")).toEqual({
    error_type: "careless",
    ai_suggested_type: null,
    ai_suggested_subtype: null,
    ai_agreement: null,
  });
});
