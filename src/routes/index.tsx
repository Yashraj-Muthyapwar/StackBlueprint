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

  const categorizedRoadmap = [
    {
      title: "Software Engineering",
      tracks: roadmap.filter((cat) =>
        ["patterns-dsa", "python", "system-design", "web-scraping"].includes(cat.slug),
      ),
    },
    {
      title: "Data & Analytics",
      tracks: roadmap.filter((cat) =>
        ["sql-mastery", "data-warehouses", "data-engineering", "pandas"].includes(cat.slug),
      ),
    },
    {
      title: "DevOps & Tools",
      tracks: roadmap.filter((cat) => ["docker", "terraform", "git-github"].includes(cat.slug)),
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Enhanced animated background orbs */}
      <div className="absolute left-[-10%] top-[-10%] -z-10 size-[600px] rounded-full bg-mint/10 opacity-70 mix-blend-screen blur-[120px] pointer-events-none" />
      <div className="absolute right-[-10%] top-[20%] -z-10 size-[500px] rounded-full bg-blue-500/10 opacity-50 mix-blend-screen blur-[120px] pointer-events-none" />
      <div className="grid-bg absolute inset-0 -z-20 opacity-[0.15] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center border-b border-hairline px-8 py-32 text-center lg:px-16 lg:py-48">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mint/15 via-background/0 to-background/0" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/5 px-4 py-1.5 shadow-[0_0_15px_-3px_rgba(94,234,212,0.2)] backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-mint"></span>
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-mint">
              StackBlueprint · Patterns track live
            </span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl lg:leading-[1.1]">
            Your roadmap to <br className="hidden lg:block" />
            <span className="bg-gradient-to-r from-mint via-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
              engineering mastery.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-balance text-lg text-muted-foreground/90 lg:text-xl">
            StackBlueprint is a visual, interactive playbook for the things engineers actually get
            asked about: <strong className="font-semibold">DSA patterns</strong>,{" "}
            <strong className="font-semibold">SQL</strong>,{" "}
            <strong className="font-semibold">system design</strong>, and the{" "}
            <strong className="font-semibold">data architecture</strong> they all run on.
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              to="/patterns"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-mint px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_-10px_rgba(94,234,212,0.8)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(94,234,212,1)]"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-all duration-1000 group-hover:animate-[shimmer_1.5s_infinite]" />
              Start with Patterns (DSA)
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/sql"
              className="group inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/30 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md transition-all duration-300 hover:border-mint/30 hover:bg-surface/60 hover:shadow-[0_0_20px_-5px_rgba(94,234,212,0.2)]"
            >
              Explore SQL Mastery
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap grid */}
      <section className="px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-baseline justify-between border-b border-hairline pb-4">
            <h2 className="text-3xl font-bold tracking-tight">The roadmap</h2>
            <span className="rounded-full bg-surface-2 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {roadmap.length} tracks · {unlockedCategories} unlocked
            </span>
          </div>

          <div className="space-y-16">
            {categorizedRoadmap.map((category) => (
              <div key={category.title}>
                <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold tracking-tight text-foreground/90">
                  {category.title}
                  <div className="h-px flex-1 bg-hairline/50" />
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
                  {category.tracks.map((cat) => {
                    const isUnlocked = !cat.locked;
                    const isSql = cat.slug === "sql-mastery";
                    const hasContent = isUnlocked || isSql;
                    const card = (
                      <div
                        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-500 ${
                          hasContent
                            ? "border-hairline/60 bg-surface/30 backdrop-blur-md hover:-translate-y-1.5 hover:border-mint/40 hover:bg-surface/60 hover:shadow-[0_12px_40px_-10px_rgba(94,234,212,0.2)]"
                            : "border-hairline/40 bg-surface/10 backdrop-blur-sm hover:-translate-y-1 hover:border-foreground/20 hover:bg-surface/30 hover:shadow-xl"
                        }`}
                      >
                        {/* Ambient card glow */}
                        {hasContent && (
                          <div className="absolute -right-20 -top-20 -z-10 size-40 rounded-full bg-mint/10 opacity-0 blur-[50px] transition-opacity duration-500 group-hover:opacity-100" />
                        )}

                        <div className="mb-6 flex items-start justify-between">
                          <div
                            className={`flex min-w-[48px] items-center justify-center rounded-xl transition-all duration-500 ${
                              typeof cat.icon === "string"
                                ? cat.slug === "data-engineering"
                                  ? "h-16"
                                  : "h-12"
                                : hasContent
                                  ? "h-12 bg-mint/10 text-mint ring-1 ring-mint/30 group-hover:bg-mint/20 group-hover:scale-110 group-hover:ring-mint/50"
                                  : "h-12 bg-surface-2 text-muted-foreground/70 ring-1 ring-hairline group-hover:bg-surface-3"
                            }`}
                          >
                            {typeof cat.icon === "string" ? (
                              <img
                                src={cat.icon}
                                alt={`${cat.title} logo`}
                                className={`${cat.slug === "data-engineering" ? "h-16 -ml-2" : "h-8"} w-auto object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110`}
                              />
                            ) : (
                              <cat.icon className="size-6" />
                            )}
                          </div>
                          {hasContent ? (
                            <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-mint shadow-[0_0_10px_-2px_rgba(94,234,212,0.2)]">
                              {isUnlocked ? "Active" : "In Progress"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-background/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                              <Lock className="size-3" />
                              Locked
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-mint">
                          {cat.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {cat.blurb}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {cat.patterns.slice(0, 4).map((p) => (
                            <span
                              key={p.slug}
                              className={
                                hasContent
                                  ? "rounded-md border border-mint/20 bg-mint/5 px-2.5 py-1 text-[11px] font-medium text-mint/90 transition-colors group-hover:border-mint/40 group-hover:bg-mint/10"
                                  : "rounded-md border border-hairline bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted-foreground/80"
                              }
                            >
                              {p.title}
                            </span>
                          ))}
                          {cat.patterns.length > 4 && (
                            <span
                              className={
                                hasContent
                                  ? "rounded-md border border-mint/20 px-2.5 py-1 text-[11px] font-medium text-mint/60"
                                  : "rounded-md border border-hairline px-2.5 py-1 text-[11px] font-medium text-muted-foreground/50"
                              }
                            >
                              +{cat.patterns.length - 4} more
                            </span>
                          )}
                        </div>

                        <div className="mt-auto pt-8">
                          <div className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors">
                            {hasContent ? (
                              <span className="text-mint flex items-center">
                                {isSql && !isUnlocked ? "Open syllabus" : "Open track"}
                                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            ) : (
                              <span className="text-muted-foreground flex items-center group-hover:text-foreground/80">
                                Preview syllabus
                                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );

                    if (cat.overviewPath === "/patterns")
                      return (
                        <Link key={cat.slug} to="/patterns" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/sql")
                      return (
                        <Link key={cat.slug} to="/sql" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/data-warehouses")
                      return (
                        <Link key={cat.slug} to="/data-warehouses" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/docker")
                      return (
                        <Link key={cat.slug} to="/docker" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/web-scraping")
                      return (
                        <Link key={cat.slug} to="/web-scraping" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/system-design")
                      return (
                        <Link key={cat.slug} to="/system-design" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/terraform")
                      return (
                        <Link key={cat.slug} to="/terraform" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/git-github")
                      return (
                        <Link key={cat.slug} to="/git-github" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/python")
                      return (
                        <Link key={cat.slug} to="/python" className="block h-full">
                          {card}
                        </Link>
                      );
                    if (cat.overviewPath === "/data-engineering")
                      return (
                        <Link key={cat.slug} to="/data-engineering" className="block h-full">
                          {card}
                        </Link>
                      );

                    return (
                      <Link
                        key={cat.slug}
                        to="/tracks/$track"
                        params={{ track: cat.slug }}
                        className="block h-full"
                      >
                        {card}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-hairline px-8 py-24 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-mint/5 via-background/0 to-background/0" />
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Built for visual learners
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Interactive elements that make complex concepts click.
            </p>
          </div>
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
              <div
                key={s.k}
                className="group relative overflow-hidden rounded-2xl border border-hairline/60 bg-surface/20 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-mint/30 hover:bg-surface/40 hover:shadow-[0_8px_30px_-5px_rgba(94,234,212,0.15)]"
              >
                <div className="absolute -right-10 -top-10 -z-10 size-32 rounded-full bg-mint/5 blur-[40px] transition-all duration-500 group-hover:bg-mint/20" />
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-mint/10 text-mint ring-1 ring-mint/20 transition-transform duration-500 group-hover:scale-110">
                  <span className="font-mono text-base font-bold">{s.k}</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
