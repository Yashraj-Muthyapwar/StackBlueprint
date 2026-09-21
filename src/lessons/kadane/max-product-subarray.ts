import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[] };

const code = `def max_product(arr):
    best_sum = max_prod = min_prod = arr[0]
    for i in range(1, len(arr)):
        x = arr[i]
        choices = (x, max_prod * x, min_prod * x)
        max_prod = max(choices)
        min_prod = min(choices)
        best_sum = max(best_sum, max_prod)
    return best_sum`;

function build({ arr }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty.", pointers: [] });
    return steps;
  }
  let bestSum = arr[0],
    maxProd = arr[0],
    minProd = arr[0];
  const ptrs = (i: number) => [{ name: "i", index: i, color: "amber" as const }];
  const sec = () => ({
    label: "running [max_prod, min_prod, best_sum]",
    array: [maxProd, minProd, bestSum],
  });
  steps.push({
    line: 1,
    array: [...arr],
    pointers: ptrs(0),
    secondary: sec(),
    narration: "Track running max AND min (negatives can flip).",
  });
  for (let i = 1; i < n; i++) {
    const x = arr[i];
    const choices = [x, maxProd * x, minProd * x];
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(i),
      highlight: { kind: "compare", indices: [i] },
      secondary: { label: "choices: x, max_prod*x, min_prod*x", array: choices },
      status: `choices=${JSON.stringify(choices)}`,
      narration: `At i=${i}, value=${x}. Choices: ${choices.join(", ")}.`,
    });
    maxProd = Math.max(...choices);
    minProd = Math.min(...choices);
    if (maxProd > bestSum) bestSum = maxProd;
    steps.push({
      line: 6,
      array: [...arr],
      pointers: ptrs(i),
      secondary: sec(),
      status: `max_prod=${maxProd}, min_prod=${minProd}, best_sum=${bestSum}`,
      narration: `max_prod=${maxProd}, min_prod=${minProd}, best_sum=${bestSum}.`,
    });
  }
  steps.push({
    line: 8,
    array: [...arr],
    status: `return ${bestSum}`,
    narration: `Maximum product = ${bestSum}.`,
    pointers: [],
  });
  return steps;
}

export const maxProduct: LessonBuilder<Inputs> = {
  slug: "max-product-subarray",
  title: "Max Product Subarray",
  subtitle: "A negative flips signs — keep both the running max and the running min.",
  problem:
    "Given an integer array, return the largest product achievable by any contiguous non-empty subarray.",
  spotIt: [
    "'Maximum product of a contiguous subarray' with negatives and zeros in the input.",
    "Sign can flip — you need to track both running max and running min.",
    "Brute force is O(n²); interviewer wants O(n).",
  ],
  avoidWhen: [
    "Array is all non-negative — a simple running product or sliding window suffices.",
    "You need product over arbitrary subsequences — this is DP, not Kadane.",
    "Overflow is a hard constraint — use logs or big integers instead.",
  ],
  variant: "max-product",
  view: "array",
  code,
  defaultInputs: { arr: [2, 3, -2, 4, -1, 2] },
  inputs: [{ key: "arr", label: "Array", kind: "intArray" }],
  validate: ({ arr }) => (arr.length === 0 ? ["Array is empty."] : []),
  build,
};
