import { type LessonContent } from "@/lessons/types";

export type WebScrapingFoundationTopicMeta = {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  iconKey: "globe" | "code" | "server";
  lessons: LessonContent[];
};

const howTheWebWorks: LessonContent = {
  slug: "how-the-web-works",
  title: "How the Web Works",
  subtitle: "Understanding clients, servers, and the request-response cycle.",
  sections: [],
};

const httpMethods: LessonContent = {
  slug: "http-methods-and-status-codes",
  title: "HTTP Methods & Status Codes",
  subtitle: "GET vs POST, and what 200, 404, and 500 actually mean.",
  sections: [],
};

const headersCookies: LessonContent = {
  slug: "headers-and-cookies",
  title: "Headers & Cookies",
  subtitle: "How state is maintained and how to mimic a real browser.",
  sections: [],
};

const theDom: LessonContent = {
  slug: "the-dom",
  title: "The Document Object Model (DOM)",
  subtitle: "How HTML becomes a tree structure that you can query.",
  sections: [],
};

const devTools: LessonContent = {
  slug: "developer-tools",
  title: "Developer Tools (Inspecting Elements)",
  subtitle: "How to reverse-engineer a website using the Elements and Network tabs.",
  sections: [],
};

const dynamicContent: LessonContent = {
  slug: "dynamic-vs-static-content",
  title: "Client-Side vs Server-Side Rendering",
  subtitle: "Why the DOM you see in DevTools doesn't always match the HTML you scrape.",
  sections: [],
};

// ==========================================
// CHAPTER 2: Static Scraping
// ==========================================
const firstRequest: LessonContent = { slug: "your-first-request", title: "Your First Request", subtitle: "fetching HTML and reading a response object", sections: [] };
const parsingSoup: LessonContent = { slug: "parsing-html-beautifulsoup", title: "Parsing HTML with BeautifulSoup", subtitle: "soup objects, tags, and navigation", sections: [] };
const cssSelectors: LessonContent = { slug: "css-selectors", title: "CSS Selectors in Practice", subtitle: "select, select_one, and choosing stable selectors", sections: [] };
const xpathLxml: LessonContent = { slug: "xpath-and-lxml", title: "XPath and lxml", subtitle: "when CSS runs out and why Scrapy will need this", sections: [] };
const extractingAttributes: LessonContent = { slug: "extracting-text-attributes", title: "Extracting Text and Attributes", subtitle: "strings, hrefs, data attributes, and whitespace", sections: [] };
const pagination: LessonContent = { slug: "following-pagination", title: "Following Pagination", subtitle: "URL patterns, next links, and knowing when to stop", sections: [] };

// ==========================================
// CHAPTER 3: Cleaning & Storing
// ==========================================
const definingSchema: LessonContent = { slug: "defining-your-schema", title: "Defining Your Schema First", subtitle: "deciding output shape before you write the parser", sections: [] };
const regexExtraction: LessonContent = { slug: "regex-for-extraction", title: "Regex for Extraction", subtitle: "pulling prices, dates, and IDs out of messy text", sections: [] };
const normalizingData: LessonContent = { slug: "normalizing-data", title: "Normalizing Data", subtitle: "types, encodings, currencies, timestamps, and null handling", sections: [] };
const pandasScraping: LessonContent = { slug: "pandas-for-scraped-data", title: "Pandas for Scraped Data", subtitle: "dataframes, deduplication, and quick validation", sections: [] };
const exportingFormats: LessonContent = { slug: "exporting-csv-json", title: "Exporting to CSV, JSON, and JSONL", subtitle: "choosing a format and why JSONL wins at scale", sections: [] };
const storingSql: LessonContent = { slug: "storing-sqlite-postgres", title: "Storing in SQLite and Postgres", subtitle: "upserts, primary keys, and idempotent writes", sections: [] };

export const FOUNDATION_TOPICS: Record<string, WebScrapingFoundationTopicMeta> = {
  "http-foundations": {
    slug: "http-foundations",
    title: "HTTP Foundations",
    category: "Foundations & Basics",
    blurb: "Master the DOM, HTTP requests, status codes, headers, and cookies.",
    iconKey: "globe",
    lessons: [howTheWebWorks, httpMethods, headersCookies, theDom, devTools, dynamicContent],
  },
  "static-scraping": {
    slug: "static-scraping",
    title: "Static Scraping with Requests and BeautifulSoup",
    category: "Foundations & Basics",
    blurb: "Fetch raw HTML and parse it efficiently to extract exactly what you need.",
    iconKey: "code",
    lessons: [firstRequest, parsingSoup, cssSelectors, xpathLxml, extractingAttributes, pagination],
  },
  "cleaning-and-storing": {
    slug: "cleaning-and-storing",
    title: "Cleaning, Structuring, and Storing",
    category: "Foundations & Basics",
    blurb: "Transform messy text into structured formats and save it to databases or CSVs.",
    iconKey: "server",
    lessons: [definingSchema, regexExtraction, normalizingData, pandasScraping, exportingFormats, storingSql],
  },
};
