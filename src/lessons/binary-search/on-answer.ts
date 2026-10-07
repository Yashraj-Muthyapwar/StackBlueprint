import type { LessonBuilder, Partition, PracticeProblem, Prediction, Step } from "../types";
import { labelledOptions, numberOptions } from "../prefix/shared";
import { lineOf, maxProbes } from "./shared";

type Mode = "sqrt" | "bananas" | "ship";
type Inputs = { mode: Mode; x: number; arr: number[]; limit: number };

/** Predict mode: one "what does the check compute?" question, then up to this many "which side?" questions. */
const MAX_DIRECTION_PREDICTIONS = 3;
/** The answer space is drawn cell by cell, so keep it readable. */
const MAX_SPACE = 80;

const practiceLadder: PracticeProblem[] = [
  {
    name: "Sqrt(x)",
    difficulty: "easy",
    hint: "The first mode of this lesson. Why is the answer space [0, x], and why is 'k * k <= x' monotonic?",
    link: "https://leetcode.com/problems/sqrtx/",
  },
  {
    name: "Guess Number Higher or Lower",
    difficulty: "easy",
    hint: "The feasibility check is given to you as an API. Binary search the answer space [1, n] and trust the hint.",
    link: "https://leetcode.com/problems/guess-number-higher-or-lower/",
  },
  {
    name: "Koko Eating Bananas",
    difficulty: "medium",
    hint: "The second mode of this lesson. Write feasible(speed) first, then wrap it in the template. Watch the ceiling division.",
    link: "https://leetcode.com/problems/koko-eating-bananas/",
  },
  {
    name: "Capacity To Ship Packages Within D Days",
    difficulty: "medium",
    hint: "The third mode. The lower bound is the heaviest single package, not 1. Why would a smaller capacity be impossible?",
    link: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
  },
  {
    name: "Find the Smallest Divisor Given a Threshold",
    difficulty: "medium",
    hint: "Same shape as Koko: divide, round up, sum, compare. The only new work is writing the check.",
    link: "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/",
  },
  {
    name: "Minimum Number of Days to Make m Bouquets",
    difficulty: "medium",
    hint: "The check scans the garden once, counting runs of adjacent flowers that have bloomed by day d. Handle the 'not enough flowers at all' case first.",
    link: "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/",
  },
  {
    name: "Magnetic Force Between Two Balls",
    difficulty: "medium",
    hint: "This one MAXIMISES the answer. Which direction do you move when the check passes? Compare it with the sqrt mode.",
    link: "https://leetcode.com/problems/magnetic-force-between-two-balls/",
  },
  {
    name: "Split Array Largest Sum",
    difficulty: "hard",
    hint: "It is the ship-capacity problem in disguise: minimise the largest piece sum. If you solved Capacity To Ship, this is the same check.",
    link: "https://leetcode.com/problems/split-array-largest-sum/",
  },
];

const codeSqrt = `def isqrt(x):
    def feasible(k):
        return k * k <= x
    low, high = 0, x
    ans = 0
    while low <= high:
        mid = (low + high) // 2
        if feasible(mid):
            ans = mid
            low = mid + 1
        else:
            high = mid - 1
    return ans`;

const codeBananas = `def min_eating_speed(piles, h):
    def feasible(speed):
        hours = sum((p + speed - 1) // speed for p in piles)
        return hours <= h
    low, high = 1, max(piles)
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if feasible(mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans`;

const codeShip = `def ship_within_days(weights, days):
    def feasible(cap):
        used, load = 1, 0
        for w in weights:
            if load + w > cap:
                used += 1
                load = 0
            load += w
        return used <= days
    low, high = max(weights), sum(weights)
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if feasible(mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans`;

const CODES: Record<Mode, string> = { sqrt: codeSqrt, bananas: codeBananas, ship: codeShip };

const DEFAULTS: Record<Mode, { x: number; arr: number[]; limit: number }> = {
  sqrt: { x: 10, arr: [3, 6, 7, 11], limit: 8 },
  bananas: { x: 10, arr: [3, 6, 7, 11], limit: 8 },
  ship: { x: 10, arr: [3, 2, 2, 4, 1, 4], limit: 3 },
};

/** What one run of feasible(mid) looks like, in a form every mode can draw. */
type Check = {
  ok: boolean;
  /** cells for the strip under the animation */
  cells: number[];
  stripLabel: string;
  /** the number that gets compared with the limit */
  total: number;
  /** e.g. "total hours" */
  totalName: string;
  /** the right-hand side of the comparison, e.g. "h = 8" */
  limitText: string;
  /** "≤" or "≤" etc. is always ≤, kept explicit so narration reads naturally */
  explain: string;
};

