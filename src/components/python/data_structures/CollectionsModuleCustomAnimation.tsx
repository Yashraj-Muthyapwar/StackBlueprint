import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

type CollectionStep = {
  title: string;
  tool: string;
  code: string;
  note: string;
  input: string[];
  output: string[];
  mode: "count" | "group" | "queue" | "layers";
};

const steps: CollectionStep[] = [
  {
    title: "Counter turns repeated values into counts",
    tool: "Counter",
    code: 'Counter("banana")',
    note: "Each distinct value becomes a key and its frequency becomes the value.",
    input: ["b", "a", "n", "a", "n", "a"],
    output: ["a: 3", "n: 2", "b: 1"],
    mode: "count",
  },
  {
    title: "defaultdict creates a list for a new group",
    tool: "defaultdict(list)",
    code: 'students["Python"].append("Ava")',
    note: "A missing key receives an empty list before append runs.",
    input: ["Python", "Ava"],
    output: ["Python: [Ava]", "SQL: [Mia]"],
    mode: "group",
  },
  {
    title: "OrderedDict can move pairs by order",
    tool: "OrderedDict",
    code: 'steps.move_to_end("ship", last=False)',
    note: "Use it for explicit order-management behavior beyond normal dictionary insertion order.",
    input: ["plan", "build", "ship"],
    output: ["ship", "plan", "build"],
    mode: "group",
  },
  {
    title: "deque serves the left side of a queue",
    tool: "deque",
    code: "next_person = queue.popleft()",
    note: "deque is designed for fast additions and removals at both ends.",
    input: ["Ava", "Noah", "Mia", "Leo"],
    output: ["served: Ava", "remaining: Noah", "Mia", "Leo"],
    mode: "queue",
  },
  {
    title: "ChainMap checks overrides before defaults",
    tool: "ChainMap",
    code: 'settings = ChainMap(user_settings, defaults)',
    note: "Lookup moves from the first mapping to the next only when a key is absent.",
    input: ["user: theme = dark", "defaults: theme = light", "defaults: language = English"],
    output: ["theme → dark", "language → English"],
    mode: "layers",
  },
];

function Tokens({ items, tone = "mint" }: { items: string[]; tone?: "mint" | "violet" }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item, index) => (
        <motion.span
          key={item + index}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.08 }}
          className={"rounded-lg border px-3 py-2 font-mono text-xs " + (tone === "mint" ? "border-mint/30 bg-mint/10 text-mint" : "border-violet/30 bg-violet/10 text-violet")}
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}

export function CollectionsModuleCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = steps[step];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % steps.length), 3000);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  const move = (offset: number) => {
    setPlaying(false);
    setStep((value) => (value + offset + steps.length) % steps.length);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-4xl"
        >
          <div className="mb-7 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet">{current.tool}</p>
            <h3 className="mt-2 text-2xl font-light text-foreground">{current.title}</h3>
          </div>
          <div className="rounded-2xl border border-hairline bg-slate-950 px-5 py-4 font-mono text-sm text-mint shadow-2xl">{current.code}</div>

          <div className="mt-8 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-2xl border border-hairline bg-surface p-5">
              <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">input</p>
              <Tokens items={current.input} tone="violet" />
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="hidden font-mono text-2xl text-mint md:block"
            >
              →
            </motion.div>
            <div className="rounded-2xl border border-mint/30 bg-mint/10 p-5">
              <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-mint">result</p>
              <Tokens items={current.output} />
            </div>
          </div>

          <div className="mx-auto mt-7 max-w-3xl rounded-xl border border-hairline bg-surface-2/40 px-5 py-4 text-center text-sm leading-relaxed text-foreground">
            {current.note}
          </div>
          {current.mode === "layers" ? (
            <div className="mx-auto mt-4 max-w-3xl text-center font-mono text-xs text-muted-foreground">
              first mapping wins when both contain the same key
            </div>
          ) : null}
        </motion.div>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setPlaying(false); setStep(0); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Restart"><RotateCcw className="size-3.5" /></button>
          <button type="button" onClick={() => move(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Previous"><ChevronLeft className="size-3.5" /></button>
          <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}</button>
          <button type="button" onClick={() => move(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Next"><ChevronRight className="size-3.5" /></button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">{step + 1} / {steps.length}</div>
      </div>
    </div>
  );
}
