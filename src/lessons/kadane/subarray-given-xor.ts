import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; k: number };

const code = `def count_subarrays_xor(arr, k):
    prefix = 0
    seen = {0: 1}
    count = 0
    for i, v in enumerate(arr):
        prefix ^= v
        need = prefix ^ k
        count += seen.get(need, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count`;

function build({ arr, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const seen = new Map<number, number>([[0, 1]]);
  let prefix = 0;
  let count = 0;
  const sec = (extra: string) => ({
    label: `seen map · ${extra}`,
    array: [...seen.entries()].map(([key, v]) => `${key}:${v}`),
  });

  steps.push({ line: 3, array: [...arr], pointers: [], secondary: sec(`count=${count}`), narration: `Looking for subarrays with XOR = ${k}.` });
  for (let i = 0; i < arr.length; i++) {
    prefix ^= arr[i];
    const need = prefix ^ k;
    const add = seen.get(need) ?? 0;
    count += add;
    steps.push({
      line: 5,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: sec(`prefix=${prefix}, need=${need}, +${add} → count=${count}`),
      status: `prefix=${prefix}, need=${need}, +${add}`,
      narration: `XOR prefix=${prefix}. Need ${need} previously seen ${add} time(s) → count += ${add}.`,
    });
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }
  steps.push({ line: 8, array: [...arr], status: `return ${count}`, narration: `Total subarrays with XOR ${k}: ${count}.`, pointers: [] });
  return steps;
}

export const subarrayGivenXor: LessonBuilder<Inputs> = {
  slug: "subarray-given-xor",
  title: "Subarrays with Given XOR",
  subtitle: "If prefix XOR up to i is P, count earlier prefixes equal to P ^ k.",
  variant: "subarray-xor",
  view: "array",
  code,
  defaultInputs: { arr: [4, 2, 2, 6, 4], k: 6 },
  inputs: [
    { key: "arr", label: "Array (non-negative ints)", kind: "intArray" },
    { key: "k", label: "Target XOR k", kind: "int" },
  ],
  validate: ({ arr }) => (arr.some((v) => v < 0) ? ["Use non-negative ints for XOR in this demo."] : []),
  build,
};
