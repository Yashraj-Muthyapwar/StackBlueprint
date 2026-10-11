import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { roadmap } from "@/lessons/roadmap";
import { HeroInteractiveDemo } from "@/components/HeroInteractiveDemo";
import { RoadmapCard } from "@/components/RoadmapCard";

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
      tracks: roadmap.filter(cat => ["patterns-dsa", "python", "system-design", "web-scraping"].includes(cat.slug))
    },
    {
      title: "Data & Analytics",
      tracks: roadmap.filter(cat => ["sql-mastery", "data-warehouses", "data-engineering", "pandas"].includes(cat.slug))
    },
    {
      title: "DevOps & Tools",
      tracks: roadmap.filter(cat => ["docker", "terraform", "git-github"].includes(cat.slug))
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Enhanced animated background orbs */}
      <div className="absolute left-[-10%] top-[-10%] -z-10 size-[600px] rounded-full bg-mint/10 opacity-70 mix-blend-screen blur-[120px] pointer-events-none" />
      <div className="absolute right-[-10%] top-[20%] -z-10 size-[500px] rounded-full bg-blue-500/10 opacity-50 mix-blend-screen blur-[120px] pointer-events-none" />
      <div className="grid-bg absolute inset-0 -z-20 opacity-[0.15] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center border-b border-hairline px-4 pt-8 pb-16 text-center sm:px-6 sm:pt-10 sm:pb-20 lg:px-8 lg:pt-12 lg:pb-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mint/15 via-background/0 to-background/0" />
        
        <div className="relative z-10 mx-auto flex max-w-5xl w-full flex-col items-center">
          <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-mint/20 bg-mint/5 px-3 py-1 shadow-[0_0_15px_-3px_rgba(94,234,212,0.2)] backdrop-blur-md sm:mb-3.5 sm:px-3.5">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-mint"></span>
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-mint truncate">
              StackBlueprint · Patterns track live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold tracking-tight text-foreground leading-[1.15] max-w-2xl">
            The visual playbook for <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-mint via-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-sm">
              software engineering.
            </span>
          </h1>
          <p className="mt-2.5 max-w-xl text-balance text-xs sm:text-sm text-muted-foreground sm:mt-3">
            Interactive, animated deep dives into the concepts top engineers actually get tested on: <strong className="font-semibold text-foreground">DSA patterns</strong>, <strong className="font-semibold text-foreground">SQL mastery</strong>, <strong className="font-semibold text-foreground">system design</strong>, and <strong className="font-semibold text-foreground">data architecture</strong>.
          </p>
          <div className="mt-3.5 flex w-full max-w-xs flex-col items-stretch gap-2 sm:mt-4 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <Link
              to="/patterns"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-mint px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-6px_rgba(94,234,212,0.7)] transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-all duration-1000 group-hover:animate-[shimmer_1.5s_infinite]" />
              Start with Patterns (DSA)
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/sql"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-hairline bg-surface/30 px-4 py-2 text-xs sm:text-sm font-semibold text-foreground backdrop-blur-md transition-all duration-300 hover:border-mint/30 hover:bg-surface/60"
            >
              Explore SQL Mastery
            </Link>
          </div>

          {/* Interactive Hero Widget Preview */}
          <HeroInteractiveDemo />
        </div>
      </section>

      {/* Roadmap grid */}
      <section className="px-4 py-12 sm:px-8 sm:py-20 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 sm:mb-12 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between border-b border-hairline pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">The roadmap</h2>
            <span className="self-start sm:self-auto rounded-full bg-surface-2 px-3 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.18em] text-muted-foreground">
              {roadmap.length} tracks · {unlockedCategories} unlocked
            </span>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {categorizedRoadmap.map((category) => (
              <div key={category.title}>
                <h3 className="mb-4 sm:mb-6 flex items-center gap-3 text-lg sm:text-xl font-semibold tracking-tight text-foreground/90">
                  {category.title}
                  <div className="h-px flex-1 bg-hairline/50" />
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-2">
                  {category.tracks.map((cat) => (
                    <RoadmapCard key={cat.slug} cat={cat} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-hairline px-4 py-16 sm:px-8 sm:py-24 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-mint/5 via-background/0 to-background/0" />
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 sm:mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Built for visual learners</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">Interactive elements that make complex concepts click.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
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
              <div key={s.k} className="group relative overflow-hidden rounded-2xl border border-hairline/60 bg-surface/20 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-mint/30 hover:bg-surface/40 hover:shadow-[0_8px_30px_-5px_rgba(94,234,212,0.15)]">
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
