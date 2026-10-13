import type { LessonBuilder, QuizQuestion, Section } from "../types";

const sortColorsCode = `def sort_colors(numbers):
    low = 0
    mid = 0
    high = len(numbers) - 1

    while mid <= high:
        if numbers[mid] == 0:
            numbers[low], numbers[mid] = (
                numbers[mid], numbers[low]
            )
            low += 1
            mid += 1

        elif numbers[mid] == 1:
            mid += 1

        else:
            numbers[mid], numbers[high] = (
                numbers[high], numbers[mid]
            )
            high -= 1

    return numbers`;

/**
 * Hidden grader for the sort-by-sign challenge. It runs after the learner's code and reaches
 * builtins directly, so shadowing `list` or `print` cannot fake a pass. A tracked list rejects
 * slicing, sorting, copying, resizing and direct iteration, and counts reads and writes, which
 * rules out O(n^2) sorts. Inputs include fixed edge cases and values drawn at run time.
 */
const sortBySignTests = String.raw`import builtins as _sb_b
import random as _sb_random


def _sb_grade():
    _b = _sb_b
    fn = globals().get("sort_by_sign")
    if not _b.callable(fn):
        return "Define a function named sort_by_sign(numbers)."

    def _blocked(message):
        def method(self, *args, **kwargs):
            raise _b.RuntimeError(message)
        return method

    copy_msg = "Do not copy the list or build another array. Rearrange the values inside numbers."
    resize_msg = "Do not add or remove items. Keep the same length and swap values by index."
    index_msg = "Do not use list helpers such as count() or in. Read the values by index."

    class _Tracked(_b.list):
        reads = 0
        writes = 0

        def __getitem__(self, index):
            if _b.isinstance(index, _b.slice):
                raise _b.RuntimeError("Slicing is not allowed. Read one index at a time.")
            self.reads += 1
            return _b.list.__getitem__(self, index)

        def __setitem__(self, index, value):
            if _b.isinstance(index, _b.slice):
                raise _b.RuntimeError("Slice assignment is not allowed. Write one index at a time.")
            self.writes += 1
            _b.list.__setitem__(self, index, value)

        __iter__ = _blocked("Do not loop over the values directly. Read them by index with low, mid and high.")
        __reversed__ = _blocked("reversed() is not allowed. Use the three-pointer method.")
        __contains__ = _blocked(index_msg)
        count = _blocked(index_msg)
        index = _blocked(index_msg)
        sort = _blocked("Sorting is not allowed. Use the three-pointer method.")
        reverse = _blocked("list.reverse() is not allowed. Use the three-pointer method.")
        copy = _blocked(copy_msg)
        __add__ = _blocked(copy_msg)
        __mul__ = _blocked(copy_msg)
        __rmul__ = _blocked(copy_msg)
        __iadd__ = _blocked(resize_msg)
        __imul__ = _blocked(resize_msg)
        __delitem__ = _blocked(resize_msg)
        append = _blocked(resize_msg)
        extend = _blocked(resize_msg)
        insert = _blocked(resize_msg)
        pop = _blocked(resize_msg)
        remove = _blocked(resize_msg)
        clear = _blocked(resize_msg)

    def group(value):
        return -1 if value < 0 else (0 if value == 0 else 1)

    cases = [
        [3, -1, 0, -5, 0, 2],
        [],
        [0],
        [-1],
        [4],
        [0, 0, 0],
        [-2, -1],
        [1, 2],
        [1, 0, -1],
        [-1, 0, 1],
        [5, -5, 5, -5],
        [0, -3, 0, 3, 0, -3, 0, 3],
    ]
    rng = _sb_random.Random()
    for _ in _b.range(5):
        size = rng.randint(3, 12)
        cases.append([rng.randint(-9, 9) for _ in _b.range(size)])
    cases.append([rng.randint(-9, 9) for _ in _b.range(40)])

    for case in cases:
        tracked = _Tracked(case)
        try:
            result = fn(tracked)
        except _b.Exception as error:
            return f"sort_by_sign({case}) raised {_b.type(error).__name__}: {error}"
        actual = _b.list.__getitem__(tracked, _b.slice(None))
        if _b.sorted(actual) != _b.sorted(case):
            return f"sort_by_sign({case}) changed the values: it left {actual}. Only rearrange the numbers."
        groups = [group(value) for value in actual]
        if groups != _b.sorted(groups):
            return (
                f"sort_by_sign({case}) left {actual}. "
                "Every negative must come before every zero, and every zero before every positive."
            )
        if result is not None and result is not tracked:
            return "Change numbers in place. Do not return a new list."
        size = _b.len(case)
        if tracked.reads > 6 * size + 10:
            return (
                f"sort_by_sign({case}) read the list {tracked.reads} times for {size} values. "
                "One three-pointer pass reads each value only a few times, so do not compare every pair."
            )
        if tracked.writes > 2 * size:
            return (
                f"sort_by_sign({case}) wrote to the list {tracked.writes} times for {size} values. "
                "A single pass needs at most one swap per value, so check that mid or high moves after every step."
            )
    return "All hidden tests passed"


_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "dutch-flag-sort-by-sign",
  question:
    "Practical challenge: Sort by sign. Write a function `sort_by_sign(numbers)` that rearranges the array in place so every negative number comes first, then every zero, then every positive number. Use the three-pointer method from this lesson, in one pass and without creating another array. For `numbers = [3, -1, 0, -5, 0, 2]`, the result could be `[-1, -5, 0, 0, 3, 2]`. The order inside each group does not matter.",
  interactiveCode: true,
  initialCode: `def sort_by_sign(numbers):
    # Write your code here.
    pass


