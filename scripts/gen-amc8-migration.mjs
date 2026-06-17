// Generate supabase/add-amc8-lessons.sql — inserts ONLY the two new AMC 8
// Day 1 lessons, leaving every other (possibly admin-edited) lesson untouched.
//
//   node scripts/gen-amc8-migration.mjs
//
// Paste the output into the Supabase SQL editor. Idempotent (upsert by slug);
// requires supabase/schema.sql to have been run first.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tracks } from "./seed-data.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../supabase/add-amc8-lessons.sql");

const WANT = new Set([
  "divisibility-factorization-gcd-lcm",
  "counting-methods",
]);

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const json = (obj) => `${q(JSON.stringify(obj))}::jsonb`;

const lines = [
  "-- Adds two AMC 8 lessons (Divisibility/Factorization/GCD/LCM and Counting",
  "-- Methods) without touching any other lesson. Idempotent. Run schema.sql first.",
  "begin;",
  "",
];

for (const t of tracks) {
  for (const m of t.modules) {
    for (const l of m.lessons) {
      if (!WANT.has(l.slug)) continue;
      const content = [
        { type: "meta", author: l.author, frequency: l.frequency },
        ...l.blocks,
      ];
      const moduleRef =
        `(select id from modules where slug = ${q(m.slug)} ` +
        `and track_id = (select id from tracks where slug = ${q(t.slug)}))`;
      lines.push(
        `-- ${t.title} › ${m.title} › ${l.title}`,
        `insert into lessons (module_id, title, slug, content, order_index)`,
        `values (${moduleRef}, ${q(l.title)}, ${q(l.slug)}, ${json(content)}, ${l.order_index})`,
        `on conflict (module_id, slug) do update set`,
        `  title = excluded.title, content = excluded.content, order_index = excluded.order_index;`,
        "",
      );
    }
  }
}

lines.push("commit;", "");

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out}`);
