import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { motion } from "motion/react";

const STEPS = [
  {
    title: "1. Start with tokens",
    text: "The tokenizer splits the prompt into IDs. Each ID becomes an embedding vector, then receives positional information.",
    active: "tokens",
  },
  {
    title: "2. Project Q, K, and V",
    text: "Every token creates a query, key, and value. Queries ask what to find; keys advertise what is available; values carry information forward.",
    active: "qkv",
  },
  {
    title: "3. Route with masked attention",
    text: "The current token scores compatible keys, masks future tokens, then makes a weighted mixture of values.",
    active: "attention",
  },
  {
    title: "4. Use several heads",
    text: "Multiple smaller attention heads run in parallel, then their results are mixed. This creates several learned communication channels.",
    active: "heads",
  },
  {
    title: "5. Refine the representation",
    text: "Residual paths preserve earlier information. Layer normalization stabilizes it. The MLP transforms each token independently.",
    active: "mlp",
  },
  {
    title: "6. Predict one more token",
    text: "After many blocks, logits become a probability distribution. The model selects a next token, appends it, and repeats.",
    active: "output",
  },
] as const;

type ActiveStage = (typeof STEPS)[number]["active"];

function Token({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "mint" | "violet" | "amber";
}) {
  const tones = {
    neutral: "border-hairline bg-surface text-foreground",
    mint: "border-mint/60 bg-mint/15 text-mint",
    violet: "border-violet/60 bg-violet/15 text-violet",
    amber: "border-amber/60 bg-amber/15 text-amber",
  };
  return (
    <span
      className={`rounded-md border px-2.5 py-1.5 font-mono text-xs transition-all ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

function Stage({
  active,
  children,
  label,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className={`relative min-w-[142px] flex-1 rounded-lg border p-3 transition-all duration-300 ${active ? "border-mint/60 bg-mint/10 shadow-[0_0_28px_rgba(64,224,180,0.12)]" : "border-hairline bg-surface/60 opacity-55"}`}
    >
      <p
        className={`mb-2 font-mono text-[10px] uppercase tracking-[0.14em] ${active ? "text-mint" : "text-muted-foreground"}`}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function Arrow() {
  return <span className="hidden text-muted-foreground md:inline">→</span>;
}

export function TransformerExplorer() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = STEPS[step];
  const active = current.active as ActiveStage;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % STEPS.length), 3000);
    return () => window.clearTimeout(timer);
  }, [playing, step]);
  useEffect(() => {
    const stop = () => setPlaying(false);
    window.addEventListener("quiz-started", stop);
    return () => window.removeEventListener("quiz-started", stop);
  }, []);
  const go = useCallback((delta: number) => {
    setPlaying(false);
    setStep((value) => (value + delta + STEPS.length) % STEPS.length);
  }, []);
  const isAtOrPast = (stage: ActiveStage) =>
    STEPS.findIndex((item) => item.active === active) >=
    STEPS.findIndex((item) => item.active === stage);

  return (
    <div className="flex flex-col">
      <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(64,224,180,0.10),transparent_48%)]" />
        <div className="relative w-full max-w-5xl space-y-7">
          <motion.div
            key={current.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">
              Decoder-only transformer
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">{current.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.text}</p>
          </motion.div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <Stage label="Prompt" active={active === "tokens"}>
              <div className="flex flex-wrap gap-1.5">
                <Token label="The" tone="mint" />
                <Token label="cat" tone="mint" />
                <Token label="sat" tone="mint" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">IDs + embeddings + position</p>
            </Stage>
            <Arrow />
            <Stage label="Q · K · V" active={active === "qkv"}>
              <div className="grid grid-cols-3 gap-1.5">
                <Token label="Q" tone="violet" />
                <Token label="K" tone="amber" />
                <Token label="V" tone="mint" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">three learned projections</p>
            </Stage>
            <Arrow />
            <Stage label="Attention" active={active === "attention"}>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                {["1.0", "0.0", "0.0", "0.3", "0.7", "0.0", "0.2", "0.5", "0.3"].map(
                  (value, index) => (
                    <span
                      key={index}
                      className={`rounded px-1.5 py-1 text-center ${index === 7 && active === "attention" ? "bg-mint/25 text-mint" : "bg-surface-2 text-muted-foreground"}`}
                    >
                      {value}
                    </span>
                  ),
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">masked score matrix</p>
            </Stage>
          </div>
          <div className="flex justify-center">
            <span className="text-muted-foreground">↓</span>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <Stage label="Multi-head" active={active === "heads"}>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((head) => (
                  <Token
                    key={head}
                    label={`H${head}`}
                    tone={active === "heads" ? "violet" : "neutral"}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">parallel relation finders</p>
            </Stage>
            <Arrow />
            <Stage label="Residual + MLP" active={active === "mlp"}>
              <div className="flex items-center justify-between">
                <Token label="+" tone="mint" />
                <span className="text-muted-foreground">→</span>
                <Token label="MLP" tone="amber" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">preserve, normalize, transform</p>
            </Stage>
            <Arrow />
            <Stage label="Next token" active={active === "output"}>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-mint">
                  <span>on</span>
                  <span>0.61</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>the</span>
                  <span>0.18</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>near</span>
                  <span>0.05</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">softmax over the vocabulary</p>
            </Stage>
          </div>
          <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className={isAtOrPast("attention") ? "text-mint" : ""}>
              repeat this block many times
            </span>
            <span>·</span>
            <span className={isAtOrPast("output") ? "text-mint" : ""}>sample and append</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Restart animation"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Previous step"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label={playing ? "Pause animation" : "Play animation"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Next step"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {step + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  );
}
