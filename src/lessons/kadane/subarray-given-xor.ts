import type { BitRow, LessonBuilder, PracticeProblem, Prediction, Step } from "../types";
import { bitWidth, numberOptions } from "../prefix/shared";

type Inputs = { arr: number[]; k: number };

/** Predict mode asks at most this many questions: one "what do we look up?" plus a few "how many?". */
const MAX_COUNT_PREDICTIONS = 3;

const practiceLadder: PracticeProblem[] = [
  {
    name: "XOR Queries of a Subarray",
    difficulty: "medium",
    hint: "The prefix XOR array on its own. Get range XOR as prefix[right + 1] ^ prefix[left] before adding the hash map.",
    link: "https://leetcode.com/problems/xor-queries-of-a-subarray/",
  },
  {
    name: "Subarray Sum Equals K",
    difficulty: "medium",
    hint: "The sum twin of this lesson: look up prefix − k instead of prefix ^ k. Same map, same one pass.",
    link: "https://leetcode.com/problems/subarray-sum-equals-k/",
  },
  {
    name: "Count Triplets That Can Form Two Arrays of Equal XOR",
    difficulty: "medium",
    hint: "k = 0 here: equal prefix values bound a subarray with XOR 0, and each pair gives several triplets. Count the gap, not just the pair.",
    link: "https://leetcode.com/problems/count-triplets-that-can-form-two-arrays-of-equal-xor/",
  },
  {
    name: "Contiguous Array",
    difficulty: "medium",
    hint: "Map 0 to −1 and the question becomes 'longest subarray with sum 0'. Store the FIRST index of each prefix, not a count, because you want the longest.",
    link: "https://leetcode.com/problems/contiguous-array/",
  },
  {
    name: "Find the Longest Substring Containing Vowels in Even Counts",
    difficulty: "medium",
    hint: "Prefix XOR over a 5-bit parity mask. Two equal masks bound a substring where every vowel count is even. First-seen index again.",
    link: "https://leetcode.com/problems/find-the-longest-substring-containing-vowels-in-even-counts/",
  },
  {
    name: "Number of Wonderful Substrings",
    difficulty: "medium",
    hint: "Parity mask over 10 letters, but now at most one bit may be odd. For each prefix, look up the same mask plus the 10 masks that differ in exactly one bit.",
    link: "https://leetcode.com/problems/number-of-wonderful-substrings/",
  },
  {
    name: "Maximum XOR of Two Numbers in an Array",
    difficulty: "medium",
    hint: "Applied to prefix XORs, this is 'maximum XOR subarray'. The hash map no longer works: you want the best partner, not an exact one. Use a binary trie.",
    link: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
  },
];

// 1-based line numbers, matching the code pane.
const code = `def count_subarrays_xor(arr, k):
    prefix = 0
    seen = {0: 1}
    count = 0
    for v in arr:
        prefix ^= v
        need = prefix ^ k
        count += seen.get(need, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count`;

const TRACK_LABEL = "prefix[j] = XOR of every cell left of boundary j";

