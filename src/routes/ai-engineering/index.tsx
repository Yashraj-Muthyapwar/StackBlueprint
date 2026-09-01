import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { TrackCard } from "@/components/learning-paths/TrackCard";
import {
  Bot,
  Brain,
  Code2,
  Database,
  Network,
  Settings,
  Target,
  Workflow,
  Cloud,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/ai-engineering/")({
  head: () => ({
    meta: [
      { title: "AI Engineering — StackBlueprint" },
      {
        name: "description",
        content:
          "Learn the fundamentals of Large Language Models and build your own AI applications.",
      },
      { property: "og:title", content: "AI Engineering — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Interactive AI Engineering roadmap: LLM basics, prompt engineering, RAG, vector databases, and orchestration.",
      },
    ],
  }),
  component: AIEngineeringIndex,
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
    group: "AI Engineering Fundamentals",
    groupBlurb:
      "Core concepts, setup, and integrating language models into your applications.",
    topics: [
      {
        slug: "intro-ai-llm",
        title: "1. Introduction to AI & LLMs",
        blurb: "Understand what Large Language Models are and how they work.",
        icon: Brain,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "prompt-engineering",
        title: "2. Prompt Engineering Basics",
        blurb: "Learn the art of crafting effective prompts to get the best responses.",
        icon: Code2,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "llm-apis",
        title: "3. Working with LLM APIs",
        blurb: "Integrate OpenAI and Anthropic APIs into your applications.",
        icon: Network,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "embeddings-vector-db",
        title: "4. Embeddings & Vector Databases",
        blurb: "Learn how text is represented as numbers and stored for semantic search.",
        icon: Database,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "rag",
        title: "5. Retrieval-Augmented Generation (RAG)",
        blurb: "Ground LLM responses in your own private data.",
        icon: Target,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "fine-tuning",
        title: "6. Fine-Tuning vs Prompting",
        blurb: "Know when to guide an existing model and when to train your own.",
        icon: Settings,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "langchain",
        title: "7. Orchestration with LangChain",
        blurb: "Build complex workflows by chaining prompts, tools, and memory.",
        icon: Workflow,
        modules: ["Coming Soon"],
        unlocked: false,
      },
      {
        slug: "deploying-ai",
        title: "8. Deploying AI Applications",
        blurb: "Take your LLM application to production securely and reliably.",
        icon: Cloud,
        modules: ["Coming Soon"],
        unlocked: false,
      },
    ],
  },
];

function AIEngineeringIndex() {
  const { isCompleted } = useProgress();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <Bot className="size-16 text-foreground drop-shadow-sm lg:size-20" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            AI Engineering Track
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Learn the fundamentals of Large Language Models and build your own AI applications.
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

                  const toPath = t.to || `/ai-engineering/${t.slug}`;
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
