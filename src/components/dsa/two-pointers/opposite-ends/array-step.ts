import type { PatternStep } from "@/components/dsa/shared/pattern-canvas-types";

/** Step data and helpers for the opposite-ends `ArrayStage`. */

export type FlowTone = "amber" | "violet" | "mint" | "rose";
export type ArrayItem = { id: number; value: number };

export type ArrayStep = PatternStep & {
  items: ArrayItem[];
  left: number | null;
  right: number | null;
  /** Indices whose values just traded places. */
  swapped?: [number, number];
  /** Indices currently being read. */
  focus?: number[];
  /** Indices finished with, drawn by the stage's `settledStyle`. */
  settled?: number[];
  /** Highlights left and right as the answer. */
  found?: boolean;
  /** Arc between left and right under the array. */
  arc?: { tone: FlowTone; label: string; dashed?: boolean };
  /** Bracket under a range of indices when no arc is shown. */
  bracket?: { from: number; to: number; label: string; tone: FlowTone | "muted" };
  /** Bars view: trapped water above each bar. */
  water?: number[];
};

export const toItems = (values: number[]) => values.map((value, id) => ({ id, value }));
export const listText = (items: ArrayItem[]) => `[${items.map((item) => item.value).join(", ")}]`;
export const range = (from: number, to: number) =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
export const pointerStats = (left: number | null, right: number | null) => [
  { label: "L", value: left ?? "·", tone: "left" as const },
  { label: "R", value: right ?? "·", tone: "right" as const },
];

/** Parses "4, 9, 1" into numbers, or returns a message for the learner. */
export function parseNumberList(raw: string, max: number): number[] | string {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length > max) return `Use at most ${max} values so every cell stays readable.`;
  const values = parts.map(Number);
  if (values.some((value) => !Number.isInteger(value) || Math.abs(value) > 999))
    return "Use whole numbers between -999 and 999, separated by commas.";
  return values;
}
