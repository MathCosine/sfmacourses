-- ============================================================================
-- DEFINITIVE FIX for: "infinite recursion detected in policy for relation
-- profiles" (seen when creating units/chapters, toggling roles, etc.)
--
-- Root cause: a pre-existing policy ON profiles that itself reads profiles
-- (directly or through a non-bypassing function). Because such policies can
-- have ANY name, dropping by name isn't enough — this script drops EVERY
-- policy on each table and recreates clean, non-recursive ones.
--
-- Paste this WHOLE file into the Supabase SQL editor and run it once.
-- Safe to run multiple times.
-- ============================================================================

-- 1) Staff check that bypasses RLS (runs as its owner; never recurses because
--    the only policy it can trigger on profiles is the SELECT-true policy).
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(lower(auth.jwt() ->> 'email') = 'sfmathopen@gmail.com', false)
    or coalesce(
      (select p.role = 'staff' from public.profiles p where p.id = auth.uid()),
      false
    );
$$;

-- 2) Drop ALL existing policies on every app table.
do $$
declare
  r record;
  tbls text[] := array[
    'profiles','tracks','modules','lessons',
    'progress','problem_completions','section_completions','announcements'
  ];
  t text;
begin
  foreach t in array tbls loop
    -- skip tables that don't exist yet
    if to_regclass('public.'||t) is null then
      continue;
    end if;
    for r in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I;', r.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- 3) profiles — NO policy here may read profiles (that is what recurses).
create policy profiles_select_all on public.profiles
  for select to authenticated using (true);
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy profiles_update_self on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy profiles_update_staff on public.profiles
  for update to authenticated using (public.is_staff()) with check (true);

-- 4) Content — world-readable, staff-writable (via the SECURITY DEFINER check).
do $$
declare t text;
begin
  foreach t in array array['tracks','modules','lessons'] loop
    execute format(
      'create policy %1$s_select on public.%1$s for select using (true);', t);
    execute format(
      'create policy %1$s_write on public.%1$s for all to authenticated '
      || 'using (public.is_staff()) with check (public.is_staff());', t);
  end loop;
end $$;

-- 5) Per-user progress tables — each user owns their rows.
do $$
declare t text;
begin
  foreach t in array array['progress','problem_completions','section_completions'] loop
    if to_regclass('public.'||t) is not null then
      execute format(
        'create policy %1$s_rw on public.%1$s for all to authenticated '
        || 'using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    end if;
  end loop;
end $$;

-- 6) Announcements — world-readable, staff-writable.
create policy announcements_select on public.announcements
  for select using (true);
create policy announcements_write on public.announcements
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- 7) Verify (optional): every profiles policy below should have a simple
--    qual — none should reference "profiles" except by SELECT-true.
--   select tablename, policyname, qual, with_check
--   from pg_policies where schemaname='public' and tablename='profiles';
