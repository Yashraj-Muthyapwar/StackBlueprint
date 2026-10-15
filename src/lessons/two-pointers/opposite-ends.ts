import type { LessonBuilder, QuizQuestion, Section } from "../types";

const reverseArrayCode = `def reverse_array(numbers):
    left = 0
    right = len(numbers) - 1

    while left < right:
        numbers[left], numbers[right] = (
            numbers[right],
            numbers[left]
        )
        left += 1
        right -= 1

    return numbers`;

/**
 * Hidden grader for the coding challenge. It runs after the learner's code, so it uses
 * builtins directly in case the learner shadowed names such as `list` or `print`.
 * A tracked list rejects slicing, iteration, copying, and resizing, and it counts writes:
 * reversing with `while left < right` writes exactly 2 * (n // 2) times.
 */
const reverseArrayTests = String.raw`import builtins as _sb_b
import random as _sb_random


def _sb_grade():
    _b = _sb_b
    fn = globals().get("reverse_array")
    if not _b.callable(fn):
        return "Define a function named reverse_array(numbers)."

    def _blocked(message):
        def method(self, *args, **kwargs):
            raise _b.RuntimeError(message)
        return method

    copy_msg = "Do not copy the list or build another array. Swap values by index."
    resize_msg = "Do not add or remove items. Reverse the list by swapping values in place."

    class _Tracked(_b.list):
        def __init__(self, data):
            _b.list.__init__(self, data)
            self._sb_writes = 0

        def __getitem__(self, index):
            if _b.isinstance(index, _b.slice):
                raise _b.RuntimeError("Slicing is not allowed. Read one index at a time.")
            return _b.list.__getitem__(self, index)

        def __setitem__(self, index, value):
            if _b.isinstance(index, _b.slice):
                raise _b.RuntimeError("Slice assignment is not allowed. Write one index at a time.")
            self._sb_writes += 1
            _b.list.__setitem__(self, index, value)

        __iter__ = _blocked("Do not loop over the values directly. Move the left and right indices instead.")
        __reversed__ = _blocked("reversed() is not allowed. Use the two-pointer method.")
        reverse = _blocked("list.reverse() is not allowed. Use the two-pointer method.")
        sort = _blocked("Sorting is not allowed. Use the two-pointer method.")
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

    cases = [[2, 4, 6, 8], [10, 20, 30, 40, 50], [], [7], [1, 2], [5, 5, 1], [-3, 0, 9, -3, 4, 4]]
    rng = _sb_random.Random()
    for _ in _b.range(4):
        size = rng.randint(3, 12)
        cases.append([rng.randint(-50, 99) for _ in _b.range(size)])

    for case in cases:
        tracked = _Tracked(case)
        try:
            result = fn(tracked)
        except _b.Exception as error:
            return f"reverse_array({case}) raised {_b.type(error).__name__}: {error}"
        actual = _b.list.__getitem__(tracked, _b.slice(None))
        expected = case[::-1]
        if actual != expected:
            return f"reverse_array({case}) left the list as {actual}. Expected {expected}."
        if result is not None and result is not tracked:
            return "Return the same list you received, or nothing. Do not return a new list."
        swaps_needed = _b.len(case) // 2
        if tracked._sb_writes != 2 * swaps_needed:
            return (
                f"reverse_array({case}) wrote to the list {tracked._sb_writes} times. "
                f"A two-pointer reversal makes exactly {swaps_needed} swaps ({2 * swaps_needed} writes). "
                "Check that your loop uses while left < right and swaps each pair once."
            )
    return "All hidden tests passed"


_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "opposite-ends-reverse-code",
  question:
    "Practical challenge. Write a function named `reverse_array(numbers)` that reverses an array in place using two pointers. Test it with `numbers = [2, 4, 6, 8]`, `reverse_array(numbers)`, and `print(numbers)`. Do not use `numbers[::-1]`, `reversed()`, or another array to store the reversed values. Use the two-pointer method we learned.",
  interactiveCode: true,
  initialCode: `def reverse_array(numbers):
    # Write your two-pointer solution here
    pass


