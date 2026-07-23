# MetaNote 실행 체크리스트 (TASK.md)

> 기준 문서: [PLAN.md](./PLAN.md). 태스크 ID를 커밋 메시지에 참조한다 (예: `P1-3 globals.css 디자인 토큰 정의`).
> `👤` = 운영자(사용자) 액션 필요. 각 Phase의 검증 게이트(`P*-V`) 통과 전 다음 Phase 진입 금지.
> TDD: 테스트 작성 태스크가 구현 태스크보다 항상 먼저다.

## Phase 1 — 기반: 디자인 시스템 + Supabase + 인증

- [x] 👤 P1-1 Supabase 프로젝트 생성, URL/anon key 발급, Auth 이메일 확인(confirm email) 끄기
- [x] P1-2 Vitest + React Testing Library 셋업 (`vitest.config.ts`, `npm run test`)
- [x] P1-3 `src/app/globals.css` — Tailwind v4 `@theme`에 DESIGN.md 토큰 정의 (canvas/ink/primary/accent 5색/radius/타이포), 기본 테마 제거
- [x] P1-4 Pretendard 폰트 (`src/lib/fonts.ts`) + `layout.tsx` `lang="ko"`·MetaNote 메타데이터 (Geist 제거)
- [x] P1-5 shadcn/ui 초기화 (`npx shadcn init`) + `lucide-react` 설치 — DESIGN.md 토큰과 CSS 변수 연결 (프리미티브는 필요 시점에 개별 추가)
- [x] P1-6 UI 컴포넌트 테스트 작성 — `Button`/`ErrorTag` 동작·상태 (TDD)
- [x] P1-7 UI 컴포넌트 구현 — `src/components/ui/` `Button`, `Card`, `Input`, `ErrorTag` (DESIGN.md 명세대로 직접 구현, shadcn 미사용)
- [x] P1-8 Supabase 연결 — `@supabase/supabase-js` + `@supabase/ssr` 설치, `src/lib/supabase/client.ts`/`server.ts`/`proxy.ts`, `.env.local` + `.env.example`
- [x] P1-9 `src/proxy.ts` — 세션 리프레시 + 미인증 시 `/login` 리다이렉트 (Next 16: middleware 아님, matcher로 정적 자산 제외)
- [x] P1-10 인증 구현 — `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`(이메일/비번/닉네임/학년), `actions.ts`(signUp/signIn/signOut — 닉네임·학년은 user_metadata에 보관, Phase 3에서 profiles로 백필)
- [x] P1-11 `src/lib/dal.ts` `verifySession()`(React `cache()`) + 인증 라우트 그룹 `src/app/(app)/layout.tsx`(네비+로그아웃) + 빈 `/dashboard`
- [x] P1-12 Playwright 셋업 — `playwright.config.ts`(webServer, 데스크톱+모바일 프로젝트), 테스트 계정 2개(`E2E_USER_{A,B}_*`, `.env.local`), `e2e/auth.setup.ts`(storageState, idempotent 가입)
- [x] P1-13 `e2e/auth.spec.ts` — 미인증 리다이렉트 / 로그인 → 대시보드 / 새로고침 세션 유지(proxy 리프레시 검증) / 로그아웃
- [x] **P1-V 검증 게이트**: `npm run test && npm run test:e2e` 통과 (Vitest 11 + Playwright 10, `npm run build` 확인)

## Phase 2 — 랜딩 페이지

