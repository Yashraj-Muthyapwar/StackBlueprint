import type { Prediction } from "../types";

/** Index range [start, start + len). */
export const span = (start: number, len: number) =>
  Array.from({ length: Math.max(0, len) }, (_, i) => start + i);

/** "+ 7" / "− 2" terms so negative array values still read correctly inside equations. */
export const addTerm = (x: number) => (x < 0 ? `− ${Math.abs(x)}` : `+ ${x}`);
export const subTerm = (x: number) => (x < 0 ? `+ ${Math.abs(x)}` : `− ${x}`);
/** Compact versions for the pills drawn on array cells. */
export const badgeAdd = (x: number) => `${x < 0 ? "−" : "+"}${Math.abs(x)}`;
export const badgeSub = (x: number) => `${x < 0 ? "+" : "−"}${Math.abs(x)}`;

/** "1 + 4 + 1 + 5" for short ranges, "1 + 4 + … + 5" for long ones. */
export function termsExpr(values: number[], sep = "+") {
  if (values.length <= 6) return values.join(` ${sep} `);
  return `${values.slice(0, 3).join(` ${sep} `)} ${sep} … ${sep} ${values[values.length - 1]}`;
}

/**
 * Rotate the correct answer to a different slot each time, so "it's always option 1"
 * never becomes the strategy.
 */
function rotated<T>(items: T[], rotate: number): T[] {
  const k = rotate % items.length;
  return [...items.slice(k), ...items.slice(0, k)];
}

/**
 * Numeric options for "what's the value?". The first entry of `distractors` should be the most
 * tempting wrong answer. Duplicates collapse, and ±1 / +2 fill in if too few distinct slips exist.
 */
export function numberOptions(
  correct: number,
  distractors: number[],
  rotate: number,
): Prediction["options"] {
  const seen = new Set<number>();
  const ordered: number[] = [];
  const add = (v: number) => {
    if (!seen.has(v)) {
      seen.add(v);
      ordered.push(v);
    }
  };
  add(correct);
  distractors.forEach(add);
  for (const d of [correct + 1, correct - 1, correct + 2]) {
    if (ordered.length >= 3) break;
    add(d);
  }
  return rotated(ordered.slice(0, 4), rotate).map((v) => ({ id: String(v), label: String(v) }));
}

/** Labelled options where the first entry is correct. Ids are positional so labels may repeat safely. */
export function labelledOptions(
  labels: string[],
  rotate: number,
): { options: Prediction["options"]; answer: string } {
  const all = labels.map((label, i) => ({ id: `o${i}`, label }));
  return { options: rotated(all, rotate), answer: "o0" };
}

/** Up to `max` build positions to quiz, spread across the array and never the trivial first cell. */
export function spreadIndices(n: number, max: number): Set<number> {
  const picks = [1, Math.floor(n / 2), n - 1, Math.floor((3 * n) / 4)];
  return new Set(picks.filter((i) => i >= 1 && i < n).slice(0, max));
}

/** Bits needed to show every number in `values`, or 0 when they are negative / non-integer / too wide to read. */
export function bitWidth(values: number[], maxBits = 12): number {
  if (values.some((v) => !Number.isInteger(v) || v < 0)) return 0;
  const hi = Math.max(1, ...values);
  const w = Math.max(1, Math.floor(Math.log2(hi)) + 1);
  return w <= maxBits ? w : 0;
}
