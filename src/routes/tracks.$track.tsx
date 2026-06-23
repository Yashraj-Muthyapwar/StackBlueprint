import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";

import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/tracks/$track")({
  head: ({ params }) => {
    const c = CATEGORY_BY_SLUG[params.track];
    const title = c ? `${c.title} — Coming soon` : "Coming soon";
    return {
      meta: [
        { title: `${title} · DataVizCore` },
        { name: "description", content: c?.blurb ?? "Preview syllabus for an upcoming track." },
      ],
    };
  },
  loader: ({ params }) => {
    if (!CATEGORY_BY_SLUG[params.track]) throw notFound();
    return null;
  },
  component: TrackPreview,
  notFoundComponent: () => (
    <div className="px-6 py-20 text-center text-muted-foreground">Track not found.</div>
  ),
});

function TrackPreview() {
  const { track } = Route.useParams();
  const cat = CATEGORY_BY_SLUG[track]!;
  const Icon = cat.icon;

  return (
    <div className="relative">
      <div className="grid-bg absolute inset-0 -z-10 opacity-40" />

      <section className="border-b border-hairline px-8 py-14 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            Back to roadmap
          </Link>

          <div className="flex items-start gap-4">
            <div className="grid size-12 place-items-center rounded-xl bg-surface-2 text-muted-foreground/80 ring-1 ring-hairline">
              <Icon className="size-5" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 backdrop-blur">
                <Lock className="size-3 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Coming soon · Preview syllabus
                </span>
              </div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight lg:text-5xl">
                {cat.title}
              </h1>
              <p className="mt-3 max-w-2xl text-balance text-muted-foreground lg:text-lg">
                {cat.blurb}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-12 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Planned modules</h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {cat.patterns.length} modules
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {cat.patterns.map((p, i) => (
              <div
                key={p.slug}
                className="group relative overflow-hidden rounded-2xl border border-hairline/70 bg-surface/60 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Lock className="size-3.5 text-muted-foreground/60" />
                </div>
                <h3 className="mt-3 text-base font-medium tracking-tight">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-mint/30 bg-mint/5 p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-4 text-mint" />
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  In the meantime — explore Patterns (DSA)
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  The DSA track is fully unlocked with interactive, step-by-step visualizations.
                </p>
                <Link
                  to="/patterns/$pattern/$lesson"
                  params={{ pattern: "two-pointers", lesson: "opposite-ends" }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Open Two Pointers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
