-- ============================================================================
-- Fix: "infinite recursion detected in policy for relation profiles" and
-- staff being unable to read the students list.
--
-- Cause: a policy ON profiles that queries profiles (directly or via a function
-- that is not SECURITY DEFINER) recurses. The fix is a SECURITY DEFINER helper
-- owned by a BYPASSRLS role + simple, non-recursive policies.
--
-- Safe to run multiple times. Paste into the Supabase SQL editor.
-- ============================================================================

-- 1) Staff check that bypasses RLS (runs as the function owner).
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

-- 2) Drop every existing policy on profiles to clear any recursive leftovers.
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

alter table public.profiles enable row level security;

-- 3) Non-recursive policies.
--    SELECT: any authenticated user can read profiles (needed for the students
--    list). This does NOT query profiles inside the policy, so no recursion.
create policy profiles_select_all on public.profiles
  for select to authenticated using (true);

--    INSERT: a user may create only their own row.
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (auth.uid() = id);

--    UPDATE self: a user may edit their own row (but cannot escalate role — see note).
create policy profiles_update_self on public.profiles
  for update to authenticated using (auth.uid() = id);

--    UPDATE by staff: staff may edit any profile (e.g. toggle roles).
--    Uses is_staff() (SECURITY DEFINER) so it does not recurse.
create policy profiles_update_staff on public.profiles
  for update to authenticated using (public.is_staff()) with check (true);

-- Done. Re-run supabase/schema.sql afterwards if you also need the content /
-- progress policies refreshed.
