import type { LessonBuilder, LinkedListShape, Step } from "../types";

type Inputs = { nodes: number; cycleTo: number };

const code = `def has_cycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`;

function shape({ nodes, cycleTo }: Inputs): LinkedListShape {
  const labels = Array.from({ length: nodes }, (_, i) => String.fromCharCode(65 + (i % 26)));
  return { nodes, cycleTo, labels };
}

function build({ nodes, cycleTo }: Inputs): Step[] {
  const steps: Step[] = [];
  const nextOf = (i: number): number => {
    if (i < 0) return -1;
    if (i === nodes - 1) return cycleTo;
    return i + 1;
  };

  steps.push({ line: 1, narration: "Floyd's tortoise & hare — two pointers race; if cycled, they meet.", pointers: [] });

  let slow = 0,
    fast = 0;
  const ptrs = () => [
    { name: "slow", index: slow, color: "mint" as const, placement: "above" as const },
    { name: "fast", index: fast, color: "amber" as const, placement: "below" as const },
  ];

  steps.push({ line: 2, pointers: ptrs(), narration: "Both start at head." });

  let safety = 0;
  while (safety++ < 3 * nodes + 10) {
    steps.push({ line: 3, pointers: ptrs(), narration: `Can fast take 2 steps? fast=${fast}, next=${nextOf(fast)}.` });
    if (fast < 0 || nextOf(fast) < 0) {
      steps.push({ line: 7, pointers: ptrs(), status: "return False", narration: "Fast hit null — no cycle. Return False." });
      return steps;
    }
    slow = nextOf(slow);
    steps.push({ line: 4, pointers: ptrs(), narration: `slow advances → ${slow}.` });
    const mid = nextOf(fast);
    fast = nextOf(mid);
    steps.push({ line: 5, pointers: ptrs(), narration: `fast advances twice → ${fast}.` });
    steps.push({
      line: 6,
      pointers: ptrs(),
      highlight: slow === fast ? { kind: "match", indices: [slow] } : { kind: "compare", indices: [slow, fast] },
      status: `slow=${slow}, fast=${fast}`,
      narration: slow === fast ? `They meet at ${slow} — cycle confirmed.` : `slow ≠ fast, keep racing.`,
    });
    if (slow === fast) {
      steps.push({
        line: 7,
        pointers: ptrs(),
        highlight: { kind: "match", indices: [slow] },
        status: "return True",
        narration: "Return True — list contains a cycle.",
      });
      return steps;
    }
  }
  return steps;
}

export const fastSlow: LessonBuilder<Inputs> = {
  slug: "fast-slow",
  title: "Two Pointers — Fast & Slow",
  subtitle: "Tortoise & hare: two pointers move at different speeds through a linked list to detect a cycle.",
  problem: "Given the head of a singly linked list, return True if the list contains a cycle and False otherwise. Use O(1) extra space.",
  variant: "fast-slow",
  view: "linked-list",
  code,
  defaultInputs: { nodes: 7, cycleTo: 3 },
  inputs: [
    { key: "nodes", label: "Node count", kind: "int", min: 3, max: 14, help: "3 – 14" },
    { key: "cycleTo", label: "Last node loops to index", kind: "int", help: "-1 for no cycle" },
  ],
  validate: ({ nodes, cycleTo }) => {
    const w: string[] = [];
    if (nodes < 3 || nodes > 14) w.push("Use 3–14 nodes for a readable visualization.");
    if (cycleTo !== -1 && (cycleTo < 0 || cycleTo >= nodes))
      w.push(`cycleTo must be -1 (no cycle) or 0 .. ${nodes - 1}.`);
    if (cycleTo === -1) w.push("No cycle present — algorithm should return False after fast walks off the end.");
    return w;
  },
  build,
  shape,
};
