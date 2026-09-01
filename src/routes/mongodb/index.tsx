import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { TrackCard } from "@/components/learning-paths/TrackCard";
import mongoDbLogo from "@/images/logos/MongoDB_Logomark_ForestGreen.png";
import {
  Database,
  Server,
  FileCode,
  Terminal,
  Activity,
  Repeat,
  Rows3,
  Code2,
  Network,
  Sigma,
  Box,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/mongodb/")({
  head: () => ({
    meta: [
      { title: "MongoDB — StackBlueprint" },
      {
        name: "description",
        content:
          "Master MongoDB: from NoSQL concepts to aggregations and Python integration.",
      },
      { property: "og:title", content: "MongoDB — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Interactive, visual MongoDB roadmap: document model, CRUD operations, indexes, aggregation pipelines, and Python integration.",
      },
    ],
  }),
  component: MongoDbIndex,
});

type Topic = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  unlocked?: boolean;
  to?: string;
};

type Section = {
  group: string;
  groupBlurb: string;
  topics: Topic[];
};

const sections: Section[] = [
  {
    group: "MongoDB Fundamentals",
    groupBlurb:
      "Core concepts, setup, and performing operations through the shell and Python.",
    topics: [
      {
        slug: "nosql-concepts",
        title: "0. NoSQL Concepts",
        blurb: "Introduction to NoSQL databases.",
        icon: Database,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "getting-started-atlas",
        title: "1. Getting Started with MongoDB Atlas",
        blurb: "Set up your first MongoDB cluster.",
        icon: Server,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "document-model",
        title: "2. MongoDB and the Document Model",
        blurb: "Understand how MongoDB stores data as documents.",
        icon: FileCode,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "mongodb-shell",
        title: "3. Connecting to a MongoDB Database Using the MongoDB Shell",
        blurb: "Connect and run commands via the shell.",
        icon: Terminal,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "connecting-python",
        title: "4. Connecting to MongoDB in Python",
        blurb: "Integrate MongoDB with your Python applications.",
        icon: Code2,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "crud-insert-find",
        title: "5. CRUD Operations: Insert and Find Documents",
        blurb: "Create and read documents in MongoDB.",
        icon: Activity,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "crud-replace-delete",
        title: "6. CRUD Operations: Replace and Delete Documents",
        blurb: "Update and remove documents.",
        icon: Repeat,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "modifying-query-results",
        title: "7. CRUD Operations: Modifying Query Results",
        blurb: "Sort, limit, and skip query results.",
        icon: Rows3,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "crud-python",
        title: "8. CRUD Operations in Python",
        blurb: "Perform CRUD operations using PyMongo.",
        icon: Box,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "mongodb-indexes",
        title: "9. MongoDB Indexes",
        blurb: "Improve query performance with indexes.",
        icon: Network,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "mongodb-aggregation",
        title: "10. MongoDB Aggregation",
        blurb: "Process data records and return computed results.",
        icon: Sigma,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "aggregation-python",
        title: "11. MongoDB Aggregation in Python",
        blurb: "Run aggregation pipelines in Python.",
        icon: Layers,
        modules: ["Coming Soon"],
        unlocked: false,
      },
    ],
  },
];

function MongoDbIndex() {
  const { isCompleted } = useProgress();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img
              src={mongoDbLogo}
              alt="MongoDB Logo"
              className="size-16 object-contain drop-shadow-sm lg:size-20"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            MongoDB
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Master MongoDB: from NoSQL concepts to aggregations and Python integration.
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

                  const completedCount = 0;
                  const totalCount = t.modules.length;

                  const toPath = t.to || `/mongodb/${t.slug}`;
                  return (
                    <TrackCard
                      key={t.slug}
                      title={t.title}
                      blurb={t.blurb}
                      icon={Icon}
                      isLocked={isLocked}
                      lessons={t.modules.map((title, moduleIndex) => ({
                        slug: `${t.slug}-${moduleIndex}`,
                        title,
                      }))}
                      completedCount={completedCount}
                      totalCount={totalCount}
                      href={isLocked ? undefined : toPath}
                    />
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
