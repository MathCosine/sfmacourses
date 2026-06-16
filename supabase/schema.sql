-- San Francisco Math Academy — database schema.
-- Idempotent: safe to run multiple times. Run this before supabase/seed.sql.

-- ----------------------------------------------------------------- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('student', 'staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  order_index int not null default 0
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  order_index int not null default 0,
  unique (track_id, slug)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  slug text not null,
  content jsonb not null default '[]'::jsonb,
  order_index int not null default 0,
  unique (module_id, slug)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists public.problem_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  problem_index int not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id, problem_index)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users (id) on delete set null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------ Unique constraints
-- Created separately (not just inline in CREATE TABLE) so they are also added
-- to tables that already existed before this script was first run. These back
-- the ON CONFLICT upserts in supabase/seed.sql.
create unique index if not exists tracks_slug_key
  on public.tracks (slug);
create unique index if not exists modules_track_slug_key
  on public.modules (track_id, slug);
create unique index if not exists lessons_module_slug_key
  on public.lessons (module_id, slug);
create unique index if not exists progress_user_lesson_key
  on public.progress (user_id, lesson_id);
create unique index if not exists problem_completions_user_lesson_idx_key
  on public.problem_completions (user_id, lesson_id, problem_index);

-- --------------------------------------------------- Status columns (usaco-style)
-- Lessons: not_started | reading | practicing | complete | skipped | ignored
-- Problems: not_started | solving | solved | skipped | ignored
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

-- ------------------------------------------------ Staff helper (no recursion)
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select p.role = 'staff' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- ------------------------------------------------------ Auto-create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------- RLS
alter table public.profiles            enable row level security;
alter table public.tracks              enable row level security;
alter table public.modules             enable row level security;
alter table public.lessons             enable row level security;
alter table public.progress            enable row level security;
alter table public.problem_completions enable row level security;
alter table public.announcements       enable row level security;

-- Profiles: anyone signed in can read; users edit themselves; staff edit anyone.
-- Policies must never query `profiles` directly (that causes infinite
-- recursion) — staff checks go through the SECURITY DEFINER is_staff().
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles;', pol.policyname);
  end loop;
end $$;

create policy profiles_select_all on public.profiles
  for select to authenticated using (true);

create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy profiles_update_self on public.profiles
  for update to authenticated using (auth.uid() = id);

create policy profiles_update_staff on public.profiles
  for update to authenticated using (public.is_staff()) with check (true);

-- Content: world-readable; only staff may write.
do $$
declare t text;
begin
  foreach t in array array['tracks','modules','lessons'] loop
    execute format('drop policy if exists %1$s_select on public.%1$s;', t);
    execute format('create policy %1$s_select on public.%1$s for select using (true);', t);
    execute format('drop policy if exists %1$s_write on public.%1$s;', t);
    execute format('create policy %1$s_write on public.%1$s for all using (public.is_staff()) with check (public.is_staff());', t);
  end loop;
end $$;

-- Per-section status (one row per (user, lesson, section_index)).
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
alter table public.section_completions enable row level security;

-- Progress: each user owns their rows.
drop policy if exists progress_rw on public.progress;
create policy progress_rw on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists problem_completions_rw on public.problem_completions;
create policy problem_completions_rw on public.problem_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists section_completions_rw on public.section_completions;
create policy section_completions_rw on public.section_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Announcements: world-readable; only staff may write.
drop policy if exists announcements_select on public.announcements;
create policy announcements_select on public.announcements
  for select using (true);

drop policy if exists announcements_write on public.announcements;
create policy announcements_write on public.announcements
  for all using (public.is_staff()) with check (public.is_staff());

-- ------------------------------------------------------------------- Notes
-- Promote your first staff user after signing up:
--   update public.profiles set role = 'staff' where email = 'you@example.com';
--
-- The email sfmathopen@gmail.com is hard-coded as a permanent super-admin in
-- the app (lib/admin.ts), so it is always staff once that account signs up.
-- To also reflect it in the DB:
--   insert into public.profiles (id, email, full_name, role)
--   select id, email, coalesce(raw_user_meta_data->>'full_name',''), 'staff'
--   from auth.users where email = 'sfmathopen@gmail.com'
--   on conflict (id) do update set role = 'staff';
--
-- Courses migration: this build's courses are AMC 8, AMC 10/12, AP Calculus BC.
-- If your project still has the old AIME track, remove it before reseeding:
--   delete from public.tracks where slug = 'aime';
-- Then run supabase/seed.sql (idempotent upserts).
