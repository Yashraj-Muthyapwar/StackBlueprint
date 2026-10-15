import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { RivetOrb } from "./RivetOrb";
import { RivetPanel, type RivetContext } from "./RivetPanel";
import { addDivider } from "@/lib/rivet/history";
import { QUIZ_RESULTS_EVENT, QUIZ_STARTED_EVENT, type QuizResults } from "@/lib/rivet/quiz";

const NUDGE_DELAY_MS = 4000;
const MAX_TOPIC_CHARS = 40;

/**
 * Bubble wording for a lesson. Pattern lessons are titled "Module: Lesson", so
 * the part after the colon is enough. A title that is already a question is
 * used as the headline itself. Anything still long becomes "this lesson"
 * rather than being cut off mid-sentence.
 */
const QUESTION_START = /^(what|why|how|when|where|which|who|is|are|can|do|does|should)\b/i;

function bubbleCopy(title: string): { headline: string; detail: string } {
  const clean = title.replace(/[!.:\s]+$/, "").trim();
  const topic = (clean.includes(": ") ? clean.slice(clean.indexOf(": ") + 2) : clean).trim();
  const fits = topic.length > 0 && topic.length <= MAX_TOPIC_CHARS;
  if (fits && (topic.endsWith("?") || QUESTION_START.test(topic)))
    return {
      headline: topic.endsWith("?") ? topic : `${topic}?`,
      detail: "Stuck? I've read this lesson with you.",
    };
  return {
    headline: fits ? `Stuck on ${topic.replace(/\?+$/, "")}?` : "Stuck on this lesson?",
    detail: "I've read this lesson with you.",
  };
}
const NUDGE_VISIBLE_MS = 25000;

/**
 * Floating AI companion for lesson pages: an animated Rivet launcher that
 * nudges a few seconds into every lesson visit, then opens the chat panel.
 * Mount once inside LessonLayout.
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
  const [quizRunning, setQuizRunning] = useState(false);
  const hidden = quizActive || quizRunning || (quizPending && !quiz);

  // Quiz lifecycle: forget old results when a quiz (re)starts, remember them once it is submitted.
  useEffect(() => {
    setQuiz(null);
    // Pages without a quiz-aware layout rely on these events alone to know when to hide.
    setQuizRunning(false);
    const onStart = () => {
      setQuizRunning(true);
      setQuiz(null);
      addDivider(baseContext.lessonKey, "New quiz attempt");
    };
    const onResults = (e: Event) => {
      const results = (e as CustomEvent<QuizResults>).detail;
      setQuizRunning(false);
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
    const frame =
      wasOpen.current && !open && !hidden
        ? window.requestAnimationFrame(() => launcherRef.current?.focus())
        : undefined;
    wasOpen.current = open;
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [open, hidden]);

  // Close the panel if a quiz begins while it is open.
  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  // Every lesson visit: show the nudge after a short pause and let it fade on its own.
  // Closing it or opening Rivet only affects this visit, so the next lesson nudges again.
  const lessonKey = baseContext.lessonKey;
  useEffect(() => {
    setNudge(false);
    setTyped(false);
    const show = window.setTimeout(() => setNudge(true), NUDGE_DELAY_MS);
    const type = window.setTimeout(() => setTyped(true), NUDGE_DELAY_MS + 1000);
    const hide = window.setTimeout(() => setNudge(false), NUDGE_DELAY_MS + NUDGE_VISIBLE_MS);
    return () => [show, type, hide].forEach(window.clearTimeout);
  }, [lessonKey]);

  const dismiss = () => setNudge(false);

  const openPanel = () => {
    setNudge(false);
    setOpen(true);
  };

  const showNudge = nudge && !open && !hidden;
  const copy = bubbleCopy(context.lessonTitle);

  if (import.meta.env.VITE_RIVET_ENABLED === "false") return null;

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
                  onClick={openPanel}
                  className="group mt-1.5 block w-full cursor-pointer text-left"
                >
                  {typed ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p className="text-[13.5px] font-semibold leading-snug">
                        {quiz
                          ? quiz.score === quiz.total
                            ? `Perfect ${quiz.score}/${quiz.total}!`
                            : `You got ${quiz.score} of ${quiz.total}.`
                          : copy.headline}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                        {quiz
                          ? quiz.score === quiz.total
                            ? "Want a tougher one?"
                            : `Want to go through the ${quiz.total - quiz.score} you missed?`
                          : copy.detail}
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
            ref={launcherRef}
            onClick={openPanel}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Ask Rivet"
            className="group relative flex cursor-pointer items-center gap-1 rounded-full border border-primary/20 bg-card/90 p-1 shadow-lg backdrop-blur transition-[padding] hover:pr-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showNudge && !reduce && (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full border border-mint"
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            {/* The artwork sits low in its box (hat at the top, shadow at the bottom), so a
                fixed round well with a slight lift keeps the hat clear of the rim while it floats. */}
            <span
              className="grid h-14 w-14 shrink-0 place-items-center overflow-visible rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 35%, color-mix(in oklab, var(--mint) 24%, var(--card)), color-mix(in oklab, var(--mint) 9%, var(--card)) 70%)",
              }}
            >
              <span className="-translate-y-[3px]">
                <RivetOrb size={48} state={hovered ? "speaking" : "idle"} follow />
              </span>
            </span>
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
