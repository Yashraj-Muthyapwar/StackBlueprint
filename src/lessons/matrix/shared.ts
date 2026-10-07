import type { Prediction } from "../types";

export const clone = (m: number[][]) => m.map((r) => [...r]);

/** "(row 1, col 3)" */
export const posLabel = (r: number, c: number) => `(row ${r}, col ${c})`;

/**
 * "Where does it go?" options. The correct position comes first in the input, wrong positions
 * follow, and duplicates (same coordinates) collapse. Returns null when fewer than three distinct
 * options exist, so a lesson can skip a question that would be a coin flip.
 */
export function positionOptions(
  correct: [number, number],
  wrong: [number, number][],
  rotate: number,
): { options: Prediction["options"]; answer: string } | null {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const [r, c] of [correct, ...wrong]) {
    const l = posLabel(r, c);
    if (!seen.has(l)) {
      seen.add(l);
      labels.push(l);
    }
  }
  const picked = labels.slice(0, 4);
  if (picked.length < 3) return null;
  const all = picked.map((label, i) => ({ id: `o${i}`, label }));
  const k = rotate % all.length;
  return { options: [...all.slice(k), ...all.slice(0, k)], answer: "o0" };
}

/** Square matrix check shared by the in-place lessons. */
export const isSquare = (m: number[][]) => m.length > 0 && m.every((r) => r.length === m.length);
