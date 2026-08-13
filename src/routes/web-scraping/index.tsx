import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Globe,
  Database,
  ShieldAlert,
  Search,
  Settings,
  LockKeyhole,
  Bot,
  Layers,
  Repeat,
  Server,
  Activity,
  Compass,
  FileCode,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { FOUNDATION_TOPICS } from "@/lessons/web-scraping/foundations-content";
import { AUTOMATION_TOPICS } from "@/lessons/web-scraping/automation-content";
import { SCALE_TOPICS } from "@/lessons/web-scraping/scale-content";
import webScraperLogo from "@/images/logos/web-scraper-logo.png";

export const Route = createFileRoute("/web-scraping/")({
  head: () => ({
    meta: [
      { title: "Web Scraping — StackBlueprint" },
      {
        name: "description",
        content:
          "From HTTP foundations to AI-driven browser agents.",
      },
      { property: "og:title", content: "Web Scraping — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Interactive, animated Web Scraping roadmap: HTTP, BeautifulSoup, Selenium, Scrapy, and AI agents.",
      },
    ],
  }),
  component: WebScrapingIndex,
});

type Topic = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  unlocked?: boolean;
  routeBase?: "foundations" | "automation" | "scale";
  to?: string;
  completedCount?: number;
};

type Section = {
  group: string;
  groupBlurb: string;
  topics: Topic[];
};

const sections: Section[] = [
  {
    group: "Foundations & Basics",
    groupBlurb:
      "Understand the underlying protocols of the web, and learn how to extract data from static HTML pages.",
    topics: [
      {
        slug: "http-foundations",
        title: "Web & HTTP Foundations for Scraping",
        blurb: "Master the DOM, HTTP requests, status codes, headers, and cookies.",
        icon: Globe,
        modules: [
          "Web & Clients",
          "HTTP Methods",
          "Headers & Cookies",
          "The DOM Tree",
          "DevTools",
          "CSR vs SSR",
        ],
        unlocked: true,
        routeBase: "foundations",
      },
      {
        slug: "static-scraping",
        title: "Static Scraping with Requests and BeautifulSoup",
        blurb: "Fetch raw HTML and parse it efficiently to extract exactly what you need.",
        icon: Search,
        modules: [
          "First Request",
          "Parsing HTML",
          "CSS Selectors",
          "XPath and lxml",
          "Extracting Attributes",
          "Pagination",
        ],
        unlocked: true,
        routeBase: "foundations",
      },
      {
        slug: "cleaning-and-storing",
        title: "Cleaning, Structuring, and Storing",
        blurb: "Transform messy text into structured formats and save it to databases or CSVs.",
        icon: Database,
        modules: [
          "Defining Schema",
          "Regex Extraction",
          "Normalizing Data",
          "Pandas",
          "Exporting (JSONL)",
          "SQLite/Postgres",
        ],
        unlocked: true,
        routeBase: "foundations",
      },
    ],
  },
  {
    group: "Advanced Scraping & Automation",
    groupBlurb: "Handle messy data, execute JavaScript to render dynamic pages, and build robust crawling spiders.",
    topics: [
      {
        slug: "hidden-api",
        title: "Finding the Hidden API",
        blurb: "Skip HTML entirely by discovering the JSON APIs that power the frontend.",
        icon: Compass,
        modules: ["Docs & Portals", "Network Tab", "Replaying Requests", "GraphQL & REST", "Sitemaps/Feeds"],
        unlocked: true,
        routeBase: "automation",
      },
      {
        slug: "browser-automation",
        title: "Browser Automation with Playwright and Selenium",
        blurb: "Control real web browsers to interact with SPAs, click buttons, and bypass simple anti-bot checks.",
        icon: Settings,
        modules: ["When to Use", "Playwright Basics", "Waiting Correctly", "Interacting", "Intercepting Network", "Vs Selenium"],
        unlocked: true,
        routeBase: "automation",
      },
      {
        slug: "authenticated-scraping",
        title: "Sessions, Logins, and Authenticated Scraping",
        blurb: "Handle cookies, tokens, CSRF, and state to scrape behind login walls safely.",
        icon: LockKeyhole,
        modules: ["Session Objects", "Form Logins", "Token Auth", "Reusing Auth State", "What Not To Login"],
        unlocked: true,
        routeBase: "automation",
      },
      {
        slug: "async-fetching",
        title: "Concurrency and Async Fetching",
        blurb: "Speed up your scrapers 100x using threads, asyncio, and semaphores.",
        icon: Repeat,
        modules: ["Latency vs Throughput", "Threads/Processes", "Asyncio/httpx", "Concurrency Caps", "Retries/Timeouts"],
        unlocked: true,
        routeBase: "automation",
      },
      {
        slug: "scrapy-framework",
        title: "The Scrapy Framework",
        blurb: "Build high-performance, asynchronous web crawling spiders that scale.",
        icon: Boxes,
        modules: ["Why Scrapy", "Spiders/Requests", "Items/Pipelines", "Middlewares", "Scrapy Shell", "With Playwright"],
        unlocked: true,
        routeBase: "automation",
      },
    ],
  },
  {
    group: "Scale, Ethics & AI",
    groupBlurb: "Scrape responsibly, avoid getting banned, and utilize next-generation AI agents for unstructured data.",
    topics: [
      {
        slug: "scale-and-politeness",
        title: "Robustness and Politeness",
        blurb: "Manage rate limits, handle retries, rotate proxies, and respect robots.txt.",
        icon: Server,
        modules: ["robots.txt", "Rate Limiting", "Retry Strategy", "Handling Bans", "Proxy Rotation", "Failing Loudly"],
        unlocked: true,
        routeBase: "scale",
      },
      {
        slug: "anti-bot-systems",
        title: "Anti-Bot Systems and What They Detect",
        blurb: "Understand how websites fingerprint you and when you've triggered an escalation.",
        icon: ShieldAlert,
        modules: ["How Detection Works", "Fingerprinting", "Captchas/Walls", "When to Stop"],
        unlocked: true,
        routeBase: "scale",
      },
      {
        slug: "legal-and-ethical",
        title: "The Legal and Ethical Line",
        blurb: "Public data vs protected data, ToS, and scraping personal information.",
        icon: Activity,
        modules: ["Public vs Protected", "ToS & CFAA", "Personal Data/GDPR", "Copyright/Database"],
        unlocked: true,
        routeBase: "scale",
      },
      {
        slug: "scrapers-in-production",
        title: "Running Scrapers in Production",
        blurb: "Incremental scraping, deduplication, alerting, and containerizing your pipelines.",
        icon: Terminal,
        modules: ["Incremental Scrapes", "Deduplication", "Scheduling (Airflow)", "Containerizing", "Alerting", "Schema Drift"],
        unlocked: true,
        routeBase: "scale",
      },
      {
        slug: "ai-agents",
        title: "AI-Driven Extraction and Browser Agents",
        blurb: "Use LLMs and vision models to navigate pages and extract unstructured data automatically.",
        icon: Bot,
        modules: ["LLM Extraction", "DOM to Markdown", "Vision Models", "Auto-Navigating Agents", "Cost/Latency"],
        unlocked: true,
        routeBase: "scale",
      },
      {
        slug: "capstone",
        title: "Capstone",
        blurb: "Build an end-to-end scalable pipeline, from target discovery to publishing.",
        icon: FileCode,
        modules: ["Choosing Target", "Building Pipeline", "Deploying", "Publishing Dataset"],
        unlocked: true,
        routeBase: "scale",
      },
    ],
  },
];

