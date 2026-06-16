"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 or 3
}

/**
 * Scrollspy table of contents. Scans the rendered lesson article for h2/h3
 * headings (section dividers + headings inside text blocks) and highlights the
 * one currently in view.
 */
export function TableOfContents({ articleId }: { articleId: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h2, h3"),
    ).filter((h) => h.id);

    setItems(
      headings.map((h) => ({
        id: h.id,
        text: h.textContent ?? "",
        level: h.tagName === "H3" ? 3 : 2,
      })),
    );

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [articleId]);

  if (items.length === 0) return null;

  function jump(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 90, behavior: "smooth" });
      setActive(id);
      history.replaceState(null, "", `#${id}`);
    }
  }

  return (
    <nav className="text-[13px]">
      <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-tmuted">
        Table of Contents
      </div>
      <ul className="space-y-0.5 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => jump(e, item.id)}
              className={cn(
                "-ml-px block border-l-2 py-1 leading-snug transition-colors",
                item.level === 3 ? "pl-6" : "pl-3",
                active === item.id
                  ? "border-gold font-medium text-gold"
                  : "border-transparent text-tmuted hover:text-tprimary",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
