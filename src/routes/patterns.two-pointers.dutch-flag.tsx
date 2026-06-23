import { createFileRoute } from "@tanstack/react-router";

import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { dutchFlag } from "@/lessons/two-pointers/dutch-flag";

export const Route = createFileRoute("/patterns/two-pointers/dutch-flag")({
  head: () => ({
    meta: [
      { title: "Dutch Flag — Two Pointers" },
      {
        name: "description",
        content:
          "Partition an array of 0s, 1s, and 2s into three zones in a single pass using three pointers.",
      },
      { property: "og:title", content: "Dutch Flag — Two Pointers" },
      {
        property: "og:description",
        content: "Three pointers, three zones, one pass. Watch the partitions form.",
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
            Arrays · Two Pointers · 03 / 03
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight lg:text-3xl">
            {dutchFlag.title}
          </h1>
          <p className="mt-2 max-w-3xl text-balance text-[15px] text-muted-foreground">
            {dutchFlag.subtitle}
          </p>
        </div>
        <LessonPlayer kind="array" lesson={dutchFlag} />
      </div>
    </div>
  );
}
