-- Cross-listings: let a single lesson appear in more than one course/unit.
-- The lesson row stays the single source of truth (same id → shared content and
-- student progress); a cross-listing only places that lesson under an extra
-- module. Idempotent. Run supabase/schema.sql first.

create table if not exists public.lesson_cross_listings (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  order_index int not null default 0,
  unique (lesson_id, module_id)
);
create unique index if not exists lesson_cross_listings_key
  on public.lesson_cross_listings (lesson_id, module_id);

alter table public.lesson_cross_listings enable row level security;

-- World-readable; only staff may write.
drop policy if exists lesson_cross_listings_select on public.lesson_cross_listings;
create policy lesson_cross_listings_select on public.lesson_cross_listings
  for select using (true);

drop policy if exists lesson_cross_listings_write on public.lesson_cross_listings;
create policy lesson_cross_listings_write on public.lesson_cross_listings
  for all using (public.is_staff()) with check (public.is_staff());
