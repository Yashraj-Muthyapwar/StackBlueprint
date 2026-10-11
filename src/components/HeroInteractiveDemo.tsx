import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, Sparkles, Terminal, Cpu } from "lucide-react";

interface Step {
  highlightLines: number[];
  array: number[];
  left: number;
  right: number;
  swapping: boolean;
  done: boolean;
  explanation: string;
}

const STEPS: Step[] = [
  {
    highlightLines: [2, 3],
    array: [1, 2, 3, 4, 5],
    left: 0,
    right: 4,
    swapping: false,
    done: false,
    explanation: "Initialize pointers: left = 0, right = 4.",
  },
  {
    highlightLines: [6],
    array: [1, 2, 3, 4, 5],
    left: 0,
    right: 4,
    swapping: true,
    done: false,
    explanation: "Swap numbers[0] (1) with numbers[4] (5).",
  },
  {
    highlightLines: [7, 8],
    array: [5, 2, 3, 4, 1],
    left: 1,
    right: 3,
    swapping: false,
    done: false,
    explanation: "Advance pointers inward: left += 1, right -= 1.",
  },
  {
    highlightLines: [6],
    array: [5, 2, 3, 4, 1],
    left: 1,
    right: 3,
    swapping: true,
    done: false,
    explanation: "Swap numbers[1] (2) with numbers[3] (4).",
  },
  {
    highlightLines: [10],
    array: [5, 4, 3, 2, 1],
    left: 2,
    right: 2,
    swapping: false,
    done: true,
    explanation: "Pointers meet (left == right). In-place reversal complete!",
  },
];

const CODE_LINES = [
  {
    num: 1,
    indent: 0,
    node: (
      <>
        <span className="text-purple-400 font-semibold">def</span>{" "}
        <span className="text-blue-400 font-semibold">reverse_array</span>(numbers):
      </>
    ),
  },
  {
    num: 2,
    indent: 4,
    node: (
      <>
        left = <span className="text-amber-400 font-mono">0</span>
      </>
    ),
  },
  {
    num: 3,
    indent: 4,
    node: (
      <>
        right = <span className="text-cyan-400">len</span>(numbers) - <span className="text-amber-400 font-mono">1</span>
      </>
    ),
  },
  {
    num: 4,
    indent: 0,
    node: null,
  },
  {
    num: 5,
    indent: 4,
    node: (
      <>
        <span className="text-purple-400 font-semibold">while</span> left &lt; right:
      </>
    ),
  },
  {
    num: 6,
    indent: 8,
    node: (
      <>
        numbers[left], numbers[right] = numbers[right], numbers[left]
      </>
    ),
  },
  {
    num: 7,
    indent: 8,
    node: (
      <>
        left += <span className="text-amber-400 font-mono">1</span>
      </>
    ),
  },
  {
    num: 8,
    indent: 8,
    node: (
      <>
        right -= <span className="text-amber-400 font-mono">1</span>
      </>
    ),
  },
  {
    num: 9,
    indent: 0,
    node: null,
  },
  {
    num: 10,
    indent: 4,
    node: (
      <>
        <span className="text-purple-400 font-semibold">return</span> numbers
      </>
    ),
  },
];

