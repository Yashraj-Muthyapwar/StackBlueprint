import { type LessonContent } from "@/lessons/types";
import { type WebScrapingFoundationTopicMeta } from "./foundations-content";

// ==========================================
// CHAPTER 9: Robustness and Politeness
// ==========================================
const readingRobots: LessonContent = { slug: "reading-robots-txt", title: "Reading robots.txt Properly", subtitle: "parsing, crawl-delay, and what it does and does not mean", sections: [] };
const rateLimiting: LessonContent = { slug: "rate-limiting-throttling", title: "Rate Limiting and Throttling", subtitle: "fixed delays, adaptive throttling, and concurrency caps", sections: [] };
const retryStrategy: LessonContent = { slug: "retry-strategy", title: "Retry Strategy", subtitle: "exponential backoff, jitter, and which status codes to retry", sections: [] };
const handlingBans: LessonContent = { slug: "handling-bans", title: "Handling Bans and Blocks", subtitle: "reading 403s and 429s, and backing off gracefully", sections: [] };
const proxyRotation: LessonContent = { slug: "proxy-rotation", title: "Proxy Rotation", subtitle: "residential vs datacenter, rotation logic, and cost tradeoffs", sections: [] };
const failingLoudly: LessonContent = { slug: "failing-loudly", title: "Failing Loudly", subtitle: "dead-letter queues and never silently dropping records", sections: [] };

// ==========================================
// CHAPTER 10: Anti-Bot Systems
// ==========================================
const howDetectionWorks: LessonContent = { slug: "how-detection-works", title: "How Detection Works", subtitle: "TLS fingerprints, header order, and behavioral signals", sections: [] };
const browserFingerprinting: LessonContent = { slug: "browser-fingerprinting", title: "Browser Fingerprinting", subtitle: "canvas, WebGL, and why headless leaks", sections: [] };
const detectingCaptchas: LessonContent = { slug: "detecting-captchas", title: "Detecting Captchas and Walls", subtitle: "recognizing the signal and responding correctly", sections: [] };
const knowingWhenToStop: LessonContent = { slug: "knowing-when-to-stop", title: "Knowing When to Stop", subtitle: "escalation as a red flag, not a challenge", sections: [] };

// ==========================================
// CHAPTER 11: The Legal and Ethical Line
// ==========================================
const publicVsProtected: LessonContent = { slug: "public-vs-protected-data", title: "Public Data vs Protected Data", subtitle: "the actual distinction courts care about", sections: [] };
const tosAndCfaa: LessonContent = { slug: "tos-cfaa-hiq", title: "Terms of Service, CFAA, and hiQ v LinkedIn", subtitle: "understanding legal precedent", sections: [] };
const personalData: LessonContent = { slug: "personal-data-gdpr", title: "Personal Data, GDPR, and CCPA", subtitle: "PII in scraped datasets", sections: [] };
const copyrightDatabase: LessonContent = { slug: "copyright-database-rights", title: "Copyright and Database Rights", subtitle: "facts vs expression, and what you can republish", sections: [] };

// ==========================================
// CHAPTER 12: Scrapers in Production
// ==========================================
const incrementalScraping: LessonContent = { slug: "incremental-scraping", title: "Incremental Scraping", subtitle: "change detection, ETags, and last-modified", sections: [] };
const deduplication: LessonContent = { slug: "deduplication-scale", title: "Deduplication at Scale", subtitle: "URL normalization, hashing, and bloom filters", sections: [] };
const scheduling: LessonContent = { slug: "scheduling", title: "Scheduling", subtitle: "cron, GitHub Actions, and Airflow for dependency-aware runs", sections: [] };
const containerizing: LessonContent = { slug: "containerizing-scraper", title: "Containerizing a Scraper", subtitle: "Docker images with browser dependencies", sections: [] };
const monitoringAlerting: LessonContent = { slug: "monitoring-alerting", title: "Monitoring and Alerting", subtitle: "success rates, volume anomalies, and silent failures", sections: [] };
const handlingSchemaDrift: LessonContent = { slug: "handling-schema-drift", title: "Handling Schema Drift", subtitle: "detecting when the site changed before your data rots", sections: [] };

