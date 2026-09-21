import { type LessonContent } from "@/lessons/types";
import { type WebScrapingFoundationTopicMeta } from "./foundations-content";

// ==========================================
// CHAPTER 4: Finding the Hidden API
// ==========================================
const checkApiFirst: LessonContent = {
  slug: "check-api-first",
  title: "Check for an API First",
  subtitle: "official APIs, docs, and open data portals",
  sections: [],
};
const reverseNetwork: LessonContent = {
  slug: "reverse-engineering-network",
  title: "Reverse-Engineering the Network Tab",
  subtitle: "spotting the XHR call behind the page",
  sections: [],
};
const replayPython: LessonContent = {
  slug: "replaying-requests-python",
  title: "Replaying Requests in Python",
  subtitle: "copy as cURL, headers, and required tokens",
  sections: [],
};
const graphqlRest: LessonContent = {
  slug: "graphql-and-rest",
  title: "GraphQL and REST Endpoints",
  subtitle: "reading payloads and crafting your own queries",
  sections: [],
};
const sitemapsFeeds: LessonContent = {
  slug: "sitemaps-and-feeds",
  title: "Sitemaps and Feeds",
  subtitle: "robots.txt, sitemap.xml, and RSS as free URL discovery",
  sections: [],
};

// ==========================================
// CHAPTER 5: Browser Automation
// ==========================================
const whenToUseBrowser: LessonContent = {
  slug: "when-you-need-browser",
  title: "When You Actually Need a Browser",
  subtitle: "the cost of headless and cheaper alternatives",
  sections: [],
};
const playwrightBasics: LessonContent = {
  slug: "playwright-basics",
  title: "Playwright Basics",
  subtitle: "launching, navigating, and grabbing rendered HTML",
  sections: [],
};
const waitingCorrectly: LessonContent = {
  slug: "waiting-correctly",
  title: "Waiting Correctly",
  subtitle: "auto-wait, network idle, and why sleep() is a bug",
  sections: [],
};
const interactingPages: LessonContent = {
  slug: "interacting-with-pages",
  title: "Interacting with Pages",
  subtitle: "clicks, typing, dropdowns, scrolling, and infinite scroll",
  sections: [],
};
const interceptingNetwork: LessonContent = {
  slug: "intercepting-network-traffic",
  title: "Intercepting Network Traffic",
  subtitle: "capturing API responses instead of scraping the DOM",
  sections: [],
};
const playwrightVsSelenium: LessonContent = {
  slug: "playwright-vs-selenium",
  title: "Playwright vs Selenium",
  subtitle: "architecture differences and when Selenium still wins",
  sections: [],
};

// ==========================================
// CHAPTER 6: Authenticated Scraping
// ==========================================
const sessionObjects: LessonContent = {
  slug: "session-objects",
  title: "Session Objects and Cookie Persistence",
  subtitle: "keeping sessions alive across requests",
  sections: [],
};
const formLogins: LessonContent = {
  slug: "form-logins-csrf",
  title: "Form Logins and CSRF Tokens",
  subtitle: "handling forms and security tokens",
  sections: [],
};
const tokenAuth: LessonContent = {
  slug: "token-based-auth",
  title: "Token-Based Auth",
  subtitle: "bearer tokens, refresh flows, and expiry handling",
  sections: [],
};
const reuseBrowserState: LessonContent = {
  slug: "reusing-browser-auth",
  title: "Reusing Browser Auth State",
  subtitle: "exporting cookies from Playwright into Requests",
  sections: [],
};
const whatNotToLogin: LessonContent = {
  slug: "what-not-to-login",
  title: "What You Should Not Log Into",
  subtitle: "ToS, account bans, and the personal-data line",
  sections: [],
};

