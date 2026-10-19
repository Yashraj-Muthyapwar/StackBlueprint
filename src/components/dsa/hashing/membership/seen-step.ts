import type { PatternStep } from "@/components/dsa/shared/pattern-canvas-types";

/** Step data and helpers for the `SeenStage` used by the seen-so-far pattern. */

export type SeenStep = PatternStep & {
  values: number[];
  /** The value being read. Null before the loop starts and after it ends. */
  index: number | null;
  /** The set as it is at this step. */
  seen: number[];
  /** The value just added to the set, drawn with an enter animation. */
  added?: number;
  /** The checked value was already in the set. */
  repeat?: boolean;
  /** Final step: what the function returns. */
  result?: boolean;
};

/** Parses "12, 25, 12" into numbers (0 to 9 values), or returns a message for the learner. */
export function parseValues(raw: string): number[] | string {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length > 9) return "Use at most 9 values so every cell stays readable.";
  const values = parts.map(Number);
  if (values.some((value) => !Number.isInteger(value) || Math.abs(value) > 99))
    return "Use whole numbers between -99 and 99, separated by commas.";
  return values;
}

export const setText = (values: number[]) => `{${values.join(", ")}}`;
