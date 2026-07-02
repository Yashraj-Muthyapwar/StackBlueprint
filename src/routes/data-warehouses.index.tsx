import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Cloud,
  Database,
  Layers,
  Network,
  Lock,
  LockKeyhole,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/data-warehouses/")({
  head: () => ({
    meta: [
      { title: "Data Warehouses — StackBlueprint" },
      {
        name: "description",
        content:
          "From OLTP vs OLAP to modern Lakehouses and Data Mesh. A visual roadmap to mastering analytical data systems.",
      },
      { property: "og:title", content: "Data Warehouses — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Interactive, animated data warehouse roadmap: ecosystems, Snowflake, BigQuery, Redshift, and modeling.",
      },
    ],
  }),
  component: DataWarehousesIndex,
});

type Topic = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  unlocked?: boolean;
  routeBase?: "foundations" | "modeling" | "platforms";
  to?: string;
};

type Section = {
  group: string;
  groupBlurb: string;
  topics: Topic[];
};

const sections: Section[] = [
  {
    group: "Foundations",
    groupBlurb:
      "The mental model for analytical systems — from basic transactions to the modern lakehouse architecture.",
    topics: [
      {
        slug: "data-ecosystems",
        title: "Data Ecosystems",
        blurb: "The journey of data: OLTP vs OLAP, data warehouses, lakes, lakehouses, and meshes.",
        icon: Cloud,
        modules: ["Data Journey", "OLTP vs OLAP", "Warehouses & Lakes", "Mesh & Fabric", "Database Families"],
        unlocked: true,
        routeBase: "foundations",
      },
      {
        slug: "data-formats",
        title: "Data Formats & Storage",
        blurb: "Understanding how data is stored, compressed, and managed at scale.",
        icon: Boxes,
        modules: ["CSV & JSON", "Row vs. Columnar", "Open Table Formats"],
        unlocked: true,
        routeBase: "foundations",
      },
    ],
  },
  {
    group: "Platforms",
    groupBlurb: "Deep dives into the major cloud data warehouse platforms.",
    topics: [
      {
        slug: "snowflake",
        title: "Snowflake",
        blurb: "Virtual warehouses, micro-partitions, clustering, and zero-copy cloning.",
        icon: Database,
        modules: ["Architecture", "Storage & Compute", "Time Travel", "Data Sharing"],
      },
      {
        slug: "bigquery",
        title: "BigQuery",
        blurb: "Serverless execution, Dremel architecture, slots, and cost optimization.",
        icon: Layers,
        modules: ["Dremel Engine", "Slots & Capacity", "Partitioning", "BI Engine"],
      },
      {
        slug: "redshift",
        title: "Amazon Redshift",
        blurb: "Leader & compute nodes, distribution styles, sort keys, and RA3 architecture.",
        icon: Network,
        modules: ["Leader/Compute", "Dist Styles", "Sort Keys", "AQUA & RA3"],
      },
    ],
  },
];

function DataWarehousesIndex() {
  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-mint/10 text-mint ring-1 ring-mint/20 lg:size-20">
            <Cloud className="size-8 lg:size-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Data Warehouses
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Go beyond simple transactions. Learn how the world's largest companies store,
            transform, and analyze petabytes of data to drive business decisions.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-24">
          {sections.map((sec, i) => (
            <div key={sec.group} className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
              <div className="mb-8 w-full shrink-0 lg:sticky lg:top-24 lg:mb-0 lg:w-64 xl:w-72">
                <div className="flex items-center gap-3">
                  <div className="grid size-6 place-items-center rounded-full bg-border text-xs font-bold text-foreground">
                    {i + 1}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {sec.group}
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {sec.groupBlurb}
                </p>
              </div>

              <div className="flex w-full flex-col gap-4">
                {sec.topics.map((t) => {
                  const Icon = t.icon;
                  const isLocked = !t.unlocked;

                  const card = (
                    <div
                      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border border-hairline transition-all duration-300 sm:flex-row ${
                        isLocked
                          ? "bg-card/20 opacity-80 grayscale"
                          : "bg-card hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-background/20"
                      }`}
                    >
                      <div className="flex shrink-0 items-center justify-center border-b border-hairline bg-background/50 p-6 sm:w-40 sm:border-b-0 sm:border-r">
                        <Icon
                          className={`size-10 ${isLocked ? "text-muted-foreground" : "text-mint"}`}
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            {t.title}
                          </h3>
                          {isLocked && <LockKeyhole className="size-5 text-muted-foreground" />}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {t.blurb}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2 pr-12">
                          {t.modules.map((m) => (
                            <span
                              key={m}
                              className="rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-hairline"
                            >
                              {m}
                            </span>
                          ))}
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

                  const toPath = t.to || `/data-warehouses/${t.routeBase}/${t.slug}`;
                  return (
                    <Link key={t.slug} to={toPath} className="block w-full outline-none">
                      {card}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
