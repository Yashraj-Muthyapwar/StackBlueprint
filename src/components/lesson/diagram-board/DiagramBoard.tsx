import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Boxes,
  Check,
  Info,
  ChevronDown,
  Eraser,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
  Wand2,
} from "lucide-react";

import { ClientOnly } from "@/components/lesson/ClientOnly";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ComponentPalette } from "./ComponentPalette";
import type { BoardController } from "./ExcalidrawCanvas";
import { BOARDS, evaluateRules, type DiagramGraph } from "./rules";

/*
 * Global whiteboard for system design lessons. A lesson references a board by id; the board's
 * prompt, starter shapes, example answer and pass rules live in ./rules.ts. Passing is optional:
 * the checklist ticks as the drawing grows and a badge appears once every rule is met. The
 * drawing and the badge are remembered in this browser only.
 */

// Excalidraw is large, so it loads on demand and only in the browser.
const ExcalidrawCanvas = lazy(() => import("./ExcalidrawCanvas"));

const STROKES = ["#1e1e1e", "#e03131", "#2f9e44", "#1971c2", "#f08c00"];
const FILLS = ["transparent", "#ffc9c9", "#b2f2bb", "#a5d8ff", "#ffec99"];

const tipKey = "sb-diagram-tip:v1";

const passedKey = (id: string) => `sb-diagram-passed:v1:${id}`;

function useSiteTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export function DiagramBoard({ boardId }: { boardId: string }) {
  const board = BOARDS[boardId];
  const theme = useSiteTheme();
  const [graph, setGraph] = useState<DiagramGraph>({ nodes: [], edges: [] });
  const [controller, setController] = useState<BoardController | null>(null);
  const [everPassed, setEverPassed] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [tipOpen, setTipOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [stroke, setStroke] = useState(STROKES[0]);
  const [fill, setFill] = useState(FILLS[0]);

  useEffect(() => {
    try {
      setEverPassed(window.localStorage.getItem(passedKey(boardId)) === "1");
    } catch {
      /* storage unavailable */
    }
  }, [boardId]);

  // First visit in this browser: ask learners to build with our components. Reopen it any time.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(tipKey) !== "1") setTipOpen(true);
    } catch {
      setTipOpen(true);
    }
  }, []);

  const closeTip = useCallback(() => {
    setTipOpen(false);
    try {
      window.localStorage.setItem(tipKey, "1");
    } catch {
      /* storage unavailable: the tip may show again next visit */
    }
  }, []);

  useEffect(() => {
    if (!tipOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeTip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tipOpen, closeTip]);

  const results = useMemo(() => (board ? evaluateRules(board.rules, graph) : []), [board, graph]);
  const passedNow = results.length > 0 && results.every((r) => r.done);

  useEffect(() => {
    if (!passedNow || everPassed) return;
    setEverPassed(true);
    try {
      window.localStorage.setItem(passedKey(boardId), "1");
    } catch {
      /* storage unavailable: the badge just is not remembered */
    }
  }, [passedNow, everPassed, boardId]);

  // Reset starts the exercise over, so it also clears the earned badge. Clear only empties the drawing.
  const resetBoard = useCallback(() => {
    controller?.load("starter");
    setEverPassed(false);
    try {
      window.localStorage.removeItem(passedKey(boardId));
    } catch {
      /* storage unavailable */
    }
  }, [controller, boardId]);

  const onReady = useCallback((c: BoardController) => setController(c), []);

  if (!board) return null;
  const done = results.filter((r) => r.done).length;

  return (
    <section
      aria-label={`Whiteboard exercise: ${board.title}`}
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      {/* Window chrome */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-rose-500/80" />
            <div className="size-2.5 rounded-full bg-amber-500/80" />
            <div className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-3.5 w-px shrink-0 bg-hairline" />
          <Sparkles className="size-3.5 shrink-0 text-mint" />
          <span className="font-mono text-[13px] font-semibold text-foreground">{board.file}</span>
          <span className="hidden min-w-0 truncate text-[13px] text-muted-foreground @min-[30rem]:inline">
            {board.title}
          </span>
        </div>
        {everPassed ? (
          <span className="flex items-center gap-1.5 rounded-full border border-mint/50 bg-mint/10 px-2.5 py-1 text-xs font-semibold text-mint">
            <Trophy className="size-3.5" />
            {passedNow ? "Passed" : "Passed earlier"}
          </span>
        ) : (
          <span className="rounded-full border border-hairline bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Optional practice
          </span>
        )}
      </div>

      <p className="border-b border-hairline px-4 py-3 text-sm leading-relaxed text-foreground/90 sm:px-5">
        {board.prompt}
      </p>

      {/* Goals: always visible above the canvas, and collapsible */}
      <div className="border-b border-hairline bg-surface/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-expanded={goalsOpen}
            onClick={() => setGoalsOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-mint/50"
          >
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                !goalsOpen && "-rotate-90",
              )}
            />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
              Goals
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {done} / {results.length}
            </span>
          </button>
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-mint transition-[width] duration-300"
              style={{ width: `${results.length ? (done / results.length) * 100 : 0}%` }}
            />
          </div>
          <span className="hidden text-xs text-muted-foreground @min-[40rem]:inline">
            {goalsOpen ? "Hide" : "Show"}
          </span>
        </div>

        {goalsOpen ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {results.map(({ rule, done: ok }) => (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  ok
                    ? "border-mint/50 bg-mint/10 text-foreground"
                    : "border-hairline bg-background text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full border",
                    ok ? "border-mint bg-mint text-background" : "border-muted-foreground/40",
                  )}
                >
                  {ok ? <Check className="size-2.5" strokeWidth={3} /> : null}
                </span>
                {rule.label}
              </li>
            ))}
          </ul>
        ) : null}

        {passedNow ? (
          <p className="mt-3 rounded-lg border border-mint/40 bg-mint/10 px-3 py-2 text-sm leading-snug text-foreground">
            {board.passNote}
          </p>
        ) : null}
      </div>

      {/* Colour picker: replaces Excalidraw's own properties panel, which covered the canvas */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-hairline bg-surface/30 px-4 py-2 sm:px-5">
        <button
          type="button"
          aria-expanded={paletteOpen}
          onClick={() => setPaletteOpen((o) => !o)}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            paletteOpen
              ? "border-mint/60 bg-mint/15 text-mint"
              : "border-hairline bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          <Boxes className="size-3.5" />
          Components
        </button>
        <button
          type="button"
          onClick={() => setTipOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-hairline bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Info className="size-3.5" />
          How it works
        </button>
        <Swatches
          label="Stroke"
          colors={STROKES}
          active={stroke}
          disabled={!controller}
          onPick={(c) => {
            setStroke(c);
            controller?.applyColor("stroke", c);
          }}
        />
        <Swatches
          label="Fill"
          colors={FILLS}
          active={fill}
          disabled={!controller}
          onPick={(c) => {
            setFill(c);
            controller?.applyColor("fill", c);
          }}
        />
      </div>

      {/* Full-width canvas */}
      <div ref={boardRef} className="relative h-[34rem] bg-background">
        <ClientOnly fallback={<BoardLoading />}>
          <Suspense fallback={<BoardLoading />}>
            <ExcalidrawCanvas board={board} theme={theme} onGraph={setGraph} onReady={onReady} />
          </Suspense>
        </ClientOnly>
        {paletteOpen ? (
          <div className="absolute bottom-16 left-3 top-16 z-10 w-52 max-w-[calc(100%-1.5rem)]">
            <ComponentPalette controller={controller} boardRef={boardRef} />
          </div>
        ) : null}
        {tipOpen ? (
          <div className="absolute inset-0 z-30 flex items-start justify-center bg-background/75 p-4 pt-6 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="diagram-tip-title"
              className="w-full max-w-md rounded-xl border border-mint/40 bg-card p-5 shadow-xl"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-mint/15 text-mint">
                  <Boxes className="size-4" />
                </span>
                <h3 id="diagram-tip-title" className="text-base font-semibold">
                  Build with our components
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>
                  Open the <strong className="text-foreground">Components</strong> panel and drag in
                  the ready-made pieces: User, Service, Database and the rest.
                </li>
                <li>
                  Each one is already named and shaped, so your diagram can be checked automatically
                  and fairly.
                </li>
                <li>Connect them by dragging from a shape's edge to draw an arrow.</li>
                <li>
                  You can draw your own shapes too, but only clearly named components are reliably
                  recognised.
                </li>
              </ul>
              <div className="mt-4 flex justify-start">
                <Button type="button" size="sm" onClick={closeTip} autoFocus>
                  Got it
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline bg-surface-2/30 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 px-2.5 text-xs"
            disabled={!controller}
            onClick={() => controller?.load("solution")}
          >
            <Wand2 className="size-3.5" /> Show example
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 px-2.5 text-xs"
            disabled={!controller}
            onClick={resetBoard}
          >
            <RotateCcw className="size-3.5" /> Reset
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 px-2.5 text-xs"
            disabled={!controller}
            onClick={() => controller?.load("blank")}
          >
            <Eraser className="size-3.5" /> Clear
          </Button>
        </div>
        <p className="flex min-w-0 flex-1 items-center gap-1.5 text-xs leading-snug text-muted-foreground">
          <Lightbulb className="size-3.5 shrink-0" />
          Build with the ready-made components in the palette, and draw an arrow by dragging from a
          shape's edge. Your drawing is saved in this browser only.
        </p>
      </div>
    </section>
  );
}

function BoardLoading() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Loading whiteboard
    </div>
  );
}

function Swatches({
  label,
  colors,
  active,
  disabled,
  onPick,
}: {
  label: string;
  colors: string[];
  active: string;
  disabled: boolean;
  onPick: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-1.5" role="group" aria-label={`${label} colour`}>
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            aria-label={`${label} ${c === "transparent" ? "none" : c}`}
            aria-pressed={active === c}
            onClick={() => onPick(c)}
            className={cn(
              "size-6 rounded-md border transition-transform hover:scale-110 disabled:opacity-50",
              active === c ? "border-foreground ring-2 ring-mint/60" : "border-hairline",
              c === "transparent" &&
                "bg-[linear-gradient(135deg,transparent_45%,#e03131_45%,#e03131_55%,transparent_55%)]",
            )}
            style={c === "transparent" ? undefined : { backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}
