import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Playwright는 Next의 .env 로딩을 거치지 않으므로 직접 읽는다 (E2E_USER_* 계정)
dotenv.config({ path: ".env.local" });

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // E2E는 Gemini를 부르지 않는다 — AI_MOCK=1이면 고정 제안이 반환된다 (src/lib/ai/gemini.ts).
    // 주의: 이미 떠 있는 dev 서버를 재사용하면(reuseExistingServer) 이 env가 적용되지 않는다 —
    // ai-suggestion.spec을 로컬에서 돌릴 땐 서버를 내리거나 AI_MOCK=1로 띄울 것.
    env: { ...(process.env as Record<string, string>), AI_MOCK: "1" },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    // 스키마·RLS는 브라우저와 무관하므로 뷰포트별로 중복 실행하지 않는다
    {
      name: "db",
      testMatch: /rls\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "desktop",
      // mistakes·dashboard·ai-suggestion은 계정 A 데이터를 변경하는 흐름 — 프로젝트 간 경합을 피해 모바일에서만 돈다
      testIgnore: [
        /rls\.spec\.ts/,
        /mistakes\.spec\.ts/,
        /dashboard\.spec\.ts/,
        /ai-suggestion\.spec\.ts/,
      ],
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "mobile",
      testIgnore: /rls\.spec\.ts/,
      use: { ...devices["iPhone 14"] },
      dependencies: ["setup"],
    },
  ],
});
