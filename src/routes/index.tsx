import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Lock, Sparkles } from "lucide-react";

import { roadmap } from "@/lessons/roadmap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patterns — learn DSA by watching it move" },
      {
        name: "description",
        content:
          "An animated, step-by-step DSA pattern explainer. Code and visualization in lockstep.",
      },
      { property: "og:title", content: "Patterns — learn DSA by watching it move" },
      {
        property: "og:description",
        content: "Watch every pointer, swap, and partition unfold next to the Python code that drives it.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative">
      <div className="grid-bg absolute inset-0 -z-10 opacity-50" />

      {/* Hero */}
      <section className="border-b border-hairline px-8 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 backdrop-blur">
            <Sparkles className="size-3.5 text-mint" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Two Pointers — now unlocked
            </span>
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground lg:text-7xl">
            Watch the algorithm,{" "}
            <span className="text-mint">line by line.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            A visual explainer for DSA patterns. Pointers glide, swaps arc, partitions tint —
            every motion locked to the Python line that caused it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/patterns/$pattern/$lesson"
              params={{ pattern: "two-pointers", lesson: "opposite-ends" }}
              className="group inline-flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Start with Two Pointers
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/patterns/$pattern"
              params={{ pattern: "two-pointers" }}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-sm text-foreground backdrop-blur transition-colors hover:border-foreground/30"
            >
              See the three variants
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap grid */}
      <section className="px-8 py-16 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Roadmap</h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {roadmap.length} categories · 1 unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((cat) => {
              const unlockedPatterns = cat.patterns.filter((p) => !p.locked);
              const isUnlocked = unlockedPatterns.length > 0;
              return (
                <div
                  key={cat.title}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-colors ${
                    isUnlocked
                      ? "border-hairline bg-surface hover:border-mint/40"
                      : "border-hairline/60 bg-surface/40"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`grid size-9 place-items-center rounded-md ${
                        isUnlocked
                          ? "bg-mint/15 text-mint ring-1 ring-mint/30"
                          : "bg-surface-2 text-muted-foreground/60 ring-1 ring-hairline"
                      }`}
                    >
                      <cat.icon className="size-4" />
                    </div>
                    {!isUnlocked && <Lock className="size-3.5 text-muted-foreground/60" />}
                  </div>
                  <h3 className="text-base font-medium tracking-tight">{cat.title}</h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {cat.patterns.length} patterns
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cat.patterns.map((p) =>
                      p.path && !p.locked ? (
                        <Link
                          key={p.slug}
                          to="/patterns/$pattern"
                          params={{ pattern: p.slug }}
                          className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 text-[11px] text-mint transition-colors hover:bg-mint/20"
                        >
                          {p.title}
                        </Link>
                      ) : (
                        <span
                          key={p.slug}
                          className="rounded-full border border-hairline px-2.5 py-0.5 text-[11px] text-muted-foreground/70"
                        >
                          {p.title}
                        </span>
                      ),
                    )}
                  </div>
                </div>
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
                d: "Annotated Python with a sliding highlight on the currently-executing line.",
              },
              {
                k: "02",
                t: "Visualization on the left",
                d: "Array tiles, pointer carets, partition bands — animated with spring easing.",
              },
              {
                k: "03",
                t: "You drive it",
                d: "Step, autoplay, scrub. Spacebar plays, arrow keys step. Speed 0.25× → 2×.",
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
