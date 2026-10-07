import type { QuizQuestion, Section } from "../types";

const bruteForce = `def two_sum_brute_force(arr, target):
    for i in range(len(arr) - 1):
        for j in range(i + 1, len(arr)):
            if arr[i] + arr[j] == target:
                return (i, j)
    return None`;

export const twoSumIntro: Section[] = [
  {
    kind: "prose",
    heading: "1. Understand what the result means",
    body: [
      "Find **two different indices** whose values add to the target. The values do not need to be next to each other. Return the indices, not the values.",
      "For `arr = [2, 7, 11, 15]` and `target = 9`, the values are `2` and `7`. Their zero-based indices are `0` and `1`. This lesson returns `(0, 1)`.",
      "Two equal values can form a pair if they have different indices. For `[5, 5]` and target `10`, return `(0, 1)`. A single `[5]` cannot form that pair.",
    ],
  },
  {
    kind: "prose",
    heading: "2. Start with all possible pairs",
    body: [
      "Choose an index `i`. Check each later index `j`. Start `j` at `i + 1` to avoid using the same index twice. This also avoids checking a pair in both orders.",
      "In the worst case, you check `(n - 1) + (n - 2) + ... + 1` pairs. That is `n(n - 1) / 2` checks, or **O(n²) time**. The code uses **O(1) extra space**.",
      "The input is already sorted. Can that order tell us which pairs cannot work?",
    ],
  },
  {
    kind: "code",
    language: "python",
    caption: "Brute force: check every distinct pair until a match is found.",
    code: bruteForce,
  },
  {
    kind: "prose",
    heading: "3. Use the sorted order",
    body: [
      "Set `left = 0` and `right = len(arr) - 1`. A pointer stores an index. `arr[left]` and `arr[right]` are the values at those indices.",
      "The left value is the smallest remaining value. The right value is the largest remaining value. Compare their sum with the target.",
      "Do not select this method just because the input contains negative numbers. Select it because sorted order lets each comparison exclude one end value.",
    ],
  },
  {
    kind: "table",
    caption: "The movement rule for sorted Two Sum",
    headers: ["Sum compared with target", "Action", "Why the excluded value cannot work"],
    rows: [
      [
        "Less than target",
        "Increase left by 1",
        "Even the largest remaining partner makes the sum too small.",
      ],
      [
        "Greater than target",
        "Decrease right by 1",
        "Even the smallest remaining partner makes the sum too large.",
      ],
      ["Equal to target", "Return (left, right)", "The two values form a valid pair."],
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "Watch the reason for each move",
    body: "Use Next to advance one step. Faded cells are indices excluded from the search. Turn on Predict to choose the next pointer before you see the explanation. The default example includes both movement rules.",
  },
];

export function twoSumReview(code: string): Section[] {
  return [
    {
      kind: "table",
      caption: "4. Trace the default example: [1, 3, 4, 5, 7, 10, 11], target 9",
      headers: ["Indices (left, right)", "Values and sum", "Decision"],
      rows: [
        ["(0, 6)", "1 + 11 = 12", "Too large: exclude index 6."],
        ["(0, 5)", "1 + 10 = 11", "Too large: exclude index 5."],
        ["(0, 4)", "1 + 7 = 8", "Too small: exclude index 0."],
        ["(1, 4)", "3 + 7 = 10", "Too large: exclude index 4."],
        ["(1, 3)", "3 + 5 = 8", "Too small: exclude index 1."],
        ["(2, 3)", "4 + 5 = 9", "Match: return (2, 3)."],
      ],
    },
    {
      kind: "prose",
      heading: "5. Stop before you reuse an index",
      body: [
        "Continue only while `left < right`. If both pointers reach the same index, there is only one value available. The search must stop.",
        "For `[1, 5, 8]` and target `10`, the pointers eventually meet at index `1`. Using `left <= right` would incorrectly accept `5 + 5` from that single index.",
        "Each unsuccessful comparison excludes one index. Any valid pair must remain between the pointers. When fewer than two indices remain, return `None`.",
      ],
    },
    {
      kind: "prose",
      heading: "6. Explain the cost",
      body: [
        "The distance `right - left` starts at `n - 1`. Each unsuccessful comparison decreases it by 1. The algorithm makes at most `n - 1` pair checks. Its time cost is **O(n)**.",
        "The algorithm stores only two indices and the current sum. It uses **O(1) extra space**. The animation stores extra data to display its steps; that is separate from the algorithm.",
        "If you must sort the array first, include the sorting cost. A comparison sort typically takes O(n log n) time. Its extra space depends on the sorting method.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Check the input and output contract",
      body: "This lesson uses zero-based indices and returns None when no pair exists. LeetCode Two Sum II guarantees one solution and requires one-based positions. For that problem, change the successful return to [left + 1, right + 1]. For unsorted Two Sum, use a hash map or preserve original indices before sorting.",
    },
    {
      kind: "interactive-code",
      caption:
        "7. Run the function. Change an array or target, then run it again. Keep each array sorted.",
      code: `${code}\n\nprint(two_sum([1, 3, 4, 5, 7, 10, 11], 9))  # (2, 3)\nprint(two_sum([5, 5], 10))                   # (0, 1)\nprint(two_sum([1, 5, 8], 10))                # None\nprint(two_sum([-5, -2, 0, 3, 7], 1))         # (1, 3)`,
    },
    {
      kind: "prose",
      heading: "Try these cases in the animation",
      body: [
        "Enter `[-5, -2, 0, 3, 7]` with target `1`. Negative values still follow the same rule because the array is sorted.",
        "Enter `[5, 5]` with target `10`. Check that the pointers identify two different indices.",
        "Enter `[1, 5, 8]` with target `10`. Watch the pointers meet without finding a pair.",
        "Video reference: [Two pointers | Brute force and Optimised Solution discussed](https://www.youtube.com/watch?v=o_fANlVBKuU). This lesson uses original explanations and Python examples to develop the brute-force-to-two-pointers sequence.",
      ],
    },
  ];
}

export const twoSumQuiz: QuizQuestion[] = [
  {
    id: "two-sum-exclude-left",
    question:
      "The sorted array is [1, 4, 6, 9]. The target is 12. The end values sum to 10. Why must left move?",
    options: [
      "1 cannot reach 12 even with the largest remaining value, 9.",
      "Moving right increases the sum.",
      "Both pointers must always move together.",
    ],
    correctIndex: 0,
    explanation:
      "Every remaining partner is at most 9. A pair containing the value 1 has a sum of at most 10. Exclude index 0.",
  },
  {
    id: "two-sum-distinct-indices",
    question:
      "For [1, 5, 8] and target 10, the pointers meet at the value 5. What must the function return?",
    options: ["(1, 1)", "None", "(0, 2)"],
    correctIndex: 1,
    explanation:
      "The value 5 occurs only once. The result must use two different indices. Stop when left is no longer less than right.",
  },
  {
    id: "two-sum-index-contract",
    question: "For [2, 7, 11, 15] and target 9, what result does this lesson return?",
    options: ["(2, 7)", "(1, 2)", "(0, 1)"],
    correctIndex: 2,
    explanation:
      "This lesson returns zero-based indices: (0, 1). The values are 2 and 7. LeetCode Two Sum II instead expects one-based positions [1, 2].",
  },
  {
    id: "two-sum-linear-cost",
    question: "Why does the two-pointer search take O(n) time on an already sorted array?",
    options: [
      "Each pointer checks every possible pair.",
      "Each unsuccessful comparison reduces right - left by 1.",
      "Sorted arrays always make any algorithm O(n).",
    ],
    correctIndex: 1,
    explanation:
      "The initial distance is n - 1. Every unsuccessful check reduces it. Each check performs a constant amount of work.",
  },
];
