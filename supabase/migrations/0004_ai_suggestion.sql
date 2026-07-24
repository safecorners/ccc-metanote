-- ============================================================
-- AI 보조 분류 (Phase 7) — 제안·일치율 축적 컬럼
-- 세 컬럼 모두 null = AI 미사용 저장. 최종 태그는 여전히 error_type.
-- ============================================================
alter table public.mistakes
  -- 1층 제안 (Newman 5종 — error_type과 동일 enum)
  add column if not exists ai_suggested_type text check (
    ai_suggested_type in ('misread', 'no_concept', 'calc_error', 'careless', 'time_pressure')
  ),
  -- 2층 제안 (Movshovitz-Hadar 6유형)
  add column if not exists ai_suggested_subtype text check (
    ai_suggested_subtype in (
      'misused_data', 'misinterpreted_language', 'invalid_inference',
      'distorted_theorem', 'unverified_solution', 'technical_error'
    )
  ),
  -- 학생의 최종 선택(error_type)이 제안과 일치했는가 — 서버에서 파생 저장
  add column if not exists ai_agreement boolean;

-- 제안 없이 일치율만 존재할 수 없다
alter table public.mistakes
  drop constraint if exists mistakes_ai_agreement_requires_suggestion;
alter table public.mistakes
  add constraint mistakes_ai_agreement_requires_suggestion
  check (ai_agreement is null or ai_suggested_type is not null);
