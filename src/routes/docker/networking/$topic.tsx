import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/docker/networking/$topic")({
  head: ({ params }) => {
    const cat = CATEGORY_BY_SLUG["docker"];
    const t = cat?.patterns.find((p) => p.slug === params.topic) || cat?.sections?.flatMap(s => s.patterns).find(p => p.slug === params.topic);
    if (!t) return { meta: [{ title: "Topic — Docker" }] };
    return {
      meta: [
        { title: `${t.title} — Docker` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — Docker` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
