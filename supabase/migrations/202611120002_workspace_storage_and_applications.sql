-- AUTOMULA Phase 2: private document storage and durable application records.
create extension if not exists vector with schema extensions;

create table if not exists public.application_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  organization text,
  role_or_program text,
  source_url text,
  status text not null default 'draft'
    check (status in ('draft','in_progress','ready_for_review','submitted','archived')),
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.application_records enable row level security;
create policy "application_records_owner_select" on public.application_records
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "application_records_owner_insert" on public.application_records
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "application_records_owner_update" on public.application_records
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "application_records_owner_delete" on public.application_records
  for delete to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  embedding extensions.vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(document_id, chunk_index)
);

create index if not exists document_chunks_user_id_idx on public.document_chunks(user_id);
create index if not exists document_chunks_document_id_idx on public.document_chunks(document_id);
alter table public.document_chunks enable row level security;
create policy "document_chunks_owner_select" on public.document_chunks
  for select to authenticated using ((select auth.uid()) = user_id);
-- Inserts and embedding maintenance are reserved for trusted server-side processing.
create policy "document_chunks_owner_delete" on public.document_chunks
  for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private-documents',
  'private-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "automula_private_documents_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "automula_private_documents_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "automula_private_documents_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