numbers = [3, -1, 0, -5, 0, 2]
sort_by_sign(numbers)
print(numbers)
`,
  testCode: sortBySignTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [
    String.raw`def\s+sort_by_sign\s*\(`,
    String.raw`\bwhile\b`,
    String.raw`\]\s*=(?!=)`,
  ],
  validationMessage:
    "Define `sort_by_sign(numbers)`, loop with `while`, and write values back into `numbers` by index.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\[[^\]\n]*:[^\]\n]*\]`,
      message: "Slicing is not allowed. Read and write one index at a time.",
    },
    {
      pattern: String.raw`\bsorted\s*\(|\.sort\s*\(`,
      message: "Sorting is not allowed. Use the three-pointer method from this lesson.",
    },
    {
      pattern: String.raw`\breversed\s*\(|\.reverse\s*\(`,
      message: "Reversing is not allowed. Use the three-pointer method from this lesson.",
    },
    {
      pattern: String.raw`\blist\s*\(|\btuple\s*\(|\bset\s*\(|\bdict\s*\(|\.copy\s*\(|\[\s*\]|\[[^\]\n]*\bfor\b|\]\s*\*|\*\s*\[|\bfilter\s*\(|\bdeque\b`,
      message: "Do not create another array. Rearrange the values inside `numbers`.",
    },
    {
      pattern: String.raw`\.append\s*\(|\.insert\s*\(|\.extend\s*\(|\.pop\s*\(|\.remove\s*\(|\.clear\s*\(|\bdel\b`,
      message: "Do not add or remove items. Keep the length and swap values by index.",
    },
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Use plain index swaps.",
    },
  ],
  explanation:
    "Treat negatives as the first group, zeros as the middle group and positives as the last group. Examine `numbers[mid]`: a negative swaps with `low` and both `low` and `mid` move, a zero only moves `mid`, and a positive swaps with `high`, which moves left while `mid` stays. Loop with `while mid <= high`. The hidden tests try empty, all-zero, already grouped and random arrays.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "dutch-flag-value-one",
    question: "What should happen when `numbers[mid] == 1`?",
    options: ["Swap with low.", "Increase mid.", "Decrease high."],
    correctIndex: 1,
    explanation:
      "A 1 already belongs in the middle group, between the zeros and the twos. Nothing needs to move, so `mid` just steps forward.",
  },
  {
    id: "dutch-flag-after-two",
    question: "After swapping a 2 at mid with the element at high, what should happen?",
    options: [
      "Increase mid and decrease high.",
      "Increase low and mid.",
      "Decrease high and examine mid again.",
    ],
    correctIndex: 2,
    explanation:
      "The 2 is now behind `high`, so `high` moves left. The value that arrived at `mid` came from the unknown region and has not been checked, so `mid` stays and examines it.",
  },
  {
    id: "dutch-flag-time",
    question: "What is the time complexity?",
    options: ["O(n)", "O(n²)", "O(1)"],
    correctIndex: 0,
    explanation:
      "Every step either moves `mid` right or moves `high` left, and the two pointers only move toward each other. That is at most n steps, so the time is O(n).",
  },
  challenge,
];

