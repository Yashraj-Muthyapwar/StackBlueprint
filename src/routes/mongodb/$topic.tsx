import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/mongodb/$topic")({
  head: ({ params }) => {
    const cat = CATEGORY_BY_SLUG["mongodb"];
    const t =
      cat?.patterns.find((p) => p.slug === params.topic) ||
      cat?.sections?.flatMap((s) => s.patterns).find((p) => p.slug === params.topic);
    if (!t) return { meta: [{ title: "Topic — MongoDB" }] };
    return {
      meta: [
        { title: `${t.title} — MongoDB` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — MongoDB` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
