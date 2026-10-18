import type { LessonBuilder, QuizQuestion, Section } from "../types";

/**
 * Hidden grader for the first-repeated-badge challenge. The badges arrive in a list that raises on
 * `in`, `index`, `count`, `sort` and slicing and counts every read, so a learner has to remember
 * the badges seen so far in a set. Reads are budgeted on a 300-value input, which rejects nested
 * loops. Builtins are reached directly so shadowing cannot fake a pass.
 */
const firstRepeatedTests = String.raw`
import builtins as _sb_b

class _SbList(_sb_b.list):
    reads = 0
    def __iter__(self):
        _SbList.reads += _sb_b.len(self)
        return _sb_b.list.__iter__(self)
    def __getitem__(self, key):
        if _sb_b.isinstance(key, _sb_b.slice):
            raise _sb_b.RuntimeError("Do not slice the list. Remember the badges you have seen in a set.")
        _SbList.reads += 1
        return _sb_b.list.__getitem__(self, key)
    def __contains__(self, item):
        raise _sb_b.RuntimeError("Do not use 'in' on the list. Remember the badges you have seen in a set.")
    def index(self, *args):
        raise _sb_b.RuntimeError("Do not search the list. Remember the badges you have seen in a set.")
    def count(self, *args):
        raise _sb_b.RuntimeError("Do not search the list. Remember the badges you have seen in a set.")
    def sort(self, *args, **kwargs):
        raise _sb_b.RuntimeError("Do not sort the list. Use a hash set.")

def _sb_expected(values):
    seen = _sb_b.set()
    for value in values:
        if value in seen:
            return value
        seen.add(value)
    return -1

def _sb_grade():
    cases = [
        [7, 4, 9, 4, 7],
        [3, 8, 5],
        [],
        [9],
        [6, 6],
        [1, 2, 3, 2, 1, 3],
        [0, -4, 5, -4, 0],
        [8, 8, 8, 8],
    ]
    seed = 31415926
    for size in _sb_b.range(1, 70):
        values = []
        for _k in _sb_b.range(size):
            seed = (seed * 1103515245 + 12345) % 2147483648
            values.append((seed >> 8) % (size * 2 + 5))
        cases.append(values)
    cases.append(_sb_b.list(_sb_b.range(300)))
    cases.append(_sb_b.list(_sb_b.range(300)) + [150])
    for values in cases:
        want = _sb_expected(values)
        _SbList.reads = 0
        inputs = _SbList(values)
        try:
            got = first_repeated_badge(inputs)
        except _sb_b.RuntimeError as problem:
            return _sb_b.str(problem)
        if _sb_b.list.copy(inputs) != values:
            return "first_repeated_badge must not change the list."
        if got != want:
            return "Wrong answer: expected " + _sb_b.str(want) + " but got " + _sb_b.str(got) + " for " + _sb_b.str(values) + "."
        if _SbList.reads > 2 * _sb_b.len(values) + 5:
            return "Too many reads: look at each badge once and use a set for the badges you have seen."
    return "All hidden tests passed"

_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "first-repeated-badge",
  question:
    "Practical challenge: First repeated badge ID. Given a list of integers, return the first badge ID that appears for a second time as you scan from left to right. If no badge repeats, return `-1`. Keep the given function signature, do not sort the list, and do not use nested loops. For `[7, 4, 9, 4, 7]` the answer is `4`, for `[3, 8, 5]` it is `-1`, and for `[]` it is `-1`.",
  interactiveCode: true,
  initialCode: `def first_repeated_badge(badges: list[int]) -> int:
    # Your implementation
    pass


