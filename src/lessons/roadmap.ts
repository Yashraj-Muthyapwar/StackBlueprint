import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  Braces,
  Calculator,
  Calendar,
  Database,
  Filter,
  Flag,
  GitMerge,
  Layers,
  Maximize2,
  Repeat,
  Rows3,
  Search,
  Server,
  Sigma,
  SquareStack,
  Target,
  Table,
  TrendingUp,
  Triangle,
  RotateCw,
  FlipHorizontal,
  Compass,
  Cloud,
  Hash,
  KeyRound,
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
  Workflow,
  Upload,
  HelpCircle,
  Globe,
  ShieldAlert,
  LockKeyhole,
  Bot,
  GitBranch,
  FileText,
  Box,
  Code2,
} from "lucide-react";

import type { LessonBuilder } from "./types";

import dockerLogo from "@/images/logos/docker-logo.png";
import terraformLogo from "@/images/logos/terraform-logo.png";
import gitLogo from "@/images/logos/git-logo.png";
import sqlLogo from "@/images/logos/sql-logo.png";
import dwLogo from "@/images/logos/data-warehouses-logo.png";
import dsaLogo from "@/images/logos/dsa-logo.png";
import systemDesignLogo from "@/images/logos/system-design-logo.png";
import webScraperLogo from "@/images/logos/web-scraper-logo.png";
import pythonLogo from "@/images/logos/python-logo.png";
import dataEngineeringLogo from "@/images/logos/data-engineering-logo.png";
import pandasLogo from "@/images/logos/pandas-logo.svg";
import mongoDbLogo from "@/images/logos/MongoDB_Logomark_ForestGreen.png";

import { FUNDAMENTALS_TOPICS } from "./system-design/fundamentals-content";
import { DISTRIBUTED_SYSTEMS_TOPICS } from "./system-design/distributed-systems-content";

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
    blurb:
      "Store the *index* a value last appeared at — enables window jumps and uniqueness checks.",
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
  blurb?: string;
  patterns: RoadmapPattern[];
};
export interface RoadmapCategory {
  title: string;
  slug: string;
  icon: LucideIcon | string;
  iconColor?: string;
  blurb: string;
  /** Optional grouping label shown above the patterns (e.g. "Arrays / Matrix"). */
  sectionTitle?: string;
  /** Multiple labelled sub-sections under this category (rendered in order). */
  sections?: RoadmapSection[];
  /** Path to the category's overview page when the category is unlocked. */
  overviewPath?: string;
  patterns: RoadmapPattern[];
  locked?: boolean;
}

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

const unlockedAIPattern = (
  title: string,
  slug: string,
  blurb: string,
  lessonsList: string[],
): RoadmapPattern => ({
  title,
  slug,
  path: `/ai-engineering/${slug}`,
  blurb,
  lessons: lessonsList.map((lTitle) => {
    const lSlug = lTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return {
      title: lTitle,
      slug: lSlug,
      path: `/ai-engineering/${slug}/${lSlug}`,
      icon: Bot,
    };
  }),
  locked: false,
});

const unlockedMongoPattern = (
  title: string,
  slug: string,
  blurb: string,
  lessonsList: string[],
): RoadmapPattern => ({
  title,
  slug,
  path: `/mongodb/${slug}`,
  blurb,
  lessons: lessonsList.map((lTitle) => {
    const lSlug = lTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return {
      title: lTitle,
      slug: lSlug,
      path: `/mongodb/${slug}/${lSlug}`,
      icon: Database,
    };
  }),
  locked: false,
});