// ==========================================
// CHAPTER 13: AI-Driven Extraction
// ==========================================
const llmExtraction: LessonContent = { slug: "llm-extraction", title: "LLM Extraction from HTML", subtitle: "structured output, JSON schemas, and validation", sections: [] };
const domToMarkdown: LessonContent = { slug: "dom-to-markdown", title: "DOM to Markdown", subtitle: "preprocessing pages to cut token cost by 90 percent", sections: [] };
const visionModels: LessonContent = { slug: "vision-models", title: "Vision Models for Layout", subtitle: "when screenshots beat HTML", sections: [] };
const autoNavigating: LessonContent = { slug: "auto-navigating-agents", title: "Auto-Navigating Agents", subtitle: "goal-driven browsing and where it breaks", sections: [] };
const costLatency: LessonContent = { slug: "cost-latency-determinism", title: "Cost, Latency, and Determinism", subtitle: "why LLM extraction is a fallback, not a default", sections: [] };

// ==========================================
// CHAPTER 14: Capstone
// ==========================================
const choosingTarget: LessonContent = { slug: "choosing-target", title: "Choosing a Target and Scoping the Dataset", subtitle: "", sections: [] };
const buildingPipeline: LessonContent = { slug: "building-pipeline", title: "Building the Pipeline", subtitle: "discovery, fetch, parse, validate, store", sections: [] };
const deployingScheduling: LessonContent = { slug: "deploying-scheduling", title: "Deploying and Scheduling It", subtitle: "", sections: [] };
const publishingDataset: LessonContent = { slug: "publishing-dataset", title: "Publishing the Dataset and Writing It Up", subtitle: "", sections: [] };

export const SCALE_TOPICS: Record<string, WebScrapingFoundationTopicMeta> = {
  "scale-and-politeness": {
    slug: "scale-and-politeness",
    title: "Robustness and Politeness",
    category: "Scale, Ethics & AI",
    blurb: "Manage rate limits, handle retries, rotate proxies, and respect robots.txt.",
    iconKey: "server",
    lessons: [readingRobots, rateLimiting, retryStrategy, handlingBans, proxyRotation, failingLoudly],
  },
  "anti-bot-systems": {
    slug: "anti-bot-systems",
    title: "Anti-Bot Systems and What They Detect",
    category: "Scale, Ethics & AI",
    blurb: "Understand how websites fingerprint you and when you've triggered an escalation.",
    iconKey: "globe",
    lessons: [howDetectionWorks, browserFingerprinting, detectingCaptchas, knowingWhenToStop],
  },
  "legal-and-ethical": {
    slug: "legal-and-ethical",
    title: "The Legal and Ethical Line",
    category: "Scale, Ethics & AI",
    blurb: "Public data vs protected data, ToS, and scraping personal information.",
    iconKey: "globe",
    lessons: [publicVsProtected, tosAndCfaa, personalData, copyrightDatabase],
  },
  "scrapers-in-production": {
    slug: "scrapers-in-production",
    title: "Running Scrapers in Production",
    category: "Scale, Ethics & AI",
    blurb: "Incremental scraping, deduplication, alerting, and containerizing your pipelines.",
    iconKey: "code",
    lessons: [incrementalScraping, deduplication, scheduling, containerizing, monitoringAlerting, handlingSchemaDrift],
  },
  "ai-agents": {
    slug: "ai-agents",
    title: "AI-Driven Extraction and Browser Agents",
    category: "Scale, Ethics & AI",
    blurb: "Use LLMs and vision models to navigate pages and extract unstructured data automatically.",
    iconKey: "globe",
    lessons: [llmExtraction, domToMarkdown, visionModels, autoNavigating, costLatency],
  },
  "capstone": {
    slug: "capstone",
    title: "Capstone",
    category: "Scale, Ethics & AI",
    blurb: "Build an end-to-end scalable pipeline, from target discovery to publishing.",
    iconKey: "server",
    lessons: [choosingTarget, buildingPipeline, deployingScheduling, publishingDataset],
  },
};
