-- Match the verified Supabase project RLS optimization and foreign-key indexes.
drop policy if exists "profile_owner_all" on public.profiles;
create policy "profile_owner_all" on public.profiles
  for all to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
drop policy if exists "knowledge_owner_all" on public.knowledge_items;
create policy "knowledge_owner_all" on public.knowledge_items
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "projects_owner_all" on public.projects;
create policy "projects_owner_all" on public.projects
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "documents_owner_all" on public.documents;
create policy "documents_owner_all" on public.documents
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "sessions_owner_all" on public.form_sessions;
create policy "sessions_owner_all" on public.form_sessions
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "audit_owner_read" on public.audit_events;
create policy "audit_owner_read" on public.audit_events
  for select to authenticated using ((select auth.uid()) = user_id);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists answer_suggestions_field_id_idx on public.answer_suggestions(field_id);
create index if not exists audit_events_session_id_idx on public.audit_events(session_id);
create index if not exists audit_events_user_id_idx on public.audit_events(user_id);
