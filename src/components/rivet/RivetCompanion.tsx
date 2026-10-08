import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { RivetOrb } from "./RivetOrb";
import { RivetPanel, type RivetContext } from "./RivetPanel";
import { addDivider } from "@/lib/rivet/history";
import { QUIZ_RESULTS_EVENT, QUIZ_STARTED_EVENT, type QuizResults } from "@/lib/rivet/quiz";

const DISMISS_KEY = "rivet:nudge-dismissed";

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Floating AI companion for lesson pages: an animated Rivet launcher that
 * nudges once per session, then opens the chat panel. Mount once inside
 * LessonLayout.
 */
export function RivetCompanion({
  context: baseContext,
  quizActive = false,
  quizPending = false,
}: {
  context: RivetContext;
  /** A quiz is in progress: Rivet hides so it can't hand out answers. */
  quizActive?: boolean;
  /** The lesson is a one-shot final quiz that has not been submitted yet. */
  quizPending?: boolean;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [typed, setTyped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const [quiz, setQuiz] = useState<QuizResults | null>(null);
  const context: RivetContext = { ...baseContext, quiz };
  const hidden = quizActive || (quizPending && !quiz);

  // Quiz lifecycle: forget old results when a quiz (re)starts, remember them once it is submitted.
  useEffect(() => {
    setQuiz(null);
    const onStart = () => {
      setQuiz(null);
      addDivider(baseContext.lessonKey, "New quiz attempt");
    };
    const onResults = (e: Event) => {
      const results = (e as CustomEvent<QuizResults>).detail;
      setQuiz(results);
      setTyped(true);
      setNudge(true);
    };
    window.addEventListener(QUIZ_STARTED_EVENT, onStart);
    window.addEventListener(QUIZ_RESULTS_EVENT, onResults);
    return () => {
      window.removeEventListener(QUIZ_STARTED_EVENT, onStart);
      window.removeEventListener(QUIZ_RESULTS_EVENT, onResults);
    };
  }, [baseContext.lessonKey]);

  // Hand keyboard focus back to the launcher when the panel closes.
  useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Close the panel if a quiz begins while it is open.
  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  // Show the nudge after a pause, once per session, and let it fade on its own.
  useEffect(() => {
    setNudge(false);
    setTyped(false);
    if (readDismissed()) return;
    const show = window.setTimeout(() => setNudge(true), 6000);
    const type = window.setTimeout(() => setTyped(true), 7000);
    const hide = window.setTimeout(() => setNudge(false), 22000);
    return () => [show, type, hide].forEach(window.clearTimeout);
  }, [context.lessonTitle]);

  const dismiss = () => {
    setNudge(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode: the nudge just returns on the next lesson */
    }
  };

  const showNudge = nudge && !open && !hidden;
  const shortTitle = context.lessonTitle.replace(/[?!.:\s]+$/, "");

  return (
    <MotionConfig reducedMotion="user">
      {/* No exit animation here: a nested AnimatePresence (the nudge) would keep this node mounted and Rivet visible during a quiz. */}
      {!open && !hidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-50 flex flex-row items-end gap-2.5 lg:flex-col lg:gap-3"
        >
          <AnimatePresence>
            {showNudge && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                className="relative w-[min(16rem,calc(100vw-8rem))] rounded-2xl lg:w-[17rem] border border-primary/25 bg-card px-3.5 pb-3 pt-2.5 shadow-[0_12px_32px_-12px_color-mix(in_oklab,var(--mint)_55%,transparent)]"
              >
                {/* Phones: bubble sits left of Rivet, tail points right. Desktop: bubble sits above, tail points down. */}
                <span className="absolute -right-[7px] bottom-6 h-3.5 w-3.5 rotate-45 rounded-tr-[3px] border-r border-t border-primary/25 bg-card lg:-bottom-[7px] lg:right-6 lg:rounded-br-[3px] lg:rounded-tr-none lg:border-b lg:border-r lg:border-t-0" />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Rivet
                  </span>
                  <button
                    onClick={dismiss}
                    className="-mr-1 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                <button
                  onClick={() => setOpen(true)}
                  className="group mt-1.5 block w-full cursor-pointer text-left"
                >
                  {typed ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p className="line-clamp-2 text-[13px] leading-snug">
                        {quiz ? (
                          quiz.score === quiz.total ? (
                            <>
                              Perfect{" "}
                              <span className="font-semibold">
                                {quiz.score}/{quiz.total}
                              </span>
                              ! Want a tougher one?
                            </>
                          ) : (
                            <>
                              You got{" "}
                              <span className="font-semibold">
                                {quiz.score} of {quiz.total}
                              </span>
                              . Want to go through the {quiz.total - quiz.score} you missed?
                            </>
                          )
                        ) : (
                          <>
                            Hey, stuck on <span className="font-semibold">{shortTitle}</span>? I've
                            read this lesson with you.
                          </>
                        )}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                        {quiz ? "Review together" : "Ask me"}
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </motion.div>
                  ) : (
                    <div className="flex h-[3.1rem] items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => {
              dismiss();
              setOpen(true);
            }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Ask Rivet"
            className="group relative flex cursor-pointer items-center gap-2 rounded-full border bg-card/90 p-1.5 shadow-lg backdrop-blur transition-[padding] hover:pr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showNudge && !reduce && (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full border border-mint"
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <RivetOrb size={50} state={hovered ? "speaking" : "idle"} follow />
            <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 group-hover:max-w-24 sm:block">
              Ask Rivet
            </span>
          </motion.button>
        </motion.div>
      )}
      <AnimatePresence>
        {open && <RivetPanel context={context} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </MotionConfig>
  );
}