numbers = [2, 4, 6, 8]
reverse_array(numbers)
print(numbers)
`,
  testCode: reverseArrayTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [String.raw`def\s+reverse_array\s*\(`, String.raw`\bwhile\b`],
  validationMessage:
    "Define `reverse_array(numbers)` and move a left pointer and a right pointer inward with a `while` loop.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\[[^\]\n]*:[^\]\n]*\]`,
      message: "Slicing such as `numbers[::-1]` is not allowed. Swap values one index at a time.",
    },
    {
      pattern: String.raw`\breversed\s*\(|\.reverse\s*\(`,
      message: "`reversed()` and `list.reverse()` are not allowed. Use the two-pointer method.",
    },
    {
      pattern: String.raw`\bsorted\s*\(|\.sort\s*\(`,
      message: "Sorting does not reverse an array. Use the two-pointer method.",
    },
    {
      pattern: String.raw`\blist\s*\(|\.copy\s*\(|\[\s*\]|\.append\s*\(|\.insert\s*\(|\.extend\s*\(`,
      message:
        "Do not create another array to store the reversed values. Swap the values inside `numbers`.",
    },
    {
      pattern: String.raw`\bfor\b`,
      message: "Use a `while left < right` loop that moves both pointers instead of a `for` loop.",
    },
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Use plain index swaps.",
    },
  ],
  explanation:
    "Start `left` at 0 and `right` at `len(numbers) - 1`. While `left < right`, swap `numbers[left]` and `numbers[right]`, then move both pointers inward. The hidden tests try empty, odd, even, and random arrays.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "opposite-ends-loop-condition",
    question: "Why does the loop use `while left < right`?",
    options: [
      "To keep the pointers moving forever.",
      "To stop when the pointers meet or cross.",
      "To make the array longer.",
    ],
    correctIndex: 1,
    explanation:
      "Once `left` reaches or passes `right`, every pair has been swapped. A middle element in an odd-length array is already in its final position.",
  },
  {
    id: "opposite-ends-time-complexity",
    question: "What is the time complexity of reversing an array using opposite-end pointers?",
    options: ["O(1)", "O(n)", "O(n²)"],
    correctIndex: 1,
    explanation:
      "The loop makes `n // 2` swaps, and each swap does a fixed amount of work. That grows in proportion to `n`, so the time is O(n).",
  },
  {
    id: "opposite-ends-suitable-example",
    question: "Which array is a suitable example for the opposite-end pattern?",
    options: [
      "Reversing [2, 4, 6, 8] in place.",
      "Finding the maximum value by checking every element with one pointer.",
      "Counting the number of elements in an array.",
    ],
    correctIndex: 0,
    explanation:
      "Reversing pairs the first element with the last, the second with the second to last, and so on. The work happens at both ends, which is what this pattern is built for.",
  },
  challenge,
];

