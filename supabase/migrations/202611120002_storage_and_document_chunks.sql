-- AUTOMULA private document storage and vector-ready text chunks.
create schema if not exists extensions;
create extension if not exists vector with schema extensions;

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

create index if not exists document_chunks_owner_document_idx
  on public.document_chunks(user_id, document_id);

alter table public.document_chunks enable row level security;

create policy "document_chunks_owner_read" on public.document_chunks
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "document_chunks_owner_delete" on public.document_chunks
  for delete to authenticated
  using ((select auth.uid()) = user_id);

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

create policy "automula_private_documents_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'private-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "automula_private_documents_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'private-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "automula_private_documents_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'private-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Create a profile row for every newly registered account.
create or replace function public.automula_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_automula on auth.users;
create trigger on_auth_user_created_automula
  after insert on auth.users
  for each row execute procedure public.automula_handle_new_user();
