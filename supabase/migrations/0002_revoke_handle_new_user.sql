-- security advisor 조치: handle_new_user()는 auth.users 트리거 전용 —
-- PostgREST RPC로 노출될 이유가 없으므로 EXECUTE를 회수한다.
revoke execute on function public.handle_new_user()
  from public, anon, authenticated;