type Cfg = {
  lo: number;
  hi: number;
  /** "max": largest feasible value wanted (feasible side is the LEFT). "min": smallest feasible (feasible side is the RIGHT). */
  dir: "max" | "min";
  check: (mid: number) => Check;
  /** question for the "what does the check compute?" prediction */
  calc: (mid: number, c: Check) => Omit<Prediction, "line"> | null;
  paramName: string;
  answerNoun: string;
  noAnswer: string;
};

function makeCfg({ mode, x, arr, limit }: Inputs): Cfg | string {
  if (mode === "sqrt") {
    if (!Number.isInteger(x) || x < 0) return "x must be a whole number ≥ 0.";
    if (x + 1 > MAX_SPACE)
      return `The search space [0, ${x}] is too big to draw. Keep x below ${MAX_SPACE}.`;
    return {
      lo: 0,
      hi: x,
      dir: "max",
      paramName: "k",
      answerNoun: `the largest k with k² ≤ ${x}`,
      noAnswer: "",
      check: (mid) => {
        const sq = mid * mid;
        return {
          ok: sq <= x,
          cells: [sq],
          stripLabel: `mid × mid, compared with x = ${x}`,
          total: sq,
          totalName: `mid² = ${sq}`,
          limitText: `x = ${x}`,
          explain: `${mid} × ${mid} = ${sq}`,
        };
      },
      calc: (mid, c) => ({
        question: `Test mid = ${mid}. What is mid × mid?`,
        options: numberOptions(c.total, [mid * 2, (mid - 1) * (mid - 1), (mid + 1) * (mid + 1)], 1),
        answer: String(c.total),
      }),
    };
  }

  if (arr.length === 0) return "Add at least one value.";
  if (arr.some((v) => !Number.isInteger(v) || v <= 0))
    return "Every value must be a positive whole number.";
  if (!Number.isInteger(limit) || limit < 1) return "The limit must be a whole number ≥ 1.";

  if (mode === "bananas") {
    const hi = Math.max(...arr);
    if (hi > MAX_SPACE)
      return `The largest pile (${hi}) makes the search space too big to draw. Keep piles at ${MAX_SPACE} or less.`;
    return {
      lo: 1,
      hi,
      dir: "min",
      paramName: "speed",
      answerNoun: `the smallest speed that finishes within ${limit} hours`,
      noAnswer: `Even at speed ${hi} every pile takes at least one hour, and there are ${arr.length} piles, so ${limit} hours is not enough.`,
      check: (mid) => {
        const cells = arr.map((p) => Math.ceil(p / mid));
        const total = cells.reduce((a, b) => a + b, 0);
        return {
          ok: total <= limit,
          cells,
          stripLabel: `hours needed per pile at speed ${mid}`,
          total,
          totalName: `total = ${total} hours`,
          limitText: `h = ${limit}`,
          explain: `${cells.join(" + ")} = ${total} hours`,
        };
      },
      calc: (mid, c) => ({
        question: `Speed ${mid}, piles [${arr.join(", ")}]. Each pile takes ⌈pile / ${mid}⌉ whole hours. How many hours in total?`,
        options: numberOptions(
          c.total,
          [
            arr.reduce((a, p) => a + Math.floor(p / mid), 0),
            Math.ceil(arr.reduce((a, b) => a + b, 0) / mid),
            c.total + arr.length,
          ],
          1,
        ),
        answer: String(c.total),
      }),
    };
  }

  // ship
  const lo = Math.max(...arr);
  const hi = arr.reduce((a, b) => a + b, 0);
  if (hi - lo + 1 > MAX_SPACE)
    return `The search space [${lo}, ${hi}] is too big to draw. Use smaller weights.`;
  return {
    lo,
    hi,
    dir: "min",
    paramName: "capacity",
    answerNoun: `the smallest capacity that ships everything within ${limit} days`,
    noAnswer: "",
    check: (mid) => {
      const loads: number[] = [];
      let load = 0;
      for (const w of arr) {
        if (load + w > mid) {
          loads.push(load);
          load = 0;
        }
        load += w;
      }
      loads.push(load);
      return {
        ok: loads.length <= limit,
        cells: loads,
        stripLabel: `load shipped each day at capacity ${mid}`,
        total: loads.length,
        totalName: `days used = ${loads.length}`,
        limitText: `${limit} days`,
        explain: `loads ${loads.join(", ")} take ${loads.length} day${loads.length === 1 ? "" : "s"}`,
      };
    },
    calc: (mid, c) => ({
      question: `Capacity ${mid}, weights in order [${arr.join(", ")}]. Fill each day until the next package would not fit. How many days does that take?`,
      options: numberOptions(c.total, [c.total - 1, c.total + 1, Math.ceil(hi / mid)], 1),
      answer: String(c.total),
    }),
  };
}

