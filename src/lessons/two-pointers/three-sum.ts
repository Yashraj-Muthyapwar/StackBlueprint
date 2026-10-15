import type { LessonBuilder, QuizQuestion, Section } from "../types";

const threeSumCode = `def three_sum(numbers: list[int], target: int) -> list[list[int]]:
    numbers.sort()
    result = []
    for i in range(len(numbers) - 2):
        # Skip repeated fixed values
        if i > 0 and numbers[i] == numbers[i - 1]:
            continue
        left = i + 1
        right = len(numbers) - 1
        while left < right:
            total = numbers[i] + numbers[left] + numbers[right]
            if total == target:
                result.append([
                    numbers[i],
                    numbers[left],
                    numbers[right]
                ])
                left += 1
                right -= 1
                # Skip repeated left values
                while left < right and numbers[left] == numbers[left - 1]:
                    left += 1
                # Skip repeated right values
                while left < right and numbers[right] == numbers[right + 1]:
                    right -= 1
            elif total < target:
                left += 1
            else:
                right -= 1
    return result`;

/**
 * Hidden grader for the closest-triplet challenge. It runs after the learner's code and reaches
 * builtins directly, so shadowing `min` or `print` cannot fake a pass. It checks the returned sum
 * against every triplet, then counts the lines the learner's code executes on an 80-value array:
 * checking every triplet blows the budget even when the learner copies the list first, while a
 * sorted two-pointer search stays far below it.
 */
const closestTripletTests = String.raw`import builtins as _sb_b
import random as _sb_random
import sys as _sb_sys


class _SbBudget(_sb_b.Exception):
    pass


def _sb_grade():
    _b = _sb_b
    fn = globals().get("three_sum_closest")
    if not _b.callable(fn):
        return "Define a function named three_sum_closest(numbers, target)."

    def all_sums(values):
        size = _b.len(values)
        sums = set()
        for a in _b.range(size):
            for b in _b.range(a + 1, size):
                for c in _b.range(b + 1, size):
                    sums.add(values[a] + values[b] + values[c])
        return sums

    def run(values, goal, budget):
        used = [0]

        def tracer(frame, event, arg):
            name = frame.f_code.co_name
            if name.startswith("_sb_") or name == "<module>":
                return None
            if event == "line":
                used[0] += 1
                if used[0] > budget:
                    raise _SbBudget()
            return tracer

        data = _b.list(values)
        _sb_sys.settrace(tracer)
        try:
            return fn(data, goal), used[0], False
        except _SbBudget:
            return None, used[0], True
        finally:
            _sb_sys.settrace(None)

    rng = _sb_random.Random()
    cases = [
        ([-1, 2, 1, -4], 1),
        ([0, 0, 0], 1),
        ([1, 1, 1, 0], -100),
        ([-5, -2, -1, 0, 2, 4], 0),
        ([3, 3, 3], 9),
        ([5, 1, 4, 2, 9], 8),
        ([-3, -3, 7, 7, 0], 100),
    ]
    for _ in _b.range(6):
        size = rng.randint(3, 10)
        cases.append(([rng.randint(-20, 20) for _ in _b.range(size)], rng.randint(-30, 30)))
    cases.append(([rng.randint(-100, 100) for _ in _b.range(80)], rng.randint(-150, 150)))

    for values, goal in cases:
        size = _b.len(values)
        sums = all_sums(values)
        best = _b.min(_b.abs(total - goal) for total in sums)
        result, used, over = run(values, goal, 12 * size * size + 200)
        if over:
            return (
                f"three_sum_closest on {size} values ran more than {12 * size * size + 200} lines of code. "
                "Checking every triplet is too slow. Sort the array, fix one number, and move two pointers."
            )
        if not _b.isinstance(result, _b.int):
            return f"three_sum_closest({values}, {goal}) returned {result!r}. Return the closest sum as an integer."
        if result not in sums:
            return (
                f"three_sum_closest({values}, {goal}) returned {result}, "
                "which is not the sum of any three different numbers in the array."
            )
        if _b.abs(result - goal) != best:
            return (
                f"three_sum_closest({values}, {goal}) returned {result}. "
                f"A sum closer to the target exists, at distance {best}."
            )
    return "All hidden tests passed"


_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "three-sum-closest",
  question:
    "Practical challenge: Closest triplet sum. Write a function `three_sum_closest(numbers, target)` that returns the sum of three different numbers in the array that is closest to the target. Use the sorting and two-pointer method from this lesson. For `numbers = [-1, 2, 1, -4]` and `target = 1`, the closest sum is `2`, from `-1 + 2 + 1`. Do not check every triplet.",
  interactiveCode: true,
  initialCode: `def three_sum_closest(numbers, target):
    # Write your code here.
    pass


