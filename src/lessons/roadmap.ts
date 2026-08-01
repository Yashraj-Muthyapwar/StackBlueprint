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
  Globe,
  ShieldAlert,
  LockKeyhole,
  Bot,
  GitBranch,
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
export interface RoadmapCategory {
  title: string;
  slug: string;
  icon: LucideIcon | string;
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
    icon: systemDesignLogo,
    locked: false,
    overviewPath: "/system-design",
    blurb: "Design systems that survive scale, failure, and traffic spikes.",
    patterns: [
      lockedPattern("Getting Started", "getting-started", "Introduction to system design and the interview delivery framework."),
      lockedPattern("Networking & Protocols", "networking-protocols", "Understand how data travels across the web (OSI, TCP, DNS)."),
      lockedPattern("Core Concepts & Metrics", "core-metrics", "Measuring performance: Availability, Scalability, and SLAs."),
      lockedPattern("Databases & DBMS", "databases", "Choosing the right storage: SQL vs NoSQL, OLAP vs OLTP, ACID."),
      lockedPattern("Scaling Data", "scaling-data", "Distributing data: Replication, Partitioning, Sharding, Consistent Hashing."),
      lockedPattern("Caching & Content Delivery", "caching", "Reducing latency with caching strategies and CDNs."),
      lockedPattern("Advanced Data Structures", "data-structures", "Specialized structures like Bloom Filters and Quad Trees."),
      lockedPattern("Architectural Styles", "architectural-styles", "Monoliths, Microservices, Event-Driven, and Serverless."),
      lockedPattern("APIs & Security", "apis-security", "REST, GraphQL, gRPC, API Gateways, and OAuth2/JWT."),
      lockedPattern("Communication Patterns", "communication-patterns", "WebSockets, Message Queues, Pub/Sub, and CDC."),
      lockedPattern("System Tradeoffs", "system-tradeoffs", "Balancing constraints: CAP Theorem, Consistency, and Scaling."),
      lockedPattern("Resilience & Security", "resilience-security", "Circuit Breakers, Chaos Engineering, and Disaster Recovery."),
      lockedPattern("Big Data Processing", "big-data", "Batch vs Stream Processing, MapReduce, and Data Lakes."),
      lockedPattern("Case Studies (Capstone)", "case-studies", "Design real-world apps like Twitter, URL Shorteners, and Netflix."),
    ],
  },
  {
    title: "Data Warehouses",
    slug: "data-warehouses",
    icon: dwLogo,
    locked: false,
    overviewPath: "/data-warehouses",
    blurb: "Cloud warehouses, modeling, and the cost/perf knobs that matter.",
    patterns: [
      {
        title: "Data Ecosystems",
        slug: "data-ecosystems",
        path: "/data-warehouses/foundations/data-ecosystems",
        blurb: "From transaction processing (OLTP) to analytical datastores (OLAP) and distributed meshes.",
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
      lockedPattern("Snowflake", "snowflake", "Virtual warehouses, micro-partitions, clustering, and Snowpark fundamentals."),
      lockedPattern("BigQuery", "bigquery", "Slots, partitioning & clustering, BI Engine, and cost-aware query design."),
      lockedPattern("Amazon Redshift", "redshift", "Distribution styles, sort keys, RA3 nodes, and workload management."),
    ],
  },
  {
    title: "Web Scraping",
    slug: "web-scraping",
    icon: webScraperLogo,
    locked: false,
    overviewPath: "/web-scraping",
    blurb: "Extracting data from the web using HTML parsing, headless browsers, and scalable crawlers.",
    patterns: [
      {
        title: "HTTP Foundations",
        slug: "http-foundations",
        path: "/web-scraping/foundations/http-foundations",
        blurb: "Master the DOM, HTTP requests, status codes, headers, and cookies.",
        lessons: [
          { title: "How the Web Works", slug: "how-the-web-works", path: "/web-scraping/foundations/http-foundations/how-the-web-works", icon: Globe },
          { title: "HTTP Methods & Status Codes", slug: "http-methods-and-status-codes", path: "/web-scraping/foundations/http-foundations/http-methods-and-status-codes", icon: ShieldAlert },
          { title: "Headers & Cookies", slug: "headers-and-cookies", path: "/web-scraping/foundations/http-foundations/headers-and-cookies", icon: LockKeyhole },
          { title: "The Document Object Model (DOM)", slug: "the-dom", path: "/web-scraping/foundations/http-foundations/the-dom", icon: Search },
          { title: "Developer Tools (Inspecting Elements)", slug: "developer-tools", path: "/web-scraping/foundations/http-foundations/developer-tools", icon: Wrench },
          { title: "Client-Side vs Server-Side Rendering", slug: "dynamic-vs-static-content", path: "/web-scraping/foundations/http-foundations/dynamic-vs-static-content", icon: Layers },
        ],
      },
      {
        title: "Static Scraping",
        slug: "static-scraping",
        path: "/web-scraping/foundations/static-scraping",
        blurb: "Fetch raw HTML and parse it efficiently to extract exactly what you need.",
        lessons: [
          { title: "Your First Request", slug: "your-first-request", path: "/web-scraping/foundations/static-scraping/your-first-request", icon: Search },
          { title: "Parsing HTML with BeautifulSoup", slug: "parsing-html-beautifulsoup", path: "/web-scraping/foundations/static-scraping/parsing-html-beautifulsoup", icon: Search },
          { title: "CSS Selectors in Practice", slug: "css-selectors", path: "/web-scraping/foundations/static-scraping/css-selectors", icon: Search },
          { title: "XPath and lxml", slug: "xpath-and-lxml", path: "/web-scraping/foundations/static-scraping/xpath-and-lxml", icon: Search },
          { title: "Extracting Text and Attributes", slug: "extracting-text-attributes", path: "/web-scraping/foundations/static-scraping/extracting-text-attributes", icon: Search },
          { title: "Following Pagination", slug: "following-pagination", path: "/web-scraping/foundations/static-scraping/following-pagination", icon: Search },
        ],
      },
      {
        title: "Cleaning & Storing",
        slug: "cleaning-and-storing",
        path: "/web-scraping/foundations/cleaning-and-storing",
        blurb: "Transform messy text into structured formats and save it to databases or CSVs.",
        lessons: [
          { title: "Defining Your Schema First", slug: "defining-your-schema", path: "/web-scraping/foundations/cleaning-and-storing/defining-your-schema", icon: Database },
          { title: "Regex for Extraction", slug: "regex-for-extraction", path: "/web-scraping/foundations/cleaning-and-storing/regex-for-extraction", icon: Database },
          { title: "Normalizing Data", slug: "normalizing-data", path: "/web-scraping/foundations/cleaning-and-storing/normalizing-data", icon: Database },
          { title: "Pandas for Scraped Data", slug: "pandas-for-scraped-data", path: "/web-scraping/foundations/cleaning-and-storing/pandas-for-scraped-data", icon: Database },
          { title: "Exporting to CSV, JSON, and JSONL", slug: "exporting-csv-json", path: "/web-scraping/foundations/cleaning-and-storing/exporting-csv-json", icon: Database },
          { title: "Storing in SQLite and Postgres", slug: "storing-sqlite-postgres", path: "/web-scraping/foundations/cleaning-and-storing/storing-sqlite-postgres", icon: Database },
        ],
      },
      {
        title: "Finding the Hidden API",
        slug: "hidden-api",
        path: "/web-scraping/automation/hidden-api",
        blurb: "Skip HTML entirely by discovering the JSON APIs that power the frontend.",
        lessons: [
          { title: "Check for an API First", slug: "check-api-first", path: "/web-scraping/automation/hidden-api/check-api-first", icon: Compass },
          { title: "Reverse-Engineering the Network Tab", slug: "reverse-engineering-network", path: "/web-scraping/automation/hidden-api/reverse-engineering-network", icon: Compass },
          { title: "Replaying Requests in Python", slug: "replaying-requests-python", path: "/web-scraping/automation/hidden-api/replaying-requests-python", icon: Compass },
          { title: "GraphQL and REST Endpoints", slug: "graphql-and-rest", path: "/web-scraping/automation/hidden-api/graphql-and-rest", icon: Compass },
          { title: "Sitemaps and Feeds", slug: "sitemaps-and-feeds", path: "/web-scraping/automation/hidden-api/sitemaps-and-feeds", icon: Compass },
        ],
      },
      {
        title: "Browser Automation",
        slug: "browser-automation",
        path: "/web-scraping/automation/browser-automation",
        blurb: "Control real web browsers to interact with SPAs, click buttons, and bypass simple anti-bot checks.",
        lessons: [
          { title: "When You Actually Need a Browser", slug: "when-you-need-browser", path: "/web-scraping/automation/browser-automation/when-you-need-browser", icon: Settings },
          { title: "Playwright Basics", slug: "playwright-basics", path: "/web-scraping/automation/browser-automation/playwright-basics", icon: Settings },
          { title: "Waiting Correctly", slug: "waiting-correctly", path: "/web-scraping/automation/browser-automation/waiting-correctly", icon: Settings },
          { title: "Interacting with Pages", slug: "interacting-with-pages", path: "/web-scraping/automation/browser-automation/interacting-with-pages", icon: Settings },
          { title: "Intercepting Network Traffic", slug: "intercepting-network-traffic", path: "/web-scraping/automation/browser-automation/intercepting-network-traffic", icon: Settings },
          { title: "Playwright vs Selenium", slug: "playwright-vs-selenium", path: "/web-scraping/automation/browser-automation/playwright-vs-selenium", icon: Settings },
        ],
      },
      {
        title: "Authenticated Scraping",
        slug: "authenticated-scraping",
        path: "/web-scraping/automation/authenticated-scraping",
        blurb: "Handle cookies, tokens, CSRF, and state to scrape behind login walls safely.",
        lessons: [
          { title: "Session Objects and Cookie Persistence", slug: "session-objects", path: "/web-scraping/automation/authenticated-scraping/session-objects", icon: LockKeyhole },
          { title: "Form Logins and CSRF Tokens", slug: "form-logins-csrf", path: "/web-scraping/automation/authenticated-scraping/form-logins-csrf", icon: LockKeyhole },
          { title: "Token-Based Auth", slug: "token-based-auth", path: "/web-scraping/automation/authenticated-scraping/token-based-auth", icon: LockKeyhole },
          { title: "Reusing Browser Auth State", slug: "reusing-browser-auth", path: "/web-scraping/automation/authenticated-scraping/reusing-browser-auth", icon: LockKeyhole },
          { title: "What You Should Not Log Into", slug: "what-not-to-login", path: "/web-scraping/automation/authenticated-scraping/what-not-to-login", icon: LockKeyhole },
        ],
      },
      {
        title: "Async Fetching",
        slug: "async-fetching",
        path: "/web-scraping/automation/async-fetching",
        blurb: "Speed up your scrapers 100x using threads, asyncio, and semaphores.",
        lessons: [
          { title: "Why Sequential Scraping Is Slow", slug: "why-sequential-is-slow", path: "/web-scraping/automation/async-fetching/why-sequential-is-slow", icon: Repeat },
          { title: "Threads and Processes", slug: "threads-and-processes", path: "/web-scraping/automation/async-fetching/threads-and-processes", icon: Repeat },
          { title: "Asyncio and httpx", slug: "asyncio-and-httpx", path: "/web-scraping/automation/async-fetching/asyncio-and-httpx", icon: Repeat },
          { title: "Controlling Concurrency", slug: "controlling-concurrency", path: "/web-scraping/automation/async-fetching/controlling-concurrency", icon: Repeat },
          { title: "Retries and Timeouts in Async Code", slug: "retries-and-timeouts", path: "/web-scraping/automation/async-fetching/retries-and-timeouts", icon: Repeat },
        ],
      },
      {
        title: "The Scrapy Framework",
        slug: "scrapy-framework",
        path: "/web-scraping/automation/scrapy-framework",
        blurb: "Build high-performance, asynchronous web crawling spiders that scale.",
        lessons: [
          { title: "Why a Framework", slug: "why-a-framework", path: "/web-scraping/automation/scrapy-framework/why-a-framework", icon: Boxes },
          { title: "Spiders and Requests", slug: "spiders-and-requests", path: "/web-scraping/automation/scrapy-framework/spiders-and-requests", icon: Boxes },
          { title: "Items, ItemLoaders, and Pipelines", slug: "items-and-pipelines", path: "/web-scraping/automation/scrapy-framework/items-and-pipelines", icon: Boxes },
          { title: "Middlewares", slug: "middlewares", path: "/web-scraping/automation/scrapy-framework/middlewares", icon: Boxes },
          { title: "The Scrapy Shell", slug: "scrapy-shell", path: "/web-scraping/automation/scrapy-framework/scrapy-shell", icon: Boxes },
          { title: "Scrapy with Playwright", slug: "scrapy-with-playwright", path: "/web-scraping/automation/scrapy-framework/scrapy-with-playwright", icon: Boxes },
        ],
      },
      {
        title: "Robustness and Politeness",
        slug: "scale-and-politeness",
        path: "/web-scraping/scale/scale-and-politeness",
        blurb: "Manage rate limits, handle retries, rotate proxies, and respect robots.txt.",
        lessons: [
          { title: "Reading robots.txt Properly", slug: "reading-robots-txt", path: "/web-scraping/scale/scale-and-politeness/reading-robots-txt", icon: Server },
          { title: "Rate Limiting and Throttling", slug: "rate-limiting-throttling", path: "/web-scraping/scale/scale-and-politeness/rate-limiting-throttling", icon: Server },
          { title: "Retry Strategy", slug: "retry-strategy", path: "/web-scraping/scale/scale-and-politeness/retry-strategy", icon: Server },
          { title: "Handling Bans and Blocks", slug: "handling-bans", path: "/web-scraping/scale/scale-and-politeness/handling-bans", icon: Server },
          { title: "Proxy Rotation", slug: "proxy-rotation", path: "/web-scraping/scale/scale-and-politeness/proxy-rotation", icon: Server },
          { title: "Failing Loudly", slug: "failing-loudly", path: "/web-scraping/scale/scale-and-politeness/failing-loudly", icon: Server },
        ],
      },
      {
        title: "Anti-Bot Systems",
        slug: "anti-bot-systems",
        path: "/web-scraping/scale/anti-bot-systems",
        blurb: "Understand how websites fingerprint you and when you've triggered an escalation.",
        lessons: [
          { title: "How Detection Works", slug: "how-detection-works", path: "/web-scraping/scale/anti-bot-systems/how-detection-works", icon: ShieldAlert },
          { title: "Browser Fingerprinting", slug: "browser-fingerprinting", path: "/web-scraping/scale/anti-bot-systems/browser-fingerprinting", icon: ShieldAlert },
          { title: "Detecting Captchas and Walls", slug: "detecting-captchas", path: "/web-scraping/scale/anti-bot-systems/detecting-captchas", icon: ShieldAlert },
          { title: "Knowing When to Stop", slug: "knowing-when-to-stop", path: "/web-scraping/scale/anti-bot-systems/knowing-when-to-stop", icon: ShieldAlert },
        ],
      },
      {
        title: "The Legal and Ethical Line",
        slug: "legal-and-ethical",
        path: "/web-scraping/scale/legal-and-ethical",
        blurb: "Public data vs protected data, ToS, and scraping personal information.",
        lessons: [
          { title: "Public Data vs Protected Data", slug: "public-vs-protected-data", path: "/web-scraping/scale/legal-and-ethical/public-vs-protected-data", icon: Activity },
          { title: "Terms of Service, CFAA, and hiQ v LinkedIn", slug: "tos-cfaa-hiq", path: "/web-scraping/scale/legal-and-ethical/tos-cfaa-hiq", icon: Activity },
          { title: "Personal Data, GDPR, and CCPA", slug: "personal-data-gdpr", path: "/web-scraping/scale/legal-and-ethical/personal-data-gdpr", icon: Activity },
          { title: "Copyright and Database Rights", slug: "copyright-database-rights", path: "/web-scraping/scale/legal-and-ethical/copyright-database-rights", icon: Activity },
        ],
      },
      {
        title: "Scrapers in Production",
        slug: "scrapers-in-production",
        path: "/web-scraping/scale/scrapers-in-production",
        blurb: "Incremental scraping, deduplication, alerting, and containerizing your pipelines.",
        lessons: [
          { title: "Incremental Scraping", slug: "incremental-scraping", path: "/web-scraping/scale/scrapers-in-production/incremental-scraping", icon: Terminal },
          { title: "Deduplication at Scale", slug: "deduplication-scale", path: "/web-scraping/scale/scrapers-in-production/deduplication-scale", icon: Terminal },
          { title: "Scheduling", slug: "scheduling", path: "/web-scraping/scale/scrapers-in-production/scheduling", icon: Terminal },
          { title: "Containerizing a Scraper", slug: "containerizing-scraper", path: "/web-scraping/scale/scrapers-in-production/containerizing-scraper", icon: Terminal },
          { title: "Monitoring and Alerting", slug: "monitoring-alerting", path: "/web-scraping/scale/scrapers-in-production/monitoring-alerting", icon: Terminal },
          { title: "Handling Schema Drift", slug: "handling-schema-drift", path: "/web-scraping/scale/scrapers-in-production/handling-schema-drift", icon: Terminal },
        ],
      },
      {
        title: "AI-Driven Extraction",
        slug: "ai-agents",
        path: "/web-scraping/scale/ai-agents",
        blurb: "Use LLMs and vision models to navigate pages and extract unstructured data automatically.",
        lessons: [
          { title: "LLM Extraction from HTML", slug: "llm-extraction", path: "/web-scraping/scale/ai-agents/llm-extraction", icon: Bot },
          { title: "DOM to Markdown", slug: "dom-to-markdown", path: "/web-scraping/scale/ai-agents/dom-to-markdown", icon: Bot },
          { title: "Vision Models for Layout", slug: "vision-models", path: "/web-scraping/scale/ai-agents/vision-models", icon: Bot },
          { title: "Auto-Navigating Agents", slug: "auto-navigating-agents", path: "/web-scraping/scale/ai-agents/auto-navigating-agents", icon: Bot },
          { title: "Cost, Latency, and Determinism", slug: "cost-latency-determinism", path: "/web-scraping/scale/ai-agents/cost-latency-determinism", icon: Bot },
        ],
      },
      {
        title: "Capstone",
        slug: "capstone",
        path: "/web-scraping/scale/capstone",
        blurb: "Build an end-to-end scalable pipeline, from target discovery to publishing.",
        lessons: [
          { title: "Choosing a Target and Scoping the Dataset", slug: "choosing-target", path: "/web-scraping/scale/capstone/choosing-target", icon: FileCode },
          { title: "Building the Pipeline", slug: "building-pipeline", path: "/web-scraping/scale/capstone/building-pipeline", icon: FileCode },
          { title: "Deploying and Scheduling It", slug: "deploying-scheduling", path: "/web-scraping/scale/capstone/deploying-scheduling", icon: FileCode },
          { title: "Publishing the Dataset and Writing It Up", slug: "publishing-dataset", path: "/web-scraping/scale/capstone/publishing-dataset", icon: FileCode },
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
  {
    title: "Terraform",
    slug: "terraform",
    icon: terraformLogo,
    locked: false,
    overviewPath: "/terraform",
    blurb: "Infrastructure as Code for provisioning and managing cloud resources.",
    patterns: [
      lockedPattern("Infrastructure as Code", "iac-fundamentals", "Why IaC, declarative vs imperative, and the core workflow."),
      lockedPattern("Terraform Basics", "basics", "Providers, resources, data sources, and state file intro."),
      lockedPattern("Variables & Outputs", "variables-outputs", "Parameterizing your infrastructure with locals and variables."),
      lockedPattern("HCL Logic", "hcl-logic", "Loops, conditionals, dynamic blocks, and built-in functions."),
      lockedPattern("Modules", "modules", "Creating and consuming reusable infrastructure components."),
      lockedPattern("State Management", "state-management", "Remote backends, state locking, and state manipulation."),
      lockedPattern("Environments", "workspaces-envs", "Managing dev, staging, and production with workspaces."),
      lockedPattern("CI/CD & Automation", "ci-cd-terraform", "Automating deployments with GitHub Actions and Terraform Cloud."),
      lockedPattern("Capstone", "capstone", "Provision a highly-available cloud architecture from scratch."),
    ],
  },
  {
    title: "Git / GitHub",
    slug: "git-github",
    icon: gitLogo,
    locked: false,
    overviewPath: "/git-github",
    blurb: "Version control, branching strategies, and collaboration workflows.",
    patterns: [
      lockedPattern("Git Fundamentals", "git-fundamentals", "Commits, history, and the working tree."),
      lockedPattern("Branching & Merging", "branching-merging", "Parallel development and combining work with merges."),
      lockedPattern("Remotes & Collaboration", "remotes", "Working with remote repositories and fetch vs pull."),
      lockedPattern("Rewriting History", "rewriting-history", "Interactive rebase, amend, and squashing commits."),
      lockedPattern("Undoing Mistakes", "undoing-things", "Resetting, reverting, and using the reflog."),
      lockedPattern("Detective Work", "detective-work", "Finding bugs with git bisect and git blame."),
      lockedPattern("Pull Requests & Review", "pull-requests", "Collaborating on code with branch protection and CODEOWNERS."),
      lockedPattern("GitHub Actions", "github-actions", "Automating tests and deployments with CI/CD pipelines."),
      lockedPattern("Team Workflows", "workflows", "GitHub Flow, GitFlow, and trunk-based development strategies."),
      lockedPattern("Capstone", "capstone", "Simulate a real-world team project: branching, reviewing, and releasing."),
    ],
  },
  {
    title: "Python",
    slug: "python",
    icon: pythonLogo,
    locked: true,
    overviewPath: "/python",
    blurb: "Master Python from basic syntax to advanced asynchronous programming.",
    patterns: [
      lockedPattern("Python Basics", "basics", "Variables, data types, and control flow."),
      lockedPattern("Data Structures", "data-structures", "Lists, dictionaries, sets, and tuples."),
      lockedPattern("Functions & Modules", "functions", "Defining functions, scope, and importing modules."),
      lockedPattern("Object-Oriented Programming", "oop", "Classes, inheritance, and polymorphism."),
      lockedPattern("Advanced Python", "advanced", "Decorators, generators, and context managers."),
    ],
  },
];

export const CATEGORY_BY_SLUG: Record<string, RoadmapCategory> = Object.fromEntries(
  roadmap.map((c) => [c.slug, c]),
);
