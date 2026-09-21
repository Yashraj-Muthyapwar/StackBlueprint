import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { LessonCompleteButton } from "./LessonCompleteButton";
import { FloatingTOC, type TOCItem } from "./FloatingTOC";

export interface LessonLayoutProps {
  trackTitle: string;
  trackPath: string;
  basePath?: string;
  topic: {
    slug: string;
    title: string;
    path?: string;
    lessons?: any[];
  };
  lesson: {
    slug: string;
    title: string;
    subtitle?: string;
    path?: string;
  };
  children?: React.ReactNode;
  sections?: any[];
  renderSection?: (section: any, onQuizActiveChange: (active: boolean) => void, index: number) => React.ReactNode;
  hasQuiz?: boolean;
  isCompleted: boolean;
  onToggleComplete: () => void;
  showKeyTakeaways?: boolean;
  isPlaceholder?: boolean;
}

export function LessonLayout({
  trackTitle,
  trackPath,
  basePath,
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
  const effectiveBasePath = basePath || trackPath;
  const idx = topic.lessons?.findIndex((x) => x.slug === lesson.slug) ?? -1;
  const prev = idx > 0 ? topic.lessons![idx - 1] : undefined;
  const next = idx < (topic.lessons?.length ?? 0) - 1 ? topic.lessons![idx + 1] : undefined;

  const isEffectivelyPlaceholder = 
    isPlaceholder || 
    (!children && (!sections || sections.length === 0)) ||
    (sections?.length === 1 && sections[0].heading === "Coming Soon");

  const tocItems: TOCItem[] = [];
  (sections || []).forEach((s, i) => {
    let subIndex = 0;
    
    // 1. Top-level explicitly defined heading
    if (s.heading) {
      tocItems.push({ id: `section-${i}-h`, targetId: `section-${i}`, title: s.heading, index: tocItems.length });
    }
    
    // 2. Headings explicitly in callouts (if they act like steps, though usually we might skip them. Let's just do body headings to be safe for now, as the user specifically mentioned steps.)

    // 3. Markdown headings inside the prose/body
    if (s.body && Array.isArray(s.body)) {
      s.body.forEach((line: any) => {
        if (typeof line === "string" && line.trim().match(/^#{2,4}\s/)) {
          const title = line.trim().replace(/^#+\s*/, "");
          const targetId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          tocItems.push({ id: `section-${i}-sub-${subIndex++}`, targetId, title, index: tocItems.length });
        }
      });
    }
  });

  return (
    <div className="px-6 pb-6 pt-10 lg:px-12 lg:pb-8 lg:pt-14">
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
            to={(topic.path || `${effectiveBasePath}/$topic`) as any}
            params={topic.path ? undefined : { topic: topic.slug } as any}
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
        <h1 className="lesson-title mt-2 font-semibold tracking-tight">
          {lesson.title}
        </h1>
        {lesson.subtitle && (
          <p className="lesson-subtitle mt-3 text-balance text-muted-foreground">
            {lesson.subtitle.split(/`([^`]+)`/g).map((part, i) =>
              i % 2 === 1 ? (
                <code
                  key={i}
                  className="rounded bg-mint/10 text-mint px-1.5 py-0.5 font-mono text-[0.85em] font-medium"
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
          {isEffectivelyPlaceholder ? (
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
                      id={`section-${i}`}
                      className={`transition-all duration-500 ${isQuizActive && s.kind !== "quiz" ? "blur-md pointer-events-none opacity-40 select-none" : ""}`}
                    >
                      {renderSection(s, setIsQuizActive, i)}
                    </div>
                  ))}
                </div>
              ) : (
                children
              )}

              {showKeyTakeaways && 
               !(sections?.length === 1 && sections[0].kind === "quiz" && sections[0].isFinalQuiz) && 
               !sections?.some(s => s.kind === "takeaways" || s.type === "takeaways") && (
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
                to={(prev.path || `${effectiveBasePath}/$topic/$lesson`) as any}
                params={prev.path ? undefined : { topic: topic.slug, lesson: prev.slug } as any}
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
                isCompleted={isCompleted && !isEffectivelyPlaceholder}
                hasQuiz={hasQuiz}
                onToggle={onToggleComplete}
                isDisabled={isEffectivelyPlaceholder}
              />
            </div>

            {next ? (
              <Link
                to={(next.path || `${effectiveBasePath}/$topic/$lesson`) as any}
                params={next.path ? undefined : { topic: topic.slug, lesson: next.slug } as any}
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
      {tocItems.length > 0 && <FloatingTOC items={tocItems} />}
    </div>
  );
}
