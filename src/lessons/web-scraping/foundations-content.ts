import { type LessonContent } from "@/lessons/types";
import howWebWorksImg from "@/images/web-scraping/foundations/how-web-works.png";

export type WebScrapingFoundationTopicMeta = {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  iconKey: string;
  lessons: LessonContent[];
};

const howTheWebWorks: LessonContent = {
  slug: "how-the-web-works",
  title: "How the Web Works",
  subtitle: "How a URL becomes a response and where your scraper fits in.",
  sections: [
    {
      kind: "prose",
      body: [
        "Before we extract data from websites, we need one reliable mental model: a browser does not visit a page like a person visits a room. It sends a request to a service, receives a response, and turns that response into something you can see and use.",
        "That same request-response cycle powers every scraper in this course. The difference is that, instead of asking a browser to do the work for us, we will often make the request directly in Python and keep only the data we need."
      ]
    },
    {
      kind: "analogy",
      title: "The Restaurant Analogy",
      text: "Think of a website as a restaurant. You are the client. You choose an item from the menu and give the waiter a precise order: that is the request. The kitchen is the server: it receives the order, prepares the result, and sends it back as the response. A scraper is a program that places those orders automatically and records the useful parts of what comes back. The important detail: the kitchen can only respond to the information in the order it receives."
    },
    {
      kind: "prose",
      heading: "Clients, Servers, and HTTP",
      body: [
        "Your browser is a client. A web service is a server. When you enter a URL, the client sends an HTTP request to the server and the server returns an HTTP response. The request describes what you want; the response contains a status code, headers, and usually a body.",
        "For example, requesting a page with GET might return 200 OK and an HTML document. A missing page might return 404. A server asking you to slow down might return 429. We will work with those responses throughout this track."
      ]
    },
    {
      kind: "image",
      src: howWebWorksImg,
      alt: "The request-response cycle behind a page load.",
      caption: "The request-response cycle behind a page load.",
    },
    {
      kind: "prose",
      heading: "What happens before the request",
      body: [
        "The HTTP request is the visible part of a longer trip. First, DNS translates a human-friendly hostname such as example.com into an IP address. Next, your computer opens a network connection to that address. For HTTPS sites, it then performs a TLS handshake to encrypt the connection and verify the server certificate.",
        "Only after those steps can HTTP begin. This is why a slow request is not always a slow website: the delay may come from name lookup, network distance, encryption setup, server work, or downloading the response."
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "A browser page is usually many requests",
      body: "The first HTML response is often a starting point, not the entire page. A browser may then fetch CSS, JavaScript, images, fonts, and JSON data from APIs. requests.get(url) makes one request; it does not automatically run JavaScript or fetch everything the browser discovers afterward."
    },
    {
      kind: "prose",
      heading: "The Anatomy of a URL",
      body: [
        "A URL is not just an address; it is a set of instructions. It usually consists of a **scheme** (like `https://`), a **host** (`en.wikipedia.org`), a **path** (`/w/index.php`), and sometimes a **query** string (`?title=Web_scraping`).",
        "It can also include a **fragment** (`#Legal_issues`) at the very end. The fragment is used by the browser to scroll to a specific part of the page or manage state, but here is the crucial detail for scraping: the fragment is never sent to the server. If a page loads different data based on the fragment, it is happening entirely in the browser via JavaScript."
      ]
    },
    {
      kind: "code",
      language: "python",
      caption: "Deconstructing a URL",
      code: `from urllib.parse import urlparse, parse_qs

url = "https://en.wikipedia.org/w/index.php?title=Web_scraping&oldid=1173934305#Legal_issues"
parsed = urlparse(url)

print(parsed.scheme)   # https
print(parsed.netloc)   # en.wikipedia.org
print(parsed.path)     # /w/index.php
print(parsed.query)    # title=Web_scraping&oldid=1173934305
print(parsed.fragment) # Legal_issues

print(parse_qs(parsed.query))
# {'title': ['Web_scraping'], 'oldid': ['1173934305']}`
    },
    {
      kind: "prose",
      heading: "Where scraping fits in",
      body: [
        "For a static site, the useful data may already be in the HTML response. In that case, a normal HTTP client such as requests is fast, simple, and usually the right tool. Your code requests the HTML, parses it, and extracts the fields you care about.",
        "For a JavaScript-heavy site, the initial HTML can be mostly an empty shell. The browser may request the actual data from a JSON API after the page loads. Later in this course, you will learn how to find and reproduce that API request and when browser automation with Playwright is the better choice."
      ]
    },
    {
      kind: "code",
      language: "python",
      caption: "Make one HTTP request and inspect the response",
      code: `import requests

url = "https://en.wikipedia.org/wiki/Web_scraping"

# Act as the client. timeout keeps a broken connection from waiting forever.
response = requests.get(url, timeout=10)

# Stop early if the server returned an error such as 404 or 500.
response.raise_for_status()

print(response.status_code)                 # 200
print(response.headers.get("content-type")) # text/html; charset=UTF-8
print(response.text[:100])                  # <!DOCTYPE html>\\n<html class="client-nojs"...`
    },
    {
      kind: "prose",
      heading: "One request, not a disguised browser",
      body: [
        "A scraper is not invisible just because it uses Python. Websites can examine the request's headers, cookies, IP reputation, timing, and TLS fingerprint. They can often distinguish a browser from a script, and they may enforce rate limits or access rules accordingly.",
        "Our goal is not to imitate every part of a browser by default. It is to make the smallest, clearest request that returns data we are allowed to collect and then handle the result responsibly."
      ]
    },
    {
      kind: "callout",
      tone: "info",
      title: "Scraping vs APIs",
      body: "Wikipedia offers an API, and in a real project you would prefer it over scraping HTML. We are scraping the HTML here because the mechanics are what we are learning."
    },
    {
      kind: "prose",
      heading: "Try it",
      body: [
        "Run the example against a simple site. Look at the status code, content type, and first few characters of the response. Then open the same URL in your browser, open DevTools -> Network, and reload the page.",
        "Notice the difference: your script made one request, while the browser likely made several. In later lessons, that Network panel will help you find exactly where a site gets its data."
      ]
    },
    {
      kind: "takeaways",
      items: [
        "The web uses a client-server model: clients send requests and servers return responses.",
        "Before HTTP begins, DNS, a network connection, and usually TLS must succeed.",
        "An HTTP response includes a status code, headers, and a body such as HTML or JSON.",
        "One browser page load can involve many requests; one requests.get call makes only one.",
        "Start with the simplest allowed request that gives you the data you need."
      ]
    }
  ]
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
    iconKey: "search",
    lessons: [firstRequest, parsingSoup, cssSelectors, xpathLxml, extractingAttributes, pagination],
  },
  "cleaning-and-storing": {
    slug: "cleaning-and-storing",
    title: "Cleaning, Structuring, and Storing",
    category: "Foundations & Basics",
    blurb: "Transform messy text into structured formats and save it to databases or CSVs.",
    iconKey: "database",
    lessons: [definingSchema, regexExtraction, normalizingData, pandasScraping, exportingFormats, storingSql],
  },
};
