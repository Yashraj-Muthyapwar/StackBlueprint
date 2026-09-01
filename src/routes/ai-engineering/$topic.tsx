import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/ai-engineering/$topic")({
  head: ({ params }) => {
    const cat = CATEGORY_BY_SLUG["ai-engineering"];
    const t =
      cat?.patterns.find((p) => p.slug === params.topic) ||
      cat?.sections?.flatMap((s) => s.patterns).find((p) => p.slug === params.topic);
    if (!t) return { meta: [{ title: "Topic — AI Engineering" }] };
    return {
      meta: [
        { title: `${t.title} — AI Engineering` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — AI Engineering` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
