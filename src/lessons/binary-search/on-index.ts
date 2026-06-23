import type { LessonBuilder, Step } from "../types";
import { isSortedAsc } from "../util";

type Inputs = { arr: number[]; target: number };

const code = `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;

function build({ arr, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array.", pointers: [] });
    return steps;
  }
  let lo = 0,
    hi = n - 1;
  const ptrs = (mid?: number): import("../types").Pointer[] => {
    const out: import("../types").Pointer[] = [
      { name: "lo", index: lo, color: "mint", placement: "above" },
      { name: "hi", index: hi, color: "amber", placement: "above" },
    ];
    if (mid !== undefined) out.push({ name: "mid", index: mid, color: "violet", placement: "below" });
    return out;
  };
  const partFor = (): Step["partitions"] => (lo <= hi ? [{ from: lo, to: hi, tone: "mid", label: "search" }] : []);

  steps.push({ line: 1, array: [...arr], pointers: ptrs(), partitions: partFor(), narration: `Search for ${target}.` });

  let safety = 0;
  while (lo <= hi && safety++ < 50) {
    const mid = (lo + hi) >> 1;
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(mid),
      partitions: partFor(),
      highlight: { kind: "compare", indices: [mid] },
      status: `mid=${mid}, arr[mid]=${arr[mid]}`,
      narration: `mid = (${lo}+${hi})/2 = ${mid}, value ${arr[mid]}.`,
    });
    if (arr[mid] === target) {
      steps.push({
        line: 5,
        array: [...arr],
        pointers: ptrs(mid),
        highlight: { kind: "match", indices: [mid] },
        status: `return ${mid}`,
        narration: `Found at index ${mid}.`,
      });
      return steps;
    }
    if (arr[mid] < target) {
      lo = mid + 1;
      steps.push({ line: 7, array: [...arr], pointers: ptrs(), partitions: partFor(), narration: `arr[mid] < target — discard left half, lo = ${lo}.` });
    } else {
      hi = mid - 1;
      steps.push({ line: 9, array: [...arr], pointers: ptrs(), partitions: partFor(), narration: `arr[mid] > target — discard right half, hi = ${hi}.` });
    }
  }
  steps.push({ line: 10, array: [...arr], pointers: [], status: "return -1", narration: "Range collapsed — target not present." });
  return steps;
}

export const bsearchIndex: LessonBuilder<Inputs> = {
  slug: "on-index",
  title: "Binary Search on Index",
  subtitle: "Search a sorted array by halving the index range each step.",
  problem: "Given a sorted array and a target value, return the index of the target if present, otherwise -1, in O(log n) time.",
  spotIt: [
    "Sorted array (or rotated sorted) and a target / boundary lookup.",
    "Required complexity is O(log n).",
    "Phrases: 'first / last occurrence', 'insertion position', 'peak element'.",
  ],
  avoidWhen: [
    "Data is unsorted and sorting costs more than the queries save.",
    "You need every match \u2014 a linear scan is simpler.",
    "Comparator isn't monotonic across the index \u2014 binary search will miss the answer.",
  ],
  variant: "bsearch-index",
  view: "array",
  code,
  defaultInputs: { arr: [1, 3, 4, 7, 11, 15, 19, 24, 30], target: 15 },
  inputs: [
    { key: "arr", label: "Array (sorted)", kind: "intArray" },
    { key: "target", label: "Target", kind: "int" },
  ],
  validate: ({ arr }) => (isSortedAsc(arr) ? [] : ["Binary search requires a sorted array. On unsorted data it returns wrong indices or -1."]),
  build,
};
