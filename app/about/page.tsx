import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { getNavTree, getSessionUser } from "@/lib/data";
import { trackTheme } from "@/lib/trackTheme";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Target,
  BookOpen,
  Users,
} from "@/components/icons";

export const metadata: Metadata = { title: "About" };

const VALUES = [
  {
    icon: Heart,
    title: "Free, forever",
    body: "Every lesson and problem is free. We believe cost should never stand between a student and great math instruction.",
  },
  {
    icon: Target,
    title: "Built for mastery",
    body: "Content is sequenced so each idea builds on the last, with practice and full solutions at every step.",
  },
  {
    icon: BookOpen,
    title: "Curated, not endless",
    body: "We pick the resources and problems that actually move the needle, so you spend time learning — not searching.",
  },
];

export default async function AboutPage() {
  const [tree, user] = await Promise.all([getNavTree(), getSessionUser()]);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3.5 py-1.5 text-[12.5px] font-medium text-tmuted">
            <Users className="h-3.5 w-3.5 text-gold" />
            San Francisco Math Initiative
          </div>
          <h1 className="mt-5 text-[2.8rem] font-extrabold leading-tight tracking-tight text-tprimary">
            Great math instruction,{" "}
            <span className="bg-gradient-to-r from-gold to-purple bg-clip-text text-transparent">
              free for everyone
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16.5px] leading-relaxed text-tmuted">
            San Francisco Math Academy is the free, structured guide of the San
            Francisco Math Initiative — built to give every motivated student a
            clear path through competition and advanced mathematics.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        <div className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-gold">Our mission</div>
        <h2 className="mt-2 text-[2rem] font-extrabold tracking-tight text-tprimary">
          Make the path to advanced math obvious
        </h2>
        <div className="prose-sfma mt-5">
          <p>
            Talented students too often stall — not for lack of ability, but for
            lack of a clear path and quality materials. The best resources are
            scattered across forums, PDFs, and old handouts, and it's hard to
            know what to study next.
          </p>
          <p>
            We built SFMA to fix that. Inspired by the structured, progress-driven
            approach of guides like{" "}
            <a href="https://usaco.guide" target="_blank" rel="noopener noreferrer">usaco.guide</a>{" "}
            in competitive programming, we organize math into clear units and
            chapters, pair every topic with curated practice, and let you track
            your progress on everything you touch.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-surface-2">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="card rounded-2xl p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/12 text-gold">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-[17px] font-bold text-tprimary">{v.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-tmuted">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses recap */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <h2 className="text-center text-[2rem] font-extrabold tracking-tight text-tprimary">What's inside</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-[15px] text-tmuted">
          Three complete courses, each covering every topic on its exam.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {tree.map((t) => {
            const theme = trackTheme(t.slug);
            const chapters = t.modules.reduce((a, m) => a + m.lessons.length, 0);
            return (
              <Link
                key={t.id}
                href={user ? `/learn/${t.slug}` : "/auth"}
                className="hover-lift group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
              >
                <div className="px-6 py-5 text-white" style={{ background: theme.gradient }}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">{theme.tag}</div>
                  <div className="mt-1 text-[1.5rem] font-extrabold tracking-tight">{t.title}</div>
                </div>
                <div className="flex items-center justify-between px-6 py-4 text-[12.5px] text-tmuted">
                  <span>{t.modules.length} units · {chapters} chapters</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-gold" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Links / CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card rounded-2xl p-8">
            <h3 className="text-[18px] font-bold text-tprimary">The Initiative</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-tmuted">
              SFMA is run by the San Francisco Math Initiative. Learn more about
              our programs and live classes:
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a href="https://sfmathacademy.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-semibold text-gold hover:underline">
                sfmathacademy.com <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a href="https://sfmathopen.replit.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-semibold text-gold hover:underline">
                sfmathopen.replit.app <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl p-8 text-white" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
            <div className="dot-grid absolute inset-0 opacity-25" />
            <div className="relative">
              <h3 className="text-[18px] font-bold">Ready to start?</h3>
              <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-white/85">
                Create a free account and begin tracking your progress through
                the guide today.
              </p>
              <Link
                href={user ? "/dashboard" : "/auth"}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-[#1d4ed8] shadow-lg transition-transform hover:-translate-y-0.5"
              >
                {user ? "Go to dashboard" : "Get started"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