function build(inputs: Inputs): Step[] {
  const steps: Step[] = [];
  const mode = inputs.mode;
  const code = CODES[mode];
  const L = {
    feasStart: lineOf(code, "def feasible") + 1,
    feasEnd: lineOf(code, "return", 0),
    init: lineOf(code, "low, high ="),
    while: lineOf(code, "while low <= high"),
    mid: lineOf(code, "mid ="),
    if: lineOf(code, "if feasible"),
    ans: lineOf(code, "ans = mid"),
    low: lineOf(code, "low = mid + 1"),
    high: lineOf(code, "high = mid - 1"),
    ret: lineOf(code, "return ans"),
  };

  const cfg = makeCfg(inputs);
  if (typeof cfg === "string") {
    steps.push({ line: L.init, array: [], pointers: [], narration: cfg });
    return steps;
  }
  const { lo, hi, dir } = cfg;
  const space = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const idx = (v: number) => v - lo;

  let low = lo;
  let high = hi;
  let ans = mode === "sqrt" ? 0 : -1;
  let ansSet = false;
  const sizes: number[] = [];

  const ptrs = (mid?: number): NonNullable<Step["pointers"]> => {
    const out: NonNullable<Step["pointers"]> = [];
    if (low <= hi)
      out.push({ name: "low", index: idx(Math.max(low, lo)), color: "mint", placement: "above" });
    if (high >= lo)
      out.push({
        name: "high",
        index: idx(Math.min(high, hi)),
        color: "amber",
        placement: "above",
      });
    if (mid !== undefined)
      out.push({ name: "mid", index: idx(mid), color: "violet", placement: "below" });
    if (ansSet) out.push({ name: "ans", index: idx(ans), color: "rose", placement: "below" });
    return out;
  };
  // Three regions: settled-feasible, settled-infeasible, and the undecided middle that is still shrinking.
  const bands = (): Partition[] => {
    const out: Partition[] = [];
    const feasTone = "low" as const;
    const failTone = "high" as const;
    if (low > lo) {
      out.push({
        from: 0,
        to: idx(low) - 1,
        tone: dir === "max" ? feasTone : failTone,
        label: dir === "max" ? "feasible" : "infeasible",
      });
    }
    if (low <= high) {
      out.push({ from: idx(low), to: idx(high), tone: "unknown", label: "undecided" });
    }
    if (high < hi) {
      out.push({
        from: idx(high) + 1,
        to: hi - lo,
        tone: dir === "max" ? failTone : feasTone,
        label: dir === "max" ? "infeasible" : "feasible",
      });
    }
    return out;
  };
  const sizeNow = () => Math.max(0, high - low + 1);
  const sizesStrip = () => ({
    label: "answers still undecided after each step",
    array: [...sizes],
    highlight: { kind: "match" as const, indices: [sizes.length - 1] },
  });
  const checkStrip = (c: Check) => ({ label: c.stripLabel, array: [...c.cells] });
  const baseStep = () => ({ array: [...space], partitions: bands() });

  const sizeInitial = hi - lo + 1;
  sizes.push(sizeInitial);

  const problemLine: Record<Mode, string> = {
    sqrt: `Find the largest integer k with k × k ≤ ${inputs.x}. Instead of searching an array, search the ANSWER: every candidate k from ${lo} to ${hi}.`,
    bananas: `Find the smallest eating speed that finishes all piles within ${inputs.limit} hours. The cells are the candidate speeds ${lo} to ${hi}.`,
    ship: `Find the smallest ship capacity that moves every package, in order, within ${inputs.limit} days. The cells are the candidate capacities ${lo} to ${hi}.`,
  };
  steps.push({
    line: L.init,
    ...baseStep(),
    pointers: ptrs(),
    secondary: sizesStrip(),
    status: `answer space [${lo}, ${hi}]  ·  ${sizeInitial} candidates`,
    narration: problemLine[mode],
    proof:
      dir === "max"
        ? "Feasibility is monotonic: if k works, every smaller value works too. So the candidates split into a feasible block on the left and an infeasible block on the right, and binary search finds the boundary."
        : "Feasibility is monotonic: if a value is big enough, every bigger value is big enough too. So the candidates split into an infeasible block on the left and a feasible block on the right, and binary search finds the boundary.",
  });

  let iter = 0;
  let guard = 0;
  while (low <= high && guard++ < 64) {
    const mid = (low + high) >> 1;
    const c = cfg.check(mid);
    const asked = iter < MAX_DIRECTION_PREDICTIONS;

    // The "what does the check compute?" question, before the result is on screen.
    if (iter === 0) {
      const calc = cfg.calc(mid, c);
      if (calc) {
        steps.push({
          line: L.mid,
          ...baseStep(),
          pointers: ptrs(mid),
          highlight: { kind: "compare", indices: [idx(mid)] },
          secondary: sizesStrip(),
          status: `mid = (${low} + ${high}) // 2 = ${mid}`,
          narration: `Try ${cfg.paramName} = ${mid}, the middle of the undecided candidates. To judge it we run feasible(${mid}): ${c.explain}.`,
          proof:
            "We never ask 'is mid the answer?'. We ask 'is mid feasible?', and that single yes or no tells us which whole side to throw away.",
          predict: { ...calc, line: L.while },
        });
      }
    }

    // Run the feasibility check.
    const feasLabel = c.ok ? "feasible" : "NOT feasible";
    const goesRight = dir === "max" ? c.ok : !c.ok;
    const correct = c.ok
      ? dir === "max"
        ? `Feasible: ans = mid, search RIGHT (low = mid + 1)`
        : `Feasible: ans = mid, search LEFT (high = mid − 1)`
      : dir === "max"
        ? `Not feasible: search LEFT (high = mid − 1)`
        : `Not feasible: search RIGHT (low = mid + 1)`;
    const opposite = c.ok
      ? dir === "max"
        ? `Feasible: ans = mid, search LEFT (high = mid − 1)`
        : `Feasible: ans = mid, search RIGHT (low = mid + 1)`
      : dir === "max"
        ? `Not feasible: search RIGHT (low = mid + 1)`
        : `Not feasible: search LEFT (high = mid − 1)`;
    const { options, answer } = labelledOptions(
      [correct, opposite, `Stop: ${cfg.paramName} = ${mid} is the answer`],
      iter + 2,
    );

    steps.push({
      line: L.feasStart,
      lineEnd: L.feasEnd,
      ...baseStep(),
      pointers: ptrs(mid),
      highlight: { kind: "compare", indices: [idx(mid)] },
      secondary: checkStrip(c),
      status: asked
        ? `${c.totalName},  limit ${c.limitText}`
        : `${c.totalName} ${c.ok ? "≤" : ">"} ${c.limitText}`,
      narration: asked
        ? `feasible(${mid}): ${c.explain}.`
        : `feasible(${mid}): ${c.explain}. ${c.total} ${c.ok ? "≤" : ">"} ${c.limitText}, so ${mid} is ${feasLabel}.`,
      proof:
        mode === "sqrt"
          ? undefined
          : iter === 0
            ? `The check costs O(n), but it only runs about log₂(${sizeInitial}) ≈ ${maxProbes(sizeInitial)} times. Trying every candidate would run it ${sizeInitial} times.`
            : undefined,
      predict: asked
        ? {
            question: `${cfg.paramName} = ${mid}: ${c.explain}. The limit is ${c.limitText}. How should the search continue?`,
            options,
            answer,
            line: L.while,
          }
        : undefined,
    });

    // Apply the decision.
    const prevLow = low;
    const prevHigh = high;
    if (c.ok) {
      ans = mid;
      ansSet = true;
      if (dir === "max") low = mid + 1;
      else high = mid - 1;
    } else if (dir === "max") {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
    sizes.push(sizeNow());

    const kept = c.ok ? `ans = ${mid}` : "";
    const moved = goesRight ? `low = ${low}` : `high = ${high}`;
    steps.push({
      line: c.ok ? L.ans : goesRight ? L.low : L.high,
      lineEnd: c.ok ? (goesRight ? L.low : L.high) : undefined,
      ...baseStep(),
      pointers: ptrs(),
      highlight: ansSet ? { kind: "match", indices: [idx(ans)] } : undefined,
      secondary: sizesStrip(),
      status: c.ok ? `${kept},  ${moved}` : moved,
      narration: c.ok
        ? dir === "max"
          ? `${mid} is feasible, so record ans = ${mid} and look for something bigger: low = ${low}. Everything from ${prevLow} to ${mid - 1} is feasible too, so it cannot beat ${mid}.`
          : `${mid} is feasible, so record ans = ${mid} and look for something smaller: high = ${high}. Everything from ${mid + 1} to ${prevHigh} is feasible too, so it cannot be smaller than ${mid}.`
        : dir === "max"
          ? `${mid} is not feasible, so every bigger value fails too. Pull high down to ${high}.`
          : `${mid} is not feasible, so every smaller value fails too. Push low up to ${low}.`,
      proof:
        iter === 0
          ? c.ok
            ? "A feasible value is a candidate answer we want to keep, but it may not be the best one. That is why ans is recorded and the search continues on the better side."
            : "An infeasible value can never be the answer, and monotonic feasibility means one whole side fails with it. That whole side is discarded in one move."
          : undefined,
    });
    iter += 1;
  }

  const found = ansSet;
  steps.push({
    line: L.ret,
    ...baseStep(),
    pointers: found ? [{ name: "ans", index: idx(ans), color: "mint" }] : [],
    highlight: found ? { kind: "match", indices: [idx(ans)] } : undefined,
    secondary: sizesStrip(),
    status: `return ${found ? ans : -1}`,
    narration: found
      ? `The undecided block is empty, so the boundary is found. Return ${ans}: ${cfg.answerNoun}.`
      : `The undecided block is empty and no candidate was feasible. ${cfg.noAnswer || "Return -1."}`,
    proof: `That took ${iter} feasibility check${iter === 1 ? "" : "s"} for ${sizeInitial} candidates. The worst case is ⌊log₂ ${sizeInitial}⌋ + 1 = ${maxProbes(sizeInitial)}.`,
  });
  return steps;
}

export const bsearchAnswer: LessonBuilder<Inputs> = {
  slug: "on-answer",
  title: "Binary Search on Answer",
  subtitle:
    "When the answer space is monotonic (feasible / infeasible), binary search the answer itself.",
  problem: ({ mode, x, limit }) =>
    mode === "bananas"
      ? `Koko has piles of bananas and ${limit} hours. She eats at a constant speed, one pile at a time, taking ⌈pile / speed⌉ hours per pile. Return the minimum integer speed that lets her finish all piles in time.`
      : mode === "ship"
        ? `Packages must be shipped in the given order. Each day the ship carries as many as fit under its capacity. Return the least capacity that delivers every package within ${limit} days.`
        : `Given a non-negative integer x = ${x}, compute the integer square root: the largest integer r such that r*r <= x.`,
  spotIt: [
    "'Minimum / maximum value such that a check passes' with a clear feasible/infeasible boundary.",
    "You can write a fast feasibility check but can't enumerate all answers.",
    "Phrases: 'minimize the largest', 'split array', 'capacity to ship', 'eat bananas in H hours'.",
  ],
  avoidWhen: [
    "Feasibility is not monotonic in the answer — binary search will lock onto the wrong side.",
    "The answer space is tiny — just iterate.",
    "Check function is too slow — bring the per-step cost down first.",
  ],
  practiceLadder,
  variant: "bsearch-answer",
  view: "array",
  code: codeSqrt,
  codeFor: (inputs) => CODES[(inputs as Inputs).mode] ?? codeSqrt,
  defaultInputs: { mode: "sqrt", ...DEFAULTS.sqrt },
  inputs: [
    {
      key: "mode",
      label: "Problem",
      kind: "select",
      options: [
        { value: "sqrt", label: "Integer square root (find the largest)" },
        { value: "bananas", label: "Koko eating bananas (find the smallest)" },
        { value: "ship", label: "Ship packages in D days (find the smallest)" },
      ],
    },
    {
      key: "x",
      label: "x  (compute ⌊√x⌋)",
      kind: "int",
      min: 0,
      max: 64,
      hidden: (v) => v.mode !== "sqrt",
    },
    {
      key: "arr",
      label: "Piles / weights (positive)",
      kind: "intArray",
      hidden: (v) => v.mode === "sqrt",
    },
    {
      key: "limit",
      label: "Limit  (hours h / days D)",
      kind: "int",
      min: 1,
      hidden: (v) => v.mode === "sqrt",
    },
  ],
  onInputChange: (changedKey, newValue) => {
    if (changedKey !== "mode") return null;
    const d = DEFAULTS[(newValue as Mode) in DEFAULTS ? (newValue as Mode) : "sqrt"];
    return { x: String(d.x), arr: d.arr.join(", "), limit: String(d.limit) };
  },
  validate: (inputs) => {
    const w: string[] = [];
    const cfg = makeCfg(inputs);
    if (typeof cfg === "string") w.push(cfg);
    else if (inputs.mode === "bananas" && inputs.limit < inputs.arr.length) {
      w.push(
        `With ${inputs.arr.length} piles and only ${inputs.limit} hours, no speed can work: each pile needs at least one hour.`,
      );
    }
    return w;
  },
  build,
};
