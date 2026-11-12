-- AUTOMULA explicit Data API grants and least-privilege profile trigger execution.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.knowledge_items to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.form_sessions to authenticated;
grant select, insert, update, delete on public.form_fields to authenticated;
grant select, insert, update, delete on public.answer_suggestions to authenticated;
grant select, insert, update, delete on public.field_mappings to authenticated;
grant select on public.audit_events to authenticated;
grant select, insert, delete on public.document_chunks to authenticated;

grant usage on schema extensions to authenticated;

-- The auth trigger runs as the function owner. Do not expose this SECURITY DEFINER
-- trigger function as a callable public API.
revoke all on function public.automula_handle_new_user() from public, anon, authenticated;