numbers = [-1, 2, 1, -4]
print(three_sum_closest(numbers, 1))
`,
  testCode: closestTripletTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [
    String.raw`def\s+three_sum_closest\s*\(`,
    String.raw`\bwhile\b`,
    String.raw`\.sort\s*\(|\bsorted\s*\(`,
  ],
  validationMessage:
    "Define `three_sum_closest(numbers, target)`, sort the values, and move two pointers with a `while` loop.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b|\bsettrace\b`,
      message:
        "This challenge does not need imports or Python internals. Use sorting and two pointers.",
    },
  ],
  explanation:
    "Sort the array, then fix `i` and run `left` and `right` over the values after it. For each triplet, keep the sum if it is closer to the target than the best so far. If the sum is below the target move `left`, otherwise move `right`, and stop early when a sum equals the target. That is O(n²). The hidden tests compare the answer with every triplet and reject solutions that check every triplet.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "three-sum-why-sort",
    question: "Why does the algorithm sort the array first?",
    options: [
      "So a sum that is too small can be fixed by moving left right, and a sum that is too large by moving right left.",
      "So the triplets come out in the same order as the input.",
      "So no duplicate checks are needed afterward.",
    ],
    correctIndex: 0,
    explanation:
      "In a sorted array, moving `left` right never gives a smaller value and moving `right` left never gives a larger one. That is what lets each comparison decide which pointer to move. Duplicates still need their own skips.",
  },
  {
    id: "three-sum-too-small",
    question: "The sum of the three selected values is less than the target. What should happen?",
    options: [
      "Increase left, so the sum can grow.",
      "Decrease right, so the sum can shrink.",
      "Move i forward immediately.",
    ],
    correctIndex: 0,
    explanation:
      "The sum has to grow. The next value to the right of `left` is at least as large, so `left += 1` is the move that can help. Decreasing `right` would only make the sum smaller.",
  },
  {
    id: "three-sum-skip-duplicates",
    question: "After saving a triplet, why does the algorithm skip repeated left and right values?",
    options: [
      "To prevent duplicate triplets in the result.",
      "To make the sort faster.",
      "To keep right from reaching the end of the array.",
    ],
    correctIndex: 0,
    explanation:
      "A repeated value next to a value that was just used would build the same triplet again. Skipping it keeps every triplet in the result unique.",
  },
  {
    id: "three-sum-time",
    question: "What is the time complexity of 3-Sum with sorting and two pointers?",
    options: ["O(n)", "O(n²)", "O(n³)"],
    correctIndex: 1,
    explanation:
      "Sorting takes O(n log n). The outer loop fixes n numbers, and each fixed number gets one two-pointer pass of at most n steps. That is O(n²), which dominates the sort.",
  },
  challenge,
];

