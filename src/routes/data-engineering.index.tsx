import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole } from "lucide-react";
import dataEngineeringLogo from "@/images/logos/data-engineering-logo.png";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/data-engineering/")({
  head: () => ({
    meta: [
      { title: "Data Engineering — StackBlueprint" },
      {
        name: "description",
        content:
          "Fundamentals of Data Engineering: Lifecycle, Architecture, and Storage.",
      },
      { property: "og:title", content: "Data Engineering — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Core principles, lifecycle, architecture, and undercurrents of data engineering.",
      },
    ],
  }),
  component: DataEngineeringIndex,
});

function DataEngineeringIndex() {
  const category = CATEGORY_BY_SLUG["data-engineering"]!;
  
  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img src={dataEngineeringLogo} alt="Data Engineering Logo" className="h-32 w-auto object-contain drop-shadow-sm lg:h-40 lg:w-auto" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            {category.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            {category.blurb}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-24">
          {(category.sections || [{ title: "Chapters", patterns: category.patterns }]).map((sec, secIdx) => {
            const parts = sec.title ? sec.title.split(" — ") : [];
            const prefix = parts.length === 2 ? parts[0] : (secIdx + 1).toString();
            const heading = parts.length === 2 ? parts[1] : (sec.title || "Chapters");

            return (
              <div key={secIdx} className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
                <div className="mb-8 w-full shrink-0 lg:sticky lg:top-24 lg:mb-0 lg:w-64 xl:w-72">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E2E8F0] dark:bg-border text-sm font-bold text-foreground">
                      {secIdx + 1}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                      {heading}
                    </h2>
                  </div>
                  {sec.blurb && (
                    <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                      {sec.blurb}
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-col gap-4">
                  {sec.patterns.map((t) => {
                    const Icon = t.lessons?.[0]?.icon || LockKeyhole;
                    const isLocked = t.locked;

                    const card = (
                      <div
                        className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border border-hairline transition-all duration-300 sm:h-[220px] sm:flex-row ${
                          isLocked
                            ? "bg-card/20 opacity-80 grayscale"
                            : "bg-card hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-background/20"
                        }`}
                      >
                        <div className="flex shrink-0 items-center justify-center border-b border-hairline bg-background/50 p-6 sm:w-40 sm:border-b-0 sm:border-r">
                          <Icon
                            className={`size-12 ${isLocked ? "text-muted-foreground" : "text-mint"}`}
                            strokeWidth={1.5}
                          />
                        </div>

                        <div className="flex flex-1 flex-col p-6 sm:p-8">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-xl font-semibold tracking-tight text-foreground line-clamp-1">
                              {t.title}
                            </h3>
                            {isLocked && <LockKeyhole className="size-5 shrink-0 text-muted-foreground" />}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                            {t.blurb}
                          </p>

                          <div className="mt-auto flex flex-wrap items-center gap-2 pr-12">
                            {t.lessons?.slice(0, 2).map((m) => (
                              <span
                                key={m.slug}
                                className="truncate max-w-[200px] sm:max-w-[240px] rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-hairline"
                              >
                                {m.title}
                              </span>
                            ))}
                            {t.lessons && t.lessons.length > 2 && (
                              <span className="shrink-0 rounded-md bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-hairline">
                                +{t.lessons.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>

                        {!isLocked && (
                          <div className="absolute bottom-6 right-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:hidden">
                            <div className="grid size-8 place-items-center rounded-full bg-mint/10 text-mint">
                              <ArrowRight className="size-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    );

                    if (isLocked) {
                      return <div key={t.slug}>{card}</div>;
                    }

                    const toPath = t.path || `/data-engineering/${t.slug}`;
                    return (
                      <Link key={t.slug} to={toPath} className="block w-full outline-none">
                        {card}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
