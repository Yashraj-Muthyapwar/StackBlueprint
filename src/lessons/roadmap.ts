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
  Container,
  Lightbulb,
  Download,
  PlayCircle,
  Terminal,
  Settings,
  Activity,
  Trash2,
  FileCode,
  Command,
  Wrench,
  Upload,
  HelpCircle,
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

import { longestSubstringNoRepeat } from "./strings/longest-substring-no-repeat";
import { minWindowSubstring } from "./strings/min-window-substring";
import { anagramInString } from "./strings/anagram-in-string";
import { palindromeCheck } from "./strings/palindrome-check";
import { reverseWords } from "./strings/reverse-words";
import { stringCompression } from "./strings/string-compression";
import { kmp } from "./strings/kmp";
import { rabinKarp } from "./strings/rabin-karp";
import { zAlgorithm } from "./strings/z-algorithm";

import { frequencyCounting } from "./hash-map/frequency-counting";
import { topKFrequent } from "./hash-map/top-k-frequent";
import { twoSum } from "./hash-map/two-sum";
import { subarraySumK } from "./hash-map/subarray-sum-k";
import { arrayIntersection } from "./hash-map/array-intersection";
import { happyNumber } from "./hash-map/happy-number";
import { containsDuplicateK } from "./hash-map/contains-duplicate-k";
import { firstUniqueChar } from "./hash-map/first-unique-char";
import { groupAnagrams } from "./hash-map/group-anagrams";
import { groupShiftedStrings } from "./hash-map/group-shifted-strings";

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
  {
    slug: "sliding-window-string",
    title: "Sliding Window",
    category: "Strings",
    blurb: "Windowed substring problems — distinct chars, cover-of-pattern, anagrams.",
    lessons: [
      { builder: longestSubstringNoRepeat, icon: Maximize2 },
      { builder: minWindowSubstring, icon: Target },
      { builder: anagramInString, icon: Repeat },
    ],
  },
  {
    slug: "two-pointers-string",
    title: "Two Pointers",
    category: "Strings",
    blurb: "Mirror/converging pointers and in-place reads-writes over char buffers.",
    lessons: [
      { builder: palindromeCheck, icon: ArrowLeftRight },
      { builder: reverseWords, icon: Repeat },
      { builder: stringCompression, icon: Hash },
    ],
  },
  {
    slug: "pattern-matching",
    title: "Pattern Matching",
    category: "Strings",
    blurb: "Exact substring search: KMP failure function, Rabin–Karp rolling hash, Z-algorithm.",
    lessons: [
      { builder: kmp, icon: Search },
      { builder: rabinKarp, icon: Hash },
      { builder: zAlgorithm, icon: Target },
    ],
  },
  {
    slug: "hash-frequency",
    title: "Frequency Based",
    category: "Hash Map",
    blurb: "Count occurrences in O(n), then mine the counts for modes, top-K, and majorities.",
    lessons: [
      { builder: frequencyCounting, icon: Sigma },
      { builder: topKFrequent, icon: TrendingUp },
    ],
  },
  {
    slug: "hash-lookup",
    title: "Lookup Based",
    category: "Hash Map",
    blurb: "Trade an O(n²) pair scan for one pass: hash what you've seen, look up the complement.",
    lessons: [
      { builder: twoSum, icon: Target },
      { builder: subarraySumK, icon: Sigma },
    ],
  },
  {
    slug: "hash-set",
    title: "Set Based",
    category: "Hash Map",
    blurb: "Membership in O(1) — intersections, dedup, and cycle detection over visited states.",
    lessons: [
      { builder: arrayIntersection, icon: Layers },
      { builder: happyNumber, icon: Repeat },
    ],
  },
  {
    slug: "hash-index",
    title: "Index Mapping",
    category: "Hash Map",
    blurb: "Store the *index* a value last appeared at — enables window jumps and uniqueness checks.",
    lessons: [
      { builder: containsDuplicateK, icon: Search },
      { builder: firstUniqueChar, icon: Hash },
    ],
  },
  {
    slug: "hash-grouping",
    title: "Grouping Pattern",
    category: "Hash Map",
    blurb: "Normalize each item to a canonical key; equal keys partition the input into buckets.",
    lessons: [
      { builder: groupAnagrams, icon: Layers },
      { builder: groupShiftedStrings, icon: SquareStack },
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
export type RoadmapSection = {
  title: string;
  patterns: RoadmapPattern[];
};
export type RoadmapCategory = {
  title: string;
  slug: string;
  icon: LucideIcon;
  blurb: string;
  /** Optional grouping label shown above the patterns (e.g. "Arrays / Matrix"). */
  sectionTitle?: string;
  /** Multiple labelled sub-sections under this category (rendered in order). */
  sections?: RoadmapSection[];
  /** Path to the category's overview page when the category is unlocked. */
  overviewPath?: string;
  patterns: RoadmapPattern[];
  locked?: boolean;
};

const toRoadmapPattern = (p: PatternEntry): RoadmapPattern => ({
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
});

const arrayPatterns: RoadmapPattern[] = patterns
  .filter((p) => p.category === "Arrays")
  .map(toRoadmapPattern);
const stringPatterns: RoadmapPattern[] = patterns
  .filter((p) => p.category === "Strings")
  .map(toRoadmapPattern);
const hashMapPatterns: RoadmapPattern[] = patterns
  .filter((p) => p.category === "Hash Map")
  .map(toRoadmapPattern);

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
    overviewPath: "/patterns",
    sections: [
      { title: "Arrays / Matrix", patterns: arrayPatterns },
      { title: "Strings", patterns: stringPatterns },
      { title: "Hash Map", patterns: hashMapPatterns },
    ],
    patterns: [...arrayPatterns, ...stringPatterns, ...hashMapPatterns],
  },
  {
    title: "SQL Mastery",
    slug: "sql-mastery",
    icon: Database,
    locked: true,
    overviewPath: "/sql",
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
    locked: false,
    overviewPath: "/data-warehouses",
    blurb: "Cloud warehouses, modeling, and the cost/perf knobs that matter.",
    patterns: [
      {
        title: "Data Ecosystems",
        slug: "data-ecosystems",
        blurb: "From transaction processing (OLTP) to analytical datastores (OLAP) and distributed meshes.",
        lessons: [], // Populated by foundations-content.ts in actual routes
      },
      {
        title: "Data Formats & Storage",
        slug: "data-formats",
        blurb: "Understanding how data is stored, compressed, and managed at scale.",
        lessons: [], // Populated by foundations-content.ts in actual routes
      },
      lockedPattern("Snowflake", "snowflake", "Virtual warehouses, micro-partitions, clustering, and Snowpark fundamentals."),
      lockedPattern("BigQuery", "bigquery", "Slots, partitioning & clustering, BI Engine, and cost-aware query design."),
      lockedPattern("Amazon Redshift", "redshift", "Distribution styles, sort keys, RA3 nodes, and workload management."),
    ],
  },
  {
    title: "Docker",
    slug: "docker",
    icon: Server, // Use Server or Box icon (lucide-react)
    locked: false,
    overviewPath: "/docker",
    blurb: "From container foundations to advanced multi-container orchestration.",
    patterns: [
      {
        title: "Docker & Containers",
        slug: "what-is-docker",
        path: "/docker/foundations/what-is-docker",
        blurb: "Why Docker exists, how it stacks up against VMs, and how to run your first container.",
        lessons: [
          {
            title: "Why Docker Exists",
            slug: "why-docker-exists",
            path: "/docker/foundations/what-is-docker/why-docker-exists",
            icon: Lightbulb,
          },
          {
            title: "Containers vs Virtual Machines",
            slug: "containers-vs-vms",
            path: "/docker/foundations/what-is-docker/containers-vs-vms",
            icon: Container,
          },
          {
            title: "Terminal Prerequisites",
            slug: "terminal-prerequisites",
            path: "/docker/foundations/what-is-docker/terminal-prerequisites",
            icon: Terminal,
          },
          {
            title: "Setting Up Docker",
            slug: "setting-up-docker",
            path: "/docker/foundations/what-is-docker/setting-up-docker",
            icon: Download,
          },
          {
            title: "Docker Architecture",
            slug: "docker-architecture",
            path: "/docker/foundations/what-is-docker/docker-architecture",
            icon: Server,
          },
          {
            title: "Your First Container",
            slug: "your-first-container",
            path: "/docker/foundations/what-is-docker/your-first-container",
            icon: PlayCircle,
          },
          {
            title: "Basic Docker Commands",
            slug: "basic-docker-commands",
            path: "/docker/foundations/what-is-docker/basic-docker-commands",
            icon: Command,
          },
        ],
      },
      {
        title: "Images and Containers",
        slug: "images-and-containers",
        path: "/docker/foundations/images-and-containers",
        blurb: "Master the core lifecycle of Docker: building images, running containers, and debugging running environments.",
        lessons: [
          {
            title: "What is a Docker Image?",
            slug: "what-is-a-docker-image",
            path: "/docker/foundations/images-and-containers/what-is-a-docker-image",
            icon: Layers,
          },
          {
            title: "Pulling and Inspecting Images",
            slug: "pulling-and-inspecting-images",
            path: "/docker/foundations/images-and-containers/pulling-and-inspecting-images",
            icon: Search,
          },
          {
            title: "Running Containers",
            slug: "running-containers",
            path: "/docker/foundations/images-and-containers/running-containers",
            icon: PlayCircle,
          },
          {
            title: "Mastering the Container Lifecycle",
            slug: "mastering-container-lifecycle",
            path: "/docker/foundations/images-and-containers/mastering-container-lifecycle",
            icon: Activity,
          },
          {
            title: "Passing Configuration: ARG vs. ENV",
            slug: "passing-configuration",
            path: "/docker/foundations/images-and-containers/passing-configuration",
            icon: Settings,
          },
          {
            title: "Debugging Containers",
            slug: "debugging-containers",
            path: "/docker/foundations/images-and-containers/debugging-containers",
            icon: Terminal,
          },
          {
            title: "Cleaning Up Images and Containers",
            slug: "cleaning-up",
            path: "/docker/foundations/images-and-containers/cleaning-up",
            icon: Trash2,
          },
          {
            title: "Writing a Dockerfile",
            slug: "writing-a-dockerfile",
            path: "/docker/foundations/images-and-containers/writing-a-dockerfile",
            icon: FileCode,
          },
          {
            title: "CMD vs. ENTRYPOINT",
            slug: "cmd-vs-entrypoint",
            path: "/docker/foundations/images-and-containers/cmd-vs-entrypoint",
            icon: Command,
          },
          {
            title: "Image Building & Caching",
            slug: "image-building-caching",
            path: "/docker/foundations/images-and-containers/image-building-caching",
            icon: Wrench,
          },
          {
            title: "Publishing Images",
            slug: "publishing-images",
            path: "/docker/foundations/images-and-containers/publishing-images",
            icon: Upload,
          },
          {
            title: "Images & Containers Quiz",
            slug: "images-containers-quiz",
            path: "/docker/foundations/images-and-containers/images-containers-quiz",
            icon: HelpCircle,
          },
        ],
      },
      {
        title: "Networking & Storage",
        slug: "networking-storage",
        path: "/docker/foundations/networking-storage",
        blurb: "Connecting containers and persisting data with volumes and bind mounts.",
        lessons: [],
      },
      lockedPattern("Docker Compose", "compose", "Declarative multi-container applications and local dev environments."),
      lockedPattern("Advanced Docker", "advanced", "Multi-stage builds, security, and registry management."),
    ],
  },
];

export const CATEGORY_BY_SLUG: Record<string, RoadmapCategory> = Object.fromEntries(
  roadmap.map((c) => [c.slug, c]),
);
