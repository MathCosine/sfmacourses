"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import {
  Bug,
  Lightbulb,
  AlertTriangle,
  Heart,
  Send,
  Close,
  ArrowUp,
  MessageCircle,
} from "@/components/icons";

type Category = "bug" | "idea" | "content" | "praise";

const CATEGORIES: {
  id: Category;
  label: string;
  icon: typeof Bug;
  color: string;
}[] = [
  { id: "bug", label: "Bug", icon: Bug, color: "var(--color-danger)" },
  { id: "idea", label: "Idea", icon: Lightbulb, color: "var(--color-gold)" },
  { id: "content", label: "Content fix", icon: AlertTriangle, color: "var(--color-yellow)" },
  { id: "praise", label: "Praise", icon: Heart, color: "var(--color-green)" },
];

/**
 * A fixed bottom-right dock: a "Back to top" button (appears once scrolled) and
 * a "Feedback" button that opens a bug-report / feedback modal. Mounted once,
 * globally, from the root layout — visible on every page.
 */
export function FloatingDock() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard shortcut: Shift+F opens feedback (ignored while typing).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typing) return;
      if (e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2.5 sm:bottom-6 sm:right-6 print:hidden">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className={cn(
            "panel flex h-10 w-10 items-center justify-center rounded-full text-tmuted transition-all duration-300 hover:text-gold",
            scrolled
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0",
          )}
        >
          <ArrowUp className="h-[18px] w-[18px]" />
        </button>

        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-gold py-2.5 pl-3.5 pr-4 text-[13.5px] font-semibold text-white shadow-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-hover"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="hidden sm:inline">Feedback</span>
        </button>
      </div>

      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const pathname = usePathname() || "/";
  const [category, setCategory] = useState<Category>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => textRef.current?.focus(), 60);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    if (sending) return;
    if (message.trim().length < 4) {
      toast("Please add a little more detail.", "error");
      textRef.current?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, email, path: pathname }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (data.ok) {
        toast("Thanks! Your feedback was sent. 🙏", "success");
        onClose();
      } else {
        toast(data.error || "Could not send feedback.", "error");
      }
    } catch {
      toast("Network error — please try again.", "error");
    } finally {
      setSending(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center px-4 pb-4 pt-[10vh] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="menu-pop panel relative w-full max-w-md overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Send feedback"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[16px] font-bold text-tprimary">Send feedback</h2>
            <p className="mt-0.5 text-[12.5px] text-tmuted">
              Found a bug or have an idea? We read every note.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 rounded-lg p-1.5 text-tfaint transition-colors hover:bg-bg hover:text-tprimary"
          >
            <Close className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11.5px] font-semibold transition-all",
                    active
                      ? "border-transparent text-tprimary shadow-sm"
                      : "border-border text-tmuted hover:border-border-strong hover:text-tprimary",
                  )}
                  style={
                    active
                      ? { background: `color-mix(in srgb, ${c.color} 14%, transparent)`, boxShadow: `inset 0 0 0 1.5px ${c.color}` }
                      : undefined
                  }
                >
                  <Icon className="h-[18px] w-[18px]" style={{ color: c.color }} />
                  {c.label}
                </button>
              );
            })}
          </div>

          <textarea
            ref={textRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder={
              category === "bug"
                ? "What happened? What did you expect instead?"
                : category === "content"
                  ? "Which lesson/problem, and what's wrong?"
                  : "Tell us more…"
            }
            className="mt-3 w-full resize-none rounded-xl border border-border bg-bg px-3.5 py-3 text-[14px] text-tprimary outline-none transition-colors placeholder:text-tfaint focus:border-gold"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email (optional — if you'd like a reply)"
            className="mt-2.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-[13.5px] text-tprimary outline-none transition-colors placeholder:text-tfaint focus:border-gold"
          />

          <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-tfaint">
            <span className="truncate">Sending from {pathname}</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5">
          <button
            onClick={onClose}
            className="rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-tmuted transition-colors hover:text-tprimary"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={sending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-[13.5px] font-semibold text-white shadow-accent transition-all hover:bg-gold-hover disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
