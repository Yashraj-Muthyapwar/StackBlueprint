import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[] };

const code = `def max_product(arr):
    best = cur_max = cur_min = arr[0]
    for i in range(1, len(arr)):
        x = arr[i]
        choices = (x, cur_max * x, cur_min * x)
        cur_max = max(choices)
        cur_min = min(choices)
        best = max(best, cur_max)
    return best`;

function build({ arr }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty.", pointers: [] });
    return steps;
  }
  let best = arr[0],
    cMax = arr[0],
    cMin = arr[0];
  const ptrs = (i: number) => [{ name: "i", index: i, color: "amber" as const }];
  const sec = () => ({ label: "running [cur_max, cur_min, best]", array: [cMax, cMin, best] });
  steps.push({ line: 1, array: [...arr], pointers: ptrs(0), secondary: sec(), narration: "Track running max AND min (negatives can flip)." });
  for (let i = 1; i < n; i++) {
    const x = arr[i];
    const choices = [x, cMax * x, cMin * x];
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(i),
      highlight: { kind: "compare", indices: [i] },
      secondary: { label: "choices: x, cur_max*x, cur_min*x", array: choices },
      status: `choices=${JSON.stringify(choices)}`,
      narration: `At i=${i}, value=${x}. Choices: ${choices.join(", ")}.`,
    });
    cMax = Math.max(...choices);
    cMin = Math.min(...choices);
    if (cMax > best) best = cMax;
    steps.push({
      line: 6,
      array: [...arr],
      pointers: ptrs(i),
      secondary: sec(),
      status: `cur_max=${cMax}, cur_min=${cMin}, best=${best}`,
      narration: `cur_max=${cMax}, cur_min=${cMin}, best=${best}.`,
    });
  }
  steps.push({ line: 8, array: [...arr], status: `return ${best}`, narration: `Maximum product = ${best}.`, pointers: [] });
  return steps;
}

export const maxProduct: LessonBuilder<Inputs> = {
  slug: "max-product-subarray",
  title: "Max Product Subarray",
  subtitle: "A negative flips signs — keep both the running max and the running min.",
  problem: "Given an integer array, return the largest product achievable by any contiguous non-empty subarray.",
  spotIt: [
    "'Maximum product of a contiguous subarray' with negatives and zeros in the input.",
    "Sign can flip \u2014 you need to track both running max and running min.",
    "Brute force is O(n\u00b2); interviewer wants O(n).",
  ],
  avoidWhen: [
    "Array is all non-negative \u2014 a simple running product or sliding window suffices.",
    "You need product over arbitrary subsequences \u2014 this is DP, not Kadane.",
    "Overflow is a hard constraint \u2014 use logs or big integers instead.",
  ],
  variant: "max-product",
  view: "array",
  code,
  defaultInputs: { arr: [2, 3, -2, 4, -1, 2] },
  inputs: [{ key: "arr", label: "Array", kind: "intArray" }],
  validate: ({ arr }) => (arr.length === 0 ? ["Array is empty."] : []),
  build,
};