const threeSumSections: Section[] = [
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "What problem does it solve?",
    body: [
      "Given an array of integers, find all unique triplets whose sum equals a target.",
      "Example:",
    ],
  },
  {
    kind: "code",
    language: "python",
    caption: "Example input",
    code: "numbers = [-4, -1, 0, 1, 2, 5]\ntarget = 0",
  },
  { kind: "prose", body: ["The answer is:"] },
  { kind: "code", language: "text", caption: "Answer", code: "[[-4, -1, 5], [-1, 0, 1]]" },
  {
    kind: "prose",
    body: [
      "Both triplets add up to 0.",
      "A brute-force solution checks every group of three numbers. That takes `O(n³)` time.",
      "3-Sum improves this to `O(n²)` by sorting the array and using two pointers.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "Imagine fixing one number",
    body: ["Think of 3-Sum as a 2-Sum problem repeated for different fixed numbers."],
  },
  {
    kind: "three-sum-intuition",
    roles: [
      {
        symbol: "i",
        title: "Fixed number",
        text: "Select the first number of the triplet. Do not move it during this search.",
        tone: "fixed",
      },
      {
        symbol: "L",
        title: "Left pointer",
        text: "Starts immediately after i. Moves right when the sum is too small.",
        tone: "left",
      },
      {
        symbol: "R",
        title: "Right pointer",
        text: "Starts at the end. Moves left when the sum is too large.",
        tone: "right",
      },
    ],
  },
  {
    kind: "prose",
    body: [
      "The key idea:",
      "1. Sort the array.",
      "2. Fix one number at index `i`.",
      "3. Find two numbers that complete the target sum.",
      "4. Move `i` forward and repeat.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "Understand the three decisions",
    body: ["Calculate the sum of the three selected values:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "The sum",
    code: "total = numbers[i] + numbers[left] + numbers[right]",
  },
  { kind: "prose", body: ["Then apply these rules:"] },
  {
    kind: "table",
    caption: "The three decisions",
    headers: ["Condition", "Action", "Why?"],
    rows: [
      ["`total == target`", "Save the triplet; move both pointers", "We found a match"],
      ["`total < target`", "`left += 1`", "We need a larger sum"],
      ["`total > target`", "`right -= 1`", "We need a smaller sum"],
    ],
  },
  {
    kind: "prose",
    body: [
      "Because the array is sorted, moving `left` right gives a value that is at least as large. Moving `right` left gives a value that is at most as large.",
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Duplicate rule",
    body: "Skip repeated fixed values. After finding a triplet, skip repeated `left` and `right` values too. This prevents duplicate triplets in the result.",
  },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Complete Python implementation",
    body: [
      "Study this implementation. Notice how the outer loop chooses the fixed number and the inner loop searches for the other two numbers.",
    ],
  },
  { kind: "pattern-canvas", problemSet: "three-sum" },
  { kind: "pattern-example", problemSet: "three-sum" },
  {
    kind: "list",
    body: ["There are three important details:"],
    items: [
      "`range(len(numbers) - 2)` stops before `i` reaches the last two positions. A triplet needs two positions after the fixed number.",
      "`while left < right` prevents using the same array position twice.",
      "After finding a match, both pointers move. We then skip duplicates before searching again.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "What should you remember?",
    body: [],
  },
  {
    kind: "table",
    caption: "What to remember about 3-Sum",
    headers: ["Topic", "What to remember"],
    rows: [
      [
        "Time complexity",
        "`O(n²)`. Sorting takes `O(n log n)`, and the pointer searches take `O(n²)`.",
      ],
      [
        "Extra space",
        "The pointer scan uses `O(1)` auxiliary space, excluding the result and sorting implementation details.",
      ],
      ["Input changes", "`numbers.sort()` modifies the original array."],
      [
        "Duplicates",
        "Skipping repeated values is necessary when the result must contain unique triplets.",
      ],
      [
        "Target",
        "The target does not have to be zero. This implementation supports any integer target.",
      ],
    ],
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Trace the pointers",
    body: ["Use this array:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Practice array",
    code: "numbers = [-5, -2, -1, 0, 2, 4]\ntarget = 0\ni = 0\nleft = i + 1\nright = len(numbers) - 1",
  },
  {
    kind: "prose",
    body: ["**Your first trace**", "Answer without running the code."],
  },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "fields",
        label: "Question A",
        title: "The three selected values",
        prompt: "What are the three selected values?",
        fields: [
          { label: "numbers[i]", answer: -5, tone: "mid" },
          { label: "numbers[left]", answer: -2, tone: "left" },
          { label: "numbers[right]", answer: 4, tone: "right" },
        ],
        success: "Correct. i = 0, left = 1 and right = 5 select -5, -2 and 4.",
        hint: "Read numbers[0], numbers[1] and numbers[5].",
      },
      {
        type: "fields",
        label: "Question B",
        title: "Their sum",
        prompt: "What is their sum?",
        fields: [{ label: "total", answer: -3, tone: "accent" }],
        success: "Correct. -5 + -2 + 4 = -3.",
        hint: "Add the three values from question A.",
      },
      {
        type: "choice",
        label: "Question C",
        title: "Which pointer moves next",
        prompt: "Which pointer moves next, and why?",
        options: [
          "Move left right because the sum is too small.",
          "Move right left because the sum is too large.",
          "Move both pointers because the sum matches.",
        ],
        answer: 0,
        success: "Right. -3 is less than the target 0, so left moves right to find a larger value.",
        hint: "Compare the sum, -3, with the target, 0.",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "3-Sum is a 2-Sum search repeated for every fixed number `i`, after the array is sorted.",
      "Sorting makes the moves safe: a sum that is too small needs `left` to move right, and a sum that is too large needs `right` to move left.",
      "A match saves the triplet and moves both pointers, then skips repeated values on both sides.",
      "Skip a repeated fixed value, because the same `i` would only rebuild triplets that are already saved.",
      "The time is `O(n²)` and the extra space is `O(1)` beyond the result. `numbers.sort()` changes the original array.",
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const threeSum: LessonBuilder<Record<string, never>> = {
  slug: "three-sum",
  title: "3-Sum: Sorting + Two Pointers",
  subtitle:
    "Find all unique triplets that sum to a target by fixing one number and moving two pointers.",
  problem: "Find all unique triplets in an array whose sum equals a target.",
  spotIt: [
    "The prompt asks for all unique groups of three values that reach a target sum.",
    "You are allowed to sort, and the answer does not depend on the original positions.",
  ],
  avoidWhen: [
    "You need the original indices of the values, because sorting changes the order.",
    "The array is large and the groups are not three values; check whether a hash map suits the problem better.",
  ],
  takeaways: [
    "Sort, fix i, then run left and right over the rest.",
    "Skip repeated fixed, left and right values to keep triplets unique.",
    "O(n²) time and O(1) extra space beyond the result.",
  ],
  variant: "three-sum",
  view: "array",
  code: threeSumCode,
  sections: threeSumSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [-4, -1, 0, 1, 2, 5],
      narration: "Use the concept lesson to trace i, left and right as they search for triplets.",
    },
  ],
};
