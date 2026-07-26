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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { FOUNDATION_TOPICS } from "@/lessons/web-scraping/foundations-content";

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
        completedCount: 0,
      },
      {
        slug: "static-scraping",
        title: "Static Scraping with Requests and BeautifulSoup",
        blurb: "Fetch raw HTML and parse it efficiently to extract exactly what you need.",
        icon: Search,
        modules: [
          "Python Requests",
          "BeautifulSoup Selectors",
          "Extracting Text",
          "Finding Attributes",
          "Pagination",
        ],
        unlocked: true,
        routeBase: "foundations",
        completedCount: 0,
      },
    ],
  },
  {
    group: "Advanced Scraping & Automation",
    groupBlurb: "Handle messy data, execute JavaScript to render dynamic pages, and build robust crawling spiders.",
    topics: [
      {
        slug: "cleaning-and-storing",
        title: "Cleaning, Structuring, and Storing Scraped Data",
        blurb: "Transform messy text into structured formats and save it to databases or CSVs.",
        icon: Database,
        modules: ["Regex Parsing", "Data Normalization", "Pandas", "Exporting to CSV/JSON", "SQL Storage"],
        unlocked: true,
        routeBase: "automation",
      },
      {
        slug: "browser-automation",
        title: "Browser Automation with Selenium and Playwright",
        blurb: "Control real web browsers to interact with SPAs, click buttons, and bypass simple anti-bot checks.",
        icon: Settings,
        modules: ["Headless Browsers", "Waiting for Elements", "Clicking & Typing", "Handling Captchas", "Playwright vs Selenium"],
        unlocked: true,
        routeBase: "automation",
      },
      {
        slug: "scrapy-framework",
        title: "The Scrapy Framework",
        blurb: "Build high-performance, asynchronous web crawling spiders that scale.",
        icon: Boxes,
        modules: ["Spiders & Items", "Pipelines", "Middlewares", "Async Fetching", "Scrapy Shell"],
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
        title: "Scraping at Scale: Robustness and Politeness",
        blurb: "Manage rate limits, handle retries, rotate proxies, and respect robots.txt.",
        icon: ShieldAlert,
        modules: ["Proxy Rotation", "User-Agent Spoofing", "robots.txt", "Rate Limiting", "Handling Bans"],
        unlocked: true,
        routeBase: "scale",
      },
      {
        slug: "apis-and-alternatives",
        title: "APIs, Open Datasets, and Alternatives to Scraping",
        blurb: "Why scrape when you don't have to? Finding official APIs and hidden endpoints.",
        icon: Layers,
        modules: ["Network Tab Reverse Engineering", "GraphQL APIs", "REST Endpoints", "Open Data Portals"],
        unlocked: true,
        routeBase: "scale",
      },
      {
        slug: "ai-agents",
        title: "Scaling, Automation, and AI-Driven Browser Agents",
        blurb: "Use LLMs and vision models to navigate pages and extract unstructured data automatically.",
        icon: Bot,
        modules: ["Vision Models", "DOM to Markdown", "LLM Extraction", "Auto-Navigating Agents"],
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
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-mint/10 text-mint ring-1 ring-mint/20 lg:size-20">
            <Globe className="size-8 lg:size-10" />
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
                  
                  const realTopic = FOUNDATION_TOPICS[t.slug as keyof typeof FOUNDATION_TOPICS];
                  const completedCount = realTopic 
                    ? realTopic.lessons.filter(l => isCompleted(l.slug)).length 
                    : (t.completedCount || 0);
                  const totalCount = realTopic ? realTopic.lessons.length : t.modules.length;

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
