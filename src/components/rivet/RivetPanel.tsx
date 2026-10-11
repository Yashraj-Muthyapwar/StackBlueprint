import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import {
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
  updateMessage,
  useRivetThread,
} from "@/lib/rivet/history";
import { streamReply } from "@/lib/rivet/chat";
import { RivetError, isAbort, type RivetErrorKind } from "@/lib/rivet/providers/errors";
import { resolveActive, useRivetSettings } from "@/lib/rivet/settings";

export interface RivetContext {
  /** Stable id of the lesson (its path), used to keep one conversation per lesson. */
  lessonKey: string;
  trackTitle: string;
  topicTitle: string;
  lessonTitle: string;
  /** Plain text of the lesson, sent to the model as grounding. */
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

export function RivetPanel({ context, onClose }: { context: RivetContext; onClose: () => void }) {
  const [view, setView] = useState<"chat" | "settings">("chat");
  const messages = useRivetThread(context.lessonKey);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<RivetState>("idle");
  const abortRef = useRef<AbortController | null>(null);
  const [error, setError] = useState<{ kind: RivetErrorKind; message: string } | null>(null);
  const settings = useRivetSettings();
  const active = resolveActive(settings);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = state !== "idle";
  const keyboardStyle = useKeyboardAwareStyle();
  const [announce, setAnnounce] = useState("");
  const quiz = context.quiz;
  const missed = quiz?.items.filter((i) => !i.correct) ?? [];
  const actions = quiz ? REVIEW_ACTIONS : QUICK_ACTIONS;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Stop any in-flight reply when the panel unmounts (not on every parent re-render).
  useEffect(() => () => abortRef.current?.abort(), []);

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
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setAnnounce("Rivet is thinking");
    setState("thinking");
    let replyId: number | null = null;
    let text = "";
    try {
      for await (const token of streamReply(key, context, controller.signal)) {
        if (replyId === null) {
          replyId = appendMessage(key, "rivet", "");
          setState("speaking");
        }
        text += token;
        updateMessage(key, replyId, text);
      }
      if (!text.trim())
        throw new RivetError(
          "empty",
          "Rivet got an empty answer from the model. Try again, or pick another model.",
        );
    } catch (e) {
      setAnnounce("");
      if (replyId !== null && !text.trim()) removeMessage(key, replyId);
      if (!isAbort(e)) {
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
      if (abortRef.current === controller) abortRef.current = null;
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
        <RivetOrb size={46} state={state} follow className="relative" />
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
                clearThread(context.lessonKey);
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
                className="flex min-h-full flex-col items-center justify-center text-center"
              >
                <RivetOrb size={84} state={state} follow />
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {!quiz
                    ? "Stuck? Let's rivet it down."
                    : missed.length === 0
                      ? "Flawless run. Nicely done."
                      : "Quiz done. Let's learn from it."}
                </h3>
                <p className="mt-1 max-w-[19rem] text-[13px] leading-snug text-muted-foreground">
                  {!quiz
                    ? "Ask me anything about this lesson. I'll nudge you toward the answer first."
                    : missed.length === 0
                      ? "Want to go deeper, or hear why each answer works?"
                      : `${missed.length} to revisit. I've got the lesson and your answers, so we can go through them together.`}
                </p>
                {quiz ? (
                  <div className="mt-3 w-full rounded-lg border bg-card px-3 py-2 text-left shadow-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{context.lessonTitle}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {context.trackTitle} · {context.topicTitle}
                        </p>
                      </div>
                      {quiz && (
                        <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-primary">
                          {quiz.score}/{quiz.total}
                        </span>
                      )}
                    </div>
                    {quiz && (
                      <ul className="mt-1.5 space-y-0.5 border-t pt-1.5">
                        {quiz.items.slice(0, 3).map((it, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground"
                          >
                            {it.correct ? (
                              <CheckCircle2 className="mt-px h-3 w-3 shrink-0 text-mint" />
                            ) : (
                              <XCircle className="mt-px h-3 w-3 shrink-0 text-rose" />
                            )}
                            <span className="line-clamp-1">{it.question.replace(/`/g, "")}</span>
                          </li>
                        ))}
                        {quiz.items.length > 3 && (
                          <li className="pl-[18px] text-[11px] text-muted-foreground">
                            +{quiz.items.length - 3} more
                          </li>
                        )}
                      </ul>
                    )}
                    <p className="mt-1.5 flex items-center gap-1.5 border-t pt-1.5 text-[10px] text-muted-foreground">
                      <ClipboardCheck className="h-3 w-3 text-primary" />
                      {quiz
                        ? "Rivet can see this lesson and your quiz results"
                        : "Rivet can see this lesson"}
                    </p>
                  </div>
                ) : (
                  <div
                    className="mt-3 flex max-w-full items-center gap-1.5 rounded-full border bg-card/80 py-1 pl-2.5 pr-3 text-xs shadow-sm"
                    title="Rivet reads this lesson so its answers fit what you are learning"
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="shrink-0 text-muted-foreground">Reading with you:</span>
                    <span className="truncate font-medium">{context.lessonTitle}</span>
                  </div>
                )}
                <p className="mb-2 mt-5 w-full text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {quiz ? "Review together" : "Try asking"}
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
                          <span className="block text-xs font-medium leading-tight">{label}</span>
                          <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                            {hint}
                          </span>
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </div>
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
                          <RivetMarkdown
                            text={m.text}
                            onNavigate={() => {
                              // On phones the panel covers the page, so close it to show the lesson.
                              if (window.matchMedia("(max-width: 639px)").matches) onClose();
                            }}
                          />
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
                className="mb-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-left text-xs transition-colors hover:bg-amber/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plug className="h-4 w-4 shrink-0 text-amber" />
                <span>
                  <span className="font-medium">Connect a free model to start chatting.</span>{" "}
                  <span className="text-muted-foreground">
                    Gemini, Groq, NVIDIA or OpenRouter, about a minute.
                  </span>
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
                placeholder="Ask Rivet about this lesson…"
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
