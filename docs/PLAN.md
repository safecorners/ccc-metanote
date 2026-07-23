# MetaNote 단계별 구현 계획

> 근거 리서치: [RESEARCH.md](./RESEARCH.md) · 실행 체크리스트: [TASK.md](./TASK.md)

## Context

docs/RESEARCH.md의 결론에 따라, 중학생 대상 오답 분석 웹앱을 "검증된 오답 분류 체계(Newman 단순화) + 학생 자기 태깅 + 메타인지 시각화" MVP로 구현한다. 자체 ML 모델은 만들지 않으며, LLM 보조 분류는 후속 단계 개요로만 포함한다. 저장/인증은 **Supabase**, 차트는 **Recharts**, 디자인은 **DESIGN.md(MetaNote 디자인 언어)** 를 따른다. 목표는 5–10명 소규모 코호트 테스트가 가능한 상태.

## 확정된 오답 분류 체계 (taxonomy) — 2층 구조

**1층(지금 구현): Newman 단순화 5종** — 학생 자기 태깅용. DESIGN.md 색 매핑 그대로 사용:

| id | 라벨 | Newman 대응 | 색 |
|---|---|---|---|
| `misread` | 문제 해석 오류 | reading/comprehension | Sky #62aef0 |
| `no_concept` | 개념 이해 부족 | transformation/정리·정의 왜곡 | Orange #dd5b00 |
| `calc_error` | 계산 실수 | process skills/기술적 오류 | Pink #ff64c8 |
| `careless` | 부주의 (아는데 실수) | carelessness | Teal #2a9d99 |
| `time_pressure` | 시간 부족 | 비인지적 요인 | Purple #d6b6f6 |

