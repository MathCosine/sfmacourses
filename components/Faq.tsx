"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/icons";

export interface FaqItem {
  q: string;
  a: string;
}

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-2xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-bg"
            >
              <span className="text-[15px] font-semibold text-tprimary">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-tmuted transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-[14px] leading-relaxed text-tmuted">{item.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