// ==========================================
// CHAPTER 7: Concurrency & Async
// ==========================================
const whySequentialSlow: LessonContent = {
  slug: "why-sequential-is-slow",
  title: "Why Sequential Scraping Is Slow",
  subtitle: "latency vs throughput",
  sections: [],
};
const threadsProcesses: LessonContent = {
  slug: "threads-and-processes",
  title: "Threads and Processes",
  subtitle: "concurrent.futures for I/O-bound work",
  sections: [],
};
const asyncioHttpx: LessonContent = {
  slug: "asyncio-and-httpx",
  title: "Asyncio and httpx",
  subtitle: "event loops, coroutines, and gather",
  sections: [],
};
const controlConcurrency: LessonContent = {
  slug: "controlling-concurrency",
  title: "Controlling Concurrency",
  subtitle: "semaphores, connection pools, and polite parallelism",
  sections: [],
};
const retriesTimeouts: LessonContent = {
  slug: "retries-and-timeouts",
  title: "Retries and Timeouts in Async Code",
  subtitle: "tenacity, backoff, and partial failure",
  sections: [],
};

// ==========================================
// CHAPTER 8: Scrapy Framework
// ==========================================
const whyScrapy: LessonContent = {
  slug: "why-a-framework",
  title: "Why a Framework",
  subtitle: "what Scrapy gives you that a script does not",
  sections: [],
};
const spidersRequests: LessonContent = {
  slug: "spiders-and-requests",
  title: "Spiders and Requests",
  subtitle: "start_urls, parse callbacks, and the scheduler",
  sections: [],
};
const itemsPipelines: LessonContent = {
  slug: "items-and-pipelines",
  title: "Items, ItemLoaders, and Pipelines",
  subtitle: "validation and storage as a first-class stage",
  sections: [],
};
const middlewares: LessonContent = {
  slug: "middlewares",
  title: "Middlewares",
  subtitle: "injecting retries, proxies, and headers globally",
  sections: [],
};
const scrapyShell: LessonContent = {
  slug: "scrapy-shell",
  title: "The Scrapy Shell",
  subtitle: "interactive selector debugging",
  sections: [],
};
const scrapyPlaywright: LessonContent = {
  slug: "scrapy-with-playwright",
  title: "Scrapy with Playwright",
  subtitle: "rendering JS inside a Scrapy pipeline",
  sections: [],
};

export const AUTOMATION_TOPICS: Record<string, WebScrapingFoundationTopicMeta> = {
  "hidden-api": {
    slug: "hidden-api",
    title: "Finding the Hidden API",
    category: "Advanced Scraping",
    blurb: "Skip HTML entirely by discovering the JSON APIs that power the frontend.",
    iconKey: "compass",
    lessons: [checkApiFirst, reverseNetwork, replayPython, graphqlRest, sitemapsFeeds],
  },
  "browser-automation": {
    slug: "browser-automation",
    title: "Browser Automation with Playwright and Selenium",
    category: "Advanced Scraping",
    blurb:
      "Control real web browsers to interact with SPAs, click buttons, and bypass simple anti-bot checks.",
    iconKey: "settings",
    lessons: [
      whenToUseBrowser,
      playwrightBasics,
      waitingCorrectly,
      interactingPages,
      interceptingNetwork,
      playwrightVsSelenium,
    ],
  },
  "authenticated-scraping": {
    slug: "authenticated-scraping",
    title: "Sessions, Logins, and Authenticated Scraping",
    category: "Advanced Scraping",
    blurb: "Handle cookies, tokens, CSRF, and state to scrape behind login walls safely.",
    iconKey: "lockKeyhole",
    lessons: [sessionObjects, formLogins, tokenAuth, reuseBrowserState, whatNotToLogin],
  },
  "async-fetching": {
    slug: "async-fetching",
    title: "Concurrency and Async Fetching",
    category: "Advanced Scraping",
    blurb: "Speed up your scrapers 100x using threads, asyncio, and semaphores.",
    iconKey: "repeat",
    lessons: [
      whySequentialSlow,
      threadsProcesses,
      asyncioHttpx,
      controlConcurrency,
      retriesTimeouts,
    ],
  },
  "scrapy-framework": {
    slug: "scrapy-framework",
    title: "The Scrapy Framework",
    category: "Advanced Scraping",
    blurb: "Build high-performance, asynchronous web crawling spiders that scale.",
    iconKey: "boxes",
    lessons: [
      whyScrapy,
      spidersRequests,
      itemsPipelines,
      middlewares,
      scrapyShell,
      scrapyPlaywright,
    ],
  },
};