const oppositeEndsSections: Section[] = [
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "Why do we use this pattern?",
    body: ["Imagine that you need to reverse an array."],
  },
  {
    kind: "code",
    language: "python",
    caption: "The array to reverse",
    code: "numbers = [10, 20, 30, 40, 50]",
  },
  {
    kind: "prose",
    body: [
      "One simple approach is to create another array and copy the elements in reverse order.",
      "But we can do better. We can swap elements at opposite ends until the pointers meet.",
      "This approach lets us reverse the array without creating another array.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "Imagine two people",
    body: ["Imagine two people standing at opposite ends of a row of five boxes."],
  },
  { kind: "opposite-ends-intuition", caption: "Each person starts at an opposite end." },
  {
    kind: "prose",
    body: [
      "The left pointer starts at index `0`. The right pointer starts at index `4`.",
      "They swap the two elements. Then the left pointer moves one step right, and the right pointer moves one step left.",
      "They repeat this process until the pointers meet or cross.",
      "That is the **opposite-ends two-pointer pattern**.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "Follow each step",
    body: ["Start with this array:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Starting state",
    code: "numbers = [10, 20, 30, 40, 50]\nleft = 0\nright = len(numbers) - 1",
  },
  {
    kind: "pattern-stepper",
    steps: [
      {
        title: "Swap the outer elements",
        cells: [10, 20, 30, 40, 50],
        pointers: [
          { index: 0, label: "left", tone: "left" },
          { index: 4, label: "right", tone: "right" },
        ],
        note: "Swap `numbers[left]` with `numbers[right]`.",
      },
      {
        title: "Move both pointers inward",
        cells: [50, 20, 30, 40, 10],
        pointers: [
          { index: 1, label: "left", tone: "left" },
          { index: 3, label: "right", tone: "right" },
        ],
        note: "Now `left = 1` and `right = 3`.",
      },
      {
        title: "Swap again",
        cells: [50, 40, 30, 20, 10],
        pointers: [
          { index: 1, label: "left", tone: "left" },
          { index: 3, label: "right", tone: "right" },
        ],
        note: "The array is reversed.",
      },
    ],
  },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Python implementation",
    body: ["Read this code. Focus on the pointer positions."],
  },
  { kind: "pattern-canvas", problemSet: "opposite-ends" },
  { kind: "pattern-example", problemSet: "opposite-ends" },
  {
    kind: "list",
    body: ["There are three important operations:"],
    items: [
      "`while left < right`: Continue while the pointers have not met or crossed.",
      "The assignment swaps the two elements.",
      "`left += 1` and `right -= 1`: Move both pointers inward.",
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Remember this interview rule",
    body: "Use `while left < right` when swapping elements from opposite ends. It avoids a needless swap when both pointers meet.",
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "When does this pattern work?",
    body: [
      "Use opposite-end pointers when the problem involves both ends of an array, such as reversing an array or finding a target sum in a sorted array.",
      "Do not assume it works for every array problem. For example, finding a target sum in an unsorted array does not give you a reliable reason to move either pointer inward.",
      "For reversing an array:",
    ],
  },
  {
    kind: "table",
    caption: "Cost of reversing an array with opposite-end pointers",
    headers: ["Measure", "Cost"],
    rows: [
      ["Time complexity", "`O(n)`"],
      ["Extra space", "`O(1)`"],
    ],
  },
  {
    kind: "prose",
    body: [
      "Here, *n* is the number of elements. Each swap processes two elements, so the total number of swaps grows in proportion to the array length.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Your turn",
    body: ["Do not write code yet. Trace the pointers first.", "Consider this array:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Practice array",
    code: "numbers = [3, 8, 12, 17, 21]\nleft = 0\nright = len(numbers) - 1",
  },
  {
    kind: "prose",
    body: [
      "Assume that you are reversing the array by swapping the elements at `left` and `right`.",
    ],
  },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "fields",
        title: "Identify the pointers",
        prompt: "Enter the starting index and the value stored at that index.",
        fields: [
          { label: "Left index", answer: 0, tone: "left" },
          { label: "Left value", answer: 3, tone: "left" },
          { label: "Right index", answer: 4, tone: "right" },
          { label: "Right value", answer: 21, tone: "right" },
        ],
        success: "Both pointers are in the right place.",
        hint: "Indices start at 0, and the last index is len(numbers) - 1.",
      },
      {
        type: "cells",
        title: "After the first swap",
        prompt: "What does the array look like after you swap the two elements?",
        answers: [21, 8, 12, 17, 3],
        success: "Correct. Only the two outer values changed places.",
        hint: "Only the values at left and right move.",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "Opposite-end pointers start at index `0` and index `len(numbers) - 1`, then walk toward each other.",
      "Each loop iteration swaps `numbers[left]` and `numbers[right]`, then moves `left` right and `right` left.",
      "`while left < right` stops when the pointers meet or cross, so the middle element is never swapped with itself.",
      "Reversing in place takes `O(n)` time and `O(1)` extra space because no second array is created.",
      "Reach for this pattern when both ends of the array matter, such as reversing or a target sum in a sorted array. An unsorted array gives no reliable rule for moving either pointer.",
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const oppositeEnds: LessonBuilder<Record<string, never>> = {
  slug: "opposite-ends",
  title: "Two Pointers: Opposite Ends",
  subtitle:
    "Reverse an array in place by swapping values from both ends until the pointers meet or cross.",
  problem: "Reverse an array in place using a left pointer and a right pointer.",
  spotIt: [
    "The problem involves both ends of an array, such as reversing it in place.",
    "The array is sorted and you need a pair that reaches a target sum.",
  ],
  avoidWhen: [
    "The array is unsorted and you need a target sum, so there is no reliable reason to move either pointer.",
    "Only one end of the array matters, such as finding the maximum with a single scan.",
  ],
  takeaways: [
    "Start left at index 0 and right at the last index, then move them toward each other.",
    "Use while left < right so the loop stops when the pointers meet or cross.",
    "Reversing in place takes O(n) time and O(1) extra space.",
  ],
  variant: "opposite-ends",
  view: "array",
  code: reverseArrayCode,
  sections: oppositeEndsSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [10, 20, 30, 40, 50],
      narration:
        "Use the concept lesson to trace both pointers as they swap values and move inward.",
    },
  ],
};
