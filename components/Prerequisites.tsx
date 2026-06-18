import Link from "next/link";
import type { LessonLink } from "@/lib/data";
import { Milestone, ArrowRight, Link2 } from "@/components/icons";

/**
 * Recommended-prerequisites box shown near the top of a lesson. Renders any
 * free-text topics (pre-rendered markdown) and links to prerequisite chapters
 * from anywhere on the site.
 */
export function Prerequisites({
  noteHtml,
  links,
}: {
  noteHtml: string;
  links: LessonLink[];
}) {
  if (!noteHtml && links.length === 0) return null;

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface-2">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <Milestone className="h-4 w-4 text-gold" />
        <span className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-tprimary">
          Before you start
        </span>
        <span className="text-[12px] text-tfaint">Recommended prerequisites</span>
      </div>

      <div className="px-5 py-4">
        {noteHtml && (
          <div
            className="prose-sfma text-[14.5px]"
            dangerouslySetInnerHTML={{ __html: noteHtml }}
          />
        )}

        {links.length > 0 && (
          <div className={noteHtml ? "mt-4" : ""}>
            <div className="grid gap-2 sm:grid-cols-2">
              {links.map((l) => (
                <Link
                  key={l.id}
                  href={l.href}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5 transition-colors hover:border-gold/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/12 text-gold">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-tprimary group-hover:text-gold">
                      {l.title}
                    </span>
                    <span className="block truncate text-[11.5px] text-tmuted">
                      {l.trackTitle} · {l.moduleTitle}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-tfaint transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
