import type { PatternStep } from "@/components/dsa/shared/pattern-canvas-types";

/** Step data and helpers for the Dutch National Flag `FlagStage`. */

export type RegionLabel = { short: string; long: string };

export type FlagStep = PatternStep & {
  values: number[];
  /** Next position for a value of the first group. */
  low: number;
  /** The element being examined. */
  mid: number;
  /** Next position for a value of the last group. */
  high: number;
  /** Indices whose values just traded places (equal when a value swaps with itself). */
  swapped?: [number, number];
  /** Label on the swap arc, e.g. "2 ⇄ 0". */
  swapLabel?: string;
  /** Names of the three finished regions, short for one-cell regions and long otherwise. */
  regionLabels: { zeros: RegionLabel; ones: RegionLabel; twos: RegionLabel };
  /** Final step: no unknown elements are left. */
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

export const listText = (values: number[]) => `[${values.join(", ")}]`;
