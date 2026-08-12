import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { LessonCompleteButton } from "./LessonCompleteButton";

export interface LessonLayoutProps {
  trackTitle: string;
  trackPath: string;
  topic: {
    slug: string;
    title: string;
    lessons?: any[];
  };
  lesson: {
    slug: string;
    title: string;
    subtitle?: string;
  };
  children?: React.ReactNode;
  sections?: any[];
  renderSection?: (section: any, onQuizActiveChange: (active: boolean) => void) => React.ReactNode;
  hasQuiz?: boolean;
  isCompleted: boolean;
  onToggleComplete: () => void;
  showKeyTakeaways?: boolean;
  isPlaceholder?: boolean;
}

export function LessonLayout({
  trackTitle,
  trackPath,
  topic,
  lesson,
  children,
  sections,
  renderSection,
  hasQuiz = false,
  isCompleted,
  onToggleComplete,
  showKeyTakeaways = true,
  isPlaceholder = false,
}: LessonLayoutProps) {
  const [isQuizActive, setIsQuizActive] = useState(false);
  const idx = topic.lessons?.findIndex((x) => x.slug === lesson.slug) ?? -1;
  const prev = idx > 0 ? topic.lessons![idx - 1] : undefined;
  const next = idx < (topic.lessons?.length ?? 0) - 1 ? topic.lessons![idx + 1] : undefined;

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <Link to={trackPath} className="hover:text-foreground">
            {trackTitle}
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to={`${trackPath}/$topic`}
            params={{ topic: topic.slug }}
            className="hover:text-foreground"
          >
            {topic.title}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">
            {String(idx + 1).padStart(2, "0")} / {String(topic.lessons?.length ?? 0).padStart(2, "0")}
          </span>
        </nav>

        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Chapter · {topic.title} · Lesson {idx + 1} of {topic.lessons?.length ?? 0}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
          {lesson.title}
        </h1>
        {lesson.subtitle && (
          <p className="mt-3 text-balance text-muted-foreground lg:text-lg">
            {lesson.subtitle.split(/`([^`]+)`/g).map((part, i) =>
              i % 2 === 1 ? (
                <code
                  key={i}
                  className="rounded-md bg-background px-1.5 py-0.5 font-mono text-[0.85em] text-foreground ring-1 ring-inset ring-hairline"
                >
                  {part}
                </code>
              ) : (
                part
              )
            )}
          </p>
        )}

        <div className="mt-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          {isPlaceholder ? (
            <div className="rounded-3xl border border-dashed border-mint/30 bg-mint/5 px-6 py-20 text-center shadow-sm">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-mint/10 text-mint">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/></svg>
              </div>
              <h3 className="mb-3 text-2xl font-medium tracking-tight text-foreground">
                Lesson Content Coming Soon
              </h3>
              <p className="mx-auto max-w-md text-balance text-muted-foreground lg:text-lg">
                We are actively working on writing the content for the <strong>{lesson.title}</strong> lesson. Check back later!
              </p>
            </div>
          ) : (
            <>
              {sections && renderSection ? (
                <div className="space-y-7">
                  {sections.map((s, i) => (
                    <div 
                      key={i} 
                      className={`transition-all duration-500 ${isQuizActive && s.kind !== "quiz" ? "blur-md pointer-events-none opacity-40 select-none" : ""}`}
                    >
                      {renderSection(s, setIsQuizActive)}
                    </div>
                  ))}
                </div>
              ) : (
                children
              )}

              {showKeyTakeaways && !sections?.some(s => s.kind === "takeaways" || s.type === "takeaways") && (
                <div className="mt-16 rounded-xl border border-hairline/60 bg-surface/20 p-8 text-center">
                  <h3 className="text-xl font-medium tracking-tight text-foreground">
                    Key Takeaways
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Check back soon for the core concepts!
                  </p>
                </div>
              )}
            </>
          )}

          <nav className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
            {prev ? (
              <Link
                to={`${trackPath}/$topic/$lesson`}
                params={{ topic: topic.slug, lesson: prev.slug }}
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
              <div className="hidden sm:block sm:flex-1" />
            )}

            <div className="flex shrink-0 justify-center sm:mx-4">
              <LessonCompleteButton
                isCompleted={isCompleted}
                hasQuiz={hasQuiz}
                onToggle={onToggleComplete}
              />
            </div>

            {next ? (
              <Link
                to={`${trackPath}/$topic/$lesson`}
                params={{ topic: topic.slug, lesson: next.slug }}
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
              <div className="hidden sm:block sm:flex-1" />
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
