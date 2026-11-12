create extension if not exists pgcrypto;

create type public.automula_knowledge_category as enum (
  'personal', 'education', 'experience', 'skills',
  'certification', 'project', 'achievement', 'preference', 'other'
);

create type public.automula_session_status as enum (
  'detected', 'analyzed', 'reviewing', 'filling',
  'completed', 'failed', 'cancelled'
);

create type public.automula_answer_confidence as enum (
  'high', 'medium', 'low', 'unsupported'
);

create type public.automula_answer_status as enum (
  'draft', 'approved', 'rejected', 'filled', 'failed'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  location text,
  professional_summary text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.automula_knowledge_category not null default 'other',
  key text not null,
  value text not null,
  source_type text,
  source_reference text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index knowledge_items_user_category_idx
  on public.knowledge_items(user_id, category);
create index knowledge_items_user_key_idx
  on public.knowledge_items(user_id, key);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  website_url text,
  repository_url text,
  status text,
  role text,
  start_date date,
  end_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  mime_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  processing_status text not null default 'pending'
    check (processing_status in ('pending', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  unique(user_id, storage_path)
);

create table public.form_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text not null,
  page_url text,
  form_title text,
  status public.automula_session_status not null default 'detected',
  adapter_name text,
  detected_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index form_sessions_user_detected_idx
  on public.form_sessions(user_id, detected_at desc);

create table public.form_fields (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.form_sessions(id) on delete cascade,
  field_key text not null,
  question text not null,
  field_type text not null,
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '{}'::jsonb,
  existing_value_present boolean not null default false,
  position integer,
  created_at timestamptz not null default now(),
  unique(session_id, field_key)
);

create table public.answer_suggestions (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.form_fields(id) on delete cascade,
  answer jsonb,
  confidence public.automula_answer_confidence not null default 'low',
  status public.automula_answer_status not null default 'draft',
  source_ids uuid[] not null default '{}',
  reasoning_summary text,
  needs_review boolean not null default true,
  model_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.field_mappings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_hash text not null,
  normalized_question text not null,
  knowledge_key text,
  approved_answer text,
  usage_count integer not null default 0 check (usage_count >= 0),
  created_at timestamptz not null default now(),
  unique(user_id, question_hash)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.form_sessions(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS on every user-owned table.
alter table public.profiles enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.form_sessions enable row level security;
alter table public.form_fields enable row level security;
alter table public.answer_suggestions enable row level security;
alter table public.field_mappings enable row level security;
alter table public.audit_events enable row level security;

create policy "profile_owner_all" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "knowledge_owner_all" on public.knowledge_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects_owner_all" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "documents_owner_all" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sessions_owner_all" on public.form_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "fields_owner_all" on public.form_fields
  for all using (
    exists (
      select 1 from public.form_sessions s
      where s.id = form_fields.session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.form_sessions s
      where s.id = form_fields.session_id and s.user_id = auth.uid()
    )
  );

create policy "suggestions_owner_all" on public.answer_suggestions
  for all using (
    exists (
      select 1
      from public.form_fields f
      join public.form_sessions s on s.id = f.session_id
      where f.id = answer_suggestions.field_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.form_fields f
      join public.form_sessions s on s.id = f.session_id
      where f.id = answer_suggestions.field_id and s.user_id = auth.uid()
    )
  );

create policy "mappings_owner_all" on public.field_mappings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "audit_owner_read" on public.audit_events
  for select using (auth.uid() = user_id);

-- Audit events are intentionally read-only to browser clients.
-- Insert audit events from trusted server-side code after ownership checks.
