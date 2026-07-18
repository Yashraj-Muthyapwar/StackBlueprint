import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles } from "lucide-react";

import { roadmap } from "@/lessons/roadmap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StackBlueprint — Your roadmap to engineering mastery" },
      {
        name: "description",
        content:
          "StackBlueprint — interactive, animated learning paths for DSA patterns, SQL, system design, and data warehouses.",
      },
      { property: "og:title", content: "StackBlueprint — Your roadmap to engineering mastery" },
      {
        property: "og:description",
        content:
          "A unified visual roadmap for engineers: DSA patterns, SQL mastery, system design, and data warehouses.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const unlockedCategories = roadmap.filter((c) => !c.locked).length;
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] size-[500px] rounded-full bg-mint/20 opacity-50 blur-[100px] animate-orb-1 -z-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] size-[400px] rounded-full bg-violet/20 opacity-50 blur-[100px] animate-orb-2 -z-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="grid-bg absolute inset-0 -z-10 opacity-50 pointer-events-none" />

      {/* Hero */}
      <section className="border-b border-hairline px-8 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 backdrop-blur">
            <Sparkles className="size-3.5 text-mint" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              StackBlueprint · Patterns track live
            </span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-foreground lg:text-7xl">
            Your roadmap to <br className="hidden lg:block" />
            <span className="text-mint">engineering mastery.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            StackBlueprint is a visual, interactive playbook for the things engineers actually get asked
            about — DSA patterns, SQL, system design, and the data warehouses they all run on.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/patterns"
              className="group inline-flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Start with Patterns (DSA)
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/sql"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-sm text-foreground backdrop-blur transition-colors hover:border-foreground/30"
            >
              Explore SQL Mastery
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap grid */}
      <section className="px-8 py-16 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">The roadmap</h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {roadmap.length} tracks · {unlockedCategories} unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {roadmap.map((cat) => {
              const isUnlocked = !cat.locked;
              const isSql = cat.slug === "sql-mastery";
              const hasContent = isUnlocked || isSql;
              const card = (
                <div
                  className={`group relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                    hasContent
                      ? "border-hairline bg-surface hover:border-mint/50 hover:shadow-[0_8px_30px_-5px_rgba(94,234,212,0.15)] hover:-translate-y-1"
                      : "border-hairline/60 bg-surface/40 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-1"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`grid size-10 place-items-center rounded-md ${
                        hasContent
                          ? "bg-mint/15 text-mint ring-1 ring-mint/30"
                          : "bg-surface-2 text-muted-foreground/70 ring-1 ring-hairline"
                      }`}
                    >
                      <cat.icon className="size-5" />
                    </div>
                    {hasContent ? (
                      <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mint">
                        {isUnlocked ? "Active" : "In Progress"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                        <Lock className="size-3" />
                        Locked
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-medium tracking-tight">{cat.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {cat.patterns.map((p) => (
                      <span
                        key={p.slug}
                        className={
                          hasContent
                            ? "rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 text-[11px] text-mint"
                            : "rounded-full border border-hairline px-2.5 py-0.5 text-[11px] text-muted-foreground/80"
                        }
                      >
                        {p.title}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm">
                    {hasContent ? (
                      <span className="text-mint">
                        {isSql && !isUnlocked ? "Open syllabus" : "Open track"}{" "}
                        <ArrowRight className="ml-1 inline size-4" />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Preview syllabus <ArrowRight className="ml-1 inline size-4" />
                      </span>
                    )}
                  </div>
                </div>
              );

              if (cat.overviewPath === "/patterns") {
                return (
                  <Link key={cat.slug} to="/patterns" className="block">
                    {card}
                  </Link>
                );
              }
              if (cat.overviewPath === "/sql") {
                return (
                  <Link key={cat.slug} to="/sql" className="block">
                    {card}
                  </Link>
                );
              }
              if (cat.overviewPath === "/data-warehouses") {
                return (
                  <Link key={cat.slug} to="/data-warehouses" className="block">
                    {card}
                  </Link>
                );
              }
              if (cat.overviewPath === "/docker") {
                return (
                  <Link key={cat.slug} to="/docker" className="block">
                    {card}
                  </Link>
                );
              }
              if (cat.overviewPath === "/web-scraping") {
                return (
                  <Link key={cat.slug} to="/web-scraping" className="block">
                    {card}
                  </Link>
                );
              }
              return (
                <Link
                  key={cat.slug}
                  to="/tracks/$track"
                  params={{ track: cat.slug }}
                  className="block"
                >
                  {card}
                </Link>
              );
            })}

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-hairline px-8 py-16 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-2xl font-semibold tracking-tight">How a lesson works</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                k: "01",
                t: "Code on the right",
                d: "Annotated source with a sliding highlight on the currently-executing line.",
              },
              {
                k: "02",
                t: "Visualization on the left",
                d: "Tiles, pointers, partitions, and grids — animated with spring easing.",
              },
              {
                k: "03",
                t: "You drive it",
                d: "Step, autoplay, scrub, and feed in your own inputs to see the algorithm react.",
              },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-hairline bg-surface p-5">
                <span className="font-mono text-xs text-mint">{s.k}</span>
                <h3 className="mt-3 text-base font-medium">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
