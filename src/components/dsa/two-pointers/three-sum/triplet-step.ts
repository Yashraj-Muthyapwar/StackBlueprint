import type { PatternStep } from "@/components/dsa/shared/pattern-canvas-types";

/** Step data and helpers for the 3-Sum `TripletStage`. */

export type TripletStep = PatternStep & {
  /** The array as the algorithm sees it (sorted once the sort step has run). */
  values: number[];
  /** The fixed number. Null before the loop starts and after it ends. */
  i: number | null;
  left: number | null;
  right: number | null;
  /** The sum of the three selected values, drawn under the array. */
  total?: { label: string; tone: "amber" | "mint" };
  /** The three selected values just matched; highlight them as a triplet. */
  found?: boolean;
  /** Indices the algorithm is passing over because they repeat the previous value. */
  skipped?: number[];
  /** Triplets saved so far. */
  results: number[][];
  /** Final step: the loop is over and the result is returned. */
  done?: boolean;
};

/** Parses "4, 9, 1" into numbers, or returns a message for the learner. */
export function parseNumberList(raw: string, min: number, max: number): number[] | string {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < min) return `Enter at least ${min} whole numbers, separated by commas.`;
  if (parts.length > max) return `Use at most ${max} values so every cell stays readable.`;
  const values = parts.map(Number);
  if (values.some((value) => !Number.isInteger(value) || Math.abs(value) > 99))
    return "Use whole numbers between -99 and 99, separated by commas.";
  return values;
}

export const triplet = (values: number[]) => `[${values.join(", ")}]`;
export const tripletList = (results: number[][]) => `[${results.map(triplet).join(", ")}]`;
