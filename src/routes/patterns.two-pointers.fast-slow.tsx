import { createFileRoute } from "@tanstack/react-router";

import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { fastSlow, fastSlowShape } from "@/lessons/two-pointers/fast-slow";

export const Route = createFileRoute("/patterns/two-pointers/fast-slow")({
  head: () => ({
    meta: [
      { title: "Fast & Slow — Two Pointers" },
      {
        name: "description",
        content:
          "Floyd's tortoise & hare cycle detection. Two pointers race through a linked list at different speeds.",
      },
      { property: "og:title", content: "Fast & Slow — Two Pointers" },
      {
        property: "og:description",
        content: "Watch the tortoise and hare meet inside a cyclic linked list.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Arrays · Two Pointers · 02 / 03
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight lg:text-3xl">
            {fastSlow.title}
          </h1>
          <p className="mt-2 max-w-3xl text-balance text-[15px] text-muted-foreground">
            {fastSlow.subtitle}
          </p>
        </div>
        <LessonPlayer kind="linked-list" lesson={fastSlow} shape={fastSlowShape} />
      </div>
    </div>
  );
}
