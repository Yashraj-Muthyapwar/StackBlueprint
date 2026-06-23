import {
  ArrowLeftRight,
  Repeat,
  Flag,
  Layers,
  Type,
  Link2,
  TreePine,
  Network,
  Binary,
  Boxes,
  Sigma,
  Hash,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RoadmapLesson = {
  title: string;
  slug: string;
  path: string;
  icon: LucideIcon;
  locked?: boolean;
};

export type RoadmapPattern = {
  title: string;
  slug: string;
  path?: string;
  blurb: string;
  lessons: RoadmapLesson[];
  locked?: boolean;
};

export type RoadmapCategory = {
  title: string;
  icon: LucideIcon;
  patterns: RoadmapPattern[];
};

export const roadmap: RoadmapCategory[] = [
  {
    title: "Arrays",
    icon: Boxes,
    patterns: [
      {
        title: "Two Pointers",
        slug: "two-pointers",
        path: "/patterns/two-pointers",
        blurb: "Two indices walk the array — converging, chasing, or partitioning.",
        lessons: [
          {
            title: "Opposite Ends",
            slug: "opposite-ends",
            path: "/patterns/two-pointers/opposite-ends",
            icon: ArrowLeftRight,
          },
          {
            title: "Fast & Slow",
            slug: "fast-slow",
            path: "/patterns/two-pointers/fast-slow",
            icon: Repeat,
          },
          {
            title: "Dutch Flag",
            slug: "dutch-flag",
            path: "/patterns/two-pointers/dutch-flag",
            icon: Flag,
          },
        ],
      },
      {
        title: "Sliding Window",
        slug: "sliding-window",
        blurb: "A window of contiguous elements expands and contracts.",
        lessons: [],
        locked: true,
      },
      {
        title: "Prefix Sum",
        slug: "prefix-sum",
        blurb: "Precompute running totals to answer range queries in O(1).",
        lessons: [],
        locked: true,
      },
    ],
  },
  {
    title: "Strings",
    icon: Type,
    patterns: [
      { title: "Palindromes", slug: "palindromes", blurb: "", lessons: [], locked: true },
      { title: "Anagrams", slug: "anagrams", blurb: "", lessons: [], locked: true },
    ],
  },
  {
    title: "Linked Lists",
    icon: Link2,
    patterns: [
      { title: "Reversal", slug: "reversal", blurb: "", lessons: [], locked: true },
      { title: "Merge", slug: "merge", blurb: "", lessons: [], locked: true },
    ],
  },
  {
    title: "Search",
    icon: Binary,
    patterns: [
      { title: "Binary Search", slug: "binary-search", blurb: "", lessons: [], locked: true },
    ],
  },
  {
    title: "Trees",
    icon: TreePine,
    patterns: [
      { title: "DFS", slug: "tree-dfs", blurb: "", lessons: [], locked: true },
      { title: "BFS", slug: "tree-bfs", blurb: "", lessons: [], locked: true },
    ],
  },
  {
    title: "Graphs",
    icon: Network,
    patterns: [
      { title: "BFS / DFS", slug: "graph-traversal", blurb: "", lessons: [], locked: true },
      { title: "Union Find", slug: "union-find", blurb: "", lessons: [], locked: true },
    ],
  },
  {
    title: "Hashing",
    icon: Hash,
    patterns: [{ title: "Frequency Map", slug: "freq-map", blurb: "", lessons: [], locked: true }],
  },
  {
    title: "Dynamic Programming",
    icon: Layers,
    patterns: [
      { title: "1D DP", slug: "1d-dp", blurb: "", lessons: [], locked: true },
      { title: "2D DP", slug: "2d-dp", blurb: "", lessons: [], locked: true },
    ],
  },
  {
    title: "Greedy",
    icon: Sigma,
    patterns: [{ title: "Intervals", slug: "intervals", blurb: "", lessons: [], locked: true }],
  },
  {
    title: "Backtracking",
    icon: Workflow,
    patterns: [{ title: "Subsets", slug: "subsets", blurb: "", lessons: [], locked: true }],
  },
];
