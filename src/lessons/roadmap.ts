import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Boxes,
  Database,
  Flag,
  Layers,
  Maximize2,
  Repeat,
  Search,
  Server,
  Sigma,
  SquareStack,
  Target,
  TrendingUp,
  Triangle,
  RotateCw,
  FlipHorizontal,
  Compass,
  Cloud,
  Hash,
} from "lucide-react";

import type { LessonBuilder } from "./types";

import { oppositeEnds } from "./two-pointers/opposite-ends";
import { fastSlow } from "./two-pointers/fast-slow";
import { dutchFlag } from "./two-pointers/dutch-flag";

import { fixedSize } from "./sliding-window/fixed-size";
import { variableExpandShrink } from "./sliding-window/variable-expand-shrink";
import { monotonicWindow } from "./sliding-window/monotonic-window";

import { prefixSum } from "./prefix/prefix-sum";
import { prefixXor } from "./prefix/prefix-xor";
import { prefix2D } from "./prefix/prefix-2d";

import { kadane } from "./kadane/max-subarray";
import { maxProduct } from "./kadane/max-product-subarray";
import { subarrayGivenXor } from "./kadane/subarray-given-xor";

import { bsearchIndex } from "./binary-search/on-index";
import { bsearchAnswer } from "./binary-search/on-answer";

import { rotate90 } from "./matrix/rotate-90";
import { transposeFlip } from "./matrix/transpose-flip";
import { spiral } from "./matrix/spiral";
import { diagonal } from "./matrix/diagonal";

export type PatternEntry = {
  slug: string;
  title: string;
  blurb: string;
  category: string;
  lessons: { builder: LessonBuilder; icon: LucideIcon }[];
};

export const patterns: PatternEntry[] = [
  {
    slug: "two-pointers",
    title: "Two Pointers",
    category: "Arrays",
    blurb: "Two indices walk the array — converging, chasing, or partitioning.",
    lessons: [
      { builder: oppositeEnds, icon: ArrowLeftRight },
      { builder: fastSlow, icon: Repeat },
      { builder: dutchFlag, icon: Flag },
    ],
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    category: "Arrays",
    blurb: "A window of contiguous elements expands and contracts as the pointers walk.",
    lessons: [
      { builder: fixedSize, icon: SquareStack },
      { builder: variableExpandShrink, icon: Maximize2 },
      { builder: monotonicWindow, icon: TrendingUp },
    ],
  },
  {
    slug: "prefix",
    title: "Prefix Based",
    category: "Arrays",
    blurb: "Precompute cumulative state so range queries become O(1) subtractions.",
    lessons: [
      { builder: prefixSum, icon: Sigma },
      { builder: prefixXor, icon: Sigma },
      { builder: prefix2D, icon: Layers },
    ],
  },
  {
    slug: "kadane",
    title: "Kadane's / Subarray",
    category: "Arrays",
    blurb: "Greedy single-pass scans over subarrays — extend or restart.",
    lessons: [
      { builder: kadane, icon: TrendingUp },
      { builder: maxProduct, icon: Triangle },
      { builder: subarrayGivenXor, icon: Hash },
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    category: "Arrays",
    blurb: "Halve the search range each step — on indices, or on the answer itself.",
    lessons: [
      { builder: bsearchIndex, icon: Search },
      { builder: bsearchAnswer, icon: Target },
    ],
  },
  {
    slug: "matrix",
    title: "Matrix / 2D Array",
    category: "Arrays",
    blurb: "Index-arithmetic patterns over grids — rotations, traversals, transformations.",
    lessons: [
      { builder: rotate90, icon: RotateCw },
      { builder: transposeFlip, icon: FlipHorizontal },
      { builder: spiral, icon: Compass },
      { builder: diagonal, icon: Compass },
    ],
  },
];

export const PATTERN_BY_SLUG: Record<string, PatternEntry> = Object.fromEntries(
  patterns.map((p) => [p.slug, p]),
);

// ---- Sidebar roadmap shape ----
export type RoadmapLesson = {
  title: string;
  slug: string;
  path: string;
  icon: LucideIcon;
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
  slug: string;
  icon: LucideIcon;
  blurb: string;
  /** Optional grouping label shown above the patterns (e.g. "Arrays / Matrix"). */
  sectionTitle?: string;
  /** Path to the category's overview page when the category is unlocked. */
  overviewPath?: string;
  patterns: RoadmapPattern[];
  locked?: boolean;
};

const arrayPatterns: RoadmapPattern[] = patterns.map((p) => ({
  title: p.title,
  slug: p.slug,
  path: `/patterns/${p.slug}`,
  blurb: p.blurb,
  lessons: p.lessons.map((l) => ({
    title: l.builder.title.replace(/^[^—]+—\s*/, ""),
    slug: l.builder.slug,
    path: `/patterns/${p.slug}/${l.builder.slug}`,
    icon: l.icon,
  })),
}));

const lockedPattern = (title: string, slug: string, blurb: string): RoadmapPattern => ({
  title,
  slug,
  blurb,
  lessons: [],
  locked: true,
});

export const roadmap: RoadmapCategory[] = [
  {
    title: "Patterns (DSA)",
    slug: "patterns-dsa",
    icon: Boxes,
    blurb: "Visual, animated walkthroughs of the canonical DSA patterns.",
    sectionTitle: "Arrays / Matrix",
    overviewPath: "/patterns",
    patterns: arrayPatterns,
  },
  {
    title: "SQL Mastery",
    slug: "sql-mastery",
    icon: Database,
    locked: true,
    blurb: "From joins to query plans — write SQL that scales with your data.",
    patterns: [
      lockedPattern("Joins", "joins", "Inner, outer, semi, anti, self — pick the right join for the shape of your data."),
      lockedPattern("Window Functions", "window-functions", "ROW_NUMBER, RANK, LAG/LEAD, framed aggregates — analytics inside SQL."),
      lockedPattern("CTEs", "ctes", "Common Table Expressions and recursive CTEs for readable, layered queries."),
      lockedPattern("Optimization", "optimization", "Reading EXPLAIN plans, indexing strategy, and rewriting hot queries."),
    ],
  },
  {
    title: "System Design",
    slug: "system-design",
    icon: Server,
    locked: true,
    blurb: "Design systems that survive scale, failure, and traffic spikes.",
    patterns: [
      lockedPattern("Scalability", "scalability", "Vertical vs horizontal scaling, load balancing, sharding, and stateless services."),
      lockedPattern("Caching", "caching", "Cache placement, eviction policies, invalidation, and consistency trade-offs."),
      lockedPattern("Databases", "databases", "OLTP vs OLAP, SQL vs NoSQL, replication, partitioning, and CAP trade-offs."),
    ],
  },
  {
    title: "Data Warehouses",
    slug: "data-warehouses",
    icon: Cloud,
    locked: true,
    blurb: "Cloud warehouses, modeling, and the cost/perf knobs that matter.",
    patterns: [
      lockedPattern("Snowflake", "snowflake", "Virtual warehouses, micro-partitions, clustering, and Snowpark fundamentals."),
      lockedPattern("BigQuery", "bigquery", "Slots, partitioning & clustering, BI Engine, and cost-aware query design."),
      lockedPattern("Amazon Redshift", "redshift", "Distribution styles, sort keys, RA3 nodes, and workload management."),
    ],
  },
];

export const CATEGORY_BY_SLUG: Record<string, RoadmapCategory> = Object.fromEntries(
  roadmap.map((c) => [c.slug, c]),
);