print(first_repeated_badge([7, 4, 9, 4, 7]))
print(first_repeated_badge([3, 8, 5]))
print(first_repeated_badge([]))
`,
  testCode: firstRepeatedTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [
    String.raw`def\s+first_repeated_badge\s*\(`,
    String.raw`\bset\s*\(|=\s*\{`,
  ],
  validationMessage:
    "Define `first_repeated_badge(badges)` and use a set to remember the badges you have already seen.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Use a set.",
    },
    {
      pattern: String.raw`\bsorted\s*\(|\.sort\s*\(`,
      message: "Do not sort the list. Use a hash set instead.",
    },
  ],
  explanation:
    "Create `seen = set()`. For each badge, check `badge in seen` first: if it is there, return the badge, because this is the first value to appear a second time. Otherwise add it. Return `-1` after the loop. Time is O(n), because each lookup and insertion is O(1) on average. Additional space is O(n), because every distinct badge may be stored. The check must come before the add, otherwise every badge would already be in the set when you test it.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "membership-order",
    question: "Why must the membership check happen before adding the current value to the set?",
    options: [
      "If you add first, the value is always in the set, so even a new value would look like a repeat.",
      "A set cannot add a value until it has been checked twice.",
      "Adding first makes the set slower.",
    ],
    correctIndex: 0,
    explanation:
      "After `seen.add(value)`, `value in seen` is always True. The check has to ask about the past, so it must run before the current value is recorded.",
  },
  {
    id: "membership-cost",
    question: "What are the time and additional space of the hash set membership approach?",
    options: [
      "O(n) time and O(n) extra space.",
      "O(n²) time and O(1) extra space.",
      "O(n log n) time and O(1) extra space.",
    ],
    correctIndex: 0,
    explanation:
      "Each of the n values needs one average O(1) lookup and at most one insertion, so time is O(n). The set can grow to hold every distinct value, so extra space is O(n).",
  },
  {
    id: "membership-signal",
    question: "Which interview wording is a signal to consider a hash set?",
    options: [
      '"Have I seen this value before?"',
      '"Return the values in sorted order."',
      '"Find the value at index 3."',
    ],
    correctIndex: 0,
    explanation:
      "Questions about whether a value already exists or has been encountered are membership questions, which a hash set answers in O(1) on average.",
  },
  challenge,
];

const membershipSections: Section[] = [
  {
    kind: "prose",
    body: [
      "You have mastered the foundations of hashing. You can explain `sets`, `dictionaries`, `collisions` and `average-case complexity`.",
      "Now we will learn how to **recognize hashing problems** in coding interviews. Our first pattern is **Hash Set Membership**, also called the **Seen-So-Far Pattern**.",
      "This pattern is used in problems such as `Contains Duplicate`, `Happy Number` and `detecting previously visited states`. For this lesson, we will focus on one idea: **how can we use a set to remember what we have already encountered?**",
    ],
  },
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "What problem does this pattern solve?",
    body: ["Imagine that you are processing a stream of employee badge IDs."],
  },
  {
    kind: "code",
    language: "python",
    caption: "Badge IDs",
    code: "badges = [12, 25, 37, 12, 49]",
  },
  {
    kind: "prose",
    body: [
      "You must identify whether an employee badge has already appeared.",
      "A straightforward approach is to compare each badge against all earlier badges. That approach can require `O(n²)` time.",
      "We need a faster method that **avoids repeated scanning**. A **hash set** lets us remember the IDs we have seen.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "A security guard's notebook",
    body: [
      "Imagine a security guard checking people entering an office. Step through three visitors.",
    ],
  },
  { kind: "guard-notebook" },
  {
    kind: "prose",
    body: ["Every time a visitor arrives, the guard follows two steps:"],
  },
  {
    kind: "list",
    items: [
      "**Check** whether the visitor's ID is already recorded.",
      "If not, **record** the ID for future checks.",
    ],
  },
  {
    kind: "prose",
    body: [
      "If the ID is already recorded, the guard knows that the visitor has appeared before. A Python set works like the guard's notebook, except membership checks are `O(1)` on average.",
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Key principle",
    body: "**Check first, then remember.** That order is important when detecting duplicates.",
  },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "The pattern step by step",
    body: ["The generic process is a single decision. Choose an answer to follow each path."],
  },
  { kind: "seen-flowchart" },
  {
    kind: "prose",
    body: [
      "Each element follows the same decision process. If it is already in the set, we have **encountered it before**. If not, we **add it to the set** and continue.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Complete Python implementation",
    body: [
      "Study this implementation of Contains Duplicate. Notice that the check happens before the add. It is a different problem from the First Repeated Badge ID that you will solve in the practice questions.",
    ],
  },
  { kind: "pattern-canvas", problemSet: "hash-membership" },
  { kind: "pattern-example", problemSet: "hash-membership" },
  {
    kind: "list",
    body: ["There are three important details:"],
    items: [
      "`seen = set()` creates the notebook before the loop, so the set starts empty.",
      "`if value in seen` asks about the **past**. It runs before `seen.add(value)`, so the current value is never compared with itself.",
      "The function returns `True` as soon as a repeat appears, and returns `False` only after the loop has read every value.",
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Early return",
    body: "Returning inside the loop means a list with an early repeat stops early, but a list with no repeat is read completely. Either way each value is read at most once, so the time is `O(n)`.",
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "When should you use it?",
    body: [],
  },
  {
    kind: "table",
    caption: "Three ways to detect a repeat",
    headers: ["Approach", "Expected time", "Extra space"],
    rows: [
      ["Compare against earlier elements", "`O(n²)` worst case", "`O(1)`"],
      ["**Hash set membership**", "`O(n)`", "`O(n)`"],
      ["Sort and compare neighbors", "`O(n log n)`", "Depends on sorting method"],
    ],
  },
  {
    kind: "prose",
    body: [
      "Hash sets are useful when you need **fast membership checks** and can use **extra memory**.",
      "But they also have limitations. Set elements must be **hashable**. Sets do not preserve duplicates, and they do not provide indexed access.",
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "An interview signal",
    body: 'Wording such as "Have I seen this before?" or "Does this value already exist?" should make you consider a hash set.',
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Solve independently",
    body: [
      "**Do not run any code yet.** First show that you can follow the pattern by hand. Use this list of badge IDs:",
    ],
  },
  {
    kind: "code",
    language: "python",
    caption: "Practice badges",
    code: "badges = [7, 4, 9, 4, 7]\nseen = set()",
  },
  {
    kind: "prose",
    body: [
      "Read the badges from left to right. For each one, check `seen` first and add the badge only if it was not there.",
    ],
  },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "fields",
        label: "Practice A",
        title: "Trace the set",
        prompt:
          "Answer without running the code. Enter a number in each box. The first repeat is the first badge that is already in seen when it is read.",
        fields: [
          {
            label: "How many values are in seen after reading 7, 4 and 9?",
            answer: 3,
            tone: "accent",
          },
          { label: "Which badge is the first one already in seen?", answer: 4, tone: "accent" },
        ],
        success:
          "Correct. After 7, 4 and 9 the set is {7, 4, 9}, so it holds three values. The next badge, 4, is already in it, so 4 is the first repeat. The 7 at the end repeats too, but it comes later.",
        hint: "Add each new badge to the set. Stop at the first badge that is already there.",
      },
      {
        type: "choice",
        label: "Practice B",
        title: "Time and additional space",
        prompt: "What are the time and additional space complexity of your set-based solution?",
        options: [
          "O(n) time and O(n) additional space.",
          "O(n²) time and O(1) additional space.",
          "O(n log n) time and O(1) additional space.",
        ],
        answer: 0,
        success:
          "Right. One pass with O(1) average lookups gives O(n) time, and the set may store every distinct badge, so extra space is O(n).",
        hint: "Count the passes over the list, then ask how large the set can grow.",
      },
      {
        type: "choice",
        label: "Practice C",
        title: "Check before adding",
        prompt: "Why must the membership check happen before adding the current value to the set?",
        options: [
          "If you add first, every value, even a new one, is already in the set and looks like a repeat.",
          "The set needs one value in it before it can answer a check.",
          "Adding after the check saves memory.",
        ],
        answer: 0,
        success:
          "Correct. After `seen.add(value)`, `value in seen` is always True. The check must ask about the past.",
        hint: "What would `value in seen` return right after you added `value`?",
      },
      {
        type: "choice",
        label: "Interview question",
        title: "Millions of transaction IDs",
        prompt:
          "You are processing millions of transaction IDs. How would you detect the first repeated transaction ID efficiently, and what are the time and memory trade-offs?",
        options: [
          "Scan once and keep a set of seen IDs. Return the first ID already in the set. It is O(n) time but needs O(n) memory.",
          "Compare every ID with all earlier IDs. It needs no extra memory but takes O(n²) time.",
          "Sort the IDs and compare neighbors. It is O(n log n), and it loses the original order that defines which ID repeated first.",
        ],
        answer: 0,
        success:
          "Right. The set trades memory for speed, which is the usual hash trade-off. Comparing every pair is too slow for millions of IDs, and sorting loses the scan order that defines the first repeat.",
        hint: "Which option is fast, keeps the scan order, and costs extra memory?",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "The seen-so-far pattern uses a set to remember what you have already encountered, so you never rescan earlier elements.",
      "Check first, then remember: test `value in seen` before `seen.add(value)`.",
      "Comparing against earlier elements is `O(n²)`, while hash set membership is `O(n)` time with `O(n)` extra space.",
      "Set elements must be hashable, and a set keeps no duplicates and no indexed access.",
      'Wording like "Have I seen this before?" is the interview signal to consider a hash set.',
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const hashSetMembership: LessonBuilder<Record<string, never>> = {
  slug: "hash-set-membership",
  title: "Hash Set Membership: The Seen-So-Far Pattern",
  subtitle: "Use a set to remember what you have already seen and spot repeats in one pass.",
  problem: "Find the first value that appears for a second time while scanning a list.",
  spotIt: [
    "The prompt asks whether a value has appeared before or already exists.",
    "You scan once and need to remember earlier values without rescanning them.",
  ],
  avoidWhen: [
    "You need the position of the earlier value, which calls for a dict from value to index.",
    "Memory is very tight and sorting or an in-place method is acceptable.",
  ],
  takeaways: [
    "Check first, then remember.",
    "O(n) time and O(n) extra space.",
    "Set elements must be hashable.",
  ],
  variant: "hash-set-membership",
  view: "array",
  code: "def first_repeated_badge(badges):\n    seen = set()\n    for badge in badges:\n        if badge in seen:\n            return badge\n        seen.add(badge)\n    return -1",
  sections: membershipSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [12, 25, 37, 12, 49],
      narration: "Use the concept lesson to see how the set remembers earlier badge IDs.",
    },
  ],
};
