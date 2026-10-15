import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  Settings2,
  Square,
  X,
  Trash2,
  Baby,
  Code2,
  HelpCircle,
  Lightbulb,
  ClipboardCheck,
  Search,
  Repeat2,
  BookMarked,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RivetOrb, type RivetState } from "./RivetOrb";
import { RivetSettings } from "./RivetSettings";
import { RivetMarkdown } from "./RivetMarkdown";
import type { QuizResults } from "@/lib/rivet/quiz";
import {
  appendMessage,
  clearThread,
  removeMessage,
  threadVersion,
  updateMessage,
  useRivetThread,
  useHistoryStorageError,
  type ChatMessage,
} from "@/lib/rivet/history";
import { streamReply } from "@/lib/rivet/chat";
import { RivetError, isAbort, type RivetErrorKind } from "@/lib/rivet/providers/errors";
import { markModelWorking, resolveActive, useRivetSettings } from "@/lib/rivet/settings";

/** How often streamed text is pushed to the UI and history (instead of on every token). */
const RENDER_INTERVAL_MS = 60;

export interface RivetContext {
  /** Stable id of the lesson (its path), used to keep one conversation per lesson. */
  lessonKey: string;
  trackTitle: string;
  topicTitle: string;
  lessonTitle: string;
  /** Raw lesson sections; Rivet picks the parts relevant to each question. */
  lessonSections?: unknown[];
  /** Plain text of the lesson, for pages without sections. */
  lessonText?: string;
  /** Present once the learner has submitted this lesson's quiz. */
  quiz?: QuizResults | null;
}

interface QuickAction {
  label: string;
  /** What is actually sent when the label is too short to be a good question. */
  prompt?: string;
  hint: string;
  icon: LucideIcon;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Explain simpler", hint: "Plain words, no jargon", icon: Baby },
  { label: "Give an example", hint: "See it in a real case", icon: Code2 },
  { label: "Quiz me", hint: "Check what stuck", icon: HelpCircle },
  {
    label: "Why it matters",
    prompt: "Why does this matter?",
    hint: "Where you'll use it",
    icon: Lightbulb,
  },
];

const REVIEW_ACTIONS: QuickAction[] = [
  { label: "Walk me through my mistakes", hint: "One question at a time", icon: Search },
  { label: "Why was I wrong?", hint: "Spot the gap in my thinking", icon: HelpCircle },
  { label: "What should I re-read?", hint: "Jump back to the right part", icon: BookMarked },
  { label: "Give me a similar question", hint: "Practice what I missed", icon: Repeat2 },
];

const TAGLINE = "Your blueprint buddy, stack by stack";

function Tagline({ state }: { state: RivetState }) {
  const text =
    state === "thinking"
      ? "Drafting your answer…"
      : state === "speaking"
        ? "Walking you through it…"
        : TAGLINE;
  return (
    // Keyed span with a CSS fade. A nested AnimatePresence here would keep the panel mounted after it closes.
    <span
      key={text}
      className="block animate-in fade-in slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
    >
      {text}
    </span>
  );
}

/**
 * On phones the on-screen keyboard overlays the page without resizing it, which
 * would hide a bottom-anchored composer. Track the visual viewport and lift the
 * panel above the keyboard (and shrink it to the visible area) while it is open.
 */
function useKeyboardAwareStyle(): React.CSSProperties | undefined {
  const [style, setStyle] = useState<React.CSSProperties>();
  useEffect(() => {
    const vv = window.visualViewport;
    const phone = window.matchMedia("(max-width: 639px)");
    if (!vv) return;
    const update = () => {
      const lift = Math.round(window.innerHeight - vv.height - vv.offsetTop);
      setStyle(
        phone.matches && lift > 80
          ? { bottom: lift, height: Math.min(window.innerHeight * 0.85, vv.height - 12) }
          : undefined,
      );
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);
  return style;
}

/** Quiz score as a small progress ring: mint when strong, amber in the middle, rose when low. */
function ScoreRing({ score, total }: { score: number; total: number }) {
  const ratio = total > 0 ? score / total : 0;
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const tone = ratio >= 0.8 ? "var(--mint)" : ratio >= 0.5 ? "var(--amber)" : "var(--rose)";
  return (
    <div
      className="relative grid h-12 w-12 shrink-0 place-items-center"
      role="img"
      aria-label={`Score ${score} of ${total}`}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="4" className="stroke-muted" />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ stroke: tone }}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - ratio) }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        />
      </svg>
      <span className="font-mono text-[13px] font-semibold tabular-nums">
        {score}/{total}
      </span>
    </div>
  );
}