function build({ arr, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({
      line: 2,
      array: [],
      pointers: [],
      narration: "The array is empty, so there are no subarrays.",
    });
    return steps;
  }

  // Dry run: every prefix value, the lookup count at each step, and the binary width for the bit view.
  const full: number[] = [0];
  for (let i = 0; i < n; i++) full.push(full[i] ^ arr[i]);
  const W = bitWidth([...arr, k, ...full]);
  const bitsView = (rows: BitRow[]) => (W > 0 ? { width: W, rows } : undefined);

  const adds: number[] = [];
  {
    const m = new Map<number, number>([[0, 1]]);
    for (let i = 0; i < n; i++) {
      adds.push(m.get(full[i + 1] ^ k) ?? 0);
      m.set(full[i + 1], (m.get(full[i + 1]) ?? 0) + 1);
    }
  }
  // Quiz the lookup rule at the first step, then the counting at the steps where something is actually found.
  const askRule = 0;
  const askCount = new Set(
    adds
      .map((a, i) => ({ a, i }))
      .filter(({ a, i }) => a > 0 && i !== askRule)
      .sort((x, y) => y.a - x.a || x.i - y.i)
      .slice(0, MAX_COUNT_PREDICTIONS)
      .map(({ i }) => i),
  );

  const seen = new Map<number, number>([[0, 1]]);
  // Boundaries (prefix positions) that hold each prefix value, so matches can be drawn on the array.
  const where = new Map<number, number[]>([[0, [0]]]);
  const P: (number | null)[] = new Array(n + 1).fill(null);
  P[0] = 0;
  let count = 0;
  const found: string[] = [];

  const track = (marks: NonNullable<Step["track"]>["marks"] = []) => ({
    label: TRACK_LABEL,
    values: [...P],
    marks,
  });
  const seenStrip = (hi?: number[], kind: "match" | "compare" = "match") => ({
    label: `seen (prefix × boundaries holding it)  ·  count = ${count}`,
    array: [...seen.entries()].map(([key, v]) => `${key}×${v}`),
    highlight: hi && hi.length > 0 ? { kind, indices: hi } : undefined,
  });
  const foundStrip = () =>
    found.length > 0 ? { label: "subarrays found (inclusive)", array: [...found] } : undefined;
  const indexOfKey = (key: number) => [...seen.keys()].indexOf(key);

  steps.push({
    line: 2,
    lineEnd: 4,
    array: [...arr],
    pointers: [],
    track: track([{ index: 0, tone: "violet" }]),
    secondary: seenStrip([0]),
    status: `looking for subarrays with XOR = ${k}`,
    narration: `We want every subarray whose XOR is ${k}. Start with seen = {0: 1}: the empty prefix before index 0 has XOR 0, and it has been seen once.`,
    proof:
      "arr[j..i] has XOR k exactly when prefix[i + 1] ^ prefix[j] = k, which means prefix[j] = prefix[i + 1] ^ k. So instead of trying every start j, look up one value in a map.",
  });

  for (let i = 0; i < n; i++) {
    const v = arr[i];
    const old = full[i];
    const prefix = full[i + 1];
    const need = prefix ^ k;
    const add = adds[i];
    P[i + 1] = prefix;
    const js = where.get(need) ?? [];
    const tail = i + 1; // boundary index of the new prefix

    const bitRows = (needValue: number | null): BitRow[] => [
      { label: "prefix", value: prefix, tone: "mint" },
      { label: "k", value: k, op: "^", tone: "amber" },
      { label: "need", value: needValue, result: true, tone: "violet" },
    ];

    const wantAsk = i === askRule || askCount.has(i);
    if (wantAsk) {
      const ruleQuestion = i === askRule;
      const predict: Prediction = ruleQuestion
        ? {
            question: `The prefix XOR is now ${prefix} and k = ${k}. Which earlier prefix value should we look up in seen?`,
            // The sum version's rule (prefix − k) is the tempting slip.
            options: numberOptions(need, [prefix - k, prefix + k, k], 1),
            answer: String(need),
            line: 5,
          }
        : {
            question: `The prefix XOR is ${prefix}, so we need an earlier prefix equal to ${need}. Look at the seen map: how many subarrays ending at index ${i} have XOR ${k}?`,
            options: numberOptions(add, [add + 1, add === 0 ? 1 : 0, Math.max(0, add - 1)], i),
            answer: String(add),
            line: 5,
          };
      steps.push({
        line: 6,
        array: [...arr],
        pointers: [{ name: "i", index: i, color: "amber" }],
        highlight: { kind: "compare", indices: [i] },
        badges: [{ index: i, text: `^${v}`, tone: "mint" }],
        track: track([
          { index: i, tone: "amber", sign: "^" },
          { index: tail, tone: "mint" },
        ]),
        bits: bitsView(bitRows(ruleQuestion ? null : need)),
        secondary: seenStrip(),
        status: `prefix = ${old} ^ ${v} = ${prefix}`,
        narration: ruleQuestion
          ? `XOR the new element into the prefix: ${old} ^ ${v} = ${prefix}. A subarray ending here has XOR k exactly when the prefix at its start equals prefix ^ k = ${prefix} ^ ${k} = ${need}.`
          : `We need prefix ^ k = ${prefix} ^ ${k} = ${need}. The map says ${need} has been seen ${add} time${add === 1 ? "" : "s"}, and each earlier boundary holding it starts one valid subarray that ends at index ${i}.`,
        proof: ruleQuestion
          ? "For sums the lookup is prefix − k. XOR undoes itself instead of subtracting, so the lookup is prefix ^ k."
          : "Each time a value was seen, a different earlier boundary held it. Every one of them pairs with the current boundary to give a subarray whose XOR is k.",
        predict,
      });
    }

    // Lookup step: highlight the entry in seen and the matching boundaries on the track.
    count += add;
    js.forEach((j) => found.push(`[${j}..${i}]`));
    const marks = [
      ...js.map((j) => ({ index: j, tone: "rose" as const, sign: "=" })),
      { index: tail, tone: "mint" as const },
    ];
    steps.push({
      line: 7,
      lineEnd: 8,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "amber" }],
      partitions: js.map((j) => ({
        from: j,
        to: i,
        tone: "mid" as const,
        label: js.length === 1 ? `xor = ${k}` : undefined,
      })),
      badges: [{ index: i, text: `^${v}`, tone: "mint" }],
      track: track(marks),
      bits: bitsView(bitRows(need)),
      secondary: seenStrip(indexOfKey(need) >= 0 ? [indexOfKey(need)] : []),
      secondary2: foundStrip(),
      status: `need = ${prefix} ^ ${k} = ${need},  seen ${add}×  →  count = ${count}`,
      narration:
        add === 0
          ? `Nobody has prefix ${need} yet, so no subarray ending at index ${i} has XOR ${k}. count stays ${count}.`
          : `prefix ${need} appears ${add} time${add === 1 ? "" : "s"} in seen, so ${add} subarray${add === 1 ? "" : "s"} ending at index ${i} ${add === 1 ? "has" : "have"} XOR ${k}: ${js.map((j) => `arr[${j}..${i}]`).join(" and ")}. count = ${count}.`,
      proof:
        add > 0 && !wantAsk
          ? `The boundary${js.length === 1 ? "" : "s"} at ${js.join(" and ")} hold${js.length === 1 ? "s" : ""} prefix ${need}. XOR-ing the two prefixes cancels everything left of the start, leaving exactly the subarray's XOR: ${need} ^ ${prefix} = ${k}.`
          : undefined,
    });

    // Insert step: record the new prefix for later elements to find.
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
    where.set(prefix, [...(where.get(prefix) ?? []), tail]);
    steps.push({
      line: 9,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "amber" }],
      track: track([{ index: tail, tone: "mint" }]),
      bits: bitsView(bitRows(need)),
      secondary: seenStrip([indexOfKey(prefix)], "compare"),
      secondary2: foundStrip(),
      status: `seen[${prefix}] = ${seen.get(prefix)}`,
      narration: `Record the boundary: seen[${prefix}] is now ${seen.get(prefix)}. Later elements can pair with this boundary as the start of a subarray.`,
    });
  }

  steps.push({
    line: 10,
    array: [...arr],
    pointers: [],
    partitions: foundBands(found),
    track: track(),
    secondary: seenStrip(),
    secondary2: foundStrip(),
    status: `return ${count}`,
    narration:
      count > 0
        ? `Return ${count}: ${found.join(", ")} all have XOR ${k}.`
        : `Return 0: no subarray has XOR ${k}.`,
    proof:
      "One pass and one map: O(n) time, O(n) space. Trying every subarray is O(n²). To find the LONGEST such subarray, store the first index of each prefix instead of a count.",
  });
  return steps;
}