const dutchFlagSections: Section[] = [
  {
    kind: "prose",
    body: [
      "In the Opposite Ends lesson, you moved two pointers toward each other. In the Fast & Slow lesson, you moved two pointers in the same direction.",
      "In this Dutch National Flag lesson, you will use three pointers to divide an array into three groups.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "What problem does it solve?",
    body: ["Suppose you have this array:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "The array",
    code: "numbers = [2, 0, 2, 1, 1, 0]",
  },
  { kind: "prose", body: ["Your task is to sort it:"] },
  { kind: "code", language: "text", caption: "Sorted result", code: "[0, 0, 1, 1, 2, 2]" },
  {
    kind: "prose",
    body: [
      "The array contains only three values: 0, 1, and 2.",
      "You could use Python's built-in sorting method. However, interviewers often ask you to solve this problem in one pass, without using a separate array.",
      "The Dutch National Flag algorithm does this using three pointers.",
    ],
  },
  {
    kind: "list",
    body: ["Goal:"],
    items: ["Sort the array in place.", "Use one scan of the array.", "Use constant extra space."],
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "Imagine three groups of flags",
    body: ["Imagine that you need to arrange flags into three groups: red, white, and blue."],
  },
  {
    kind: "dutch-flag-intuition",
    groups: [
      { value: 0, title: "First group" },
      { value: 1, title: "Middle group" },
      { value: 2, title: "Last group" },
    ],
  },
  {
    kind: "prose",
    body: [
      "Each value belongs in a specific part of the array.",
      "Instead of sorting every pair of elements, we classify each element and place it in the correct group.",
      "We use three pointers:",
    ],
  },
  {
    kind: "list",
    items: [
      "`low`: marks the next position for a 0.",
      "`mid`: examines the current element.",
      "`high`: marks the next position for a 2.",
    ],
  },
  { kind: "prose", body: ["Remember this phrase:"] },
  { kind: "mnemonic", text: "Low collects zeros. Mid examines. High collects twos." },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "Understand the three regions",
    body: ["Consider this array:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Starting array",
    code: "numbers = [2, 0, 1, 2, 1, 0]",
  },
  { kind: "prose", body: ["At any point, think of the array as four regions:"] },
  {
    kind: "table",
    caption: "The four regions",
    headers: ["Region", "Indexes"],
    rows: [
      ["Processed zeros", "Indexes before `low`"],
      ["Processed ones", "Indexes from `low` to `mid - 1`"],
      ["Unknown elements", "Indexes from `mid` to `high`"],
      ["Processed twos", "Indexes after `high`"],
    ],
  },
  {
    kind: "prose",
    body: [
      "The algorithm keeps these regions correct as it processes each element.",
      "The key is to examine `numbers[mid]`.",
    ],
  },
  {
    kind: "table",
    caption: "What to do with the value at mid",
    headers: ["Value at mid", "Action"],
    rows: [
      ["`0`", "Swap with `numbers[low]`. Increase `low` and `mid`."],
      ["`1`", "Increase `mid`."],
      ["`2`", "Swap with `numbers[high]`. Decrease `high`."],
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Important interview detail",
    body: "When the middle value is 2, do not advance `mid` yet. The element swapped in from the right has not been checked. You must examine it first.",
  },
  {
    kind: "prose",
    body: ["**Example: Work through the first steps**", "Start with:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Starting state",
    code: "numbers = [2, 0, 1, 2, 1, 0]\nlow = 0\nmid = 0\nhigh = 5",
  },
  {
    kind: "pattern-stepper",
    steps: [
      {
        label: "Step 1",
        title: "Examine the middle value",
        cells: [2, 0, 1, 2, 1, 0],
        pointers: [
          { index: 0, label: "low", tone: "left" },
          { index: 0, label: "mid", tone: "accent" },
          { index: 5, label: "high", tone: "right" },
        ],
        note: "The value is 2. It belongs at the right end. Swap it with the value at `high`.",
      },
      {
        label: "Step 2",
        title: "Update the right boundary",
        cells: [0, 0, 1, 2, 1, 2],
        pointers: [
          { index: 0, label: "low", tone: "left" },
          { index: 0, label: "mid", tone: "accent" },
          { index: 4, label: "high", tone: "right" },
          { index: 5, label: "done", tone: "mid" },
        ],
        note: "Now `high = 4`. Keep `mid = 0` so the new value at index 0 can be examined.",
      },
    ],
  },
  {
    kind: "prose",
    body: [
      "Notice that we did not move `mid` after the swap. That is one of the most important parts of this algorithm.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Python logic",
    body: ["Read this code. Focus on the pointer positions."],
  },
  { kind: "pattern-canvas", problemSet: "dutch-flag" },
  { kind: "pattern-example", problemSet: "dutch-flag" },
  {
    kind: "list",
    body: ["This is the core decision structure."],
    items: [
      "The algorithm repeats these decisions until `mid > high`.",
      "At that point, every element is in the correct group.",
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Stopping condition",
    body: "The algorithm stops when `mid > high`. At that point, there are no unknown elements left.",
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "When should you use this?",
    body: [],
  },
  {
    kind: "table",
    caption: "Dutch National Flag at a glance",
    headers: ["Measure", "Dutch National Flag"],
    rows: [
      ["Time complexity", "`O(n)`"],
      ["Extra space", "`O(1)`"],
      ["Input requirement", "Values limited to 0, 1, and 2"],
      ["Main benefit", "One-pass, in-place sorting"],
    ],
  },
  {
    kind: "prose",
    body: [
      "The algorithm is efficient because each iteration moves at least one boundary. It does not need to compare every pair of elements.",
    ],
  },
  {
    kind: "callout",
    tone: "warn",
    title: "Two common mistakes",
    body: "- Increasing `mid` after every swap. This can skip an unchecked element.\n- Using `mid < high` as the loop condition. This can leave the final unclassified element unprocessed.",
  },
  {
    kind: "prose",
    body: ["Use `while mid <= high` so the algorithm examines the final unknown element."],
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Trace the pointers yourself",
    body: ["Do not write code yet. Use this array:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Practice array",
    code: "numbers = [2, 0, 1, 2, 0]\nlow = 0\nmid = 0\nhigh = 4",
  },
  { kind: "prose", body: ["Answer these questions."] },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "fields",
        label: "Question A",
        title: "The value at mid",
        prompt: "What is `numbers[mid]` at the start?",
        fields: [{ label: "numbers[mid]", answer: 2, tone: "accent" }],
        success: "Correct. mid is 0, and numbers[0] is 2.",
        hint: "mid starts at index 0. Read the value stored there.",
      },
      {
        type: "choice",
        label: "Question B",
        title: "Which pointers move",
        prompt: "Which pointer or pointers should move after the first operation?",
        options: ["Only low", "Only mid", "Only high", "Low and mid"],
        answer: 2,
        success: "Right. A 2 is swapped to the right end, so only high moves.",
        hint: "Look at the action for a 2: swap with numbers[high], then decrease high.",
      },
      {
        type: "cells",
        label: "Question C",
        title: "The array after the first operation",
        prompt: "After the first operation, what is the array?",
        answers: [0, 0, 1, 2, 2],
        success: "Correct. numbers[0] and numbers[4] swapped, and high moved to 3.",
        hint: "Swap numbers[mid] with numbers[high]. Only those two positions change.",
      },
      {
        type: "choice",
        label: "Question D",
        title: "Why mid stays",
        prompt:
          "Why must `mid` stay in place when its value is 2 and you swap it with `numbers[high]`?",
        options: [
          "The element swapped in from the right has not been examined yet.",
          "mid must always stay equal to low.",
          "The swapped-in value is always a 0.",
          "high has to move first, and mid then follows automatically.",
        ],
        answer: 0,
        success:
          "Correct. The value from the right came from the unknown region, so mid must examine it.",
        hint: "Think about which region the incoming value came from.",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "Three pointers split the array into four regions: zeros before `low`, ones from `low` to `mid - 1`, unknown elements from `mid` to `high`, and twos after `high`.",
      "`mid` examines one element at a time: a 0 is swapped to `low`, a 1 stays, and a 2 is swapped to `high`.",
      "After swapping a 2 with `numbers[high]`, keep `mid` where it is, because the value that arrived has not been examined.",
      "Use `while mid <= high`, so the last unknown element is still classified.",
      "One pass and three indexes: `O(n)` time and `O(1)` extra space, for values limited to 0, 1, and 2.",
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const dutchFlag: LessonBuilder<Record<string, never>> = {
  slug: "dutch-flag",
  title: "Two Pointers: Dutch National Flag",
  subtitle: "Sort an array of 0s, 1s and 2s in one pass with three pointers and no extra array.",
  problem: "Sort an array that contains only 0, 1 and 2 in place, in one pass.",
  spotIt: [
    "The array holds only a few distinct values, such as 0, 1 and 2, and must be sorted in place.",
    "The prompt asks for one pass and constant extra space.",
  ],
  avoidWhen: [
    "The values are arbitrary numbers with many distinct values.",
    "You may use extra memory or a built-in sort and only need the result.",
  ],
  takeaways: [
    "low collects zeros, mid examines, high collects twos.",
    "After swapping a 2 to high, examine mid again.",
    "One pass, O(n) time and O(1) extra space.",
  ],
  variant: "dutch-flag",
  view: "array",
  code: sortColorsCode,
  sections: dutchFlagSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [2, 0, 2, 1, 1, 0],
      narration: "Use the concept lesson to trace the low, mid and high pointers.",
    },
  ],
};
