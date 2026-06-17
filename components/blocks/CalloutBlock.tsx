import type { CalloutVariant } from "@/lib/types";
import { CALLOUT_LABELS } from "@/lib/types";
import {
  ScrollText,
  Lightbulb,
  Beaker,
  BookOpen,
  Info,
  AlertTriangle,
} from "@/components/icons";

const VARIANT_ICON: Record<CalloutVariant, typeof Info> = {
  theorem: ScrollText,
  "big-idea": Lightbulb,
  recipe: Beaker,
  example: BookOpen,
  info: Info,
  warning: AlertTriangle,
};

export interface PreparedCallout {
  variant: CalloutVariant;
  label: string;
  html: string;
}

/**
 * A styled "environment" box — theorem, big idea, recipe, example, note, or
 * warning. Each variant has its own accent color, icon and label, set in
 * globals.css via the `.env-<variant>` class.
 */
export function CalloutBlock({ block }: { block: PreparedCallout }) {
  const Icon = VARIANT_ICON[block.variant] ?? Info;
  return (
    <div className={`env env-${block.variant}`}>
      <div className="env-head">
        <span className="env-badge">
          <Icon className="h-[15px] w-[15px]" />
        </span>
        <span className="env-label">{block.label || CALLOUT_LABELS[block.variant]}</span>
      </div>
      <div
        className="prose-sfma env-body"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    </div>
  );
}