export function HeroInteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [mobileTab, setMobileTab] = useState<"visual" | "code">("visual");

  const step = STEPS[currentStep];

  // Base delay: 2000ms / speed factor (e.g. 0.5x = 4000ms, 1x = 2000ms, 2x = 1000ms)
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(2000 / speed);
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Keyboard navigation for Left, Right arrow keys and Spacebar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIsPlaying(false);
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIsPlaying(false);
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="group/widget mx-auto mt-6 sm:mt-8 w-full max-w-[960px] px-1 sm:px-0 outline-none focus-visible:ring-2 focus-visible:ring-mint/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl transition-all"
    >
      <div className="relative overflow-hidden rounded-2xl border border-hairline/80 bg-surface/50 shadow-2xl backdrop-blur-xl">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -left-16 -top-16 -z-10 size-48 rounded-full bg-mint/15 blur-[55px]" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 -z-10 size-48 rounded-full bg-blue-500/10 blur-[55px]" />

        {/* Window Chrome Header */}
        <div className="flex items-center justify-between border-b border-hairline/60 bg-surface/70 px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-red-500/80" />
              <div className="size-2.5 rounded-full bg-amber-500/80" />
              <div className="size-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="h-3.5 w-px bg-hairline" />
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-[13px] text-muted-foreground">
              <Sparkles className="size-3.5 text-mint" />
              <span className="font-semibold text-foreground/90">reverse_array.py</span>
              <span className="hidden text-muted-foreground/60 md:inline">— Two Pointers</span>
            </div>
          </div>

          {/* Tab buttons visible only on mobile screens */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex rounded-md bg-surface-2 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMobileTab("visual")}
                className={`flex items-center gap-1 rounded px-2.5 py-0.5 font-medium transition-all ${
                  mobileTab === "visual"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Cpu className="size-3" />
                <span className="text-[11px]">Visual</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("code")}
                className={`flex items-center gap-1 rounded px-2.5 py-0.5 font-medium transition-all ${
                  mobileTab === "code"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Terminal className="size-3" />
                <span className="text-[11px]">Code</span>
              </button>
            </div>
          </div>

          {/* Desktop runtime indicator */}
          <div className="hidden md:flex items-center gap-2 text-muted-foreground font-mono text-xs">
            <span className="size-2 rounded-full bg-mint animate-pulse" />
            <span>Interactive runtime</span>
          </div>
        </div>

        {/* Workspace Body: 5 cols Visual, 7 cols Code on md+ with zero line-overflow */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-hairline/60">
          
          {/* Visual Column (5 cols on md+) */}
          <div className={`p-4 sm:p-5 md:col-span-5 flex flex-col justify-between ${mobileTab === "code" ? "hidden md:flex" : "flex"}`}>
            {/* Top header */}
            <div className="flex items-center justify-between font-mono text-xs sm:text-[12.5px]">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                Array State &amp; Pointers
              </span>
              <span className="text-mint font-semibold">
                {step.done ? "Reversed in-place" : step.swapping ? "Swapping elements" : "Scanning bounds"}
              </span>
            </div>

            {/* Central visual animation and explanation positioned gracefully in the middle */}
            <div className="my-auto flex flex-col justify-center py-4 sm:py-5">
              {/* Number cells with larger size on desktop */}
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {step.array.map((num, idx) => {
                  const isLeft = idx === step.left;
                  const isRight = idx === step.right;
                  const isTarget = isLeft || isRight;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      {/* Pointer Tag */}
                      <div className="h-5 text-[10px] sm:text-xs font-mono font-bold">
                        {isLeft && isRight ? (
                          <span className="text-purple-400">L=R</span>
                        ) : isLeft ? (
                          <span className="text-mint">L [{idx}]</span>
                        ) : isRight ? (
                          <span className="text-blue-400">R [{idx}]</span>
                        ) : null}
                      </div>

                      {/* Cell */}
                      <div
                        className={`relative flex size-9 sm:size-10 lg:size-11 items-center justify-center rounded-xl border text-base sm:text-lg font-bold font-mono transition-all duration-300 ${
                          step.done
                            ? "border-mint/60 bg-mint/15 text-mint shadow-sm"
                            : step.swapping && isTarget
                              ? "border-mint bg-mint/20 text-mint shadow-[0_0_15px_rgba(94,234,212,0.4)] scale-105 ring-1 ring-mint/40"
                              : isLeft
                                ? "border-mint/80 bg-mint/10 text-mint shadow-sm ring-2 ring-mint/30"
                                : isRight
                                  ? "border-blue-400/80 bg-blue-500/10 text-blue-400 shadow-sm ring-2 ring-blue-400/30"
                                  : "border-hairline bg-surface-2 text-foreground/70"
                        }`}
                      >
                        {num}
                        <span className="absolute -bottom-4 text-[9px] sm:text-[10px] font-mono text-muted-foreground/60">
                          [{idx}]
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step info banner */}
              <div className="mt-5 sm:mt-6 rounded-xl border border-hairline/80 bg-surface-2/60 px-3.5 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex size-4.5 shrink-0 items-center justify-center rounded-full ${
                      step.done
                        ? "bg-mint/20 text-mint"
                        : "bg-surface-3 text-muted-foreground"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="size-3 text-mint" />
                    ) : (
                      <span className="font-mono text-[9px] sm:text-[10px] font-bold">
                        {currentStep + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-[12.5px] font-medium text-foreground leading-snug">
                    {step.explanation}
                  </p>
                  <div className="ml-auto hidden sm:flex items-center gap-1.5 shrink-0 font-mono text-[10px] text-muted-foreground">
                    <span>
                      L:<strong className="text-mint">{step.left}</strong> R:<strong className="text-blue-400">{step.right}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper controls pinned cleanly at bottom */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline/60 pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5" /> {currentStep === STEPS.length - 1 ? "Replay" : "Autoplay"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(0);
                  }}
                  className="rounded-lg border border-hairline bg-surface p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title="Reset to step 1 (Keyboard: Left/Right to step, Space to play)"
                >
                  <RotateCcw className="size-3.5" />
                </button>

                {/* Speed Toggle (0.5x, 1x, 2x) */}
                <div className="flex items-center rounded-lg border border-hairline bg-surface/60 p-0.5 text-[10px] font-mono">
                  {([0.5, 1, 2] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className={`rounded px-1.5 py-0.5 font-semibold transition-all ${
                        speed === s
                          ? "bg-mint text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={`Playback speed ${s}x`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Step progress pills */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? "w-5 bg-mint"
                        : "w-2 bg-surface-3 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Python Code Column (7 cols on md+): Generous horizontal space, 0 overflow */}
          <div className={`bg-surface/30 p-4 sm:p-5 md:col-span-7 flex flex-col justify-between ${mobileTab === "visual" ? "hidden md:flex" : "flex"}`}>
            <div>
              <div className="mb-2.5 flex items-center justify-between text-muted-foreground">
                <span className="text-xs sm:text-[12.5px] font-semibold uppercase tracking-wider">Python (In-Place)</span>
                <div className="flex items-center gap-1.5 text-xs sm:text-[12.5px] font-mono">
                  <span className="text-blue-400 font-medium">O(n) Time</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-mint font-semibold">O(1) Space</span>
                </div>
              </div>

              <div className="rounded-xl bg-background/90 p-2 sm:p-3 border border-hairline/70 shadow-inner overflow-x-auto">
                <div className="flex flex-col font-mono text-[10.5px] sm:text-[11px] lg:text-[11.5px] leading-[1.48] text-left min-w-full">
                  {CODE_LINES.map((line) => {
                    const isHighlighted = step.highlightLines.includes(line.num);
                    return (
                      <div
                        key={line.num}
                        className={`flex items-baseline rounded px-1.5 py-[1.5px] transition-colors duration-150 ${
                          isHighlighted
                            ? "bg-mint/15 text-foreground font-semibold"
                            : "text-muted-foreground/80 hover:text-muted-foreground"
                        }`}
                      >
                        <span className="w-4 shrink-0 text-right pr-2 text-muted-foreground/35 select-none font-mono text-[9.5px] sm:text-[10px]">
                          {line.num}
                        </span>
                        <span className="whitespace-pre font-mono text-left select-text">
                          {line.node ? (
                            <>
                              {" ".repeat(line.indent)}
                              {line.node}
                            </>
                          ) : (
                            " "
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-hairline/50 bg-surface-2/40 px-3 py-2 text-[10.5px] sm:text-[11.5px] leading-relaxed text-muted-foreground">
              💡 <span className="font-semibold text-foreground">Complexity:</span> Runs in <span className="text-blue-400 font-semibold">O(n) time</span> with <span className="text-mint font-semibold">O(1) auxiliary space</span> via simultaneous assignment (<code className="text-mint font-semibold">a, b = b, a</code>).
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
