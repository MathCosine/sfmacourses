-- Feedback / bug reports. Idempotent and safe to run anytime.
-- Backs the floating "Send feedback" widget (components/FeedbackWidget.tsx)
-- and the /api/feedback route. Until this runs, the widget still works but
-- submissions are rejected with a friendly "not set up yet" message.

begin;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  category text not null default 'bug'
    check (category in ('bug', 'idea', 'content', 'praise', 'other')),
  message text not null,
  path text,
  user_agent text,
  status text not null default 'open'
    check (status in ('open', 'triaged', 'resolved', 'wont_fix')),
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_idx
  on public.feedback (created_at desc);

alter table public.feedback enable row level security;

-- Anyone (even signed-out visitors) may submit feedback...
drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback
  for insert to anon, authenticated with check (true);

-- ...but only staff may read or triage it.
drop policy if exists feedback_select on public.feedback;
create policy feedback_select on public.feedback
  for select to authenticated using (public.is_staff());

drop policy if exists feedback_update on public.feedback;
create policy feedback_update on public.feedback
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

commit;
