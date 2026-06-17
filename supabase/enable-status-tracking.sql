-- Enable usaco-style status tracking. Idempotent and safe to run anytime.
-- Run this if clicking Reading / Practicing / Complete / Solved does not persist.
-- (The app also works with just the boolean columns, but this stores the full
--  six-state status on chapters, sections, and problems.)

begin;

-- Unique keys that back per-user upserts.
create unique index if not exists progress_user_lesson_key
  on public.progress (user_id, lesson_id);
create unique index if not exists problem_completions_user_lesson_idx_key
  on public.problem_completions (user_id, lesson_id, problem_index);

-- Status columns.
alter table public.progress
  add column if not exists status text not null default 'not_started';
update public.progress
  set status = 'complete'
  where completed = true and status = 'not_started';

alter table public.problem_completions
  add column if not exists status text not null default 'not_started';
update public.problem_completions
  set status = 'solved'
  where completed = true and status = 'not_started';

-- Per-section status table.
create table if not exists public.section_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  section_index int not null,
  status text not null default 'not_started',
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id, section_index)
);
create unique index if not exists section_completions_key
  on public.section_completions (user_id, lesson_id, section_index);

-- Row-level security: each user reads/writes only their own rows.
alter table public.progress            enable row level security;
alter table public.problem_completions enable row level security;
alter table public.section_completions enable row level security;

drop policy if exists progress_rw on public.progress;
create policy progress_rw on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists problem_completions_rw on public.problem_completions;
create policy problem_completions_rw on public.problem_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists section_completions_rw on public.section_completions;
create policy section_completions_rw on public.section_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
