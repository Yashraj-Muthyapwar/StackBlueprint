import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Code2,
  Database,
  FunctionSquare,
  Box,
  Zap,
  LockKeyhole,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import pythonLogo from "@/images/logos/python-logo.png";

export const Route = createFileRoute("/python/")({
  head: () => ({
    meta: [
      { title: "Python — StackBlueprint" },
      {
        name: "description",
        content: "Master Python from basic syntax to advanced asynchronous programming.",
      },
      { property: "og:title", content: "Python — StackBlueprint" },
      {
        property: "og:description",
        content: "Master Python from basic syntax to advanced asynchronous programming.",
      },
    ],
  }),
  component: PythonIndex,
});

type Topic = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  unlocked?: boolean;
  to?: string;
  completedCount?: number;
};

type Section = {
  group: string;
  groupBlurb: string;
  topics: Topic[];
};

const sections: Section[] = [
  {
    group: "Foundations",
    groupBlurb: "The core syntax and built-in data structures of Python.",
    topics: [
      {
        slug: "basics",
        title: "Python Basics",
        blurb: "Variables, data types, and control flow.",
        icon: Code2,
        modules: ["Variables", "Data Types", "If/Else", "Loops"],
      },
      {
        slug: "data-structures",
        title: "Data Structures",
        blurb: "Lists, dictionaries, sets, and tuples.",
        icon: Database,
        modules: ["Lists", "Dictionaries", "Sets", "Tuples"],
      },
    ],
  },
  {
    group: "Intermediate Concepts",
    groupBlurb: "Structuring your code with functions, modules, and classes.",
    topics: [
      {
        slug: "functions",
        title: "Functions & Modules",
        blurb: "Defining functions, scope, and importing modules.",
        icon: FunctionSquare,
        modules: ["Functions", "Scope", "Modules", "Packages"],
      },
      {
        slug: "oop",
        title: "Object-Oriented Programming",
        blurb: "Classes, inheritance, and polymorphism.",
        icon: Box,
        modules: ["Classes", "Objects", "Inheritance", "Polymorphism"],
      },
    ],
  },
  {
    group: "Advanced Python",
    groupBlurb: "Advanced techniques for high-performance and asynchronous code.",
    topics: [
      {
        slug: "advanced",
        title: "Advanced Python",
        blurb: "Decorators, generators, and context managers.",
        icon: Zap,
        modules: ["Decorators", "Generators", "Context Managers", "Async IO"],
      },
    ],
  },
];

function PythonIndex() {
  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img src={pythonLogo} alt="Python Logo" className="size-16 object-contain drop-shadow-sm lg:size-20" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Python
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Master Python from basic syntax to advanced asynchronous programming. This track is currently in development.
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
                  const isLocked = true;

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
                    </div>
                  );

                  return <div key={t.slug}>{card}</div>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
