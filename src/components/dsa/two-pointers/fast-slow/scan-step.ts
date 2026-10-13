import type { PatternStep } from "@/components/dsa/shared/pattern-canvas-types";

/** Step data and helpers for the same-direction `ScanStage`. */

export type ScanTone = "amber" | "violet" | "rose";

export type ScanStep = PatternStep & {
  values: number[];
  /** Slow pointer: the recorder. */
  slow: number | null;
  /** Fast pointer: the scout. */
  fast: number | null;
  /** Last index of the kept prefix (-1 when nothing is kept yet). */
  prefixEnd: number;
  /** Label under the kept prefix, e.g. "unique prefix". */
  prefixLabel: string;
  /** A comparison between fast and another index, drawn as a dashed arc. */
  compare?: { with: number; label: string; tone: "amber" | "rose" };
  /** A copy from fast into another index, drawn as a solid arc. */
  write?: { to: number; label: string };
  /** Index that just received a new value. */
  written?: number;
  /** Final step: values after the prefix are leftovers. */
  done?: boolean;
};

/** Parses "4, 9, 1" into numbers, or returns a message for the learner. */
export function parseNumberList(raw: string, max: number): number[] | string {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return "Enter at least one whole number.";
  if (parts.length > max) return `Use at most ${max} values so every cell stays readable.`;
  const values = parts.map(Number);
  if (values.some((value) => !Number.isInteger(value) || Math.abs(value) > 999))
    return "Use whole numbers between -999 and 999, separated by commas.";
  return values;
}

export const isSorted = (values: number[]) => values.every((v, i) => i === 0 || values[i - 1] <= v);

export const listText = (values: number[]) => `[${values.join(", ")}]`;
