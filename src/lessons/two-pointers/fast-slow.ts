import type { Lesson, LinkedListShape, LinkedListStep } from "../types";

const code = `def has_cycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`;

export const fastSlowShape: LinkedListShape = {
  nodes: 7,
  cycleTo: 3,
  labels: ["A", "B", "C", "D", "E", "F", "G"],
};

function nextOf(i: number): number {
  if (i < 0) return -1;
  if (i === fastSlowShape.nodes - 1) return fastSlowShape.cycleTo;
  return i + 1;
}

function build(): LinkedListStep[] {
  const steps: LinkedListStep[] = [];

  steps.push({
    line: 1,
    pointers: [],
    narration:
      "Floyd's algorithm: two pointers traverse the list at different speeds. If a cycle exists, they meet.",
  });

  let slow = 0;
  let fast = 0;

  steps.push({
    line: 2,
    pointers: [
      { name: "slow", index: slow, color: "mint", placement: "above" },
      { name: "fast", index: fast, color: "amber", placement: "below" },
    ],
    narration: "Both pointers start at the head.",
  });

  let safety = 0;
  while (safety++ < 50) {
    steps.push({
      line: 3,
      pointers: [
        { name: "slow", index: slow, color: "mint", placement: "above" },
        { name: "fast", index: fast, color: "amber", placement: "below" },
      ],
      narration: "Can fast take two steps? Check fast and fast.next are non-null.",
    });

    slow = nextOf(slow);
    steps.push({
      line: 4,
      pointers: [
        { name: "slow", index: slow, color: "mint", placement: "above" },
        { name: "fast", index: fast, color: "amber", placement: "below" },
      ],
      narration: `slow advances one node → index ${slow}.`,
    });

    const mid = nextOf(fast);
    fast = nextOf(mid);
    steps.push({
      line: 5,
      pointers: [
        { name: "slow", index: slow, color: "mint", placement: "above" },
        { name: "fast", index: fast, color: "amber", placement: "below" },
      ],
      narration: `fast advances two nodes → index ${fast}.`,
    });

    steps.push({
      line: 6,
      pointers: [
        { name: "slow", index: slow, color: "mint", placement: "above" },
        { name: "fast", index: fast, color: "amber", placement: "below" },
      ],
      highlight:
        slow === fast ? { kind: "match", indices: [slow] } : { kind: "compare", indices: [slow, fast] },
      status: `slow=${slow}, fast=${fast}`,
      narration:
        slow === fast
          ? `slow and fast meet at index ${slow} — a cycle is confirmed.`
          : `slow (${slow}) ≠ fast (${fast}), keep racing.`,
    });

    if (slow === fast) {
      steps.push({
        line: 7,
        pointers: [
          { name: "slow", index: slow, color: "mint", placement: "above" },
          { name: "fast", index: fast, color: "amber", placement: "below" },
        ],
        highlight: { kind: "match", indices: [slow] },
        status: "return True",
        narration: "Return True — the list contains a cycle.",
      });
      return steps;
    }
  }
  return steps;
}

export const fastSlow: Lesson<LinkedListStep> = {
  slug: "fast-slow",
  title: "Two Pointers — Fast & Slow",
  subtitle:
    "The tortoise & hare: two pointers move at different speeds through a linked list to detect a cycle.",
  variant: "fast-slow",
  code,
  steps: build(),
};
