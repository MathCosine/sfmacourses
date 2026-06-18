-- Fix legacy slug constraints.
--
-- Older databases were created with `slug text not null unique` on modules /
-- lessons, which makes a GLOBAL unique index (modules_slug_key / lessons_slug_key)
-- on slug alone. That breaks two different courses each having, say, a "General"
-- unit. The intended rule is per-parent uniqueness — already provided by the
-- composite indexes. This drops the stray global constraints/indexes.
-- Idempotent and safe to run on a fresh DB (the IF EXISTS clauses no-op).

alter table public.modules drop constraint if exists modules_slug_key;
alter table public.lessons drop constraint if exists lessons_slug_key;
drop index if exists public.modules_slug_key;
drop index if exists public.lessons_slug_key;

-- Make sure the correct composite uniques exist.
create unique index if not exists modules_track_slug_key
  on public.modules (track_id, slug);
create unique index if not exists lessons_module_slug_key
  on public.lessons (module_id, slug);