export function RivetPanel({ context, onClose }: { context: RivetContext; onClose: () => void }) {
  const [view, setView] = useState<"chat" | "settings">("chat");
  const messages = useRivetThread(context.lessonKey);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<RivetState>("idle");
  const abortRef = useRef<AbortController | null>(null);
  const requestThread = useRef<{ key: string; version: number } | null>(null);
  const [error, setError] = useState<{ kind: RivetErrorKind; message: string } | null>(null);
  const settings = useRivetSettings();
  const historyStorageError = useHistoryStorageError();
  const active = resolveActive(settings);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = state !== "idle";
  const keyboardStyle = useKeyboardAwareStyle();
  const [announce, setAnnounce] = useState("");
  const quiz = context.quiz;
  const missed = quiz?.items.filter((i) => !i.correct) ?? [];
  const actions = quiz ? REVIEW_ACTIONS : QUICK_ACTIONS;
  /** The empty, non-quiz chat screen already shows a large Rivet. */
  const bigRivetShown = view === "chat" && messages.length === 0 && !quiz;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // Escape inside an open dropdown (the model picker) closes only the dropdown.
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (document.querySelector("[data-radix-popper-content-wrapper]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Stop any in-flight reply when the panel unmounts (not on every parent re-render).
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    const request = requestThread.current;
    if (
      request &&
      (request.key !== context.lessonKey || threadVersion(request.key) !== request.version)
    )
      abortRef.current?.abort();
  }, [messages, context.lessonKey]);

  const opened = useRef(false);
  useEffect(() => {
    if (messages.length === 0) return;
    endRef.current?.scrollIntoView({ behavior: opened.current ? "smooth" : "auto", block: "end" });
    opened.current = true;
  }, [messages, state]);

  // Grow the composer with its text (up to its max height).
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const stop = () => abortRef.current?.abort();

  /** Streams a reply to the latest message in this lesson's thread. */
  const run = async () => {
    const key = context.lessonKey;
    const version = threadVersion(key);
    const used = active;
    const controller = new AbortController();
    abortRef.current = controller;
    requestThread.current = { key, version };
    setError(null);
    setAnnounce("Rivet is thinking");
    setState("thinking");
    let replyId: number | null = null;
    let text = "";
    let finish: string | null = null;
    let flushTimer: number | undefined;
    // The thread was cleared mid-reply: drop the rest instead of recreating it.
    const stale = () => threadVersion(key) !== version;
    const flush = (status?: ChatMessage["status"]) => {
      window.clearTimeout(flushTimer);
      flushTimer = undefined;
      if (replyId !== null && !stale()) updateMessage(key, replyId, text, status);
    };
    try {
      for await (const part of streamReply(key, context, controller.signal)) {
        if (stale()) break;
        if ("finish" in part) {
          finish = part.finish;
          continue;
        }
        if (replyId === null) {
          replyId = appendMessage(key, "rivet", "");
          setState("speaking");
          setAnnounce("Rivet is replying");
        }
        text += part.text;
        flushTimer ??= window.setTimeout(() => flush(), RENDER_INTERVAL_MS);
      }
      if (stale()) return;
      if (!text.trim())
        throw new RivetError(
          "empty",
          finish === "filtered"
            ? "The provider withheld this answer. Try rephrasing your question."
            : "Rivet got an empty answer from the model. Try again, or pick another model.",
        );
      flush(finish === "length" ? "truncated" : undefined);
      if (used) markModelWorking(used.provider.id, used.config.model, used.keyRevision);
      setAnnounce(
        finish === "length"
          ? "Rivet finished replying. The reply was cut short at the length limit."
          : finish === "filtered"
            ? "Rivet finished replying. The provider withheld part of the answer."
            : "Rivet finished replying.",
      );
    } catch (e) {
      window.clearTimeout(flushTimer);
      if (!stale() && replyId !== null) {
        // Keep a partial reply, clearly marked, and leave it out of what is resent to the model.
        if (text.trim()) updateMessage(key, replyId, text, "interrupted");
        else removeMessage(key, replyId);
      }
      if (isAbort(e)) {
        setAnnounce("Reply stopped.");
      } else {
        setAnnounce("");
        setError(
          e instanceof RivetError
            ? { kind: e.kind, message: e.message }
            : {
                kind: "server",
                message: "Something went wrong while talking to the model. Try again.",
              },
        );
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        requestThread.current = null;
      }
      setState("idle");
    }
  };

  const send = (text: string) => {
    const prompt = text.trim();
    if (!prompt || busy || abortRef.current) return; // the ref also blocks a second send in the same tick
    if (!active) {
      setView("settings");
      return;
    }
    appendMessage(context.lessonKey, "user", prompt);
    setDraft("");
    void run();
  };

  return (
    <motion.section
      role="dialog"
      aria-label="Rivet, your learning companion"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      style={keyboardStyle}
      className="fixed inset-x-0 bottom-0 z-[60] flex h-[85dvh] origin-bottom-right flex-col overflow-hidden rounded-t-2xl border bg-card shadow-2xl sm:inset-x-auto sm:bottom-4 sm:right-4 sm:h-[min(660px,calc(100dvh-7rem))] sm:w-[400px] sm:rounded-2xl"
    >
      <div role="status" aria-live="polite" className="sr-only">
        {announce}
      </div>
      <header className="relative flex items-center gap-3 border-b px-4 py-3">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(120deg, color-mix(in oklab, var(--mint) 14%, transparent), transparent 55%, color-mix(in oklab, var(--violet) 12%, transparent))",
          }}
        />
        {/* The start screen shows a big Rivet, so the header one steps aside until chatting begins. */}
        <motion.div
          className="relative shrink-0 overflow-visible"
          initial={false}
          animate={
            bigRivetShown
              ? { width: 0, opacity: 0, scale: 0.6, marginRight: -12 }
              : { width: 46, opacity: 1, scale: 1, marginRight: 0 }
          }
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          aria-hidden
        >
          <RivetOrb size={46} state={state} follow />
        </motion.div>
        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold leading-none">Rivet</h2>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                active ? "bg-mint/15 text-mint" : "bg-amber/15 text-amber",
              )}
            >
              {active ? active.provider.name.replace("Google ", "") : "Not connected"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            <Tagline state={state} />
          </p>
        </div>
        <div className="relative flex items-center gap-0.5">
          {messages.length > 0 && view === "chat" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                stop();
                setError(null);
                void clearThread(context.lessonKey);
              }}
              aria-label="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", view === "settings" && "bg-accent")}
            onClick={() => setView(view === "chat" ? "settings" : "chat")}
            aria-label="Provider settings"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close Rivet"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {historyStorageError && view === "chat" && (
        <p role="alert" className="border-b px-4 py-2 text-xs text-destructive">
          {historyStorageError}
        </p>
      )}

      {view === "settings" ? (
        <RivetSettings onDone={() => setView("chat")} />
      ) : (
        <>
          <div
            role="log"
            aria-label="Conversation with Rivet"
            aria-live="off"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in oklab, var(--foreground) 9%, transparent) 1px, transparent 1.2px)",
              backgroundSize: "18px 18px",
            }}
          >
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex min-h-full flex-col",
                  quiz ? "justify-center gap-3" : "items-center justify-center text-center",
                )}
              >
                {quiz ? (
                  // Quiz review: a compact header so the results and actions fit without scrolling.
                  <>
                    <div className="flex items-center gap-3">
                      {/* The header already shows Rivet, so the score takes this spot. */}
                      <ScoreRing score={quiz.score} total={quiz.total} />
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold leading-tight tracking-tight">
                          {missed.length === 0
                            ? "Flawless run. Nicely done."
                            : "Quiz done. Let's learn from it."}
                        </h3>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                          {missed.length === 0
                            ? "Want to go deeper, or hear why each answer works?"
                            : `${missed.length} to revisit. I have the lesson and your answers.`}
                        </p>
                      </div>
                    </div>
                    <div className="w-full rounded-lg border bg-card px-3 py-2 text-left shadow-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <p className="min-w-0 flex-1 truncate text-xs font-medium">
                          {context.lessonTitle}
                        </p>
                      </div>
                      {(() => {
                        // Missed questions first: they are what the review is about.
                        const ordered = [...missed, ...quiz.items.filter((i) => i.correct)];
                        const shown = ordered.slice(
                          0,
                          missed.length > 0 ? Math.min(missed.length, 3) : 2,
                        );
                        const rest = quiz.items.length - shown.length;
                        return (
                          <ul className="mt-1.5 space-y-0.5 border-t pt-1.5">
                            {shown.map((it, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground"
                              >
                                {it.correct ? (
                                  <CheckCircle2 className="mt-px h-3 w-3 shrink-0 text-mint" />
                                ) : (
                                  <XCircle className="mt-px h-3 w-3 shrink-0 text-rose" />
                                )}
                                <span className="line-clamp-1">
                                  {it.question.replace(/`/g, "")}
                                </span>
                              </li>
                            ))}
                            {rest > 0 && (
                              <li className="pl-[18px] text-[11px] text-muted-foreground">
                                +{rest} {missed.length > 0 ? "answered correctly" : "more"}
                              </li>
                            )}
                          </ul>
                        );
                      })()}
                    </div>
                    <div>
                      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Review together
                      </p>
                      <div className="grid w-full grid-cols-2 gap-2">
                        {actions.map(({ label, prompt, hint, icon: Icon }, i) => (
                          <motion.button
                            key={label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            onClick={() => send(prompt ?? label)}
                            title={hint}
                            aria-description={hint}
                            className="group flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-2.5 py-2 text-left shadow-sm transition-colors hover:border-primary/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary transition-transform group-hover:scale-110">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-xs font-medium leading-tight">{label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <ClipboardCheck className="h-3 w-3 text-primary" />
                      Rivet sees this lesson's text and code, and your quiz results
                    </p>
                  </>
                ) : (
                  <>
                    <RivetOrb size={84} state={state} follow />
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">
                      Stuck? Let's rivet it down.
                    </h3>
                    <p className="mt-1 max-w-[19rem] text-[13px] leading-snug text-muted-foreground">
                      Ask about this course, a relevant example, or where to learn next. I'll nudge
                      you toward the answer first.
                    </p>
                    <div
                      className="mt-3 flex max-w-full items-center gap-1.5 rounded-full border bg-card/80 py-1 pl-2.5 pr-3 text-xs shadow-sm"
                      title="Rivet reads this lesson's text and examples, not your code editor"
                    >
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="shrink-0 text-muted-foreground">Reading with you:</span>
                      <span className="truncate font-medium">{context.lessonTitle}</span>
                    </div>
                    <p className="mb-2 mt-5 w-full text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Try asking
                    </p>
                    <div className="grid w-full grid-cols-2 gap-2.5">
                      {actions.map(({ label, prompt, hint, icon: Icon }, i) => (
                        <motion.button
                          key={label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + i * 0.06 }}
                          whileHover={{ y: -2 }}
                          onClick={() => send(prompt ?? label)}
                          className="group cursor-pointer rounded-lg border bg-card px-2.5 py-2 text-left shadow-sm transition-colors hover:border-primary/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="flex items-start gap-2">
                            <span className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary transition-transform group-hover:scale-110">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-medium leading-tight">
                                {label}
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                                {hint}
                              </span>
                            </span>
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <>
                {messages.map((m) =>
                  m.role === "divider" ? (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      <span className="h-px flex-1 bg-hairline" />
                      {m.text}
                      <span className="h-px flex-1 bg-hairline" />
                    </div>
                  ) : (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex gap-2", m.role === "user" && "justify-end")}
                    >
                      {m.role === "rivet" && <RivetOrb size={26} still className="mt-0.5" />}
                      <div
                        className={cn(
                          "min-w-0 max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed [overflow-wrap:anywhere]",
                          m.role === "user"
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md border bg-surface",
                        )}
                      >
                        <span className="sr-only">
                          {m.role === "user" ? "You said: " : "Rivet said: "}
                        </span>
                        {m.role === "rivet" ? (
                          <>
                            <RivetMarkdown
                              text={m.text}
                              onNavigate={() => {
                                // On phones the panel covers the page, so close it to show the lesson.
                                if (window.matchMedia("(max-width: 639px)").matches) onClose();
                              }}
                            />
                            {m.status && (
                              <p className="mt-1.5 border-t pt-1 text-[11px] text-muted-foreground">
                                {m.status === "truncated"
                                  ? "Cut short at the length limit. Ask Rivet to continue."
                                  : "Interrupted before it finished. Not used as context for later answers."}
                              </p>
                            )}
                          </>
                        ) : (
                          m.text
                        )}
                      </div>
                    </motion.div>
                  ),
                )}
                {state === "thinking" && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <RivetOrb size={26} still className="mt-0.5" />
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border bg-surface px-3.5 py-3">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
            {error && messages.length > 0 && (
              <div className="flex gap-2" role="alert">
                <AlertCircle className="mt-0.5 h-[26px] w-[18px] shrink-0 text-destructive" />
                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm leading-snug">
                  <p>{error.message}</p>
                  <div className="mt-2 flex gap-2">
                    {error.kind !== "notconfigured" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => void run()}
                        disabled={busy}
                      >
                        <RotateCcw className="h-3 w-3" /> Try again
                      </Button>
                    )}
                    {["auth", "network", "model", "notconfigured"].includes(error.kind) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setView("settings")}
                      >
                        Open settings
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Scroll anchor. Only rendered once chatting: otherwise its spacing makes the empty state scroll. */}
            {messages.length > 0 && <div ref={endRef} />}
          </div>

          <div className="border-t bg-card px-3 pb-3 pt-2.5">
            {!active && (
              <button
                onClick={() => setView("settings")}
                className="group mb-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3 py-1.5 text-left text-xs transition-colors hover:bg-amber/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plug className="h-3.5 w-3.5 shrink-0 text-amber" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  Connect a model to start chatting
                </span>
                <span className="flex shrink-0 items-center gap-0.5 text-muted-foreground group-hover:text-foreground">
                  Set up <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            )}
            {messages.length > 0 && (
              <div
                className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]"
                style={{ maskImage: "linear-gradient(to right, black 88%, transparent)" }}
              >
                {actions.map(({ label, prompt }) => (
                  <button
                    key={label}
                    disabled={busy}
                    onClick={() => send(prompt ?? label)}
                    className={cn(
                      badgeVariants({ variant: "outline" }),
                      "shrink-0 cursor-pointer whitespace-nowrap py-1 font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
              className="flex items-end gap-2 rounded-xl border bg-surface px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Message Rivet"
                maxLength={4000}
                onKeyDown={(e) => {
                  // isComposing: Enter confirms an IME candidate (Chinese, Japanese, Korean), it must not send.
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                placeholder="Ask Rivet about this course…"
                className="max-h-28 min-h-8 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
              />
              {busy ? (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-lg"
                  onClick={stop}
                  aria-label="Stop"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={!draft.trim()}
                  aria-label="Send"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              {active ? <span className="font-mono">{active.config.model}</span> : null}
              {active ? " · " : ""}Rivet can be wrong. Check important details against the lesson.
            </p>
          </div>
        </>
      )}
    </motion.section>
  );
}
