-- AUTOMULA Phase 3: vector search over private document chunks.
create index if not exists document_chunks_embedding_hnsw_idx
  on public.document_chunks using hnsw (embedding extensions.vector_cosine_ops);

create policy "document_chunks_owner_insert" on public.document_chunks
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.documents d
      where d.id = document_chunks.document_id
        and d.user_id = (select auth.uid())
    )
  );

create or replace function public.match_document_chunks(
  query_embedding extensions.vector(1536),
  match_count integer default 8
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    chunks.id,
    chunks.document_id,
    chunks.content,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from public.document_chunks as chunks
  where chunks.user_id = (select auth.uid())
    and chunks.embedding is not null
  order by chunks.embedding <=> query_embedding
  limit greatest(1, least(match_count, 20));
$$;

revoke all on function public.match_document_chunks(extensions.vector, integer) from public, anon;
grant execute on function public.match_document_chunks(extensions.vector, integer) to authenticated;