Green(#1aae39)은 극복 완료 전용, Brown은 일러스트 전용 — 오류 유형 아님.

**2층(Phase 7 예약): Movshovitz-Hadar 6유형** — 학생이 풀이/메모를 입력하면 LLM이 MZI 기준으로 서브 분류를 제안하는 정밀화 층 ("개념 이해 부족, 그중에서도 정리·정의 왜곡으로 보여요"). 지금은 스키마·UI에 반영하지 않는다.

현재 리포는 create-next-app 기본 스캐폴드(Next.js **16.2.11**, React 19.2, React Compiler on, Tailwind v4, `src/app/`)이며 기능 코드는 없다.

## 핵심 유저 시나리오 3가지 (모든 설계·E2E의 기준)

**시나리오 1 — 시험 직후 30초 오답 기록** (Phase 4 / `e2e/mistakes.spec.ts`)
수학 시험을 마친 중학생 지우가 쉬는 시간에 폰으로 로그인 → "오답 기록" CTA 탭 → 단원(예: 일차방정식) 선택 → 오류 원인 태그 1개("계산 실수") 탭 → 문제번호만 적고 저장. 전 과정 30초 이내, 필수 입력은 단원+원인 태그 2가지뿐. 저장 직후 "차트가 업데이트됐어요" 토스트로 대시보드 유도.
*성공 기준: 모바일 뷰포트에서 탭 4~5회 이내로 기록 완료.*

**시나리오 2 — 내 실수 패턴 발견 (메타인지 순간)** (Phase 5 / `e2e/dashboard.spec.ts`)
오답이 6건 이상 쌓인 지우가 대시보드를 열면 레이더 차트가 "계산 실수가 아니라 '문제를 잘못 읽음'이 가장 많다"는 예상 밖 분포를 보여준다. 히트맵에서 특정 단원(함수)에 오답이 몰려 있음을 확인하고, 다시 풀어 맞힌 문제를 목록에서 "극복 완료" 토글. 스트릭·극복 수가 올라간다.
*성공 기준: 기록 → 차트 반영이 즉시(revalidate), 자기 예상과 다른 패턴이 한 화면에서 읽힘.*

**시나리오 3 — 착각점수로 자기 평가 교정** (Phase 5 / `e2e/dashboard.spec.ts`)
시험 전 지우가 "이번 수학 몇 점 나올 것 같아?"에 85점을 입력. 시험 후 실제 점수 73점을 입력하면 착각점수 −12점과 함께 "예상보다 12점 낮았어요 — 아는 것과 안다고 느끼는 것의 차이예요" 코멘트가 표시된다. 반복 기록 시 예상-실제 격차가 줄어드는 추이를 확인.
*성공 기준: 예상/실제 입력 2회로 착각점수 시각화 렌더, 격차 방향(과신/과소평가)이 문구로 해석됨.*

## Next 16 컨벤션 (구현 전 필독: `node_modules/next/dist/docs/`)

- **middleware → `src/proxy.ts`** 로 개명됨. Supabase 공식 가이드는 middleware.ts 기준이므로 파일명/export만 옮겨 적용하고 세션 리프레시를 반드시 검증.
- **fetch는 기본 캐시 안 됨.** 데이터가 전부 학생별(쿠키 스코프)이므로 `use cache`는 쓰지 않는 게 기본 — fresh 조회 + `<Suspense>` 스트리밍. 전역 정적 데이터(단원·오류유형)는 TS 상수로 두어 캐싱 이슈 자체를 제거. `cacheComponents`는 켜지 않음.
- 인증 검증은 proxy가 아닌 DAL(`verifySession()` + React `cache()`)에서 수행 (Next 공식 auth 가이드 패턴). proxy는 낙관적 리다이렉트/세션 갱신만.
- 뮤테이션은 Server Actions + `revalidatePath` 중심.

## 테스트 전략 (TDD + Playwright)

- **단위/컴포넌트 테스트: Vitest** (+ React Testing Library) — 로직(집계·스트릭 계산·taxonomy 매핑·폼 검증)은 **테스트 먼저 작성 → 구현** 순서(TDD). 테스트는 대상 옆 `*.test.ts(x)`.
- **E2E: Playwright** — 각 Phase의 핵심 사용자 플로우를 `e2e/` 아래 spec으로 작성. 데스크톱 + 모바일 뷰포트(iPhone 프로젝트) 2개 프로젝트로 실행.
- **테스트용 Supabase**: 로컬 `supabase start`(Docker) 또는 별도 테스트 프로젝트. Playwright는 테스트 계정 2개(RLS 격리 검증용)로 `storageState` 기반 인증 재사용(`e2e/auth.setup.ts`).
- 셋업은 Phase 1에서 완료: `vitest.config.ts`, `playwright.config.ts`(webServer로 dev 서버 자동 기동), `npm run test` / `npm run test:e2e` 스크립트.
- 각 Phase의 "검증" = 해당 spec 통과 (`npm run test && npm run test:e2e`) + 수동 확인 최소화.

## 사용 라이브러리

| 라이브러리 | 용도 | 비고 |
|---|---|---|
| `zod` | Server Action 입력 검증(P4-1), error_type enum 검증 | taxonomy 상수에서 enum 파생 |
| `lucide-react` | 아이콘 (네비, 극복 완료 체크 등) | shadcn 기본 아이콘 |
| `shadcn/ui` | **선별 사용** — Dialog(삭제 확인), Select(단원 선택), Sonner(토스트), Label 등 동작 복잡한 프리미티브만 | DESIGN.md 토큰으로 재스타일링. Button/Card/Input/ErrorTag는 DESIGN.md 명세대로 직접 구현 |
| `recharts` | 차트 4종 (레이더/히트맵 보조/시계열/착각점수) | 히트맵은 커스텀 CSS grid |
| `@supabase/supabase-js` + `@supabase/ssr` | DB·인증 (쿠키 기반 세션) | |
| `pretendard` | 폰트 (`next/font/local`) | |
| dev: `vitest` + React Testing Library, `@playwright/test` | 테스트 | |

**추가하지 않는 것**: react-hook-form(Server Actions + `useActionState`로 충분), 날짜 라이브러리(주별 집계는 표준 Date), 상태 관리 라이브러리(서버 중심 데이터 흐름).

---

## Phase 1 — 기반: 디자인 시스템 + Supabase + 인증

**목표**: DESIGN.md 토큰이 적용된 한국어 앱 셸에서 이메일 로그인이 동작.

- `src/app/globals.css`: Tailwind v4 `@theme`에 DESIGN.md 토큰(canvas/ink/primary #0075de/accent 팔레트/radius/타이포 스케일) 정의. Geist·기본 테마 제거.
- `src/lib/fonts.ts`: Pretendard(`next/font/local`, pretendard npm 패키지). `src/app/layout.tsx`: `lang="ko"`, MetaNote 메타데이터.
- `src/components/ui/`: `Button`, `Card`, `Input`, `ErrorTag` — DESIGN.md 컴포넌트 명세 그대로.
- Supabase: `.env.local` + `.env.example`, `npm i @supabase/supabase-js @supabase/ssr`, `src/lib/supabase/client.ts`(browser) / `server.ts`(cookies) / `proxy.ts`(세션 갱신 헬퍼), `src/proxy.ts`(리프레시 + 미인증 시 `/login` 리다이렉트, matcher로 정적 자산 제외).
- 인증: 이메일+비밀번호, **회원가입 UI 포함**. `src/app/login/page.tsx` + `src/app/signup/page.tsx`(이메일/비번/닉네임/학년 → profiles 생성) + `actions.ts`(signUp/signIn/signOut), `src/lib/dal.ts`의 `verifySession()`, 인증 라우트 그룹 `src/app/(app)/layout.tsx`(네비+로그아웃). Supabase 이메일 확인(confirm email)은 코호트 마찰을 줄이기 위해 끔.
- **테스트 셋업**: Vitest + RTL, Playwright(+ `e2e/auth.setup.ts` storageState, 모바일/데스크톱 프로젝트), 테스트용 Supabase(로컬 or 별도 프로젝트) + 테스트 계정 2개.

**검증**: `e2e/auth.spec.ts` — 미인증 시 `/dashboard` → `/login` 리다이렉트, 로그인 → 대시보드 진입, 새로고침 후 세션 유지, 로그아웃. UI 컴포넌트(Button/ErrorTag) Vitest 스냅샷·동작 테스트.

## Phase 2 — 랜딩 페이지 (초반에 제대로)

**목표**: 서비스의 얼굴이 되는 완성도 높은 랜딩 — 방문자가 MetaNote가 무엇인지 이해하고 로그인으로 진입.

- **`design-taste-frontend` 스킬을 로드하고 작업** (랜딩 전용 스킬, 설치됨).
- `src/app/page.tsx` 전면 교체: DESIGN.md 랜딩 스펙 적용 — 다크 인디고 히어로 밴드, 핵심 메시지("왜 틀렸는지 아는 것이 진짜 공부" 류 — 메타인지 가치 제안), 기능 소개 섹션(오답 태깅 → 패턴 시각화 → 착각점수, DESIGN.md 카드/일러스트 톤), CTA는 `/login` 진입.
- 필요 시 랜딩 전용 섹션 컴포넌트는 `src/components/landing/` 아래에 분리.
- 이 시점엔 실제 앱 스크린샷이 없으므로 차트류는 디자인 토큰 기반 목업 그래픽/일러스트로 표현 (Phase 5 완료 후 실물 교체 여지).
- 메타데이터·OG 이미지·파비콘도 이 단계에서 정리.

**검증**: `e2e/landing.spec.ts` — 루트 `/` 렌더(모바일·데스크톱 프로젝트 모두), 히어로·핵심 섹션 노출, CTA 클릭 → `/login` 이동. 수동으로 Lighthouse 기본 점검(레이아웃 시프트·폰트 로딩).

## Phase 3 — 데이터 모델: 스키마 + RLS + 시드

**목표**: 학생별로 격리된 오답 데이터 스키마 + 단원 시드.

- `supabase/migrations/0001_init.sql`:
  - `profiles`(id=auth.users.id, display_name, grade)
  - `units`(subject 기본 '수학', grade, order_no, name) — 2022 개정 교육과정 중학 수학 단원 ~20행 시드 (단원명은 이 단계 구현 시 조사해 확정)
  - `mistakes`(user_id, unit_id, source, problem_ref, `error_type` CHECK 5종: misread/no_concept/calc_error/careless/time_pressure, memo, resolved, mistake_date, created_at)
  - `score_predictions`(exam_name, predicted, actual, exam_date) — 착각점수용
  - RLS: mistakes/score_predictions/profiles에 `auth.uid() = user_id` 전체 정책, units는 authenticated read-only.
- `src/lib/taxonomy.ts`: 오류 유형 5종 `{id, label, color}` **단일 소스** (상단 "확정된 taxonomy" 표 그대로) — 태그·차트 전부 참조.
- `src/lib/types.ts`(row 타입), `src/lib/queries.ts`(DAL: `getMistakes()`, `getUnits()` 등, 내부에서 `verifySession()`).

**검증**: TDD — `taxonomy.test.ts`(5종 id·색 매핑 무결성), `queries` 계층은 통합 테스트(테스트 Supabase 대상)로 두 계정 간 RLS 격리(A 세션에서 B 데이터 미조회) 검증. 단원 시드 카운트·정렬 확인 테스트.

## Phase 4 — 핵심 입력 플로우

**목표**: 폰에서 30초 안에 오답 1건 기록, 목록에서 조회·수정·삭제.

- `src/app/(app)/mistakes/new/page.tsx`: 최소 마찰 단일 화면 폼 — ① 단원 선택(학년 필터) ② 오류 원인 태그 1개 탭(필수, 핵심 상호작용) ③ 선택: 출처/문제번호/한 줄 메모. 제출 → Server Action(`mistakes/actions.ts`, `revalidatePath`) → 대시보드 유도 토스트.
- `src/app/(app)/mistakes/page.tsx`: note-card 리스트(모바일)/테이블(데스크톱), 극복 완료 토글, 삭제(확인 다이얼로그). 상세/수정은 인라인 또는 `[id]` 라우트 — 구현 시 판단.
- 사진 첨부·OCR은 하지 않음(후속).

**검증**: TDD — 폼 검증 로직(필수 필드·error_type 유효성) 단위 테스트 먼저. `e2e/mistakes.spec.ts` — 모바일 프로젝트에서 오답 3건 입력 → 목록 표시 → 극복 완료 토글 → 삭제, 계정 B storageState로 A의 데이터 비노출 확인.

## Phase 5 — 시각화 대시보드

**목표**: 메타인지를 자극하는 4개 뷰 + 빈 상태.

- `npm i recharts`. `src/app/(app)/dashboard/page.tsx`: 서버 집계(`queries.ts`에 유형별 카운트/단원×유형 매트릭스/주별 시계열 추가) + `<Suspense>` 스트리밍, 차트는 클라이언트 컴포넌트.
- 구현 순서(각각 독립 배포 가능):
  1. `src/components/charts/ErrorRadar.tsx` — RadarChart(5개 유형 축)
  2. `src/components/charts/UnitHeatmap.tsx` — 커스텀 CSS grid(단원×유형, 카운트 기반 농도)
  3. `src/components/charts/TrendLine.tsx` — 주 단위 추이 LineChart
  4. `src/components/charts/GapScore.tsx` + 예상/실제 점수 입력 UI — 착각점수 시각화 + 한 줄 코멘트
- 빈 상태: 3건 미만 시 안내 카드("오답을 3개만 기록하면 나의 실수 패턴이 보여요") + 입력 CTA.

**검증**: TDD — 집계 함수(유형별 카운트/단원×유형 매트릭스/주별 시계열/착각점수 계산)를 순수 함수로 분리해 단위 테스트 먼저 작성. `e2e/dashboard.spec.ts` — 유형·단원 섞어 6건+ 입력 후 레이더/히트맵/시계열 렌더 및 입력 직후 갱신, 신규 계정 빈 상태 카드 노출, 모바일 세로 스택.

## Phase 6 — 폴리시 & 코호트 투입 준비

**목표**: 5–10명 학생에게 링크를 줄 수 있는 상태.

- 게이미피케이션-lite: 스트릭·누적 기록·극복 완료 스탯 타일(별도 테이블 없이 `queries.ts` 파생).
- 온보딩: 오답 0건이면 대시보드가 3단계 안내 카드(빈 상태 확장, 별도 라우트 없음).
- 랜딩 업데이트: Phase 5에서 완성된 실제 차트 화면을 랜딩 목업 그래픽과 교체(선택).
- 모바일 마감: 44px 터치 타깃, 하단 고정 "오답 기록" CTA, 라우트별 `loading.tsx`/`error.tsx`.
- Vercel 배포 + 프로덕션 env + 테스트 계정 생성.

**검증**: TDD — 스트릭·누적 스탯 계산 단위 테스트 먼저. `e2e/onboarding.spec.ts`(오답 0건 신규 계정의 3단계 안내 카드) + 전체 회귀(`npm run test && npm run test:e2e`). 실기기(iOS Safari/Android Chrome) 전체 플로우는 수동 1회. RESEARCH.md 1단계 벤치마크(1주 자발적 입력 빈도)는 created_at 기반으로 Supabase 대시보드에서 확인 — 앱 내 관리 화면 미구현.

## Phase 7 — LLM 보조 분류 (개요만, 이번 범위 밖)

- **2층 분류 구조**: 학생이 풀이/메모를 입력하면 Claude API few-shot으로 1층(Newman 5종) 태그를 검증·제안하고, Movshovitz-Hadar 6유형(오용된 자료/잘못 해석된 언어/부적절한 추론/정리·정의 왜곡/검증 안 된 해답/기술적 오류)으로 서브 분류를 정밀화 — 최종 선택은 항상 학생. `ANTHROPIC_API_KEY` 서버 전용.
- `mistakes`에 `ai_suggested_type`/`ai_agreement` 컬럼 추가 → LLM-학생 일치율(목표 70%) 데이터 자동 축적.
- 그 이후: 사진 첨부(Supabase Storage) → OCR(Mathpix)은 입력 마찰이 병목으로 확인될 때만.

---

## 확정된 결정 사항

1. **taxonomy**: Newman 단순화 5종 확정 + MZI 6유형은 Phase 7 LLM 서브 분류로 예약 (상단 표 참조).
2. **인증**: 이메일+비밀번호, 회원가입 UI 포함.
3. **단원 시드**: Phase 3 구현 시 2022 개정 교육과정 기준으로 조사·확정.

## 운영 체크리스트 (구현 범위 밖)

- **미성년자 개인정보**: 코호트 투입(Phase 6) 전 보호자 동의 안내문 준비 — LLM 단계(Phase 7) 전에는 외부 데이터 전송 없음.
- **주의**: Next 16 + @supabase/ssr 문서 갭 — proxy.ts 세션 리프레시는 Phase 1 검증 항목에 포함되어 있음.

## 커밋 규칙

커밋 메시지는 한국어로 작성 (AGENTS.md). 태스크 ID(TASK.md)를 커밋 메시지에 참조.
