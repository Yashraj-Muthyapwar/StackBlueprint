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

export const FOUNDATION_TOPICS: Record<string, WebScrapingFoundationTopicMeta> = {
  "http-foundations": {
    slug: "http-foundations",
    title: "HTTP Foundations",
    category: "Foundations & Basics",
    blurb: "Master the DOM, HTTP requests, status codes, headers, and cookies.",
    iconKey: "globe",
    lessons: [howTheWebWorks, httpMethods, headersCookies, theDom, devTools, dynamicContent],
  },
};
