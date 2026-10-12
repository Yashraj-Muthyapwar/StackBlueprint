import { OPPOSITE_ENDS_PROBLEMS } from "@/components/dsa/two-pointers/opposite-ends/problems";

import type { AnyPatternProblem } from "./pattern-canvas-types";

export type ProblemSet = {
  problems: AnyPatternProblem[];
  /** Height of the tallest stage in the set, so switching problems never resizes the canvas. */
  stageMinHeight?: string;
};

/**
 * Problem sets that `pattern-canvas` and `pattern-example` sections can name.
 * Register each pattern lesson's problems here under a stable id.
 */
export const PROBLEM_SETS: Record<string, ProblemSet> = {
  "opposite-ends": { problems: OPPOSITE_ENDS_PROBLEMS, stageMinHeight: "20.5rem" },
};