function WebScrapingIndex() {
  const { isCompleted } = useProgress();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img src={webScraperLogo} alt="Web Scraping Logo" className="size-16 object-contain drop-shadow-sm lg:size-20" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Web Scraping
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Extracting data from the web using HTML parsing, headless browsers, scalable crawlers, and AI agents.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-24">
          {sections.map((sec, i) => (
            <div key={sec.group} className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
              <div className="mb-8 w-full shrink-0 lg:sticky lg:top-24 lg:mb-0 lg:w-64 xl:w-72">
                <div className="flex items-center gap-3">
                  <div className="grid size-6 place-items-center rounded-full bg-border text-xs font-bold text-foreground">
                    {i + 1}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {sec.group}
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {sec.groupBlurb}
                </p>
              </div>

              <div className="flex w-full flex-col gap-4">
                {sec.topics.map((t) => {
                  const Icon = t.icon;
                  const isLocked = !t.unlocked;
                  
                  const getTopicLessons = (t: Topic) => {
                    const f = FOUNDATION_TOPICS[t.slug as keyof typeof FOUNDATION_TOPICS];
                    if (f) return f.lessons;
                    const a = AUTOMATION_TOPICS[t.slug as keyof typeof AUTOMATION_TOPICS];
                    if (a) return a.lessons;
                    const s = SCALE_TOPICS[t.slug as keyof typeof SCALE_TOPICS];
                    if (s) return s.lessons;
                    return null;
                  };

                  const realTopicLessons = getTopicLessons(t);
                  const completedCount = realTopicLessons 
                    ? realTopicLessons.filter(l => isCompleted(l.slug)).length 
                    : (t.completedCount || 0);
                  const totalCount = realTopicLessons ? realTopicLessons.length : t.modules.length;

                  const card = (
                    <div
                      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border border-hairline transition-all duration-300 sm:flex-row ${
                        isLocked
                          ? "bg-card/20 opacity-80 grayscale"
                          : "bg-card hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-background/20"
                      }`}
                    >
                      <div className="flex shrink-0 items-center justify-center border-b border-hairline bg-background/50 p-6 sm:w-40 sm:border-b-0 sm:border-r">
                        <Icon
                          className={`size-10 ${isLocked ? "text-muted-foreground" : "text-mint"}`}
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            {t.title}
                          </h3>
                          {isLocked && <LockKeyhole className="size-5 text-muted-foreground" />}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {t.blurb}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2 pr-12">
                          {t.modules.map((m) => (
                            <span
                              key={m}
                              className="rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-hairline"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                        
                        {!isLocked && (
                          <div className="mt-6 flex items-center gap-2">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
                              <div 
                                className="h-full bg-mint transition-all duration-500 ease-out" 
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {completedCount}/{totalCount} lessons complete
                            </span>
                          </div>
                        )}
                      </div>

                      {!isLocked && (
                        <div className="absolute bottom-6 right-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:hidden">
                          <div className="grid size-8 place-items-center rounded-full bg-mint/10 text-mint">
                            <ArrowRight className="size-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  );

                  if (isLocked) {
                    return <div key={t.slug}>{card}</div>;
                  }

                  const toPath = t.to || `/web-scraping/${t.routeBase}/${t.slug}`;
                  return (
                    <Link key={t.slug} to={toPath} className="block w-full outline-none">
                      {card}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
