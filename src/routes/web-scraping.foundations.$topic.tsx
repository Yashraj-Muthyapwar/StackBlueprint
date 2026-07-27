import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FOUNDATION_TOPICS } from "@/lessons/web-scraping/foundations-content";

export const Route = createFileRoute("/web-scraping/foundations/$topic")({
  head: ({ params }) => {
    const t = FOUNDATION_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Foundations — Web Scraping" }] };
    return {
      meta: [
        { title: `${t.title} — Web Scraping Foundations` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — Web Scraping Foundations` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
