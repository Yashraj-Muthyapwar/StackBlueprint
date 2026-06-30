import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { FOUNDATION_TOPICS } from "@/lessons/data-warehouses/foundations-content";
import { SectionRenderer } from "@/components/data-warehouses/SectionRenderer";

export const Route = createFileRoute("/data-warehouses/foundations/$topic/$lesson")({
  head: ({ params }) => {
    const t = FOUNDATION_TOPICS[params.topic];
    const l = t?.lessons.find((x) => x.slug === params.lesson);
    if (!t || !l) return { meta: [{ title: "Lesson — Data Warehouses" }] };
    return {
      meta: [
        { title: `${l.title} — ${t.title}` },
        { name: "description", content: l.subtitle },
        { property: "og:title", content: `${l.title} — ${t.title}` },
        { property: "og:description", content: l.subtitle },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { topic, lesson } = Route.useParams();
  const t = FOUNDATION_TOPICS[topic];
  const idx = t?.lessons.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons[idx] : undefined;

  if (!t || !l) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Lesson not found.{" "}
        <Link to="/data-warehouses" className="text-mint underline-offset-4 hover:underline">
          Back to Data Warehouses
        </Link>
      </div>
    );
  }

  const prev = idx > 0 ? t.lessons[idx - 1] : undefined;
  const next = idx < t.lessons.length - 1 ? t.lessons[idx + 1] : undefined;

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <Link to="/data-warehouses" className="hover:text-foreground">
            Data Warehouses
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/data-warehouses" className="hover:text-foreground">
            Foundations
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to="/data-warehouses/foundations/$topic"
            params={{ topic: t.slug }}
            className="hover:text-foreground"
          >
            {t.title}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">
            {String(idx + 1).padStart(2, "0")} / {String(t.lessons.length).padStart(2, "0")}
          </span>
        </nav>

        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Foundations · {t.title} · Lesson {idx + 1} of {t.lessons.length}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
          {l.title}
        </h1>
        <p className="mt-3 text-balance text-muted-foreground lg:text-lg">
          {l.subtitle}
        </p>

        <div className="mt-10 space-y-7">
          {l.sections.map((s, i) => (
            <SectionRenderer key={i} section={s} />
          ))}
        </div>

        <nav className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          {prev ? (
            <Link
              to="/data-warehouses/foundations/$topic/$lesson"
              params={{ topic: t.slug, lesson: prev.slug }}
              className="group inline-flex items-center gap-2 rounded-lg border border-hairline/70 px-4 py-3 transition-colors hover:border-mint/40 hover:bg-surface/60"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              <div className="text-left">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Previous
                </div>
                <div className="text-sm font-medium">{prev.title}</div>
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/data-warehouses/foundations/$topic/$lesson"
              params={{ topic: t.slug, lesson: next.slug }}
              className="group inline-flex items-center gap-2 rounded-lg border border-hairline/70 px-4 py-3 text-right transition-colors hover:border-mint/40 hover:bg-surface/60"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Next
                </div>
                <div className="text-sm font-medium">{next.title}</div>
              </div>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