- [x] P2-1 `design-taste-frontend` 스킬 로드 → 랜딩 디자인 디렉션 확정 (DESIGN.md 랜딩 스펙 기반)
- [x] P2-2 히어로 밴드 구현 — 다크 인디고(#213183) "밤" 밴드, 메타인지 가치 제안 카피, `/login` CTA (+별자리 SVG, tw-animate-css 등장 모션, reduced-motion 가드)
- [x] P2-3 기능 소개 섹션 — 오답 태깅 → 패턴 시각화 → 착각점수 (`src/components/landing/`, 실제 ErrorTag/Card 프리뷰 + 토큰 기반 레이더/히트맵 SVG 모티프)
- [x] P2-4 메타데이터·OG 이미지·파비콘 정리 (`icon.svg` + `scripts/generate-og.mjs`로 OG/PNG 아이콘 생성, metadataBase는 P6-7에서 실 도메인 교체)
- [x] P2-5 `e2e/landing.spec.ts` — 루트 렌더(모바일·데스크톱), 히어로·핵심 섹션 노출, CTA → `/login`, 앵커 이동, 가로 오버플로 가드
- [x] **P2-V 검증 게이트**: 전체 테스트 통과 (Vitest 11 + Playwright 22) + 375px/1280px 풀페이지 렌더 수동 확인 (Lighthouse 정식 측정은 P6 배포 후 재점검)

## Phase 3 — 데이터 모델: 스키마 + RLS + 시드

- [ ] P3-1 2022 개정 교육과정 중학 수학 단원 목록 조사·확정 (~20행)
- [ ] P3-2 `taxonomy.test.ts` 작성 — 5종 id·라벨·색 매핑 무결성 (TDD)
- [ ] P3-3 `src/lib/taxonomy.ts` 구현 — 5종 `{id, label, color}` 단일 소스 (PLAN.md 표 그대로)
- [ ] P3-4 `supabase/migrations/0001_init.sql` — profiles/units/mistakes(error_type CHECK 5종)/score_predictions + RLS(`auth.uid() = user_id`, units는 read-only) + 단원 시드
- [ ] 👤 P3-5 마이그레이션 적용 (Supabase CLI `db push` 또는 대시보드 SQL Editor)
- [ ] P3-6 `src/lib/types.ts`(row 타입) + `src/lib/queries.ts`(DAL: `getMistakes()`, `getUnits()` — 내부 `verifySession()`)
- [ ] P3-7 RLS 격리 통합 테스트 — 계정 A 세션에서 B 데이터 미조회, 단원 시드 카운트·정렬 확인
- [ ] **P3-V 검증 게이트**: 전체 테스트 통과

## Phase 4 — 핵심 입력 플로우 (시나리오 1)

- [ ] P4-1 폼 검증 로직 단위 테스트 작성 — 필수 필드(단원·error_type)·유효성 (TDD)
- [ ] P4-2 폼 검증 로직 구현 + `createMistake` Server Action (`src/app/(app)/mistakes/actions.ts`, `revalidatePath`)
- [ ] P4-3 오답 입력 폼 — `src/app/(app)/mistakes/new/page.tsx`: 단원 선택(shadcn Select, 학년 필터) + 오류 태그 1개 탭(필수) + 선택 입력(출처/문제번호/메모), 저장 토스트(Sonner, "차트가 업데이트됐어요")
- [ ] P4-4 오답 목록 — `src/app/(app)/mistakes/page.tsx`: note-card(모바일)/테이블(데스크톱), 극복 완료 토글, 삭제(shadcn Dialog 확인)
- [ ] P4-5 `e2e/mistakes.spec.ts` — 모바일 프로젝트: 3건 입력 → 목록 → 토글 → 삭제, 계정 B로 A 데이터 비노출
- [ ] **P4-V 검증 게이트**: 전체 테스트 통과 + 시나리오 1 수기 확인(탭 4~5회 이내 기록)

## Phase 5 — 시각화 대시보드 (시나리오 2·3)

- [ ] P5-1 집계 순수 함수 단위 테스트 작성 — 유형별 카운트/단원×유형 매트릭스/주별 시계열/착각점수 계산 (TDD)
- [ ] P5-2 집계 함수 구현 + `queries.ts` 집계 쿼리 추가
- [ ] P5-3 `recharts` 설치 + `src/app/(app)/dashboard/page.tsx` — 서버 집계 + `<Suspense>` 스트리밍 구조
- [ ] P5-4 `src/components/charts/ErrorRadar.tsx` — RadarChart(5개 유형 축, taxonomy 색)
- [ ] P5-5 `src/components/charts/UnitHeatmap.tsx` — 커스텀 CSS grid(단원×유형, 카운트 농도)
- [ ] P5-6 `src/components/charts/TrendLine.tsx` — 주 단위 유형별 추이
- [ ] P5-7 `src/components/charts/GapScore.tsx` + 예상/실제 점수 입력 UI — 착각점수 + 해석 코멘트("예상보다 N점 낮았어요…")
- [ ] P5-8 빈 상태 — 3건 미만 시 안내 카드 + 입력 CTA
- [ ] P5-9 `e2e/dashboard.spec.ts` — 6건+ 입력 후 차트 렌더·즉시 갱신, 신규 계정 빈 상태, 모바일 세로 스택
- [ ] **P5-V 검증 게이트**: 전체 테스트 통과 + 시나리오 2·3 수기 확인

## Phase 6 — 폴리시 & 코호트 투입 준비

- [ ] P6-1 스트릭·누적 스탯 계산 단위 테스트 작성 (TDD)
- [ ] P6-2 스탯 타일 구현 — 주 단위 스트릭/누적 기록/극복 완료 수 (`queries.ts` 파생, 별도 테이블 없음)
- [ ] P6-3 온보딩 — 오답 0건 시 대시보드 3단계 안내 카드 (빈 상태 확장)
- [ ] P6-4 모바일 마감 — 44px 터치 타깃, 하단 고정 "오답 기록" CTA, 라우트별 `loading.tsx`/`error.tsx`
- [ ] P6-5 랜딩 목업 그래픽 → 실제 차트 화면 교체 (선택)
- [ ] P6-6 `e2e/onboarding.spec.ts` + 전체 회귀 (`npm run test && npm run test:e2e`)
- [ ] 👤 P6-7 Vercel 배포 + 프로덕션 Supabase env + 테스트 계정 5–10개 생성
- [ ] 👤 P6-8 실기기 수동 테스트 — iOS Safari/Android Chrome 전체 플로우 1회
- [ ] **P6-V 검증 게이트**: 전체 회귀 통과 + 코호트 투입 가능 판정

## 운영 체크리스트 (구현 범위 밖)

- [ ] 👤 보호자 동의 안내문 준비 (코호트 투입 전 — LLM 단계 전에는 외부 데이터 전송 없음)
- [ ] 👤 1단계 벤치마크 계측 — 1주일간 자발적 입력 빈도를 Supabase 대시보드(created_at 기준)로 확인

> Phase 7(LLM 보조 분류)은 이번 구현 범위 밖 — 개요는 PLAN.md 참조.
