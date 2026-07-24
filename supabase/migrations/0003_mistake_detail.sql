-- ============================================================
-- 오답 상세 — 문제 본문/답 컬럼 + 문제 사진(Storage)
-- 새 컬럼은 전부 선택 입력 (필수는 여전히 단원 + 오류 유형 2개, 시나리오 1)
-- ============================================================
alter table public.mistakes
  add column if not exists problem_text   text,
  add column if not exists my_answer      text,
  add column if not exists correct_answer text,
  -- 'mistake-images' 버킷 내 경로: {user_id}/{uuid}.jpg
  add column if not exists image_path     text;

-- ============================================================
-- mistake-images — 문제 사진 비공개 버킷 (표시는 signed URL)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mistake-images', 'mistake-images', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

-- 경로 첫 폴더 = 본인 uid 규칙. UPDATE 정책은 의도적으로 없음 —
-- 교체는 새 업로드 + 옛 객체 삭제로 처리한다.
drop policy if exists "본인 오답 이미지 조회" on storage.objects;
create policy "본인 오답 이미지 조회" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'mistake-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "본인 오답 이미지 업로드" on storage.objects;
create policy "본인 오답 이미지 업로드" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'mistake-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "본인 오답 이미지 삭제" on storage.objects;
create policy "본인 오답 이미지 삭제" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'mistake-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
