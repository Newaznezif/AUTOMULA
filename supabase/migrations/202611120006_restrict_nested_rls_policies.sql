-- Restrict nested ownership policies to signed-in users and cache auth.uid().
drop policy if exists "fields_owner_all" on public.form_fields;
create policy "fields_owner_all" on public.form_fields
  for all to authenticated
  using (exists (
    select 1 from public.form_sessions s
    where s.id = form_fields.session_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.form_sessions s
    where s.id = form_fields.session_id and s.user_id = (select auth.uid())
  ));

drop policy if exists "suggestions_owner_all" on public.answer_suggestions;
create policy "suggestions_owner_all" on public.answer_suggestions
  for all to authenticated
  using (exists (
    select 1 from public.form_fields f
    join public.form_sessions s on s.id = f.session_id
    where f.id = answer_suggestions.field_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.form_fields f
    join public.form_sessions s on s.id = f.session_id
    where f.id = answer_suggestions.field_id and s.user_id = (select auth.uid())
  ));

drop policy if exists "mappings_owner_all" on public.field_mappings;
create policy "mappings_owner_all" on public.field_mappings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
