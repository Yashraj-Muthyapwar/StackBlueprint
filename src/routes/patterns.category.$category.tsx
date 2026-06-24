import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Boxes, Type } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { patterns } from "@/lessons/roadmap";

type CategoryMeta = {
  label: string;
  blurb: string;
  icon: LucideIcon;
  filter: string;
};

const CATEGORIES: Record<string, CategoryMeta> = {
  arrays: {
    label: "Arrays / Matrix",
    blurb:
      "Two pointers, sliding window, prefix-based, Kadane's, binary search, and matrix traversals.",
    icon: Boxes,
    filter: "Arrays",
  },
  strings: {
    label: "Strings",
    blurb:
      "Sliding window on characters, two-pointer scans, and exact matching with KMP, Rabin–Karp, and Z.",
    icon: Type,
    filter: "Strings",
  },
};

export const Route = createFileRoute("/patterns/category/$category")({
  head: ({ params }) => {
    const c = CATEGORIES[params.category];
    if (!c) return { meta: [{ title: "Category" }] };
    return {
      meta: [
        { title: `${c.label} — Patterns (DSA)` },
        { name: "description", content: c.blurb },
        { property: "og:title", content: `${c.label} — Patterns (DSA)` },
        { property: "og:description", content: c.blurb },
      ],
    };
  },
  loader: ({ params }) => {
    if (!CATEGORIES[params.category]) throw notFound();
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="px-6 py-16 text-center text-muted-foreground">Category not found.</div>
  ),
});

function CategoryPage() {
  const { category } = Route.useParams();
  const meta = CATEGORIES[category];
  if (!meta) return null;
  const list = patterns.filter((p) => p.category === meta.filter);
  const Icon = meta.icon;

  return (
    <div className="relative">
      <div className="grid-bg absolute inset-0 -z-10 opacity-40" />

      <section className="border-b border-hairline px-8 py-10 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <Link to="/patterns" className="hover:text-foreground">
              Patterns
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{meta.label}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="grid size-12 place-items-center rounded-md bg-mint/15 text-mint ring-1 ring-mint/30">
              <Icon className="size-6" />
            </div>
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight lg:text-4xl">
                {meta.label}
              </h1>
              <p className="mt-2 max-w-2xl text-balance text-muted-foreground">{meta.blurb}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Link
                key={p.slug}
                to="/patterns/$pattern"
                params={{ pattern: p.slug }}
                className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-mint/40"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mint">
                    {p.lessons.length} lesson{p.lessons.length === 1 ? "" : "s"}
                  </span>
                </div>
                <h3 className="text-base font-medium tracking-tight">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.lessons.slice(0, 6).map((l) => (
                    <span
                      key={l.builder.slug}
                      className="rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 text-[10px] text-mint"
                    >
                      {l.builder.title.replace(/^[^—]+—\s*/, "")}
                    </span>
                  ))}
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-mint">
                  Open pattern
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