/** Bands for every found subarray, unlabelled so they can overlap without text colliding. */
function foundBands(found: string[]) {
  return found.map((f) => {
    const [from, to] = f.slice(1, -1).split("..").map(Number);
    return { from, to, tone: "mid" as const };
  });
}

export const subarrayGivenXor: LessonBuilder<Inputs> = {
  slug: "subarray-given-xor",
  title: "Subarrays with Given XOR",
  subtitle: "If prefix XOR up to i is P, count earlier prefixes equal to P ^ k.",
  problem:
    "Given an array and an integer k, count the number of contiguous subarrays whose XOR equals k.",
  spotIt: [
    "'Count / find subarrays whose XOR equals K'.",
    "Range XOR + hash map of prefix XOR counts.",
    "Variants: 'subarrays with sum K' (same trick with sums).",
  ],
  avoidWhen: [
    "K is not fixed and changes per query — preprocess differently.",
    "You need the longest such subarray and there are duplicates — store first-seen index, not counts.",
    "Aggregation isn't invertible (AND / OR) — the prefix trick breaks.",
  ],
  practiceLadder,
  variant: "subarray-xor",
  view: "array",
  code,
  defaultInputs: { arr: [4, 2, 2, 6, 4], k: 6 },
  inputs: [
    { key: "arr", label: "Array (non-negative ints)", kind: "intArray" },
    { key: "k", label: "Target XOR k", kind: "int" },
  ],
  validate: ({ arr, k }) => {
    const w: string[] = [];
    if (arr.some((v) => v < 0) || k < 0)
      w.push("Use non-negative ints for XOR in this demo. The binary view is hidden otherwise.");
    if (arr.some((v) => !Number.isInteger(v)) || !Number.isInteger(k))
      w.push("XOR needs whole numbers, so decimals are truncated in this demo.");
    return w;
  },
  build,
};
