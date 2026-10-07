import type { Step } from "../types";

type Block = NonNullable<Step["complexity"]>["blocks"][number];
type Explanation = Pick<Step, "line" | "lineEnd" | "narration" | "proof"> & { formula: string };

/** Three optional steps, opened by the player's Explain complexity button. */
export function withComplexityReview(
  steps: Step[],
  config: {
    n: number;
    checks: number;
    timeBlocks: Block[];
    memoryBlocks: Block[];
    body: Explanation;
    loop: Explanation;
    space: Explanation;
  },
): Step[] {
  const final = steps[steps.length - 1];
  const reviews = [
    {
      title: "1. The work inside one pass: O(1)",
      metric: "time" as const,
      explanation: config.body,
    },
    {
      title: "2. Repeat that work: O(n) total time",
      metric: "time" as const,
      explanation: config.loop,
    },
    {
      title: "3. Reuse the same variables: O(1) space",
      metric: "space" as const,
      explanation: config.space,
    },
  ];
  return [
    ...steps,
    ...reviews.map(({ title, metric, explanation }): Step => {
      const blocks = metric === "time" ? config.timeBlocks : config.memoryBlocks;
      return {
        ...final,
        predict: undefined,
        line: explanation.line,
        lineEnd: explanation.lineEnd,
        narration: explanation.narration,
        proof: explanation.proof,
        status: explanation.formula,
        complexity: {
          title,
          metric,
          blocks,
          activeBlock:
            metric === "space" ? -1 : blocks.findIndex((block) => block.line === explanation.line),
          formula: explanation.formula,
          n: config.n,
          checks: config.checks,
        },
      };
    }),
  ];
}
