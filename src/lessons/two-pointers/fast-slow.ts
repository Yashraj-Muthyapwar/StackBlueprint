import type { LessonBuilder, QuizQuestion, Section } from "../types";

const removeDuplicatesCode = `def remove_duplicates(numbers):
    if not numbers:
        return 0

    slow = 0
    for fast in range(1, len(numbers)):
        if numbers[fast] != numbers[slow]:
            slow += 1
            numbers[slow] = numbers[fast]

    return slow + 1`;

/**
 * Hidden grader for the Move Zeros challenge. It runs after the learner's code and reaches
 * builtins directly, so shadowing `list` or `print` cannot fake a pass. A tracked list rejects
 * slicing, sorting, copying and resizing, so only in-place index moves can succeed.
 */
const moveZerosTests = String.raw`import builtins as _sb_b
import random as _sb_random


def _sb_grade():
    _b = _sb_b
    fn = globals().get("move_zeros")
    if not _b.callable(fn):
        return "Define a function named move_zeros(numbers)."

    def _blocked(message):
        def method(self, *args, **kwargs):
            raise _b.RuntimeError(message)
        return method

    copy_msg = "Do not copy the list or build another array. Move values inside numbers."
    resize_msg = "Do not add or remove items. Keep the same length and overwrite or swap values by index."

    class _Tracked(_b.list):
        def __getitem__(self, index):
            if _b.isinstance(index, _b.slice):
                raise _b.RuntimeError("Slicing is not allowed. Read one index at a time.")
            return _b.list.__getitem__(self, index)

        def __setitem__(self, index, value):
            if _b.isinstance(index, _b.slice):
                raise _b.RuntimeError("Slice assignment is not allowed. Write one index at a time.")
            _b.list.__setitem__(self, index, value)

        sort = _blocked("Sorting is not allowed. Use a slow and a fast pointer.")
        reverse = _blocked("list.reverse() is not allowed. Use a slow and a fast pointer.")
        __reversed__ = _blocked("reversed() is not allowed. Use a slow and a fast pointer.")
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

    cases = [
        [0, 1, 0, 3, 12],
        [],
        [0],
        [5],
        [0, 0, 0],
        [1, 2, 3],
        [1, 0],
        [0, 1],
        [4, 0, 0, 4, 0, 5],
        [-1, 0, -2, 0, 0, 7],
    ]
    rng = _sb_random.Random()
    for _ in _b.range(5):
        size = rng.randint(3, 12)
        cases.append([rng.choice([0, 0, rng.randint(-9, 20)]) for _ in _b.range(size)])

    for case in cases:
        tracked = _Tracked(case)
        try:
            result = fn(tracked)
        except _b.Exception as error:
            return f"move_zeros({case}) raised {_b.type(error).__name__}: {error}"
        actual = _b.list.__getitem__(tracked, _b.slice(None))
        expected = [value for value in case if value != 0] + [0] * case.count(0)
        if actual != expected:
            return f"move_zeros({case}) left the list as {actual}. Expected {expected}."
        if result is not None and result is not tracked:
            return "Change numbers in place. Do not return a new list."
    return "All hidden tests passed"


_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "fast-slow-move-zeros",
  question:
    "Practical challenge: Move zeros. Write your own Python function `move_zeros(numbers)`. For this input, `numbers = [0, 1, 0, 3, 12]`, the expected result is `[1, 3, 12, 0, 0]`. Your function must modify the original array, preserve the order of non-zero elements, and avoid creating another array.",
  interactiveCode: true,
  initialCode: `def move_zeros(numbers):
    # Write your code here.
    pass


numbers = [0, 1, 0, 3, 12]
move_zeros(numbers)
print(numbers)
`,
  testCode: moveZerosTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [
    String.raw`def\s+move_zeros\s*\(`,
    String.raw`\bfor\b|\bwhile\b`,
    String.raw`\]\s*=(?!=)`,
  ],
  validationMessage:
    "Define `move_zeros(numbers)`, scan it with a loop, and write values back into `numbers` by index.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\[[^\]\n]*:[^\]\n]*\]`,
      message: "Slicing is not allowed. Read and write one index at a time.",
    },
    {
      pattern: String.raw`\bsorted\s*\(|\.sort\s*\(`,
      message: "Sorting is not allowed. Use a slow pointer and a fast pointer.",
    },
    {
      pattern: String.raw`\breversed\s*\(|\.reverse\s*\(`,
      message: "Reversing is not allowed. Use a slow pointer and a fast pointer.",
    },
    {
      pattern: String.raw`\blist\s*\(|\btuple\s*\(|\bset\s*\(|\bdict\s*\(|\.copy\s*\(|\[\s*\]|\[[^\]\n]*\bfor\b|\]\s*\*|\*\s*\[|\bfilter\s*\(|\bdeque\b`,
      message: "Do not create another array. Move the values inside `numbers`.",
    },
    {
      pattern: String.raw`\.append\s*\(|\.insert\s*\(|\.extend\s*\(|\.pop\s*\(|\.remove\s*\(|\.clear\s*\(|\bdel\b`,
      message: "Do not add or remove items. Keep the length and overwrite or swap values by index.",
    },
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Use plain index moves.",
    },
  ],
  explanation:
    "Let `fast` scan every index. When `numbers[fast]` is not 0, write it to `numbers[slow]` (or swap the two) and move `slow` forward. Afterwards, every index from `slow` to the end holds 0. The hidden tests try empty, all-zero, no-zero and random arrays.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "fast-slow-scanner",
    question: "Which pointer scans every element?",
    options: ["Slow", "Fast", "Both must always move together"],
    correctIndex: 1,
    explanation:
      "`fast` visits every index exactly once. `slow` moves only when `fast` finds a value worth keeping.",
  },
  {
    id: "fast-slow-duplicate",
    question: "What happens when the fast value equals the last unique value?",
    options: [
      "Advance slow and copy the value",
      "Leave slow in place and continue scanning",
      "Stop the loop",
    ],
    correctIndex: 1,
    explanation:
      "An equal value is a duplicate, so nothing is written. `slow` keeps marking the last unique value while `fast` moves on.",
  },
  {
    id: "fast-slow-space",
    question: "What is the extra space complexity?",
    options: ["O(1)", "O(n)", "O(n²)"],
    correctIndex: 0,
    explanation:
      "The algorithm only keeps two indexes, no matter how long the array is. It reuses the original array instead of creating a new one.",
  },
  challenge,
];

