import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { roadmap } from "@/lessons/roadmap";

export const Route = createFileRoute("/patterns/two-pointers/")({
  head: () => ({
    meta: [
      { title: "Two Pointers — three variants" },
      {
        name: "description",
        content:
          "Three flavors of the Two Pointers pattern: Opposite Ends, Fast & Slow, and Dutch Flag.",
      },
      { property: "og:title", content: "Two Pointers — three variants" },
      {
        property: "og:description",
        content: "Opposite Ends, Fast & Slow, and Dutch Flag — animated step-by-step.",
      },
    ],
  }),
  component: TwoPointersIndex,
});

function TwoPointersIndex() {
  const pattern = roadmap[0].patterns[0];
  return (
    <div className="px-8 py-12 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Arrays · Pattern
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight lg:text-5xl">Two Pointers</h1>
        <p className="mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
          Two indices walk an array (or a list) — converging, chasing, or partitioning. The same
          idea wears three faces.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {pattern.lessons.map((les, i) => (
            <Link
              key={les.slug}
              to={les.path}
              className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-mint/40"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-md bg-mint/15 text-mint ring-1 ring-mint/30">
                  <les.icon className="size-5" />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  0{i + 1} / 0{pattern.lessons.length}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-medium">{les.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {i === 0 && "Start at both ends. Converge toward the answer."}
                {i === 1 && "Tortoise & hare. Detect cycles by racing speeds."}
                {i === 2 && "Three pointers partition into three zones in one pass."}
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-mint">
                Open lesson
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
