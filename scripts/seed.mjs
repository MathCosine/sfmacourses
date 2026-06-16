// Seed the SFMA Supabase project with tracks, modules, and lessons.
//
//   node scripts/seed.mjs
//
// Reads credentials from the environment (falling back to the project's
// publishable key). To bypass row-level security, run with the service role:
//
//   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
//
import { createClient } from "@supabase/supabase-js";
import { tracks } from "./seed-data.mjs";

const URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vqioilvbdqpmywmppqtg.supabase.co";
const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_U2nygA2laev0pwVm1wMfYQ_kggTjskv";

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

async function upsertRow(table, match, row) {
  const { data: existing, error: selErr } = await sb
    .from(table)
    .select("id")
    .match(match)
    .maybeSingle();
  if (selErr) throw new Error(`${table} lookup: ${selErr.message}`);

  if (existing) {
    const { error } = await sb.from(table).update(row).eq("id", existing.id);
    if (error) throw new Error(`${table} update: ${error.message}`);
    return existing.id;
  }
  const { data, error } = await sb
    .from(table)
    .insert(row)
    .select("id")
    .single();
  if (error) throw new Error(`${table} insert: ${error.message}`);
  return data.id;
}

async function main() {
  console.log(`Seeding ${URL}`);
  for (const t of tracks) {
    const trackId = await upsertRow(
      "tracks",
      { slug: t.slug },
      {
        title: t.title,
        slug: t.slug,
        description: t.description,
        order_index: t.order_index,
      },
    );
    console.log(`  track: ${t.title}`);

    for (const m of t.modules) {
      const moduleId = await upsertRow(
        "modules",
        { track_id: trackId, slug: m.slug },
        {
          track_id: trackId,
          title: m.title,
          slug: m.slug,
          description: m.description,
          order_index: m.order_index,
        },
      );
      console.log(`    module: ${m.title}`);

      for (const l of m.lessons) {
        const content = [
          { type: "meta", author: l.author, frequency: l.frequency },
          ...l.blocks,
        ];
        await upsertRow(
          "lessons",
          { module_id: moduleId, slug: l.slug },
          {
            module_id: moduleId,
            title: l.title,
            slug: l.slug,
            content,
            order_index: l.order_index,
          },
        );
        console.log(`      lesson: ${l.title} (${l.blocks.length} blocks)`);
      }
    }
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