const fastSlowSections: Section[] = [
  {
    kind: "prose",
    body: [
      "In the previous lesson, you moved two pointers toward each other. In this lesson, both pointers move from left to right.",
      "We will learn the pattern by using a common interview problem: **Remove Duplicates from a Sorted Array**.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "What problem does it solve?",
    body: ["Suppose you have this sorted array:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "The sorted array",
    code: "numbers = [2, 2, 4, 4, 6, 6, 8]",
  },
  {
    kind: "prose",
    body: [
      "You need to remove the duplicates without creating another array.",
      "The expected unique values are:",
    ],
  },
  { kind: "code", language: "text", caption: "Unique values", code: "[2, 4, 6, 8]" },
  {
    kind: "prose",
    body: [
      "A beginner might create a new array and copy the unique values into it. But interviews often require you to modify the original array in place.",
      "The slow-fast pattern helps us do this in one pass, with constant extra space.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "Imagine a scout and a recorder",
    body: [],
  },
  {
    kind: "fast-slow-intuition",
    roles: [
      {
        pointer: "Fast pointer",
        nickname: "The scout",
        text: "Checks each element in the array. It looks for a new value.",
        tone: "right",
      },
      {
        pointer: "Slow pointer",
        nickname: "The recorder",
        text: "Marks the position of the last unique value. When the scout finds a new value, the recorder advances and stores it.",
        tone: "left",
      },
    ],
  },
  { kind: "prose", body: ["Remember this rule:"] },
  { kind: "mnemonic", text: "Fast finds. Slow writes." },
  {
    kind: "prose",
    body: [
      "Both pointers move in the same direction. However, they do not move the same number of times.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "Follow the pointers step by step",
    body: ["Start with:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Starting array",
    code: "numbers = [2, 2, 4, 4, 6]",
  },
  { kind: "prose", body: ["The initial positions are:"] },
  { kind: "code", language: "python", caption: "Initial pointers", code: "slow = 0\nfast = 1" },
  {
    kind: "pattern-stepper",
    steps: [
      {
        label: "Start",
        title: "Initial array",
        cells: [2, 2, 4, 4, 6],
        pointers: [
          { index: 0, label: "slow", tone: "left" },
          { index: 1, label: "fast", tone: "right" },
        ],
        note: "Slow marks index 0. Fast begins at index 1.",
      },
      {
        label: "Step 1",
        title: "Fast finds another 2",
        cells: [2, 2, 4, 4, 6],
        pointers: [
          { index: 0, label: "slow", tone: "left" },
          { index: 1, label: "fast", tone: "right" },
        ],
        note: "The value at fast equals the value at slow. This is a duplicate, so slow does not move.",
      },
      {
        label: "Step 2",
        title: "Fast finds 4",
        cells: [2, 4, 4, 4, 6],
        pointers: [
          { index: 1, label: "slow", tone: "left" },
          { index: 2, label: "fast", tone: "right" },
        ],
        note: "The value at fast differs from the value at slow. Advance slow by one and copy 4 to that position.",
      },
    ],
  },
  {
    kind: "prose",
    body: [
      "Only the unique prefix matters. The elements after the prefix can still contain old values.",
      "Continue the same process. Fast checks the remaining elements. Slow advances only when fast finds a new unique value.",
      "At the end, the array begins with:",
    ],
  },
  { kind: "code", language: "text", caption: "Unique prefix", code: "[2, 4, 6]" },
  { kind: "prose", body: ["The number of unique values is 3."] },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Python implementation",
    body: ["Here is a complete solution for removing duplicates from a sorted array."],
  },
  { kind: "pattern-canvas", problemSet: "fast-slow" },
  { kind: "prose", body: ["Example:"] },
  { kind: "pattern-example", problemSet: "fast-slow" },
  {
    kind: "list",
    body: ["Notice three things:"],
    items: [
      "`fast` checks every element, starting at index 1.",
      "`slow` advances only when a new value appears.",
      "`slow + 1` gives the number of unique elements because array indexes start at 0.",
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Important",
    body: "The function does not shorten the Python list. It returns the number of valid elements. Only the first `k` elements are the unique result.",
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "When does this pattern work?",
    body: [],
  },
  {
    kind: "table",
    caption: "Where the slow-fast approach fits",
    headers: ["Situation", "Result"],
    rows: [
      ["Sorted array with adjacent duplicates", "Works well"],
      ["Need to modify the array in place", "Works well"],
      ["Need to preserve the order of unique values", "Works well"],
      ["Unsorted array with duplicates anywhere", "This exact approach is not sufficient"],
    ],
  },
  {
    kind: "prose",
    body: [
      "**Why does sorting matter?** In a sorted array, equal values appear next to each other. Therefore, comparing the fast value with the latest unique value is enough.",
    ],
  },
  { kind: "prose", body: ["For this algorithm:"] },
  {
    kind: "table",
    caption: "Cost of removing duplicates with slow and fast pointers",
    headers: ["Measure", "Cost", "Why"],
    rows: [
      ["Time complexity", "`O(n)`", "The fast pointer scans each element once."],
      ["Extra space", "`O(1)`", "Only a fixed number of extra variables are used."],
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Array contents",
    body: "The algorithm does not move all duplicates to the end. It places unique values at the beginning. The remaining positions may contain old values and are not part of the result.",
  },
  {
    kind: "prose",
    body: [
      "The slow pointer marks the position of the last unique value. The fast pointer searches for the next unique value.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Trace the pointers yourself",
    body: ["Do not run Python yet.", "Given this sorted array:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Practice array",
    code: "numbers = [3, 3, 6, 6, 9]",
  },
  { kind: "prose", body: ["Initially:"] },
  { kind: "code", language: "python", caption: "Initial pointers", code: "slow = 0\nfast = 1" },
  { kind: "prose", body: ["Answer these questions:"] },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "choice",
        label: "Question A",
        title: "Duplicate or new value?",
        prompt: "When fast = 1, do the pointers detect a duplicate or a new value?",
        options: ["A duplicate", "A new value"],
        answer: 0,
        success: "Right. numbers[1] is 3, the same as numbers[0], so slow stays at 0.",
        hint: "Compare numbers[fast] with numbers[slow].",
      },
      {
        type: "fields",
        label: "Question B",
        title: "When fast reaches the 6",
        prompt: "When fast = 2, what happens to slow and the array?",
        fields: [
          { label: "slow moves to index", answer: 1, tone: "left" },
          { label: "Value written there", answer: 6, tone: "left" },
        ],
        success: "Correct. 6 differs from 3, so slow moves to 1 and numbers[1] becomes 6.",
        hint: "6 differs from numbers[slow], so slow advances first, then the value is copied.",
      },
      {
        type: "fields",
        label: "Question C",
        title: "Count the unique values",
        prompt: "After the loop finishes, how many unique values are there?",
        fields: [{ label: "Unique values", answer: 3 }],
        success: "Correct. The prefix is [3, 6, 9], so the function returns slow + 1 = 3.",
        hint: "Follow fast to the end and count how many times slow advanced, plus the first value.",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "Same-direction pointers both move left to right: `fast` checks every element, and `slow` moves only when something is kept.",
      "`slow` marks the end of the valid prefix. Everything after it is leftover data, not part of the result.",
      "In a sorted array, comparing `numbers[fast]` with `numbers[slow]` is enough, because equal values sit next to each other.",
      "The function returns a count instead of shortening the list. Read the result as `numbers[:k]`.",
      "One pass and two indexes: `O(n)` time and `O(1)` extra space.",
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const fastSlow: LessonBuilder<Record<string, never>> = {
  slug: "fast-slow",
  title: "Two Pointers: Same Direction (Slow & Fast)",
  subtitle:
    "Remove duplicates from a sorted array in place as one pointer scans and the other writes.",
  problem: "Remove duplicates from a sorted array in place and return the number of unique values.",
  spotIt: [
    "The array is sorted and you must remove duplicates or keep each value a limited number of times.",
    "The prompt asks you to modify the array in place and return a count.",
  ],
  avoidWhen: [
    "Duplicates can appear anywhere in an unsorted array.",
    "You need a brand-new array and may use extra memory.",
  ],
  takeaways: [
    "Fast finds. Slow writes.",
    "slow marks the end of the unique prefix; return slow + 1.",
    "One pass, O(n) time and O(1) extra space.",
  ],
  variant: "fast-slow",
  view: "array",
  code: removeDuplicatesCode,
  sections: fastSlowSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [2, 2, 4, 4, 6, 6, 8],
      narration: "Use the concept lesson to trace the slow and fast pointers.",
    },
  ],
};
