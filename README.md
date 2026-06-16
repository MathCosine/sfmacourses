# San Francisco Math Academy (SFMA)

A free, structured guide to competition mathematics — AMC 8, AMC 10/12, and
AIME. Built with Next.js (App Router), Supabase (auth + data), and KaTeX for
beautifully rendered math.

## Stack

- **Next.js** App Router + TypeScript + Server Components
- **Supabase** for auth, Postgres, and row-level security
- **KaTeX** via a `remark`/`rehype` pipeline (`remark-math` + `rehype-katex`)
- **Tailwind v4** for utilities, with a hand-built dark design system
- No component libraries — every component is written by hand

## Getting started

```bash
npm install
cp .env.example .env.local   # already populated with the project keys
npm run dev
```

Open <http://localhost:3000>.

## Deployment (Vercel)

This is a server-rendered Next.js app (Server Components, Server Actions,
middleware-based auth). It needs a Node server at runtime, so **static hosts
like GitHub Pages cannot run it** — deploy it on Vercel (or any Next.js-capable
host such as Netlify or Cloudflare).

1. Push this repo to GitHub (already done).
2. At <https://vercel.com/new>, **Import** the `sfmacourses` repository. Vercel
   auto-detects Next.js — no build settings to change.
3. Under **Environment Variables**, add the two public keys (same as
   `.env.example`), for all environments:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://vqioilvbdqpmywmppqtg.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_U2nygA2laev0pwVm1wMfYQ_kggTjskv` |

4. Click **Deploy**. You'll get a URL like `https://sfmacourses.vercel.app`.
5. In **Supabase → Authentication → URL Configuration**, set the **Site URL**
   to your Vercel URL and add it under **Redirect URLs**, so signup
   confirmation emails point at the deployed site.

Make sure `supabase/schema.sql` and `supabase/seed.sql` have been run (see
below) before visiting the deployed site, or the content tree will be empty.

> Note: GitHub Pages serves only static files. If you point Pages at this repo
> it will just render this `README.md` — that is expected, not a build error.

## Database

The schema and seed live in `supabase/`:

1. **`supabase/schema.sql`** — creates all tables (`profiles`, `tracks`,
   `modules`, `lessons`, `progress`, `problem_completions`, `announcements`),
   row-level-security policies, a `handle_new_user` trigger that creates a
   profile on signup, and an `is_staff()` helper. Paste it into the Supabase
   SQL editor and run it once.
2. **`supabase/seed.sql`** — six full lessons of real competition-math content
   (two per track). Paste it into the SQL editor after the schema.

Alternatively, seed over the API:

```bash
SUPABASE_SERVICE_ROLE_KEY=... npm run seed
```

Content is authored in `scripts/seed-data.mjs`; `npm run seed:sql` regenerates
`supabase/seed.sql` from it.

### Becoming staff

After signing up, promote yourself in the SQL editor:

```sql
update public.profiles set role = 'staff' where email = 'you@example.com';
```

Staff see an **Edit** button on every lesson and a **Staff Admin** panel
(`/admin`) for managing content, students, and announcements.

## Project layout

```
app/
  page.tsx                              Homepage (no sidebar)
  auth/                                 Sign in / sign up
  dashboard/                            Progress, resume, announcements
  learn/[track]/                        Track overview
  learn/[track]/[module]/[lesson]/      Lesson view (3-column + TOC scrollspy)
  admin/                                Staff: content editor, students, posts
components/                             Sidebar, TOC, block renderers, …
lib/                                    Supabase clients, data access, markdown
scripts/                               Seed data + generators
supabase/                              schema.sql + seed.sql
middleware.ts                          Protects /dashboard, /admin, /learn
```

## Lesson content model

`lessons.content` is a JSONB array of blocks:

```jsonc
[
  { "type": "meta", "author": "…", "frequency": "essential" },
  { "type": "section", "title": "Introduction" },
  { "type": "text", "content": "markdown with $x^2$ and $$\\sum$$" },
  { "type": "resource", "source": "AoPS", "stars": 5, "title": "…", "description": "…", "url": "…" },
  { "type": "problem", "title": "…", "source": "AMC 8 2019 #15", "difficulty": "Easy",
    "statement": "…", "hint": "…", "solution": "…" }
]
```

The optional `meta` block stores lesson-level author/frequency (the `lessons`
table has no dedicated columns for them) and is filtered out of the rendered
content stream.
