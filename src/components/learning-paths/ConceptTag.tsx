import { Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Marks a lesson that teaches a way of thinking instead of a pattern with its own algorithm.
 * Used in lesson headers and on track cards so concept lessons read as different from patterns.
 */
export function ConceptTag({
  label = "Concept",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-violet/40 bg-violet/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-violet",
        className,
      )}
    >
      <Lightbulb className="size-3" aria-hidden />
      {label}
    </span>
  );
}
