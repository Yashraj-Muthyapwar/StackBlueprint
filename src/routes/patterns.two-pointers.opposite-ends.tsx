import { createFileRoute } from "@tanstack/react-router";

import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { oppositeEnds } from "@/lessons/two-pointers/opposite-ends";

export const Route = createFileRoute("/patterns/two-pointers/opposite-ends")({
  head: () => ({
    meta: [
      { title: "Opposite Ends — Two Pointers" },
      {
        name: "description",
        content:
          "Two pointers start at opposite ends of a sorted array and converge toward a target sum.",
      },
      { property: "og:title", content: "Opposite Ends — Two Pointers" },
      {
        property: "og:description",
        content: "Animated Two-Sum on a sorted array. Watch L and R converge.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <LessonHeader
          eyebrow="Arrays · Two Pointers · 01 / 03"
          title={oppositeEnds.title}
          subtitle={oppositeEnds.subtitle}
        />
        <LessonPlayer kind="array" lesson={oppositeEnds} />
      </div>
    </div>
  );
}

function LessonHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-1.5 text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-balance text-[15px] text-muted-foreground">{subtitle}</p>
    </div>
  );
}
