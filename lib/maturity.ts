import type { Maturity } from "./types";

export interface MaturityMeta {
  label: string;
  /** Solid accent color. */
  color: string;
  /** One-line explanation for tooltips / banners. */
  desc: string;
}

export const MATURITY_META: Record<Maturity, MaturityMeta> = {
  stable: {
    label: "Stable",
    color: "#2f9e44",
    desc: "Reviewed and complete — safe to study.",
  },
  developing: {
    label: "In progress",
    color: "#f08c00",
    desc: "Actively being written — content may still change.",
  },
  draft: {
    label: "Draft",
    color: "#868e96",
    desc: "Early draft — this chapter isn't finished yet.",
  },
};

export const MATURITY_OPTIONS: Maturity[] = ["stable", "developing", "draft"];
export const DEFAULT_MATURITY: Maturity = "draft";

/** Coerce any stored value to a valid maturity (defaults to "draft"). */
export function maturityOf(value: string | null | undefined): Maturity {
  return value === "stable" || value === "developing" ? value : "draft";
}
