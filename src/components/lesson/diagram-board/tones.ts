import type { BoardNode } from "./rules";

/** Component colours, shared by the canvas shapes and the palette previews. */
export const TONES: Record<NonNullable<BoardNode["tone"]>, { stroke: string; fill: string }> = {
  mint: { stroke: "#0f9f7e", fill: "#d1fae5" },
  violet: { stroke: "#7c5cd6", fill: "#ede9fe" },
  amber: { stroke: "#c77a0a", fill: "#fef3c7" },
  muted: { stroke: "#475569", fill: "#f1f5f9" },
  sky: { stroke: "#1971c2", fill: "#d0ebff" },
  rose: { stroke: "#c2255c", fill: "#ffdeeb" },
};
