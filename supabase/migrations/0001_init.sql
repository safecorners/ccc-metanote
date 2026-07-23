-- MetaNote 초기 스키마 (P3-4)
-- profiles / units / mistakes / score_predictions + RLS + 2022 개정 교육과정 중학 수학 단원 시드
-- 재실행 가능하도록 작성됨 (Supabase SQL Editor에 그대로 붙여넣기 가능)

-- ============================================================
-- profiles — auth.users 1:1. 닉네임·학년 보관
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  grade smallint not null check (grade between 1 and 3),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "본인 프로필 조회" on public.profiles;
create policy "본인 프로필 조회" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "본인 프로필 수정" on public.profiles;
create policy "본인 프로필 수정" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 가입 시 user_metadata(display_name/grade)로 프로필 자동 생성.
-- 클라이언트 insert 정책을 두지 않기 위해 트리거(security definer)로 처리한다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, grade)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), '학생'),
    coalesce((new.raw_user_meta_data ->> 'grade')::smallint, 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Phase 1에서 user_metadata에만 저장된 기존 계정 백필
insert into public.profiles (id, display_name, grade)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'display_name', ''), '학생'),
  coalesce((u.raw_user_meta_data ->> 'grade')::smallint, 1)
from auth.users u
on conflict (id) do nothing;

-- ============================================================
-- units — 전역 읽기 전용 마스터 (2022 개정 교육과정 중학 수학)
-- ============================================================
create table if not exists public.units (
  id bigint generated always as identity primary key,
  subject text not null default '수학',
  grade smallint not null check (grade between 1 and 3),
  order_no smallint not null,
  name text not null,
  unique (subject, grade, order_no)
);

alter table public.units enable row level security;

drop policy if exists "단원 조회" on public.units;
create policy "단원 조회" on public.units
  for select to authenticated using (true);

insert into public.units (subject, grade, order_no, name) values
  ('수학', 1, 1, '소인수분해'),
  ('수학', 1, 2, '정수와 유리수'),
  ('수학', 1, 3, '문자와 식'),
  ('수학', 1, 4, '일차방정식'),
  ('수학', 1, 5, '좌표평면과 그래프'),
  ('수학', 1, 6, '기본 도형과 작도'),
  ('수학', 1, 7, '평면도형의 성질'),
  ('수학', 1, 8, '입체도형의 성질'),
  ('수학', 1, 9, '대푯값과 자료의 정리'),
  ('수학', 2, 1, '유리수와 순환소수'),
  ('수학', 2, 2, '식의 계산'),
  ('수학', 2, 3, '일차부등식'),
  ('수학', 2, 4, '연립일차방정식'),
  ('수학', 2, 5, '일차함수와 그래프'),
  ('수학', 2, 6, '삼각형과 사각형의 성질'),
  ('수학', 2, 7, '도형의 닮음'),
  ('수학', 2, 8, '피타고라스 정리'),
  ('수학', 2, 9, '경우의 수와 확률'),
  ('수학', 3, 1, '제곱근과 실수'),
  ('수학', 3, 2, '다항식의 곱셈과 인수분해'),
  ('수학', 3, 3, '이차방정식'),
  ('수학', 3, 4, '이차함수와 그래프'),
  ('수학', 3, 5, '삼각비'),
  ('수학', 3, 6, '원의 성질'),
  ('수학', 3, 7, '산포도와 상관관계')
on conflict (subject, grade, order_no) do update set name = excluded.name;

-- ============================================================
-- mistakes — 오답 기록. 필수는 단원 + 오류 유형 2개뿐 (시나리오 1)
-- ============================================================
create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  unit_id bigint not null references public.units (id),
  error_type text not null check (
    error_type in ('misread', 'no_concept', 'calc_error', 'careless', 'time_pressure')
  ),
  source text,
  problem_ref text,
  memo text,
  resolved boolean not null default false,
  mistake_date date not null default (now() at time zone 'Asia/Seoul')::date,
  created_at timestamptz not null default now()
);

-- RLS 조건 컬럼 + 목록/집계 정렬을 한 번에 커버
create index if not exists mistakes_user_created_idx
  on public.mistakes (user_id, created_at desc);
-- 단원×유형 히트맵 집계용 (FK 인덱스 겸용)
create index if not exists mistakes_user_unit_idx
  on public.mistakes (user_id, unit_id);

alter table public.mistakes enable row level security;

drop policy if exists "본인 오답만 접근" on public.mistakes;
create policy "본인 오답만 접근" on public.mistakes
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- score_predictions — 착각점수(예상 vs 실제, 시나리오 3)
-- ============================================================
create table if not exists public.score_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_name text not null,
  predicted smallint check (predicted between 0 and 100),
  actual smallint check (actual between 0 and 100),
  exam_date date not null default (now() at time zone 'Asia/Seoul')::date,
  created_at timestamptz not null default now()
);

create index if not exists score_predictions_user_exam_date_idx
  on public.score_predictions (user_id, exam_date desc);

alter table public.score_predictions enable row level security;

drop policy if exists "본인 점수 기록만 접근" on public.score_predictions;
create policy "본인 점수 기록만 접근" on public.score_predictions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
