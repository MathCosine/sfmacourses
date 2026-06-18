-- Problem Bank: a hidden track for standalone practice problems that are NOT
-- tied to a teaching chapter. It is excluded from the learner course nav
-- (lib/data.ts → getCourseTree) but its problems appear on /problems and open
-- in the standalone problem workspace. Staff manage it from the admin page just
-- like any other course. Idempotent — run supabase/schema.sql first.

insert into public.tracks (title, slug, description, order_index)
values ('Problem Bank', 'problem-bank', 'Standalone practice problems.', 100)
on conflict (slug) do nothing;

-- A default holding module so staff can start adding problem sets immediately.
insert into public.modules (track_id, title, slug, description, order_index)
select t.id, 'General', 'general', 'Uncategorized problems.', 0
from public.tracks t
where t.slug = 'problem-bank'
on conflict (track_id, slug) do nothing;