export const roadmap: RoadmapCategory[] = [
  {
    title: "Patterns (DSA)",
    slug: "patterns-dsa",
    icon: dsaLogo,
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
    icon: sqlLogo,
    locked: false,
    overviewPath: "/sql",
    blurb: "Master SQL: from database foundations to complex querying and performance tuning.",
    patterns: [],
    sections: [
      {
        title: "Foundations",
        patterns: [
          {
            title: "Database Fundamentals",
            slug: "database-fundamentals",
            path: "/sql/foundations/database-fundamentals",
            blurb:
              "Databases, DBMSs, relational modeling, keys, SQL command families, and storage basics.",
            lessons: [
              {
                title: "What is a Database?",
                slug: "what-is-database",
                path: "/sql/foundations/database-fundamentals/what-is-database",
                icon: Database,
              },
              {
                title: "What is a DBMS?",
                slug: "what-is-a-dbms",
                path: "/sql/foundations/database-fundamentals/what-is-a-dbms",
                icon: Database,
              },
              {
                title: "The Relational Model",
                slug: "relational-model-basics",
                path: "/sql/foundations/database-fundamentals/relational-model-basics",
                icon: Table,
              },
              {
                title: "Keys in Relational Databases",
                slug: "keys-in-relational-databases",
                path: "/sql/foundations/database-fundamentals/keys-in-relational-databases",
                icon: KeyRound,
              },
              {
                title: "Levels of Abstraction",
                slug: "levels-of-abstraction",
                path: "/sql/foundations/database-fundamentals/levels-of-abstraction",
                icon: Layers,
              },
              {
                title: "SQL Command Families",
                slug: "sql-commands",
                path: "/sql/foundations/database-fundamentals/sql-commands",
                icon: Terminal,
              },
              {
                title: "The Database Landscape",
                slug: "database-landscape",
                path: "/sql/foundations/database-fundamentals/database-landscape",
                icon: Boxes,
              },
              {
                title: "How Databases Work Under the Hood",
                slug: "db-under-the-hood",
                path: "/sql/foundations/database-fundamentals/db-under-the-hood",
                icon: Database,
              },
              {
                title: "Database Fundamentals: Final Quiz",
                slug: "fundamentals-quiz",
                path: "/sql/foundations/database-fundamentals/fundamentals-quiz",
                icon: HelpCircle,
              },
            ],
          },
          {
            title: "Data Types & Schemas",
            slug: "data-types",
            path: "/sql/foundations/data-types",
            blurb:
              "Choose types for numeric, text, date, JSON, and missing values without losing meaning.",
            lessons: [
              {
                title: "Numeric & Text Types",
                slug: "numeric-text",
                path: "/sql/foundations/data-types/numeric-text",
                icon: Hash,
              },
              {
                title: "Dates, Timestamps & Time Zones",
                slug: "dates-timestamps",
                path: "/sql/foundations/data-types/dates-timestamps",
                icon: Calendar,
              },
              {
                title: "JSON & JSONB",
                slug: "json-jsonb",
                path: "/sql/foundations/data-types/json-jsonb",
                icon: Braces,
              },
              {
                title: "NULL Semantics",
                slug: "null-semantics",
                path: "/sql/foundations/data-types/null-semantics",
                icon: AlertTriangle,
              },
            ],
          },
          {
            title: "SQL Querying Fundamentals",
            slug: "sql-querying-fundamentals",
            path: "/sql/foundations/sql-querying-fundamentals",
            blurb:
              "SELECT, FROM, filters, ordering, operators, and the logical order that makes queries predictable.",
            lessons: [
              {
                title: "Your First Query",
                slug: "your-first-query",
                path: "/sql/foundations/sql-querying-fundamentals/your-first-query",
                icon: Table,
              },
              {
                title: "SQL Basics: Comments, Calculations, and Aliases",
                slug: "sql-basics-comments-operators",
                path: "/sql/foundations/sql-querying-fundamentals/sql-basics-comments-operators",
                icon: Terminal,
              },
              {
                title: "SQL Operators: Arithmetic, Comparison, and Logic",
                slug: "sql-operators",
                path: "/sql/foundations/sql-querying-fundamentals/sql-operators",
                icon: Calculator,
              },
              {
                title: "WHERE Filters",
                slug: "where",
                path: "/sql/foundations/sql-querying-fundamentals/where",
                icon: Filter,
              },
              {
                title: "CASE WHEN: Label and Bucket Data",
                slug: "case-when",
                path: "/sql/foundations/sql-querying-fundamentals/case-when",
                icon: Rows3,
              },
              {
                title: "DISTINCT, ORDER BY & LIMIT",
                slug: "order-limit",
                path: "/sql/foundations/sql-querying-fundamentals/order-limit",
                icon: Rows3,
              },
              {
                title: "Logical Query Order",
                slug: "logical-order",
                path: "/sql/foundations/sql-querying-fundamentals/logical-order",
                icon: Workflow,
              },
              {
                title: "Querying Fundamentals: Final Quiz",
                slug: "querying-fundamentals-quiz",
                path: "/sql/foundations/sql-querying-fundamentals/querying-fundamentals-quiz",
                icon: HelpCircle,
              },
            ],
          },
        ],
      },
      {
        title: "Querying Data",
        patterns: [
          {
            title: "Filtering & Predicates",
            slug: "filtering",
            path: "/sql/querying/filtering",
            blurb:
              "Boolean logic, range and set filters, pattern matching, NULL semantics, and index-friendly WHERE predicates.",
            lessons: [
              {
                title: "Boolean Logic (AND / OR / NOT)",
                slug: "boolean-logic",
                path: "/sql/querying/filtering/boolean-logic",
                icon: Filter,
              },
              {
                title: "Set, Range & Array Filtering",
                slug: "in-between",
                path: "/sql/querying/filtering/in-between",
                icon: Filter,
              },
              {
                title: "Pattern Matching (LIKE / ILIKE)",
                slug: "like-ilike",
                path: "/sql/querying/filtering/like-ilike",
                icon: Filter,
              },
              {
                title: "The NULL Pitfalls (Three-Valued Logic)",
                slug: "null-pitfalls",
                path: "/sql/querying/filtering/null-pitfalls",
                icon: AlertTriangle,
              },
              {
                title: "Writing Efficient WHERE Predicates",
                slug: "writing-efficient-where-predicates",
                path: "/sql/querying/filtering/writing-efficient-where-predicates",
                icon: Search,
              },
              {
                title: "Filtering & Predicates: Final Quiz",
                slug: "filtering-predicates-quiz",
                path: "/sql/querying/filtering/filtering-predicates-quiz",
                icon: HelpCircle,
              },
            ],
          },
          {
            title: "Aggregations & GROUP BY",
            slug: "aggregations",
            path: "/sql/querying/aggregations",
            blurb:
              "Aggregate values, form groups, filter groups, and verify your understanding with a final quiz.",
            lessons: [
              {
                title: "Aggregate Functions (COUNT / COUNT DISTINCT / SUM / AVG / MIN / MAX)",
                slug: "aggregate-functions",
                path: "/sql/querying/aggregations/aggregate-functions",
                icon: Sigma,
              },
              {
                title: "GROUP BY: One Summary per Group",
                slug: "group-by",
                path: "/sql/querying/aggregations/group-by",
                icon: Sigma,
              },
              {
                title: "Evaluation Filtering (HAVING)",
                slug: "having",
                path: "/sql/querying/aggregations/having",
                icon: Filter,
              },
              {
                title: "Aggregations & GROUP BY: Final Quiz",
                slug: "aggregations-quiz",
                path: "/sql/querying/aggregations/aggregations-quiz",
                icon: HelpCircle,
              },
            ],
          },
          {
            title: "Joins",
            slug: "joins",
            path: "/sql/querying/joins",
            blurb:
              "Combine related tables, choose join shapes, and understand how the database executes them.",
            lessons: [
              {
                title: "Inner Joins & Join Conditions",
                slug: "inner-joins-conditions",
                path: "/sql/querying/joins/inner-joins-conditions",
                icon: GitMerge,
              },
              {
                title: "Outer Joins & NULL Semantics",
                slug: "outer-joins-null",
                path: "/sql/querying/joins/outer-joins-null",
                icon: GitMerge,
              },
              {
                title: "Cross Joins & Self Joins",
                slug: "cross-self-joins",
                path: "/sql/querying/joins/cross-self-joins",
                icon: GitMerge,
              },
              {
                title: "Semi-Joins & Anti-Joins",
                slug: "semi-anti-joins",
                path: "/sql/querying/joins/semi-anti-joins",
                icon: GitMerge,
              },
              {
                title: "Non-Equi, Range & ASOF Joins",
                slug: "non-equi-range-asof",
                path: "/sql/querying/joins/non-equi-range-asof",
                icon: GitMerge,
              },
              {
                title: "Joins + Aggregation",
                slug: "joins-aggregation-fan-out",
                path: "/sql/querying/joins/joins-aggregation-fan-out",
                icon: GitMerge,
              },
              {
                title: "LATERAL Joins",
                slug: "lateral-joins",
                path: "/sql/querying/joins/lateral-joins",
                icon: GitMerge,
              },
              {
                title: "Join Order, Internals & Performance",
                slug: "join-order-internals",
                path: "/sql/querying/joins/join-order-internals",
                icon: GitMerge,
              },
              {
                title: "Joins: Final Quiz",
                slug: "joins-final-quiz",
                path: "/sql/querying/joins/joins-final-quiz",
                icon: HelpCircle,
              },
            ],
          },
          {
            title: "Subqueries & Set Ops",
            slug: "subqueries",
            path: "/sql/querying/subqueries",
            blurb:
              "Use scalar and correlated subqueries, existence checks, and set operations with confidence.",
            lessons: [
              {
                title: "Scalar Subqueries",
                slug: "scalar-subqueries",
                path: "/sql/querying/subqueries/scalar-subqueries",
                icon: Layers,
              },
              {
                title: "Correlated Subqueries",
                slug: "correlated-subqueries",
                path: "/sql/querying/subqueries/correlated-subqueries",
                icon: Layers,
              },
              {
                title: "Existence Checks (EXISTS vs IN)",
                slug: "exists-vs-in",
                path: "/sql/querying/subqueries/exists-vs-in",
                icon: Filter,
              },
              {
                title: "Set Operations (UNION / INTERSECT / EXCEPT)",
                slug: "set-ops",
                path: "/sql/querying/subqueries/set-ops",
                icon: Layers,
              },
              {
                title: "Subqueries & Set Ops: Final Quiz",
                slug: "subqueries-quiz",
                path: "/sql/querying/subqueries/subqueries-quiz",
                icon: HelpCircle,
              },
            ],
          },
        ],
      },
      {
        title: "Specialized Data Handling",
        patterns: [
          {
            title: "String Functions",
            slug: "string-functions",
            path: "/sql/specialized/string-functions",
            blurb:
              "Build, extract, clean, and search text values with practical SQL string functions.",
            lessons: [
              {
                title: "CONCAT / CONCAT_WS / SUBSTRING: Build and Extract Text",
                slug: "concat-substring",
                path: "/sql/specialized/string-functions/concat-substring",
                icon: Hash,
              },
              {
                title: "LEFT / RIGHT / LENGTH / CHAR_LENGTH: Inspect Text",
                slug: "left-right-length",
                path: "/sql/specialized/string-functions/left-right-length",
                icon: Hash,
              },
              {
                title: "UPPER / LOWER / INITCAP: Standardize Text",
                slug: "upper-lower",
                path: "/sql/specialized/string-functions/upper-lower",
                icon: Hash,
              },
              {
                title: "TRIM / LTRIM / RTRIM / BTRIM / REPLACE: Clean Text",
                slug: "trim-replace",
                path: "/sql/specialized/string-functions/trim-replace",
                icon: Hash,
              },
              {
                title: "POSITION / SPLIT_PART",
                slug: "position-split-part",
                path: "/sql/specialized/string-functions/position-split-part",
                icon: Hash,
              },
              {
                title: "Regular Expressions: Flexible Pattern Matching",
                slug: "regex",
                path: "/sql/specialized/string-functions/regex",
                icon: Hash,
              },
              {
                title: "String Functions: Final Quiz",
                slug: "string-functions-quiz",
                path: "/sql/specialized/string-functions/string-functions-quiz",
                icon: HelpCircle,
              },
            ],
          },
          {
            title: "Numeric Functions",
            slug: "numeric-functions",
            path: "/sql/specialized/numeric-functions",
            blurb:
              "ROUND, TRUNC, CEIL/FLOOR, ABS, MOD/%, POWER/SQRT/EXP/LOG — the math layer of SQL.",
            lessons: [
              {
                title: "ROUND / TRUNC / CEIL / FLOOR: Shape Numbers",
                slug: "round-trunc-ceil-floor",
                path: "/sql/specialized/numeric-functions/round-trunc-ceil-floor",
                icon: Calculator,
              },
              {
                title: "NULLIF / COALESCE: Safe Math",
                slug: "nullif-coalesce",
                path: "/sql/specialized/numeric-functions/nullif-coalesce",
                icon: Calculator,
              },
              {
                title: "ABS / SIGN / LEAST / GREATEST: Compare Values",
                slug: "abs-sign-least-greatest",
                path: "/sql/specialized/numeric-functions/abs-sign-least-greatest",
                icon: Calculator,
              },
              {
                title: "MOD / %: Remainder & Parity",
                slug: "mod",
                path: "/sql/specialized/numeric-functions/mod",
                icon: Calculator,
              },
              {
                title: "POWER / SQRT / EXP / LOG: Model Scale",
                slug: "power-sqrt-log",
                path: "/sql/specialized/numeric-functions/power-sqrt-log",
                icon: Calculator,
              },
              {
                title: "RANDOM / RAND: Numbers in a Range",
                slug: "random-range",
                path: "/sql/specialized/numeric-functions/random-range",
                icon: Calculator,
              },
              {
                title: "Numeric Functions: Final Quiz",
                slug: "numeric-functions-quiz",
                path: "/sql/specialized/numeric-functions/numeric-functions-quiz",
                icon: HelpCircle,
              },
            ],
          },
          {
            title: "Date & Time",
            slug: "datetime-functions",
            path: "/sql/specialized/datetime-functions",
            blurb: "Time zones, interval math, and date arithmetic for scheduling and temporal overlaps.",
            lessons: [
              {
                title: "Current Time & Time Zones",
                slug: "time-zones-precision",
                path: "/sql/specialized/datetime-functions/time-zones-precision",
                icon: Calendar,
              },
              {
                title: "Extraction & Formatting",
                slug: "extraction-formatting",
                path: "/sql/specialized/datetime-functions/extraction-formatting",
                icon: Calendar,
              },
              {
                title: "Truncation & Bucketing",
                slug: "date-truncation",
                path: "/sql/specialized/datetime-functions/date-truncation",
                icon: Calendar,
              },
              {
                title: "Date Arithmetic & DATEDIFF",
                slug: "date-arithmetic",
                path: "/sql/specialized/datetime-functions/date-arithmetic",
                icon: Calendar,
              },
              {
                title: "Intervals, Lookbacks & Sargable Filters",
                slug: "intervals-lookbacks",
                path: "/sql/specialized/datetime-functions/intervals-lookbacks",
                icon: Calendar,
              },
              {
                title: "Calendar & Period Analysis",
                slug: "calendar-period-analysis",
                path: "/sql/specialized/datetime-functions/calendar-period-analysis",
                icon: Calendar,
              },
              {
                title: "Overlapping Ranges",
                slug: "overlapping-ranges",
                path: "/sql/specialized/datetime-functions/overlapping-ranges",
                icon: Calendar,
              },
              {
                title: "Date Spines & Gap Filling",
                slug: "date-spines-gap-filling",
                path: "/sql/specialized/datetime-functions/date-spines-gap-filling",
                icon: Calendar,
              },
              {
                title: "Date & Time: Final Quiz",
                slug: "datetime-quiz",
                path: "/sql/specialized/datetime-functions/datetime-quiz",
                icon: HelpCircle,
              },
            ],
          },
          {
            title: "Conversions",
            slug: "conversions",
            path: "/sql/specialized/conversions",
            blurb: "CAST and CONVERT — for schema evolution and cross-type operations.",
            lessons: [
              {
                title: "CAST / TO_CHAR (Type Casting)",
                slug: "cast-to-char",
                path: "/sql/specialized/conversions/cast-to-char",
                icon: Repeat,
              },
              {
                title: "CONVERT",
                slug: "convert",
                path: "/sql/specialized/conversions/convert",
                icon: Repeat,
              },
              {
                title: "Implicit Coercion",
                slug: "implicit-coercion",
                path: "/sql/specialized/conversions/implicit-coercion",
                icon: Repeat,
              },
              {
                title: "Safe Casts",
                slug: "safe-casts",
                path: "/sql/specialized/conversions/safe-casts",
                icon: Repeat,
              },
              {
                title: "Conversions: Final Quiz",
                slug: "conversions-quiz",
                path: "/sql/specialized/conversions/conversions-quiz",
                icon: HelpCircle,
              },
            ],
          },
          {
            title: "Error Handling",
            slug: "error-handling",
            path: "/sql/specialized/error-handling",
            locked: false,
            blurb: "Defensive queries, transactions, savepoints, and PostgreSQL exception blocks.",
            lessons: [
              {
                title: "Defensive Querying",
                slug: "failing-safely",
                path: "/sql/specialized/error-handling/failing-safely",
                icon: AlertTriangle,
              },
              {
                title: "Transactions & Rollbacks",
                slug: "transactions-rollbacks",
                path: "/sql/specialized/error-handling/transactions-rollbacks",
                icon: AlertTriangle,
              },
              {
                title: "Savepoints",
                slug: "savepoints",
                path: "/sql/specialized/error-handling/savepoints",
                icon: AlertTriangle,
              },
              {
                title: "Exception Handling (PostgreSQL)",
                slug: "plpgsql-exceptions",
                path: "/sql/specialized/error-handling/plpgsql-exceptions",
                icon: AlertTriangle,
              },
              {
                title: "Error Handling: Final Quiz",
                slug: "error-handling-quiz",
                path: "/sql/specialized/error-handling/error-handling-quiz",
                icon: HelpCircle,
              },
            ],
          },
        ],
      },
      {
        title: "Advanced SQL",
        patterns: [
          {
            title: "Window Functions",
            slug: "window-functions",
            path: "/sql/querying/window-functions",
            blurb:
              "Advanced analytical SQL, beginning with multi-dimensional GROUPING SETS, ROLLUP, and CUBE.",
            lessons: [
              {
                title: "Multi-Dimensional Aggregations (GROUPING SETS / ROLLUP / CUBE)",
                slug: "grouping-sets",
                path: "/sql/querying/window-functions/grouping-sets",
                icon: Sigma,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "System Design",
    slug: "system-design",
    icon: systemDesignLogo,
    locked: false,
    overviewPath: "/system-design",
    blurb: "Design systems that survive scale, failure, and traffic spikes.",
    patterns: [],
    sections: [
      {
        title: "1 · Foundations",
        blurb: "Requirements, estimation, core metrics, networking, APIs and caching.",
        patterns: [
          {
            title: FUNDAMENTALS_TOPICS["getting-started"].title,
            slug: FUNDAMENTALS_TOPICS["getting-started"].slug,
            blurb: FUNDAMENTALS_TOPICS["getting-started"].blurb,
            path: "/system-design/fundamentals/getting-started",
            lessons: FUNDAMENTALS_TOPICS["getting-started"].lessons.map(l => ({ title: l.title, slug: l.slug, path: `/system-design/fundamentals/getting-started/${l.slug}`, icon: (l as any).icon || PlayCircle })),
          },
          lockedPattern(
            "Core Concepts & Metrics",
            "core-metrics",
            "Measuring performance: Availability, Scalability, and SLAs.",
          ),
          {
            title: FUNDAMENTALS_TOPICS["networking-protocols"].title,
            slug: FUNDAMENTALS_TOPICS["networking-protocols"].slug,
            blurb: FUNDAMENTALS_TOPICS["networking-protocols"].blurb,
            path: "/system-design/fundamentals/networking-protocols",
            lessons: FUNDAMENTALS_TOPICS["networking-protocols"].lessons.map(l => ({ title: l.title, slug: l.slug, path: `/system-design/fundamentals/networking-protocols/${l.slug}`, icon: (l as any).icon || Globe })),
          },
          lockedPattern(
            "Routing & Load Balancing",
            "routing-load-balancing",
            "Proxy vs Reverse Proxy, Load Balancers.",
          ),
          lockedPattern(
            "APIs & Rate Limiting",
            "apis-rate-limiting",
            "REST, GraphQL, gRPC, and API Gateways.",
          ),
          lockedPattern(
            "Caching & Content Delivery",
            "caching-cdn",
            "Reducing latency with caching strategies and CDNs.",
          ),
        ],
      },
      {
        title: "2 · Data, Scaling & Architecture",
        blurb: "Storage internals, replication, sharding, consistency, messaging.",
        patterns: [
          lockedPattern(
            "Database Foundations",
            "database-foundations",
            "Choosing the right data model.",
          ),
          lockedPattern(
            "Database Internals",
            "database-internals",
            "How databases store and index data.",
          ),
          lockedPattern(
            "Replication & Sharding",
            "replication-sharding",
            "Distributing data across nodes.",
          ),
          lockedPattern(
            "Consistency Models",
            "consistency-models",
            "What a system promises a client will see.",
          ),
          lockedPattern(
            "Storage Systems",
            "storage-systems",
            "Block, file, and object storage.",
          ),
          lockedPattern(
            "Security & Auth",
            "security-auth",
            "Keeping data private in transit and at rest.",
          ),
          lockedPattern(
            "Communication & Messaging",
            "communication-messaging",
            "Sync vs Async, queues, streams.",
          ),
          lockedPattern(
            "Architectural Styles",
            "architectural-styles",
            "Monoliths, Microservices, Event-Driven.",
          ),
        ],
      },
      {
        title: "3 · Distributed & Data Systems",
        blurb: "Network failures, clocks, consensus, and data-engineering patterns.",
        patterns: [
          {
            title: DISTRIBUTED_SYSTEMS_TOPICS["distributed-systems"].title,
            slug: DISTRIBUTED_SYSTEMS_TOPICS["distributed-systems"].slug,
            blurb: DISTRIBUTED_SYSTEMS_TOPICS["distributed-systems"].blurb,
            path: "/system-design/distributed-systems/distributed-systems",
            lessons: DISTRIBUTED_SYSTEMS_TOPICS["distributed-systems"].lessons.map(l => ({ title: l.title, slug: l.slug, path: `/system-design/distributed-systems/distributed-systems/${l.slug}`, icon: (l as any).icon || Server })),
          },
          lockedPattern(
            "Time, Clocks & Consensus",
            "time-consensus",
            "Ordering events and reaching agreement.",
          ),
          lockedPattern(
            "Distributed Transactions",
            "distributed-transactions",
            "Two-Phase Commit, Saga Pattern.",
          ),
          lockedPattern(
            "Batch, Streaming & Analytics",
            "batch-streaming",
            "ETL, Data Lakes, Streaming Engines.",
          ),
          lockedPattern(
            "Data Engineering Patterns",
            "data-engineering-patterns",
            "Incremental Loader, CDC, Lineage.",
          ),
          lockedPattern(
            "Observability",
            "observability",
            "Logging, Metrics, Tracing, and Alerting.",
          ),
        ],
      },
      {
        title: "4 · Interview Fluency",
        blurb: "Specialized structures, technology deep-dives, and case studies.",
        patterns: [
          lockedPattern(
            "Probabilistic & Spatial",
            "probabilistic-spatial",
            "Bloom Filters, Quad Trees, Geohashing.",
          ),
          lockedPattern(
            "Deployment & Delivery",
            "deployment-delivery",
            "Blue-Green Deployments, Canary Releases.",
          ),
          lockedPattern(
            "Technology Deep Dives",
            "technology-deep-dives",
            "PostgreSQL, Redis, Kafka, Elasticsearch.",
          ),
          lockedPattern(
            "Recurring Interview Patterns",
            "interview-patterns",
            "High Read/Write Traffic, Hot Keys.",
          ),
          lockedPattern(
            "System Design Interviews",
            "case-studies",
            "End-to-end designs under interview conditions.",
          ),
        ],
      },
    ],
  },
  {
    title: "Data Warehouses",
    slug: "data-warehouses",
    icon: dwLogo,
    locked: false,
    overviewPath: "/data-warehouses",
    blurb: "Cloud warehouses, modeling, and the cost/perf knobs that matter.",
    patterns: [],
    sections: [
      {
        title: "Part I — Foundations",
        blurb: "The core concepts behind modern analytical data storage.",
        patterns: [
          {
            title: "Data Ecosystems",
            slug: "data-ecosystems",
            path: "/data-warehouses/foundations/data-ecosystems",
            blurb:
              "From transaction processing (OLTP) to analytical datastores (OLAP) and distributed meshes.",
            lessons: [
              {
                title: "The Journey of Data",
                slug: "data-journey",
                path: "/data-warehouses/foundations/data-ecosystems/data-journey",
                icon: Activity,
              },
              {
                title: "OLTP vs. OLAP",
                slug: "oltp-vs-olap",
                path: "/data-warehouses/foundations/data-ecosystems/oltp-vs-olap",
                icon: ArrowLeftRight,
              },
              {
                title: "Storing Analytical Data",
                slug: "analytical-storage",
                path: "/data-warehouses/foundations/data-ecosystems/analytical-storage",
                icon: Database,
              },
              {
                title: "Organizing the Landscape",
                slug: "organizing-data",
                path: "/data-warehouses/foundations/data-ecosystems/organizing-data",
                icon: Boxes,
              },
              {
                title: "Database Engines",
                slug: "database-engines",
                path: "/data-warehouses/foundations/data-ecosystems/database-engines",
                icon: Server,
              },
              {
                title: "Modern Data Warehouses",
                slug: "data-warehouses",
                path: "/data-warehouses/foundations/data-ecosystems/data-warehouses",
                icon: Cloud,
              },
            ],
          },
          {
            title: "Data Formats & Storage",
            slug: "data-formats",
            path: "/data-warehouses/foundations/data-formats",
            blurb: "Understanding how data is stored, compressed, and managed at scale.",
            lessons: [
              {
                title: "Human-Readable Formats",
                slug: "human-readable",
                path: "/data-warehouses/foundations/data-formats/human-readable",
                icon: FileCode,
              },
              {
                title: "Row vs. Columnar",
                slug: "columnar-formats",
                path: "/data-warehouses/foundations/data-formats/columnar-formats",
                icon: SquareStack,
              },
              {
                title: "Open Table Formats",
                slug: "open-table-formats",
                path: "/data-warehouses/foundations/data-formats/open-table-formats",
                icon: Layers,
              },
              {
                title: "Block, File & Object",
                slug: "storage-types",
                path: "/data-warehouses/foundations/data-formats/storage-types",
                icon: Container,
              },
              {
                title: "Cloud Object Storage",
                slug: "cloud-storage",
                path: "/data-warehouses/foundations/data-formats/cloud-storage",
                icon: Cloud,
              },
              {
                title: "Distributed File Systems",
                slug: "distributed-file-systems",
                path: "/data-warehouses/foundations/data-formats/distributed-file-systems",
                icon: Server,
              },
              {
                title: "Data Compression",
                slug: "data-compression",
                path: "/data-warehouses/foundations/data-formats/data-compression",
                icon: Hash,
              },
              {
                title: "In-Memory Storage",
                slug: "in-memory-storage",
                path: "/data-warehouses/foundations/data-formats/in-memory-storage",
                icon: Activity,
              },
            ],
          },
        ],
      },
      {
        title: "Part II — Modern Cloud Warehouses",
        blurb: "Deep dives into the architectures of Snowflake, BigQuery, and Redshift.",
        patterns: [
          {
            title: "Snowflake",
            slug: "snowflake",
            path: "/data-warehouses/cloud-warehouses/snowflake",
            blurb: "Virtual warehouses, micro-partitions, clustering, and Snowpark fundamentals.",
            lessons: [
              {
                title: "Snowflake Architecture",
                slug: "snowflake-architecture",
                path: "/data-warehouses/cloud-warehouses/snowflake/snowflake-architecture",
                icon: Cloud,
              },
              {
                title: "Micro-Partitions & Clustering",
                slug: "micro-partitions",
                path: "/data-warehouses/cloud-warehouses/snowflake/micro-partitions",
                icon: Layers,
              },
            ],
          },
          {
            title: "BigQuery",
            slug: "bigquery",
            path: "/data-warehouses/cloud-warehouses/bigquery",
            blurb: "Slots, partitioning & clustering, BI Engine, and cost-aware query design.",
            lessons: [
              {
                title: "BigQuery Architecture",
                slug: "bigquery-architecture",
                path: "/data-warehouses/cloud-warehouses/bigquery/bigquery-architecture",
                icon: Cloud,
              },
              {
                title: "Slots and Pricing",
                slug: "slots-pricing",
                path: "/data-warehouses/cloud-warehouses/bigquery/slots-pricing",
                icon: Activity,
              },
            ],
          },
          {
            title: "Amazon Redshift",
            slug: "redshift",
            path: "/data-warehouses/cloud-warehouses/redshift",
            blurb: "Distribution styles, sort keys, RA3 nodes, and workload management.",
            lessons: [
              {
                title: "Redshift Architecture",
                slug: "redshift-architecture",
                path: "/data-warehouses/cloud-warehouses/redshift/redshift-architecture",
                icon: Server,
              },
              {
                title: "Distribution Styles",
                slug: "distribution-styles",
                path: "/data-warehouses/cloud-warehouses/redshift/distribution-styles",
                icon: SquareStack,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Web Scraping",
    slug: "web-scraping",
    icon: webScraperLogo,
    locked: false,
    overviewPath: "/web-scraping",
    blurb:
      "Extracting data from the web using HTML parsing, headless browsers, and scalable crawlers.",
    patterns: [],
    sections: [
      {
        title: "Web Scraping Foundations",
        patterns: [
          {
            title: "HTTP Foundations",
            slug: "http-foundations",
            path: "/web-scraping/foundations/http-foundations",
            blurb: "Master the DOM, HTTP requests, status codes, headers, and cookies.",
            lessons: [
              {
                title: "How the Web Works",
                slug: "how-the-web-works",
                path: "/web-scraping/foundations/http-foundations/how-the-web-works",
                icon: Globe,
              },
              {
                title: "HTTP Methods & Status Codes",
                slug: "http-methods-and-status-codes",
                path: "/web-scraping/foundations/http-foundations/http-methods-and-status-codes",
                icon: ShieldAlert,
              },
              {
                title: "Headers & Cookies",
                slug: "headers-and-cookies",
                path: "/web-scraping/foundations/http-foundations/headers-and-cookies",
                icon: LockKeyhole,
              },
              {
                title: "The Document Object Model (DOM)",
                slug: "the-dom",
                path: "/web-scraping/foundations/http-foundations/the-dom",
                icon: Search,
              },
              {
                title: "Developer Tools (Inspecting Elements)",
                slug: "developer-tools",
                path: "/web-scraping/foundations/http-foundations/developer-tools",
                icon: Wrench,
              },
              {
                title: "Client-Side vs Server-Side Rendering",
                slug: "dynamic-vs-static-content",
                path: "/web-scraping/foundations/http-foundations/dynamic-vs-static-content",
                icon: Layers,
              },
            ],
          },
          {
            title: "Static Scraping",
            slug: "static-scraping",
            path: "/web-scraping/foundations/static-scraping",
            blurb: "Fetch raw HTML and parse it efficiently to extract exactly what you need.",
            lessons: [
              {
                title: "Your First Request",
                slug: "your-first-request",
                path: "/web-scraping/foundations/static-scraping/your-first-request",
                icon: Search,
              },
              {
                title: "Parsing HTML with BeautifulSoup",
                slug: "parsing-html-beautifulsoup",
                path: "/web-scraping/foundations/static-scraping/parsing-html-beautifulsoup",
                icon: Search,
              },
              {
                title: "CSS Selectors in Practice",
                slug: "css-selectors",
                path: "/web-scraping/foundations/static-scraping/css-selectors",
                icon: Search,
              },
              {
                title: "XPath and lxml",
                slug: "xpath-and-lxml",
                path: "/web-scraping/foundations/static-scraping/xpath-and-lxml",
                icon: Search,
              },
              {
                title: "Extracting Text and Attributes",
                slug: "extracting-text-attributes",
                path: "/web-scraping/foundations/static-scraping/extracting-text-attributes",
                icon: Search,
              },
              {
                title: "Following Pagination",
                slug: "following-pagination",
                path: "/web-scraping/foundations/static-scraping/following-pagination",
                icon: Search,
              },
            ],
          },
        ],
      },
      {
        title: "Cleaning & Storing",
        slug: "cleaning-and-storing",
        path: "/web-scraping/foundations/cleaning-and-storing",
        blurb: "Transform messy text into structured formats and save it to databases or CSVs.",
        lessons: [
          {
            title: "Defining Your Schema First",
            slug: "defining-your-schema",
            path: "/web-scraping/foundations/cleaning-and-storing/defining-your-schema",
            icon: Database,
          },
          {
            title: "Regex for Extraction",
            slug: "regex-for-extraction",
            path: "/web-scraping/foundations/cleaning-and-storing/regex-for-extraction",
            icon: Database,
          },
          {
            title: "Normalizing Data",
            slug: "normalizing-data",
            path: "/web-scraping/foundations/cleaning-and-storing/normalizing-data",
            icon: Database,
          },
          {
            title: "Pandas for Scraped Data",
            slug: "pandas-for-scraped-data",
            path: "/web-scraping/foundations/cleaning-and-storing/pandas-for-scraped-data",
            icon: Database,
          },
          {
            title: "Exporting to CSV, JSON, and JSONL",
            slug: "exporting-csv-json",
            path: "/web-scraping/foundations/cleaning-and-storing/exporting-csv-json",
            icon: Database,
          },
          {
            title: "Storing in SQLite and Postgres",
            slug: "storing-sqlite-postgres",
            path: "/web-scraping/foundations/cleaning-and-storing/storing-sqlite-postgres",
            icon: Database,
          },
        ],
      },
      {
        title: "Finding the Hidden API",
        slug: "hidden-api",
        path: "/web-scraping/automation/hidden-api",
        blurb: "Skip HTML entirely by discovering the JSON APIs that power the frontend.",
        lessons: [
          {
            title: "Check for an API First",
            slug: "check-api-first",
            path: "/web-scraping/automation/hidden-api/check-api-first",
            icon: Compass,
          },
          {
            title: "Reverse-Engineering the Network Tab",
            slug: "reverse-engineering-network",
            path: "/web-scraping/automation/hidden-api/reverse-engineering-network",
            icon: Compass,
          },
          {
            title: "Replaying Requests in Python",
            slug: "replaying-requests-python",
            path: "/web-scraping/automation/hidden-api/replaying-requests-python",
            icon: Compass,
          },
          {
            title: "GraphQL and REST Endpoints",
            slug: "graphql-and-rest",
            path: "/web-scraping/automation/hidden-api/graphql-and-rest",
            icon: Compass,
          },
          {
            title: "Sitemaps and Feeds",
            slug: "sitemaps-and-feeds",
            path: "/web-scraping/automation/hidden-api/sitemaps-and-feeds",
            icon: Compass,
          },
        ],
      },
      {
        title: "Browser Automation",
        slug: "browser-automation",
        path: "/web-scraping/automation/browser-automation",
        blurb:
          "Control real web browsers to interact with SPAs, click buttons, and bypass simple anti-bot checks.",
        lessons: [
          {
            title: "When You Actually Need a Browser",
            slug: "when-you-need-browser",
            path: "/web-scraping/automation/browser-automation/when-you-need-browser",
            icon: Settings,
          },
          {
            title: "Playwright Basics",
            slug: "playwright-basics",
            path: "/web-scraping/automation/browser-automation/playwright-basics",
            icon: Settings,
          },
          {
            title: "Waiting Correctly",
            slug: "waiting-correctly",
            path: "/web-scraping/automation/browser-automation/waiting-correctly",
            icon: Settings,
          },
          {
            title: "Interacting with Pages",
            slug: "interacting-with-pages",
            path: "/web-scraping/automation/browser-automation/interacting-with-pages",
            icon: Settings,
          },
          {
            title: "Intercepting Network Traffic",
            slug: "intercepting-network-traffic",
            path: "/web-scraping/automation/browser-automation/intercepting-network-traffic",
            icon: Settings,
          },
          {
            title: "Playwright vs Selenium",
            slug: "playwright-vs-selenium",
            path: "/web-scraping/automation/browser-automation/playwright-vs-selenium",
            icon: Settings,
          },
        ],
      },
      {
        title: "Authenticated Scraping",
        slug: "authenticated-scraping",
        path: "/web-scraping/automation/authenticated-scraping",
        blurb: "Handle cookies, tokens, CSRF, and state to scrape behind login walls safely.",
        lessons: [
          {
            title: "Session Objects and Cookie Persistence",
            slug: "session-objects",
            path: "/web-scraping/automation/authenticated-scraping/session-objects",
            icon: LockKeyhole,
          },
          {
            title: "Form Logins and CSRF Tokens",
            slug: "form-logins-csrf",
            path: "/web-scraping/automation/authenticated-scraping/form-logins-csrf",
            icon: LockKeyhole,
          },
          {
            title: "Token-Based Auth",
            slug: "token-based-auth",
            path: "/web-scraping/automation/authenticated-scraping/token-based-auth",
            icon: LockKeyhole,
          },
          {
            title: "Reusing Browser Auth State",
            slug: "reusing-browser-auth",
            path: "/web-scraping/automation/authenticated-scraping/reusing-browser-auth",
            icon: LockKeyhole,
          },
          {
            title: "What You Should Not Log Into",
            slug: "what-not-to-login",
            path: "/web-scraping/automation/authenticated-scraping/what-not-to-login",
            icon: LockKeyhole,
          },
        ],
      },
      {
        title: "Async Fetching",
        slug: "async-fetching",
        path: "/web-scraping/automation/async-fetching",
        blurb: "Speed up your scrapers 100x using threads, asyncio, and semaphores.",
        lessons: [
          {
            title: "Why Sequential Scraping Is Slow",
            slug: "why-sequential-is-slow",
            path: "/web-scraping/automation/async-fetching/why-sequential-is-slow",
            icon: Repeat,
          },
          {
            title: "Threads and Processes",
            slug: "threads-and-processes",
            path: "/web-scraping/automation/async-fetching/threads-and-processes",
            icon: Repeat,
          },
          {
            title: "Asyncio and httpx",
            slug: "asyncio-and-httpx",
            path: "/web-scraping/automation/async-fetching/asyncio-and-httpx",
            icon: Repeat,
          },
          {
            title: "Controlling Concurrency",
            slug: "controlling-concurrency",
            path: "/web-scraping/automation/async-fetching/controlling-concurrency",
            icon: Repeat,
          },
          {
            title: "Retries and Timeouts in Async Code",
            slug: "retries-and-timeouts",
            path: "/web-scraping/automation/async-fetching/retries-and-timeouts",
            icon: Repeat,
          },
        ],
      },
      {
        title: "The Scrapy Framework",
        slug: "scrapy-framework",
        path: "/web-scraping/automation/scrapy-framework",
        blurb: "Build high-performance, asynchronous web crawling spiders that scale.",
        lessons: [
          {
            title: "Why a Framework",
            slug: "why-a-framework",
            path: "/web-scraping/automation/scrapy-framework/why-a-framework",
            icon: Boxes,
          },
          {
            title: "Spiders and Requests",
            slug: "spiders-and-requests",
            path: "/web-scraping/automation/scrapy-framework/spiders-and-requests",
            icon: Boxes,
          },
          {
            title: "Items, ItemLoaders, and Pipelines",
            slug: "items-and-pipelines",
            path: "/web-scraping/automation/scrapy-framework/items-and-pipelines",
            icon: Boxes,
          },
          {
            title: "Middlewares",
            slug: "middlewares",
            path: "/web-scraping/automation/scrapy-framework/middlewares",
            icon: Boxes,
          },
          {
            title: "The Scrapy Shell",
            slug: "scrapy-shell",
            path: "/web-scraping/automation/scrapy-framework/scrapy-shell",
            icon: Boxes,
          },
          {
            title: "Scrapy with Playwright",
            slug: "scrapy-with-playwright",
            path: "/web-scraping/automation/scrapy-framework/scrapy-with-playwright",
            icon: Boxes,
          },
        ],
      },
      {
        title: "Robustness and Politeness",
        slug: "scale-and-politeness",
        path: "/web-scraping/scale/scale-and-politeness",
        blurb: "Manage rate limits, handle retries, rotate proxies, and respect robots.txt.",
        lessons: [
          {
            title: "Reading robots.txt Properly",
            slug: "reading-robots-txt",
            path: "/web-scraping/scale/scale-and-politeness/reading-robots-txt",
            icon: Server,
          },
          {
            title: "Rate Limiting and Throttling",
            slug: "rate-limiting-throttling",
            path: "/web-scraping/scale/scale-and-politeness/rate-limiting-throttling",
            icon: Server,
          },
          {
            title: "Retry Strategy",
            slug: "retry-strategy",
            path: "/web-scraping/scale/scale-and-politeness/retry-strategy",
            icon: Server,
          },
          {
            title: "Handling Bans and Blocks",
            slug: "handling-bans",
            path: "/web-scraping/scale/scale-and-politeness/handling-bans",
            icon: Server,
          },
          {
            title: "Proxy Rotation",
            slug: "proxy-rotation",
            path: "/web-scraping/scale/scale-and-politeness/proxy-rotation",
            icon: Server,
          },
          {
            title: "Failing Loudly",
            slug: "failing-loudly",
            path: "/web-scraping/scale/scale-and-politeness/failing-loudly",
            icon: Server,
          },
        ],
      },
      {
        title: "Anti-Bot Systems",
        slug: "anti-bot-systems",
        path: "/web-scraping/scale/anti-bot-systems",
        blurb: "Understand how websites fingerprint you and when you've triggered an escalation.",
        lessons: [
          {
            title: "How Detection Works",
            slug: "how-detection-works",
            path: "/web-scraping/scale/anti-bot-systems/how-detection-works",
            icon: ShieldAlert,
          },
          {
            title: "Browser Fingerprinting",
            slug: "browser-fingerprinting",
            path: "/web-scraping/scale/anti-bot-systems/browser-fingerprinting",
            icon: ShieldAlert,
          },
          {
            title: "Detecting Captchas and Walls",
            slug: "detecting-captchas",
            path: "/web-scraping/scale/anti-bot-systems/detecting-captchas",
            icon: ShieldAlert,
          },
          {
            title: "Knowing When to Stop",
            slug: "knowing-when-to-stop",
            path: "/web-scraping/scale/anti-bot-systems/knowing-when-to-stop",
            icon: ShieldAlert,
          },
        ],
      },
      {
        title: "The Legal and Ethical Line",
        slug: "legal-and-ethical",
        path: "/web-scraping/scale/legal-and-ethical",
        blurb: "Public data vs protected data, ToS, and scraping personal information.",
        lessons: [
          {
            title: "Public Data vs Protected Data",
            slug: "public-vs-protected-data",
            path: "/web-scraping/scale/legal-and-ethical/public-vs-protected-data",
            icon: Activity,
          },
          {
            title: "Terms of Service, CFAA, and hiQ v LinkedIn",
            slug: "tos-cfaa-hiq",
            path: "/web-scraping/scale/legal-and-ethical/tos-cfaa-hiq",
            icon: Activity,
          },
          {
            title: "Personal Data, GDPR, and CCPA",
            slug: "personal-data-gdpr",
            path: "/web-scraping/scale/legal-and-ethical/personal-data-gdpr",
            icon: Activity,
          },
          {
            title: "Copyright and Database Rights",
            slug: "copyright-database-rights",
            path: "/web-scraping/scale/legal-and-ethical/copyright-database-rights",
            icon: Activity,
          },
        ],
      },
      {
        title: "Scrapers in Production",
        slug: "scrapers-in-production",
        path: "/web-scraping/scale/scrapers-in-production",
        blurb: "Incremental scraping, deduplication, alerting, and containerizing your pipelines.",
        lessons: [
          {
            title: "Incremental Scraping",
            slug: "incremental-scraping",
            path: "/web-scraping/scale/scrapers-in-production/incremental-scraping",
            icon: Terminal,
          },
          {
            title: "Deduplication at Scale",
            slug: "deduplication-scale",
            path: "/web-scraping/scale/scrapers-in-production/deduplication-scale",
            icon: Terminal,
          },
          {
            title: "Scheduling",
            slug: "scheduling",
            path: "/web-scraping/scale/scrapers-in-production/scheduling",
            icon: Terminal,
          },
          {
            title: "Containerizing a Scraper",
            slug: "containerizing-scraper",
            path: "/web-scraping/scale/scrapers-in-production/containerizing-scraper",
            icon: Terminal,
          },
          {
            title: "Monitoring and Alerting",
            slug: "monitoring-alerting",
            path: "/web-scraping/scale/scrapers-in-production/monitoring-alerting",
            icon: Terminal,
          },
          {
            title: "Handling Schema Drift",
            slug: "handling-schema-drift",
            path: "/web-scraping/scale/scrapers-in-production/handling-schema-drift",
            icon: Terminal,
          },
        ],
      },
      {
        title: "AI-Driven Extraction",
        slug: "ai-agents",
        path: "/web-scraping/scale/ai-agents",
        blurb:
          "Use LLMs and vision models to navigate pages and extract unstructured data automatically.",
        lessons: [
          {
            title: "LLM Extraction from HTML",
            slug: "llm-extraction",
            path: "/web-scraping/scale/ai-agents/llm-extraction",
            icon: Bot,
          },
          {
            title: "DOM to Markdown",
            slug: "dom-to-markdown",
            path: "/web-scraping/scale/ai-agents/dom-to-markdown",
            icon: Bot,
          },
          {
            title: "Vision Models for Layout",
            slug: "vision-models",
            path: "/web-scraping/scale/ai-agents/vision-models",
            icon: Bot,
          },
          {
            title: "Auto-Navigating Agents",
            slug: "auto-navigating-agents",
            path: "/web-scraping/scale/ai-agents/auto-navigating-agents",
            icon: Bot,
          },
          {
            title: "Cost, Latency, and Determinism",
            slug: "cost-latency-determinism",
            path: "/web-scraping/scale/ai-agents/cost-latency-determinism",
            icon: Bot,
          },
        ],
      },
      {
        title: "Capstone",
        slug: "capstone",
        path: "/web-scraping/scale/capstone",
        blurb: "Build an end-to-end scalable pipeline, from target discovery to publishing.",
        lessons: [
          {
            title: "Choosing a Target and Scoping the Dataset",
            slug: "choosing-target",
            path: "/web-scraping/scale/capstone/choosing-target",
            icon: FileCode,
          },
          {
            title: "Building the Pipeline",
            slug: "building-pipeline",
            path: "/web-scraping/scale/capstone/building-pipeline",
            icon: FileCode,
          },
          {
            title: "Deploying and Scheduling It",
            slug: "deploying-scheduling",
            path: "/web-scraping/scale/capstone/deploying-scheduling",
            icon: FileCode,
          },
          {
            title: "Publishing the Dataset and Writing It Up",
            slug: "publishing-dataset",
            path: "/web-scraping/scale/capstone/publishing-dataset",
            icon: FileCode,
          },
        ],
      },
    ],
  },
  {
    title: "Docker",
    slug: "docker",
    icon: dockerLogo,
    locked: false,
    overviewPath: "/docker",
    blurb: "From container foundations to advanced multi-container orchestration.",
    patterns: [],
    sections: [
      {
        title: "Part I — Foundations",
        blurb: "Master the core lifecycle of Docker: building images and running containers.",
        patterns: [
          {
            title: "Docker & Containers",
            slug: "what-is-docker",
            path: "/docker/foundations/what-is-docker",
            blurb:
              "Why Docker exists, how it stacks up against VMs, and how to run your first container.",
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
              {
                title: "Docker Run Commands",
                slug: "docker-run-commands",
                path: "/docker/foundations/what-is-docker/docker-run-commands",
                icon: PlayCircle,
              },
            ],
          },
          {
            title: "Images and Containers",
            slug: "images-and-containers",
            path: "/docker/foundations/images-and-containers",
            blurb:
              "Master the core lifecycle of Docker: building images, running containers, and debugging running environments.",
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
        ],
      },
      {
        title: "Part II — Networking & Storage",
        blurb: "Connecting containers and persisting data with volumes and bind mounts.",
        patterns: [
          {
            title: "Storage & Volumes",
            slug: "storage-volumes",
            path: "/docker/networking/storage-volumes",
            blurb:
              "Learn how to persist state across container restarts using Volumes, Bind Mounts, and tmpfs.",
            lessons: [
              {
                title: "Why Containers are Ephemeral",
                slug: "ephemeral-containers",
                path: "/docker/networking/storage-volumes/ephemeral-containers",
                icon: Trash2,
              },
              {
                title: "Docker Volumes",
                slug: "docker-volumes",
                path: "/docker/networking/storage-volumes/docker-volumes",
                icon: Database,
              },
              {
                title: "Bind Mounts",
                slug: "bind-mounts",
                path: "/docker/networking/storage-volumes/bind-mounts",
                icon: Layers,
              },
              {
                title: "tmpfs Mounts",
                slug: "tmpfs-mounts",
                path: "/docker/networking/storage-volumes/tmpfs-mounts",
                icon: Activity,
              },
            ],
          },
          {
            title: "Docker Networking",
            slug: "networking",
            path: "/docker/networking/networking",
            blurb: "Communicate securely between containers and expose ports to the outside world.",
            lessons: [
              {
                title: "Networking Basics",
                slug: "networking-basics",
                path: "/docker/networking/networking/networking-basics",
                icon: Globe,
              },
              {
                title: "The Bridge Network",
                slug: "bridge-network",
                path: "/docker/networking/networking/bridge-network",
                icon: Server,
              },
              {
                title: "Host and None Networks",
                slug: "host-none-networks",
                path: "/docker/networking/networking/host-none-networks",
                icon: Server,
              },
              {
                title: "DNS and Container Discovery",
                slug: "dns-discovery",
                path: "/docker/networking/networking/dns-discovery",
                icon: Search,
              },
            ],
          },
        ],
      },
      {
        title: "Part III — Orchestration",
        blurb: "Declarative multi-container applications and local dev environments.",
        patterns: [
          {
            title: "Docker Compose",
            slug: "compose",
            path: "/docker/orchestration/compose",
            blurb:
              "Define and run multi-container Docker applications using a single declarative YAML file.",
            lessons: [
              {
                title: "Introduction to Docker Compose",
                slug: "intro-compose",
                path: "/docker/orchestration/compose/intro-compose",
                icon: FileCode,
              },
              {
                title: "Writing a docker-compose.yml",
                slug: "writing-compose-yml",
                path: "/docker/orchestration/compose/writing-compose-yml",
                icon: FileCode,
              },
              {
                title: "Managing Multi-Container Apps",
                slug: "managing-apps",
                path: "/docker/orchestration/compose/managing-apps",
                icon: Terminal,
              },
            ],
          },
          {
            title: "Orchestration Intro",
            slug: "orchestration-intro",
            path: "/docker/orchestration/orchestration-intro",
            blurb:
              "When Docker Compose isn't enough: a gentle introduction to Swarm and Kubernetes.",
            lessons: [
              {
                title: "Docker Swarm Basics",
                slug: "swarm-basics",
                path: "/docker/orchestration/orchestration-intro/swarm-basics",
                icon: Layers,
              },
              {
                title: "Why Kubernetes Exists",
                slug: "why-k8s",
                path: "/docker/orchestration/orchestration-intro/why-k8s",
                icon: Lightbulb,
              },
            ],
          },
        ],
      },
      {
        title: "Part IV — Production & Advanced",
        blurb: "Multi-stage builds, security, and registry management.",
        patterns: [
          {
            title: "Advanced Image Building",
            slug: "advanced-images",
            path: "/docker/advanced/advanced-images",
            blurb:
              "Optimize image sizes and build times with multi-stage builds and deep caching strategies.",
            lessons: [
              {
                title: "Multi-Stage Builds",
                slug: "multi-stage-builds",
                path: "/docker/advanced/advanced-images/multi-stage-builds",
                icon: Layers,
              },
              {
                title: "Minimizing Image Size",
                slug: "minimizing-size",
                path: "/docker/advanced/advanced-images/minimizing-size",
                icon: ArrowLeftRight,
              },
            ],
          },
          {
            title: "Docker Security",
            slug: "security",
            path: "/docker/advanced/security",
            blurb: "Run containers safely with Rootless mode, image scanning, and user namespaces.",
            lessons: [
              {
                title: "Running as Non-Root",
                slug: "non-root",
                path: "/docker/advanced/security/non-root",
                icon: ShieldAlert,
              },
              {
                title: "Image Scanning",
                slug: "image-scanning",
                path: "/docker/advanced/security/image-scanning",
                icon: Search,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Terraform",
    slug: "terraform",
    icon: terraformLogo,
    locked: false,
    overviewPath: "/terraform",
    blurb: "Infrastructure as Code for provisioning and managing cloud resources.",
    patterns: [],
    sections: [
      {
        title: "Terraform Fundamentals",
        patterns: [
          lockedPattern(
            "Infrastructure as Code",
            "iac-fundamentals",
            "Why IaC, declarative vs imperative, and the core workflow.",
          ),
          lockedPattern(
            "Terraform Basics",
            "basics",
            "Providers, resources, data sources, and state file intro.",
          ),
          lockedPattern(
            "Variables & Outputs",
            "variables-outputs",
            "Parameterizing your infrastructure with locals and variables.",
          ),
          lockedPattern(
            "HCL Logic",
            "hcl-logic",
            "Loops, conditionals, dynamic blocks, and built-in functions.",
          ),
          lockedPattern(
            "Modules",
            "modules",
            "Creating and consuming reusable infrastructure components.",
          ),
          lockedPattern(
            "State Management",
            "state-management",
            "Remote backends, state locking, and state manipulation.",
          ),
          lockedPattern(
            "Environments",
            "workspaces-envs",
            "Managing dev, staging, and production with workspaces.",
          ),
          lockedPattern(
            "CI/CD & Automation",
            "ci-cd-terraform",
            "Automating deployments with GitHub Actions and Terraform Cloud.",
          ),
          lockedPattern(
            "Capstone",
            "capstone",
            "Provision a highly-available cloud architecture from scratch.",
          ),
        ],
      },
    ],
  },
  {
    title: "Git / GitHub",
    slug: "git-github",
    icon: gitLogo,
    locked: false,
    overviewPath: "/git-github",
    blurb: "Version control, branching strategies, and collaboration workflows.",
    patterns: [],
    sections: [
      {
        title: "Git Fundamentals",
        patterns: [
          lockedPattern(
            "Git Fundamentals",
            "git-fundamentals",
            "Commits, history, and the working tree.",
          ),
          lockedPattern(
            "Branching & Merging",
            "branching-merging",
            "Parallel development and combining work with merges.",
          ),
          lockedPattern(
            "Remotes & Collaboration",
            "remotes",
            "Working with remote repositories and fetch vs pull.",
          ),
          lockedPattern(
            "Rewriting History",
            "rewriting-history",
            "Interactive rebase, amend, and squashing commits.",
          ),
          lockedPattern(
            "Undoing Mistakes",
            "undoing-things",
            "Resetting, reverting, and using the reflog.",
          ),
          lockedPattern(
            "Detective Work",
            "detective-work",
            "Finding bugs with git bisect and git blame.",
          ),
          lockedPattern(
            "Pull Requests & Review",
            "pull-requests",
            "Collaborating on code with branch protection and CODEOWNERS.",
          ),
          lockedPattern(
            "GitHub Actions",
            "github-actions",
            "Automating tests and deployments with CI/CD pipelines.",
          ),
          lockedPattern(
            "Team Workflows",
            "workflows",
            "GitHub Flow, GitFlow, and trunk-based development strategies.",
          ),
          lockedPattern(
            "Capstone",
            "capstone",
            "Simulate a real-world team project: branching, reviewing, and releasing.",
          ),
        ],
      },
    ],
  },
  {
    title: "Python",
    slug: "python",
    icon: pythonLogo,
    locked: false,
    overviewPath: "/python",
    blurb: "Master Python from basic syntax to advanced asynchronous programming.",
    patterns: [],
    sections: [
      {
        title: "1. Foundations",
        patterns: [
          lockedPattern("Python Basics", "basics", "Variables, data types, and control flow."),
          lockedPattern(
            "Data Structures",
            "data-structures",
            "Lists, dictionaries, sets, and tuples.",
          ),
        ],
      },
      {
        title: "2. Intermediate Concepts",
        patterns: [
          lockedPattern(
            "Functions & Modules",
            "functions",
            "Defining functions, scope, and importing modules.",
          ),
          {
            slug: "oop",
            title: "Object-Oriented Programming",
            blurb: "Classes, inheritance, and polymorphism.",
            locked: false,
            path: "/python/oop",
            lessons: [
              {
                slug: "classes-and-objects",
                title: "Classes and Objects",
                icon: Box,
                path: "/python/oop/classes-and-objects",
              },
              {
                slug: "instance-and-class-attributes",
                title: "Instance and Class Attributes",
                icon: Box,
                path: "/python/oop/instance-and-class-attributes",
              },
              {
                slug: "types-of-methods",
                title: "Types of Methods",
                icon: Box,
                path: "/python/oop/types-of-methods",
              },
              {
                slug: "encapsulation",
                title: "Encapsulation",
                icon: Box,
                path: "/python/oop/encapsulation",
              },
              {
                slug: "inheritance",
                title: "Inheritance",
                icon: Box,
                path: "/python/oop/inheritance",
              },
              {
                slug: "polymorphism",
                title: "Polymorphism",
                icon: Box,
                path: "/python/oop/polymorphism",
              },
              {
                slug: "abstraction",
                title: "Abstraction",
                icon: Box,
                path: "/python/oop/abstraction",
              },
              {
                slug: "composition",
                title: "Composition",
                icon: Box,
                path: "/python/oop/composition",
              },
              {
                slug: "special-methods",
                title: "Special Methods",
                icon: Code2,
                path: "/python/oop/special-methods",
              },
            ],
          },
          {
            slug: "file-handling",
            title: "File Handling",
            blurb: "Read and write text, CSV, and JSON files in Python.",
            locked: false,
            path: "/python/file-handling",
            lessons: [
              {
                slug: "file-basics",
                title: "File Basics",
                icon: FileText,
                path: "/python/file-handling/file-basics",
              },
              {
                slug: "working-with-paths",
                title: "Working with Paths",
                icon: FileText,
                path: "/python/file-handling/working-with-paths",
              },
              {
                slug: "reading-files",
                title: "Reading Files",
                icon: FileText,
                path: "/python/file-handling/reading-files",
              },
              {
                slug: "writing-files",
                title: "Writing Files",
                icon: FileText,
                path: "/python/file-handling/writing-files",
              },
              {
                slug: "file-modes",
                title: "File Modes",
                icon: FileText,
                path: "/python/file-handling/file-modes",
              },
              {
                slug: "file-methods",
                title: "File Methods",
                icon: FileText,
                path: "/python/file-handling/file-methods",
              },
              {
                slug: "os-module",
                title: "OS Module",
                icon: FileText,
                path: "/python/file-handling/os-module",
              },
              {
                slug: "working-with-json",
                title: "Working with JSON",
                icon: FileText,
                path: "/python/file-handling/working-with-json",
              },
              {
                slug: "working-with-csv",
                title: "Working with CSV",
                icon: FileText,
                path: "/python/file-handling/working-with-csv",
              },
              {
                slug: "pickle-module",
                title: "Pickle Module",
                icon: FileText,
                path: "/python/file-handling/pickle-module",
              },
              {
                slug: "shutil-module",
                title: "Shutil Module",
                icon: FileText,
                path: "/python/file-handling/shutil-module",
              },
            ],
          },
        ],
      },
      {
        title: "3. Advanced Python",
        patterns: [
          lockedPattern(
            "Advanced Python",
            "advanced",
            "Decorators, generators, and context managers.",
          ),
        ],
      },
    ],
  },
  {
    title: "Pandas",
    slug: "pandas",
    icon: pandasLogo,
    locked: false,
    overviewPath: "/pandas",
    blurb: "Master data manipulation and analysis with Pandas.",
    patterns: [],
    sections: [
      {
        title: "Pandas Fundamentals",
        patterns: [
          lockedPattern(
            "DataFrames & Series",
            "dataframes-series",
            "Core Pandas data structures and basic operations.",
          ),
          lockedPattern(
            "Data Cleaning",
            "data-cleaning",
            "Handling missing values, duplicates, and data types.",
          ),
          lockedPattern(
            "Data Aggregation",
            "data-aggregation",
            "Group by, merge, join, and pivot tables.",
          ),
        ],
      },
    ],
  },
  {
    title: "Fundamentals of Data Engineering",
    slug: "data-engineering",
    icon: dataEngineeringLogo,
    locked: false,
    overviewPath: "/data-engineering",
    blurb: "Core principles, lifecycle, architecture, and undercurrents of data engineering.",
    patterns: [],
    sections: [
      {
        title: "Part I — Data Engineering Foundations",
        blurb:
          "The core concepts, lifecycle stages, and architectural principles that form the bedrock of data engineering.",
        patterns: [
          {
            title: "1. Understanding the Data Engineering Discipline",
            slug: "data-engineering-described",
            path: "/data-engineering/data-engineering-described",
            blurb: "What is data engineering, its lifecycle, evolution, and required skills.",
            lessons: [
              {
                title: "1.1 What Data Engineering Means",
                slug: "what-data-engineering-means",
                path: "/data-engineering/data-engineering-described/what-data-engineering-means",
                icon: Activity,
              },
              {
                title: "1.2 Data Landscape",
                slug: "data-landscape",
                path: "/data-engineering/data-engineering-described/data-landscape",
                icon: Activity,
              },
              {
                title: "1.3 Data Engineering Skills and Responsibilities",
                slug: "skills-and-responsibilities",
                path: "/data-engineering/data-engineering-described/skills-and-responsibilities",
                icon: Activity,
              },
              {
                title: "1.4 Data Engineers Within an Organization",
                slug: "within-organization",
                path: "/data-engineering/data-engineering-described/within-organization",
                icon: Activity,
              },
              {
                title: "1.5 Working With Stakeholders and Data Requirements",
                slug: "working-with-stakeholders",
                path: "/data-engineering/data-engineering-described/working-with-stakeholders",
                icon: Activity,
              },
              {
                title: "1.6 Data Engineering on the Cloud",
                slug: "data-engineering-on-the-cloud",
                path: "/data-engineering/data-engineering-described/data-engineering-on-the-cloud",
                icon: Activity,
              },
              {
                title: "1.7 Cloud Networking Basics: VPCs, Subnets, and CIDR",
                slug: "cloud-networking-basics",
                path: "/data-engineering/data-engineering-described/cloud-networking-basics",
                icon: Activity,
              },
              {
                title: "1.8 Controlling Cloud Traffic: Routing, Gateways, NAT, and Firewalls",
                slug: "controlling-cloud-traffic",
                path: "/data-engineering/data-engineering-described/controlling-cloud-traffic",
                icon: Activity,
              },
              {
                title: "1.9 Foundations Quiz",
                slug: "foundations-quiz",
                path: "/data-engineering/data-engineering-described/foundations-quiz",
                icon: Activity,
              },
            ],
          },
          {
            title: "2. The End-to-End Data Journey",
            slug: "data-engineering-lifecycle",
            path: "/data-engineering/data-engineering-lifecycle",
            blurb: "Generation, Storage, Ingestion, Transformation, and Serving Data.",
            lessons: [
              {
                title: "2.1 Data Generation and Source Systems",
                slug: "data-generation-and-source-systems",
                path: "/data-engineering/data-engineering-lifecycle/data-generation-and-source-systems",
                icon: Repeat,
              },
              {
                title: "2.2 Data Ingestion and Storage",
                slug: "data-ingestion-and-storage",
                path: "/data-engineering/data-engineering-lifecycle/data-ingestion-and-storage",
                icon: Repeat,
              },
              {
                title: "2.3 Transforming and Serving Data",
                slug: "transforming-and-serving",
                path: "/data-engineering/data-engineering-lifecycle/transforming-and-serving",
                icon: Repeat,
              },
              {
                title: "2.4 The Undercurrents: Practices That Keep Data Reliable",
                slug: "undercurrents-reliable-data",
                path: "/data-engineering/data-engineering-lifecycle/undercurrents-reliable-data",
                icon: Repeat,
              },
              {
                title: "2.5 The Data Journey Quiz",
                slug: "data-journey-quiz",
                path: "/data-engineering/data-engineering-lifecycle/data-journey-quiz",
                icon: Repeat,
              },
            ],
          },
          {
            title: "3. Designing Scalable Data Platforms",
            slug: "designing-scalable-data-platforms",
            path: "/data-engineering/designing-scalable-data-platforms",
            blurb: "Fundamentals of architecture, principles, patterns, and platforms.",
            lessons: [
              {
                title: "3.1 Fundamentals of Data Architecture",
                slug: "fundamentals-of-data-architecture",
                path: "/data-engineering/designing-scalable-data-platforms/fundamentals-of-data-architecture",
                icon: Layers,
              },
              {
                title: "3.2 Principles for Reliable and Scalable Systems",
                slug: "principles-for-reliable-and-scalable-systems",
                path: "/data-engineering/designing-scalable-data-platforms/principles-for-reliable-and-scalable-systems",
                icon: Layers,
              },
              {
                title: "3.3 Designing Modular and Event-Driven Systems",
                slug: "designing-modular-and-event-driven-systems",
                path: "/data-engineering/designing-scalable-data-platforms/designing-modular-and-event-driven-systems",
                icon: Layers,
              },
              {
                title: "3.4 Batch, Streaming, and Modern Data Platform Patterns",
                slug: "batch-streaming-and-modern-data-platform-patterns",
                path: "/data-engineering/designing-scalable-data-platforms/batch-streaming-and-modern-data-platform-patterns",
                icon: Layers,
              },
              {
                title: "3.5 A Complete Example: Designing a Scalable Retail Data Platform",
                slug: "a-complete-example",
                path: "/data-engineering/designing-scalable-data-platforms/a-complete-example",
                icon: Layers,
              },
            ],
          },
          {
            title: "4. Selecting the Right Data Technologies",
            slug: "selecting-the-right-data-technologies",
            path: "/data-engineering/selecting-the-right-data-technologies",
            blurb: "Evaluating technology choices, deployment models, and trade-offs.",
            lessons: [
              {
                title: "4.1 Evaluating Technology Choices",
                slug: "evaluating-technology-choices",
                path: "/data-engineering/selecting-the-right-data-technologies/evaluating-technology-choices",
                icon: Settings,
              },
              {
                title: "4.2 Cloud, Infrastructure, and Deployment Models",
                slug: "cloud-infrastructure-and-deployment-models",
                path: "/data-engineering/selecting-the-right-data-technologies/cloud-infrastructure-and-deployment-models",
                icon: Settings,
              },
              {
                title: "4.3 Security, Compliance, and Governance by Design",
                slug: "security-compliance-and-governance-by-design",
                path: "/data-engineering/selecting-the-right-data-technologies/security-compliance-and-governance-by-design",
                icon: Settings,
              },
              {
                title: "4.4 Cost, Migration, and Continuous Architecture",
                slug: "cost-migration-and-continuous-architecture",
                path: "/data-engineering/selecting-the-right-data-technologies/cost-migration-and-continuous-architecture",
                icon: Settings,
              },
              {
                title: "4.5 Translating Requirements into Architecture",
                slug: "translating-requirements-into-architecture",
                path: "/data-engineering/selecting-the-right-data-technologies/translating-requirements-into-architecture",
                icon: Settings,
              },
            ],
          },
        ],
      },
      {
        title: "Part II — The Data Engineering Pipeline",
        blurb:
          "How data is generated in source systems, stored efficiently, and ingested into the data platform.",
        patterns: [
          {
            title: "5. Where Data Comes From",
            slug: "data-generation",
            path: "/data-engineering/data-generation",
            blurb: "Databases, APIs, change data capture, logs, and streaming platforms.",
            lessons: [
              {
                title: "5.1 Understanding Data Sources",
                slug: "understanding-data-sources",
                path: "/data-engineering/data-generation/understanding-data-sources",
                icon: Server,
              },
              {
                title: "5.2 Databases, APIs, Files, and Logs",
                slug: "databases-apis-files-logs",
                path: "/data-engineering/data-generation/databases-apis-files-logs",
                icon: Server,
              },
              {
                title: "5.3 Events, Messages, and Change Data",
                slug: "events-messages-change-data",
                path: "/data-engineering/data-generation/events-messages-change-data",
                icon: Server,
              },
              {
                title: "5.4 Working With External and Shared Data",
                slug: "external-shared-data",
                path: "/data-engineering/data-generation/external-shared-data",
                icon: Server,
              },
            ],
          },
          {
            title: "6. Building the Data Storage Layer",
            slug: "storage-deep-dive",
            path: "/data-engineering/storage-deep-dive",
            blurb: "Foundations, systems, data organization, and modern architectures.",
            lessons: [
              {
                title: "6.1 Foundations of Data Storage",
                slug: "foundations-data-storage",
                path: "/data-engineering/storage-deep-dive/foundations-data-storage",
                icon: Database,
              },
              {
                title: "6.2 Storage Systems and Data Platforms",
                slug: "storage-systems-platforms",
                path: "/data-engineering/storage-deep-dive/storage-systems-platforms",
                icon: Database,
              },
              {
                title: "6.3 Data Organization and Performance",
                slug: "data-organization-performance",
                path: "/data-engineering/storage-deep-dive/data-organization-performance",
                icon: Database,
              },
              {
                title: "6.4 Modern Storage Architectures",
                slug: "modern-storage-architectures",
                path: "/data-engineering/storage-deep-dive/modern-storage-architectures",
                icon: Database,
              },
            ],
          },
          {
            title: "7. Moving Data Into the Platform",
            slug: "ingestion-deep-dive",
            path: "/data-engineering/ingestion-deep-dive",
            blurb: "Ingestion fundamentals, batch, streaming, and operational considerations.",
            lessons: [
              {
                title: "7.1 Data Ingestion Fundamentals",
                slug: "data-ingestion-fundamentals",
                path: "/data-engineering/ingestion-deep-dive/data-ingestion-fundamentals",
                icon: Download,
              },
              {
                title: "7.2 Batch and Incremental Ingestion",
                slug: "batch-incremental-ingestion",
                path: "/data-engineering/ingestion-deep-dive/batch-incremental-ingestion",
                icon: Download,
              },
              {
                title: "7.3 Streaming and Event-Based Ingestion",
                slug: "streaming-event-based-ingestion",
                path: "/data-engineering/ingestion-deep-dive/streaming-event-based-ingestion",
                icon: Download,
              },
              {
                title: "7.4 Ingestion Patterns and Technologies",
                slug: "ingestion-patterns-technologies",
                path: "/data-engineering/ingestion-deep-dive/ingestion-patterns-technologies",
                icon: Download,
              },
              {
                title: "7.5 Reliability and Operational Considerations",
                slug: "reliability-operational-considerations",
                path: "/data-engineering/ingestion-deep-dive/reliability-operational-considerations",
                icon: Download,
              },
            ],
          },
        ],
      },
      {
        title: "Part III — Processing & Data Modeling",
        blurb:
          "Techniques for transforming raw data into structured models optimized for analytics and reporting.",
        patterns: [
          {
            title: "8. Querying and Transforming Data",
            slug: "querying-transforming",
            path: "/data-engineering/querying-transforming",
            blurb: "Query optimization, transformation patterns, and processing frameworks.",
            lessons: [
              {
                title: "8.1 Query Processing and Optimization",
                slug: "query-processing-optimization",
                path: "/data-engineering/querying-transforming/query-processing-optimization",
                icon: FileCode,
              },
              {
                title: "8.2 Data Transformation Patterns",
                slug: "data-transformation-patterns",
                path: "/data-engineering/querying-transforming/data-transformation-patterns",
                icon: FileCode,
              },
              {
                title: "8.3 Batch and Streaming Processing",
                slug: "batch-streaming-processing",
                path: "/data-engineering/querying-transforming/batch-streaming-processing",
                icon: FileCode,
              },
              {
                title: "8.4 Advanced Data Access Techniques",
                slug: "advanced-data-access",
                path: "/data-engineering/querying-transforming/advanced-data-access",
                icon: FileCode,
              },
            ],
          },
          {
            title: "9. Designing Effective Data Models",
            slug: "data-modeling",
            path: "/data-engineering/data-modeling",
            blurb: "Fundamentals of modeling, analytical modeling, and stream modeling.",
            lessons: [
              {
                title: "9.1 Fundamentals of Data Modeling",
                slug: "fundamentals-data-modeling",
                path: "/data-engineering/data-modeling/fundamentals-data-modeling",
                icon: FileCode,
              },
              {
                title: "9.2 Analytical Data Modeling",
                slug: "analytical-data-modeling",
                path: "/data-engineering/data-modeling/analytical-data-modeling",
                icon: FileCode,
              },
              {
                title: "9.3 Modeling Batch and Streaming Data",
                slug: "modeling-batch-streaming",
                path: "/data-engineering/data-modeling/modeling-batch-streaming",
                icon: FileCode,
              },
            ],
          },
        ],
      },
      {
        title: "Part IV — Data Delivery",
        blurb:
          "Serving curated data to downstream consumers through dashboards, machine learning models, and reverse ETL.",
        patterns: [
          {
            title: "10. Serving Data for Analytics and AI",
            slug: "serving-data-analytics-ai",
            path: "/data-engineering/serving-data-analytics-ai",
            blurb: "Data products, analytics delivery, machine learning, and reverse ETL.",
            lessons: [
              {
                title: "10.1 Designing Data Products",
                slug: "designing-data-products",
                path: "/data-engineering/serving-data-analytics-ai/designing-data-products",
                icon: Target,
              },
              {
                title: "10.2 Delivering Data for Analytics",
                slug: "delivering-data-analytics",
                path: "/data-engineering/serving-data-analytics-ai/delivering-data-analytics",
                icon: Target,
              },
              {
                title: "10.3 Preparing Data for Machine Learning",
                slug: "preparing-data-ml",
                path: "/data-engineering/serving-data-analytics-ai/preparing-data-ml",
                icon: Target,
              },
              {
                title: "10.4 Data Sharing and Consumption Patterns",
                slug: "data-sharing-consumption",
                path: "/data-engineering/serving-data-analytics-ai/data-sharing-consumption",
                icon: Target,
              },
              {
                title: "10.5 Reverse ETL and Operational Data Delivery",
                slug: "reverse-etl",
                path: "/data-engineering/serving-data-analytics-ai/reverse-etl",
                icon: Target,
              },
            ],
          },
        ],
      },
      {
        title: "Part V — Trust & Security",
        blurb:
          "Ensuring data integrity, implementing access controls, and maintaining robust security practices.",
        patterns: [
          {
            title: "11. Protecting Data and Building Trust",
            slug: "protecting-data",
            path: "/data-engineering/protecting-data",
            blurb: "Security principles, protecting infrastructure, and monitoring access.",
            lessons: [
              {
                title: "11.1 Security Principles and Responsibilities",
                slug: "security-principles",
                path: "/data-engineering/protecting-data/security-principles",
                icon: ShieldAlert,
              },
              {
                title: "11.2 Protecting Data and Infrastructure",
                slug: "protecting-data-infrastructure",
                path: "/data-engineering/protecting-data/protecting-data-infrastructure",
                icon: ShieldAlert,
              },
              {
                title: "11.3 Monitoring, Access, and Operational Security",
                slug: "monitoring-access-operational",
                path: "/data-engineering/protecting-data/monitoring-access-operational",
                icon: ShieldAlert,
              },
            ],
          },
        ],
      },
      {
        title: "Part VI — The Future of Data Engineering",
        blurb:
          "Emerging trends, the rise of the live data stack, and how the role of the data engineer is evolving.",
        patterns: [
          {
            title: "12. The Evolution of Modern Data Engineering",
            slug: "evolution-modern-data-engineering",
            path: "/data-engineering/evolution-modern-data-engineering",
            blurb: "Changing landscape, cloud-scale platforms, and the future role.",
            lessons: [
              {
                title: "12.1 The Changing Data Engineering Landscape",
                slug: "changing-landscape",
                path: "/data-engineering/evolution-modern-data-engineering/changing-landscape",
                icon: TrendingUp,
              },
              {
                title: "12.2 Cloud-Scale and Real-Time Data Platforms",
                slug: "cloud-scale-real-time",
                path: "/data-engineering/evolution-modern-data-engineering/cloud-scale-real-time",
                icon: TrendingUp,
              },
              {
                title: "12.3 Data, Applications, and Machine Learning",
                slug: "data-apps-ml",
                path: "/data-engineering/evolution-modern-data-engineering/data-apps-ml",
                icon: TrendingUp,
              },
              {
                title: "12.4 The Future Role of the Data Engineer",
                slug: "future-role",
                path: "/data-engineering/evolution-modern-data-engineering/future-role",
                icon: TrendingUp,
              },
            ],
          },
        ],
      },
      {
        title: "Part VII — Technical Deep Dives",
        blurb:
          "A closer look at low-level mechanics like serialization formats, compression, and cloud networking.",
        patterns: [
          {
            title: "13. How Data Is Encoded and Compressed",
            slug: "encoded-compressed",
            path: "/data-engineering/encoded-compressed",
            blurb: "Serialization fundamentals, formats, and compression techniques.",
            lessons: [
              {
                title: "13.1 Data Serialization Fundamentals",
                slug: "data-serialization",
                path: "/data-engineering/encoded-compressed/data-serialization",
                icon: Hash,
              },
              {
                title: "13.2 Serialization Formats",
                slug: "serialization-formats",
                path: "/data-engineering/encoded-compressed/serialization-formats",
                icon: Hash,
              },
              {
                title: "13.3 Data Compression Techniques",
                slug: "data-compression",
                path: "/data-engineering/encoded-compressed/data-compression",
                icon: Hash,
              },
              {
                title: "13.4 Choosing Formats for Performance and Storage",
                slug: "choosing-formats",
                path: "/data-engineering/encoded-compressed/choosing-formats",
                icon: Hash,
              },
            ],
          },
          {
            title: "14. Cloud Networking for Data Engineers",
            slug: "cloud-networking",
            path: "/data-engineering/cloud-networking",
            blurb: "Networking fundamentals, subnets, routing, and connectivity.",
            lessons: [
              {
                title: "14.1 Cloud Networking Fundamentals",
                slug: "networking-fundamentals",
                path: "/data-engineering/cloud-networking/networking-fundamentals",
                icon: Cloud,
              },
              {
                title: "14.2 Networks, Subnets, and Routing",
                slug: "networks-subnets-routing",
                path: "/data-engineering/cloud-networking/networks-subnets-routing",
                icon: Cloud,
              },
              {
                title: "14.3 Connectivity and Network Security",
                slug: "connectivity-network-security",
                path: "/data-engineering/cloud-networking/connectivity-network-security",
                icon: Cloud,
              },
              {
                title: "14.4 Networking Patterns for Data Platforms",
                slug: "networking-patterns",
                path: "/data-engineering/cloud-networking/networking-patterns",
                icon: Cloud,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "MongoDB",
    slug: "mongodb",
    icon: mongoDbLogo,
    locked: false,
    overviewPath: "/mongodb",
    blurb: "Master MongoDB: from NoSQL concepts to aggregations and Python integration.",
    patterns: [],
    sections: [
      {
        title: "Foundations & Setup",
        blurb: "Core NoSQL concepts, document architecture, and connection methods.",
        patterns: [
          unlockedMongoPattern("NoSQL Concepts", "nosql-concepts", "Compare data models, inspect flexible documents, and choose from access patterns.", [
            "Introduction to NoSQL",
            "Types of NoSQL Databases",
            "The CAP Theorem",
          ]),
          lockedPattern(
            "Getting Started with Atlas",
            "getting-started-atlas",
            "Set up your first MongoDB cluster.",
          ),
          lockedPattern(
            "The Document Model",
            "document-model",
            "Understand how MongoDB stores data as documents.",
          ),
          lockedPattern(
            "Connecting via Shell",
            "mongodb-shell",
            "Connect and run commands via the Mongo shell.",
          ),
          lockedPattern(
            "Connecting in Python",
            "connecting-python",
            "Integrate MongoDB with your Python applications.",
          ),
        ],
      },
      {
        title: "CRUD Operations",
        blurb: "Mastering data manipulation through the shell and Python.",
        patterns: [
          lockedPattern(
            "Insert and Find Documents",
            "crud-insert-find",
            "Create and read documents in MongoDB.",
          ),
          lockedPattern(
            "Replace and Delete Documents",
            "crud-replace-delete",
            "Update and remove documents.",
          ),
          lockedPattern(
            "Modifying Query Results",
            "modifying-query-results",
            "Sort, limit, and skip query results.",
          ),
          lockedPattern(
            "CRUD Operations in Python",
            "crud-python",
            "Perform CRUD operations using PyMongo.",
          ),
        ],
      },
      {
        title: "Indexes & Aggregation",
        blurb: "Optimizing queries and processing data with advanced pipelines.",
        patterns: [
          lockedPattern(
            "MongoDB Indexes",
            "mongodb-indexes",
            "Improve query performance with indexes.",
          ),
          lockedPattern(
            "MongoDB Aggregation",
            "mongodb-aggregation",
            "Process data records and return computed results.",
          ),
          lockedPattern(
            "Aggregation in Python",
            "aggregation-python",
            "Run aggregation pipelines in Python.",
          ),
        ],
      },
    ],
  },
  {
    title: "AI Engineering",
    slug: "ai-engineering",
    icon: Bot,
    iconColor: "text-rose-500",
    locked: false,
    overviewPath: "/ai-engineering",
    blurb: "Learn the fundamentals of Large Language Models and build your own AI applications.",
    patterns: [],
    sections: [
      {
        title: "Foundations of Generative AI",
        blurb: "Core concepts, evolution of LLMs, and running models locally or via APIs.",
        patterns: [
          unlockedAIPattern(
            "Deep Learning Fundamentals",
            "deep-learning-fundamentals",
            "Neural networks, CNNs, RNNs, and the building blocks of deep learning.",
            [
              "Neural Networks Basics",
              "Loss Functions & Softmax",
              "Gradient Descent & Variants",
              "CNN",
              "RNN",
              "RNN Types",
              "LSTM",
            ],
          ),
          unlockedAIPattern(
            "Core Concepts & Evolution",
            "core-concepts",
            "From RNNs to the Transformer architecture, tokenization, and model pretraining.",
            [
              "Introduction to Generative Modeling",
              "Tokenization & Embeddings",
              "The Transformer Architecture",
              "Model Lifecycle & Pretraining",
            ],
          ),
          unlockedAIPattern(
            "Local Inference & API Integration",
            "local-inference",
            "Interact with APIs and run open-weight models locally with Ollama and vLLM.",
            ["Interacting with Model APIs", "Local Model Execution & Quantization"],
          ),
        ],
      },
      {
        title: "Prompt Engineering & Context",
        blurb: "Mastering in-context learning, structured outputs, and advanced reasoning.",
        patterns: [
          unlockedAIPattern(
            "Prompt Crafting & Structured I/O",
            "prompt-crafting",
            "Personas, few-shot prompting, and enforcing strict JSON outputs.",
            [
              "System Prompts & Personas",
              "In-Context Learning Techniques",
              "Structured Outputs & Schemas",
            ],
          ),
          unlockedAIPattern(
            "Advanced Reasoning Patterns",
            "advanced-reasoning",
            "Chain-of-Thought (CoT), Self-Consistency, and Tree of Thoughts (ToT).",
            ["Chain-of-Thought (CoT)", "Self-Consistency & Tree of Thoughts (ToT)"],
          ),
        ],
      },
      {
        title: "Level 1 Capstone",
        blurb: "Apply your knowledge from Modules 1 & 2 by building a conversational agent.",
        patterns: [
          unlockedAIPattern(
            "Interactive CLI Assistant",
            "capstone-1",
            "Build an Interactive Multi-Turn CLI Assistant with Custom Context Windows.",
            ["Project Setup & Architecture", "Implementation & Testing"],
          ),
        ],
      },
      {
        title: "Embeddings & RAG",
        blurb: "Connecting LLMs to external knowledge using vector stores and advanced retrieval.",
        patterns: [
          unlockedAIPattern(
            "Vector Stores & Ingestion Pipelines",
            "vector-stores",
            "Document chunking, vector embeddings, and similarity search in vector databases.",
            [
              "Document Parsing & Chunking",
              "Vector Embeddings & Similarity Search",
              "Vector Databases",
            ],
          ),
          unlockedAIPattern(
            "Advanced RAG Strategies",
            "advanced-rag",
            "Hybrid search, cross-encoder re-ranking, query expansion, and GraphRAG.",
            [
              "Hybrid Search & Re-ranking",
              "Context Engineering & Retrieval Optimization",
              "GraphRAG & Structured Knowledge",
            ],
          ),
        ],
      },
      {
        title: "Tool Use & Function Calling",
        blurb: "Empowering LLMs to interact with external APIs, databases, and code environments.",
        patterns: [
          unlockedAIPattern(
            "Interfacing with External Systems",
            "interfacing-systems",
            "Mechanics of function calling, REST API wrappers, and Model Context Protocol (MCP).",
            [
              "Mechanics of Function Calling",
              "API & Database Tooling",
              "Model Context Protocol (MCP)",
            ],
          ),
          unlockedAIPattern(
            "Dynamic Execution Environments",
            "dynamic-execution",
            "Sandboxed code execution and semantic tool selection strategies.",
            ["Code Generation & Sandboxed Execution", "Tool Selection Strategies"],
          ),
        ],
      },
      {
        title: "Level 2 Capstone",
        blurb: "Apply your knowledge from Modules 3 & 4 by building an intelligent RAG system.",
        patterns: [
          unlockedAIPattern(
            "Hybrid GraphRAG Engine",
            "capstone-2",
            "Build a Hybrid GraphRAG Documentation Engine with Real-Time SQL & Tool Invocation.",
            ["Project Setup & Architecture", "Implementation & Testing"],
          ),
        ],
      },
      {
        title: "Single-Agent Architectures",
        blurb: "Building autonomous agents with perception-action loops, memory, and state graphs.",
        patterns: [
          unlockedAIPattern(
            "Agent Core Loops & Reasoning Patterns",
            "agent-core-loops",
            "ReAct framework, Plan-and-Solve, and iterative self-correction.",
            [
              "The Agentic Loop & Autonomy",
              "ReAct Framework",
              "Plan-and-Solve & Stepwise Execution",
              "Reflection & Self-Correction",
            ],
          ),
          unlockedAIPattern(
            "Memory & State Machines",
            "memory-state",
            "Agent memory architectures and deterministic control with LangGraph.",
            ["Agent Memory Architecture", "State Graphs & Deterministic Control"],
          ),
        ],
      },
      {
        title: "Multi-Agent Systems",
        blurb: "Scaling agents into collaborative swarms and orchestrating enterprise workflows.",
        patterns: [
          unlockedAIPattern(
            "Multi-Agent Patterns & Protocols",
            "multi-agent-patterns",
            "Hierarchical networks, structured handoffs, and frameworks like CrewAI and AutoGen.",
            ["Multi-Agent Architectures", "Inter-Agent Communication", "Multi-Agent Frameworks"],
          ),
          unlockedAIPattern(
            "Scalability & Enterprise Workflows",
            "scalability-workflows",
            "Distributed execution and Human-in-the-Loop (HITL) oversight.",
            ["Distributed Agent Execution", "Human-in-the-Loop (HITL)"],
          ),
        ],
      },
      {
        title: "Level 3 Capstone",
        blurb: "Apply your knowledge from Modules 5 & 6 by orchestrating a multi-agent team.",
        patterns: [
          unlockedAIPattern(
            "Autonomous Multi-Agent Team",
            "capstone-3",
            "Build an Autonomous Multi-Agent Research & Code Generation Team with HITL Gates.",
            ["Project Setup & Architecture", "Implementation & Testing"],
          ),
        ],
      },
      {
        title: "Evaluation, Observability & Safety",
        blurb: "Measuring agent performance, tracing execution, and implementing guardrails.",
        patterns: [
          unlockedAIPattern(
            "Agent & RAG Evaluation",
            "agent-rag-eval",
            "LLM-as-a-Judge, the RAG Triad, and automated testing suites.",
            [
              "Evaluation Metrics & Benchmarks",
              "LLM-as-a-Judge & Automated Testing",
              "Component-Level vs. End-to-End Evals",
            ],
          ),
          unlockedAIPattern(
            "Observability & Production Operations",
            "observability",
            "Tracing telemetry, semantic caching, and token budgeting.",
            ["Tracing & Telemetry", "Caching & Rate Limiting"],
          ),
          unlockedAIPattern(
            "AI Safety & Defensive Engineering",
            "ai-safety",
            "Defending against prompt injection and implementing input/output guardrails.",
            ["Security & Threat Vectors", "Guardrails & Moderation"],
          ),
        ],
      },
      {
        title: "Model Adaptation, Fine-Tuning & Serving",
        blurb: "Customizing models with PEFT/LoRA and deploying them for high throughput.",
        patterns: [
          unlockedAIPattern(
            "Fine-Tuning Foundations",
            "fine-tuning",
            "Supervised fine-tuning, QLoRA adapters, and preference alignment (DPO).",
            [
              "When to Prompt, RAG, or Fine-Tune",
              "Supervised Fine-Tuning (SFT)",
              "Parameter-Efficient Fine-Tuning (PEFT)",
              "Preference Alignment",
            ],
          ),
          unlockedAIPattern(
            "High-Throughput Production Serving",
            "production-serving",
            "Continuous batching with vLLM and edge deployment via WebGPU.",
            ["Inference Engines", "Edge Deployment & WebGPU"],
          ),
        ],
      },
      {
        title: "Level 4 Capstone",
        blurb:
          "Apply your knowledge from Modules 7 & 8 to deploy a robust, enterprise-grade agent.",
        patterns: [
          unlockedAIPattern(
            "Enterprise Agent System",
            "capstone-4",
            "Deploy an Enterprise Agent System with Tracing, Custom Evaluators, Guardrails, and a Fine-Tuned LoRA Adapter.",
            ["Project Setup & Architecture", "Implementation & Testing"],
          ),
        ],
      },
    ],
  },
];

export const CATEGORY_BY_SLUG: Record<string, RoadmapCategory> = Object.fromEntries(
  roadmap.map((c) => [c.slug, c]),
);
