import { DUTCH_FLAG_PROBLEMS } from "@/components/dsa/two-pointers/dutch-flag/problems";
import { FAST_SLOW_PROBLEMS } from "@/components/dsa/two-pointers/fast-slow/problems";
import { THREE_SUM_PROBLEMS } from "@/components/dsa/two-pointers/three-sum/problems";
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
  "fast-slow": { problems: FAST_SLOW_PROBLEMS, stageMinHeight: "13rem" },
  "dutch-flag": { problems: DUTCH_FLAG_PROBLEMS, stageMinHeight: "15rem" },
  "three-sum": { problems: THREE_SUM_PROBLEMS, stageMinHeight: "20rem" },
};
