import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Binary,
  Boxes,
  Braces,
  GitBranch,
  Hash,
  Layers,
  Link2,
  Lock,
  Network,
  Repeat,
  Sparkles,
  Spline,
  Type,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import dsaLogo from "@/images/logos/dsa-logo.png";

import { patterns } from "@/lessons/roadmap";

const arrayPatternTitles = patterns.filter((p) => p.category === "Arrays").map((p) => p.title);
const stringPatternTitles = patterns.filter((p) => p.category === "Strings").map((p) => p.title);
const hashMapPatternTitles = patterns.filter((p) => p.category === "Hash Map").map((p) => p.title);

export const Route = createFileRoute("/patterns/")({
  head: () => ({
    meta: [
      { title: "Patterns (DSA) — StackBlueprint" },
      {
        name: "description",
        content:
          "Interview-grade DSA patterns visualized step-by-step. Arrays / Matrix track is live; more topics coming soon.",
      },
      { property: "og:title", content: "Patterns (DSA) — StackBlueprint" },
      {
        property: "og:description",
        content: "Visual, animated DSA pattern lessons. Arrays / Matrix unlocked.",
      },
    ],
  }),
  component: PatternsIndex,
});

type Topic = {
  title: string;
  blurb: string;
  icon: LucideIcon;
  locked: boolean;
  to?: string;
  patternsList: string[];
};

const topics: Topic[] = [
  {
    title: "Arrays / Matrix",
    blurb:
      "Two pointers, sliding window, prefix-based, Kadane's, binary search, and matrix traversals.",
    icon: Boxes,
    locked: false,
    to: "/patterns/category/arrays",
    patternsList: arrayPatternTitles,
  },
  {
    title: "Strings",
    blurb:
      "Sliding window on characters, two-pointer scans, and exact matching with KMP, Rabin–Karp, and Z.",
    icon: Type,
    locked: false,
    to: "/patterns/category/strings",
    patternsList: stringPatternTitles,
  },
  {
    title: "Hash Map",
    blurb:
      "Frequency, lookup, set, index mapping, and grouping — O(1) ops that unlock O(n) solutions.",
    icon: Hash,
    locked: false,
    to: "/patterns/category/hash-map",
    patternsList: hashMapPatternTitles,
  },
  {
    title: "Linked List",
    blurb: "Reversal, cycle detection, merging, and in-place rewiring.",
    icon: Link2,
    locked: true,
    patternsList: ["Reversal", "Cycle detection", "Merge & split", "Reorder"],
  },
  {
    title: "Stack / Queue",
    blurb: "Monotonic stack, next greater element, expression parsing, and deques.",
    icon: Layers,
    locked: true,
    patternsList: ["Monotonic stack", "NGE", "Parsing", "Deque tricks"],
  },
  {
    title: "Trees",
    blurb: "DFS / BFS, recursion patterns, LCA, BST invariants, and tree DP.",
    icon: GitBranch,
    locked: true,
    patternsList: ["DFS / BFS", "BST ops", "LCA", "Tree DP"],
  },
  {
    title: "Graphs",
    blurb: "BFS / DFS, Union-Find, topological sort, Dijkstra, and MST.",
    icon: Network,
    locked: true,
    patternsList: ["Union-Find", "Topo sort", "Dijkstra", "MST"],
  },
  {
    title: "Heap / Priority Queue",
    blurb: "Top-K, k-way merge, scheduling, and streaming medians.",
    icon: Spline,
    locked: true,
    patternsList: ["Top-K", "K-way merge", "Median stream"],
  },
  {
    title: "Backtracking",
    blurb: "Subsets, permutations, combinations, N-Queens, and constraint search.",
    icon: Repeat,
    locked: true,
    patternsList: ["Subsets", "Permutations", "N-Queens", "Sudoku"],
  },
  {
    title: "Dynamic Programming",
    blurb: "1D / 2D DP, knapsack family, LIS, LCS, and interval DP.",
    icon: Workflow,
    locked: true,
    patternsList: ["Knapsack", "LIS / LCS", "Interval DP", "Bitmask DP"],
  },
  {
    title: "Greedy",
    blurb: "Interval scheduling, exchange arguments, and Huffman-style proofs.",
    icon: Sparkles,
    locked: true,
    patternsList: ["Intervals", "Exchange args", "Huffman"],
  },
  {
    title: "Tries",
    blurb: "Prefix trees, autocomplete, XOR tries, and word dictionaries.",
    icon: Braces,
    locked: true,
    patternsList: ["Prefix tree", "Autocomplete", "XOR trie"],
  },
  {
    title: "Bit Manipulation",
    blurb: "Bit tricks, masks, popcount, and subset enumeration via bits.",
    icon: Binary,
    locked: true,
    patternsList: ["Bit tricks", "Subset bitmask", "Popcount"],
  },
];

function PatternsIndex() {
  const unlocked = topics.filter((t) => !t.locked).length;
  return (
    <div className="relative">
      <div className="grid-bg absolute inset-0 -z-10 opacity-40" />

      <section className="border-b border-hairline px-8 py-14 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3" />
              Back to roadmap
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 backdrop-blur">
              <Sparkles className="size-3.5 text-mint" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Patterns (DSA) · {unlocked} of {topics.length} topics unlocked
              </span>
            </div>
          </div>
          <div className="mb-6">
            <img src={dsaLogo} alt="DSA Patterns Logo" className="size-16 object-contain drop-shadow-sm lg:size-20" />
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight lg:text-5xl">
            DSA patterns, visualized.
          </h1>
          <p className="mt-3 max-w-2xl text-balance text-muted-foreground lg:text-lg">
            Every pattern is a small, animated story: code on one side, the data structure breathing
            on the other. Start with the Arrays / Matrix track — the rest land soon.
          </p>
        </div>
      </section>

      <section className="px-8 py-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => {
              const card = (
                <div
                  className={`group relative h-full overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                    t.locked
                      ? "border-hairline/60 bg-surface/40 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-1"
                      : "border-hairline bg-surface hover:border-mint/50 hover:shadow-[0_8px_30px_-5px_rgba(94,234,212,0.15)] hover:-translate-y-1"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`grid size-10 place-items-center rounded-md ${
                        t.locked
                          ? "bg-surface-2 text-muted-foreground/70 ring-1 ring-hairline"
                          : "bg-mint/15 text-mint ring-1 ring-mint/30"
                      }`}
                    >
                      <t.icon className="size-5" />
                    </div>
                    {t.locked ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                        <Lock className="size-3" />
                        Locked
                      </span>
                    ) : (
                      <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mint">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-medium tracking-tight">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.patternsList.slice(0, 6).map((p) => (
                      <span
                        key={p}
                        className={
                          t.locked
                            ? "rounded-full border border-hairline px-2 py-0.5 text-[10px] text-muted-foreground/80"
                            : "rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 text-[10px] text-mint"
                        }
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm">
                    {t.locked ? (
                      <span className="text-muted-foreground">
                        Coming soon <ArrowRight className="ml-1 inline size-4" />
                      </span>
                    ) : (
                      <span className="text-mint">
                        Open track <ArrowRight className="ml-1 inline size-4" />
                      </span>
                    )}
                  </div>
                </div>
              );

              if (!t.locked && t.to) {
                const category = t.to.replace("/patterns/category/", "");
                return (
                  <Link
                    key={t.title}
                    to="/patterns/category/$category"
                    params={{ category }}
                    className="block"
                  >
                    {card}
                  </Link>
                );
              }
              return (
                <div key={t.title} aria-disabled className="block cursor-not-allowed">
                  {card}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
