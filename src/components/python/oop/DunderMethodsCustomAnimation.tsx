import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Box,
  Braces,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Eye,
  Hash,
  PackageSearch,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShoppingCart,
  Terminal,
  Type,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 5;
const STEP_DURATIONS = [6200, 7200, 6200, 6800, 25000];

export function DunderMethodsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(
      () => setStep((current) => (current + 1) % TOTAL_STEPS),
      STEP_DURATIONS[step],
    );
    return () => window.clearTimeout(id);
  }, [isHovered, playing, step]);

  const go = useCallback((delta: number) => {
    setPlaying(false);
    setStep((current) => (current + delta + TOTAL_STEPS) % TOTAL_STEPS);
  }, []);

  return (
    <div
      className="flex flex-col relative z-10 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <CreateScene key="create" />}
          {step === 1 && <RepresentScene key="represent" />}
          {step === 2 && <CountScene key="count" />}
          {step === 3 && <CombineScene key="combine" />}
          {step === 4 && <ProtocolMap key="map" />}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Restart animation"
            title="Restart animation"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Previous step"
            title="Previous step"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => setPlaying((current) => !current)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label={playing ? "Pause animation" : "Play animation"}
            title={playing ? "Pause animation" : "Play animation"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Next step"
            title="Next step"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          {step + 1} / {TOTAL_STEPS}
        </div>
      </div>
    </div>
  );
}

function Scene({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-4xl px-3 sm:px-6"
    >
      <div className="mb-7 text-center">
        <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function CreateScene() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 900),
      window.setTimeout(() => setPhase(2), 2350),
      window.setTimeout(() => setPhase(3), 3950),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <Scene eyebrow="1 · Object creation" title="A class call gives Python a setup job">
      <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1.1fr]">
        <CodeWindow
          label="your Python class"
          lines={[
            "class Product:",
            "    def __init__(self, name, price):",
            "        self.name = name",
            "        self.price = price",
            "",
            'product = Product("Laptop", 900)',
          ]}
          activeLine={phase < 3 ? 1 : 5}
        />
        <DispatchArrow active={phase >= 1} />
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.05] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Cpu className="size-3.5" /> Python's protocol
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">constructor</span>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              animate={
                phase >= 2
                  ? { scale: [1, 1.08, 1], rotate: [0, -2, 0] }
                  : { scale: 0.9, opacity: 0.45 }
              }
              transition={{ duration: 0.5 }}
              className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-indigo-500/50 bg-surface shadow-[0_0_28px_rgba(99,102,241,0.18)]"
            >
              <Box className="mb-1 size-7 text-indigo-500" />
              <span className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400">
                Product
              </span>
            </motion.div>
            <div className="min-w-0">
              <div className="mb-1 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                __init__(...)
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Receives the values and stores them on the new object.
              </p>
            </div>
          </div>
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-surface/70 px-3 py-2 font-mono text-[11px]"
              >
                <CheckCircle className="size-3.5 text-emerald-500" />
                <span className="text-muted-foreground">name:</span>
                <span className="text-foreground">\"Laptop\"</span>
                <span className="ml-2 text-muted-foreground">price:</span>
                <span className="text-foreground">900</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <BottomNote color="indigo" icon={<Box className="size-3.5" />}>
        Think of <code>__init__()</code> as the object's first moment: it turns input values into
        object state.
      </BottomNote>
    </Scene>
  );
}

function RepresentScene() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 900),
      window.setTimeout(() => setPhase(2), 2850),
      window.setTimeout(() => setPhase(3), 4700),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <Scene eyebrow="2 · Two representations" title="One object, two useful descriptions">
      <div className="relative grid gap-4 md:grid-cols-[0.95fr_1.35fr] md:items-center">
        <CodeWindow
          label="a complete Python class"
          lines={[
            "class Product:",
            "    def __init__(self, name, price):",
            "        self.name = name",
            "        self.price = price",
            "",
            "    def __str__(self):",
            '        return f"{self.name} — ${self.price}"',
            "",
            "    def __repr__(self):",
            "        return repr((self.name, self.price))",
          ]}
          activeLine={phase < 3 ? 5 : 8}
        />
        <div className="space-y-3">
          <motion.div
            animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0.92, opacity: 0.45 }}
            className="relative z-10 rounded-xl border border-hairline bg-surface-2/80 px-4 py-3 shadow-sm sm:flex sm:items-center sm:gap-3"
          >
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 sm:mx-0 sm:mb-0">
              <PackageSearch className="size-5" />
            </div>
            <div className="text-center sm:text-left">
              <div className="font-mono text-sm font-bold text-foreground">product</div>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                name=\"Laptop\" · price=900
              </div>
            </div>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AudienceCard
              icon={<Type className="size-5" />}
              title="For people"
              call="print(product)"
              method="__str__()"
              output="Laptop — $900"
              color="amber"
              visible={phase >= 1}
            />
            <AudienceCard
              icon={<Eye className="size-5" />}
              title="For developers"
              call="repr(product)"
              method="__repr__()"
              output="('Laptop', 900)"
              color="violet"
              visible={phase >= 3}
            />
          </div>
        </div>
      </div>
      <BottomNote color="amber" icon={<Braces className="size-3.5" />}>
        Use <code>__str__()</code> for a friendly label; use <code>__repr__()</code> to make
        debugging informative.
      </BottomNote>
    </Scene>
  );
}

function CountScene() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 700),
      window.setTimeout(() => setPhase(2), 1500),
      window.setTimeout(() => setPhase(3), 2300),
      window.setTimeout(() => setPhase(4), 3800),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);
  const items = ["Laptop", "Mouse", "Keyboard"];
  return (
    <Scene eyebrow="3 · Built-in functions" title="Your cart can participate in len()">
      <div className="grid gap-4 md:grid-cols-[1.1fr_auto_0.9fr] md:items-center">
        <div className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.05] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <ShoppingCart className="size-3.5" /> cart.items
            </div>
            <div className="font-mono text-xs text-muted-foreground">3 items</div>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <motion.div
                key={item}
                initial={{ x: -18, opacity: 0 }}
                animate={phase > index ? { x: 0, opacity: 1 } : { x: -18, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2"
              >
                <span className="flex size-5 items-center justify-center rounded bg-sky-500/10 font-mono text-[9px] text-sky-600 dark:text-sky-400">
                  {index + 1}
                </span>
                <span className="font-mono text-xs text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <DispatchArrow active={phase >= 4} label="asks for size" />
        <motion.div
          animate={
            phase >= 4 ? { scale: [0.92, 1.08, 1], opacity: 1 } : { opacity: 0.42, scale: 0.92 }
          }
          className="rounded-2xl border border-sky-500/30 bg-surface p-6 text-center shadow-[0_0_28px_rgba(14,165,233,0.12)]"
        >
          <div className="font-mono text-sm text-muted-foreground">len(cart)</div>
          <div className="my-3 font-mono text-3xl font-black text-sky-600 dark:text-sky-400">3</div>
          <div className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            __len__() returned it
          </div>
        </motion.div>
      </div>
      <BottomNote color="sky" icon={<Hash className="size-3.5" />}>
        <code>__len__()</code> must return a non-negative integer—then Python handles the rest.
      </BottomNote>
    </Scene>
  );
}

function CombineScene() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 900),
      window.setTimeout(() => setPhase(2), 2450),
      window.setTimeout(() => setPhase(3), 4000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);
  return (
    <Scene eyebrow="4 · Operator overloading" title="Make + mean something natural for your class">
      <div className="relative flex flex-col items-center gap-4">
        <div className="flex w-full max-w-3xl items-center justify-center gap-3 sm:gap-6">
          <CartCard name="cart_a" items={["Laptop", "Mouse"]} color="rose" faded={phase >= 2} />
          <motion.div
            animate={phase >= 1 ? { scale: [1, 1.25, 1], rotate: [0, 90, 0] } : {}}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          >
            <Plus className="size-5" />
          </motion.div>
          <CartCard name="cart_b" items={["Keyboard"]} color="rose" faded={phase >= 2} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -5 }}
          className="rounded-full border border-rose-500/25 bg-rose-500/10 px-4 py-1.5 font-mono text-xs font-semibold text-rose-600 dark:text-rose-400"
        >
          cart_a.__add__(cart_b)
        </motion.div>
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 19 }}
            >
              <CartCard
                name="combined"
                items={["Laptop", "Mouse", "Keyboard"]}
                color="rose"
                emphasis
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNote color="rose" icon={<Plus className="size-3.5" />}>
        <code>__add__()</code> decides the result of <code>cart_a + cart_b</code>; here it returns a
        new, combined cart.
      </BottomNote>
    </Scene>
  );
}

function ProtocolMap() {
  const [activeExample, setActiveExample] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActiveExample((current) => (current + 1) % 5), 4500);
    return () => window.clearInterval(id);
  }, []);
  const examples = [
    {
      syntax: "print(product)",
      intent: "I need readable text",
      method: "__str__()",
      code: ["def __str__(self):", '    return f"{self.name} — ${self.price}"'],
      result: "Laptop — $900",
      tone: "text-amber-600 dark:text-amber-400 border-amber-500/35 bg-amber-500/10",
      solid: "bg-amber-500",
    },
    {
      syntax: "len(cart)",
      intent: "I need an item count",
      method: "__len__()",
      code: ["def __len__(self):", "    return len(self.items)"],
      result: "3",
      tone: "text-sky-600 dark:text-sky-400 border-sky-500/35 bg-sky-500/10",
      solid: "bg-sky-500",
    },
    {
      syntax: "cart_a + cart_b",
      intent: "I want to combine carts",
      method: "__add__()",
      code: [
        "def __add__(self, other):",
        "    return ShoppingCart(",
        "        self.items + other.items)",
      ],
      result: "combined cart",
      tone: "text-rose-600 dark:text-rose-400 border-rose-500/35 bg-rose-500/10",
      solid: "bg-rose-500",
    },
    {
      syntax: "product_a == product_b",
      intent: "I need to compare products",
      method: "__eq__()",
      code: ["def __eq__(self, other):", "    return self.sku == other.sku"],
      result: "True",
      tone: "text-emerald-600 dark:text-emerald-400 border-emerald-500/35 bg-emerald-500/10",
      solid: "bg-emerald-500",
    },
    {
      syntax: "summer_sale(100)",
      intent: "I want to run this object",
      method: "__call__()",
      code: ["def __call__(self, price):", "    return price * 0.8"],
      result: "80",
      tone: "text-orange-600 dark:text-orange-400 border-orange-500/35 bg-orange-500/10",
      solid: "bg-orange-500",
    },
  ];
  const example = examples[activeExample];
  return (
    <Scene eyebrow="5 · The mental model" title="Syntax makes a request. Your object answers it.">
      <p className="-mt-3 mb-6 text-center text-sm text-muted-foreground">
        Python is the bridge between the operation you write and the behavior your class defines.
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={example.method}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid items-stretch gap-3 md:grid-cols-[0.95fr_auto_0.9fr_auto_1.15fr] md:items-center"
        >
          <div className="rounded-2xl border border-hairline bg-surface-2/60 p-4 shadow-sm">
            <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              1 · You write
            </div>
            <code className="block rounded-lg border border-hairline bg-surface px-3 py-3 text-center font-mono text-[13px] font-semibold text-foreground shadow-sm">
              {example.syntax}
            </code>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
              {example.intent}
            </p>
          </div>
          <FlowArrow solid={example.solid} />
          <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.055] p-4 text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Cpu className="size-5" />
            </div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              2 · Python
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">looks for</p>
            <motion.code
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className={cn(
                "mt-1 inline-flex rounded-md border px-2 py-1 font-mono text-[11px] font-bold",
                example.tone,
              )}
            >
              {example.method}
            </motion.code>
          </div>
          <FlowArrow solid={example.solid} />
          <div className="rounded-2xl border border-hairline bg-surface-2/60 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                3 · Your class
              </div>
              <Code2 className={cn("size-4", example.tone.split(" ")[0])} />
            </div>
            <div className="rounded-lg border border-hairline bg-surface px-3 py-2 font-mono text-[10px] leading-5 text-muted-foreground">
              {example.code.map((line) => (
                <div key={line} className="whitespace-pre">
                  <PythonLine line={line} />
                </div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-3 flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2 font-mono text-[11px]"
            >
              <CheckCircle className={cn("size-3.5", example.tone.split(" ")[0])} />
              <span className="text-muted-foreground">returns</span>
              <span className="font-semibold text-foreground">{example.result}</span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 flex justify-center gap-1.5" aria-label="Protocol examples">
        {examples.map((item, index) => (
          <motion.span
            key={item.method}
            animate={index === activeExample ? { scale: 1.25 } : { scale: 1 }}
            className={cn(
              "size-1.5 rounded-full",
              index === activeExample ? example.solid : "bg-hairline",
            )}
          />
        ))}
      </div>
      <BottomNote color="indigo" icon={<Braces className="size-3.5" />}>
        The important idea: Python's familiar syntax is only the{" "}
        <strong className="font-medium text-foreground">request</strong>. The dunder method supplies
        the behavior.
      </BottomNote>
    </Scene>
  );
}

function FlowArrow({ solid }: { solid: string }) {
  return (
    <div className="flex items-center justify-center gap-1 md:flex-col">
      <div className="relative h-10 w-px bg-hairline md:h-px md:w-10">
        <motion.span
          animate={{ scale: [0.75, 1.5, 0.75], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className={cn(
            "absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
            solid,
          )}
        />
      </div>
      <ChevronRight className="size-3.5 rotate-90 text-muted-foreground md:rotate-0" />
    </div>
  );
}

function CodeWindow({
  label,
  lines,
  activeLine,
}: {
  label: string;
  lines: string[];
  activeLine: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-2/70 shadow-sm">
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Terminal className="size-3.5" /> {label}
      </div>
      <div className="p-4 font-mono text-[11px] leading-6">
        {lines.map((line, index) => (
          <motion.div
            key={`${line}-${index}`}
            animate={
              activeLine === index
                ? { backgroundColor: "rgba(99, 102, 241, 0.11)", x: 2 }
                : { backgroundColor: "rgba(0,0,0,0)", x: 0 }
            }
            className={cn(
              "whitespace-pre rounded px-2",
              index === activeLine
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground",
            )}
          >
            <PythonLine line={line} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PythonLine({ line }: { line: string }) {
  return (
    <>
      {line
        .split(/(\bclass\b|\bdef\b|\breturn\b|\bself\b|\b\d+\b|"[^"\\n]*")/g)
        .map((part, index) => (
          <span
            key={`${part}-${index}`}
            className={cn(
              part === "class" || part === "def" || part === "return"
                ? "text-pink-600 dark:text-pink-400"
                : part === "self"
                  ? "text-sky-600 dark:text-sky-400"
                  : /^\d+$/.test(part)
                    ? "text-amber-600 dark:text-amber-400"
                    : part.startsWith('"')
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "",
            )}
          >
            {part}
          </span>
        ))}
    </>
  );
}

function DispatchArrow({ active, label = "dispatches" }: { active: boolean; label?: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-1 md:flex-col">
      <motion.div
        animate={active ? { x: [0, 6, 0], opacity: 1 } : { opacity: 0.28 }}
        transition={{ repeat: active ? Infinity : 0, duration: 0.9 }}
        className="flex size-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md"
      >
        <ChevronRight className="size-4 md:rotate-90" />
      </motion.div>
      <span className="whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function AudienceCard({
  icon,
  title,
  call,
  method,
  output,
  color,
  visible,
}: {
  icon: ReactNode;
  title: string;
  call: string;
  method: string;
  output: string;
  color: "amber" | "violet";
  visible: boolean;
}) {
  const styles =
    color === "amber"
      ? "border-amber-500/25 bg-amber-500/[0.055] text-amber-600 dark:text-amber-400"
      : "border-violet-500/25 bg-violet-500/[0.055] text-violet-600 dark:text-violet-400";
  return (
    <motion.div
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 12 }}
      transition={{ duration: 0.38 }}
      className={cn("rounded-2xl border p-4", styles)}
    >
      <div className="mb-4 flex items-center gap-2">
        <span>{icon}</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <code className="block rounded-md border border-current/20 bg-surface/70 px-2.5 py-2 font-mono text-[11px] text-foreground">
        {call}
      </code>
      <div className="my-3 flex items-center gap-2">
        <ArrowRight className="size-3" />
        <code className="font-mono text-[11px] font-bold">{method}</code>
      </div>
      <div className="rounded-md border border-current/20 bg-surface/50 px-2.5 py-2 font-mono text-[10px] text-foreground">
        {output}
      </div>
    </motion.div>
  );
}

function CartCard({
  name,
  items,
  color,
  faded = false,
  emphasis = false,
}: {
  name: string;
  items: string[];
  color: "rose";
  faded?: boolean;
  emphasis?: boolean;
}) {
  return (
    <motion.div
      animate={faded ? { opacity: 0.35, scale: 0.94 } : { opacity: 1, scale: 1 }}
      className={cn(
        "min-w-[125px] rounded-2xl border p-4 text-center",
        emphasis
          ? "border-rose-500/50 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.15)]"
          : "border-hairline bg-surface-2/65",
      )}
    >
      <ShoppingCart className="mx-auto mb-2 size-6 text-rose-500" />
      <div className="mb-2 font-mono text-[10px] font-bold text-foreground">{name}</div>
      <div className="flex flex-wrap justify-center gap-1">
        {items.map((item) => (
          <span
            key={item}
            className="rounded bg-rose-500/10 px-1.5 py-1 font-mono text-[9px] text-rose-600 dark:text-rose-400"
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function BottomNote({
  color,
  icon,
  children,
}: {
  color: "indigo" | "amber" | "sky" | "rose" | "emerald";
  icon: ReactNode;
  children: ReactNode;
}) {
  const colors = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    amber: "text-amber-600 dark:text-amber-400",
    sky: "text-sky-600 dark:text-sky-400",
    rose: "text-rose-600 dark:text-rose-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div className="mx-auto mt-5 flex max-w-2xl items-start gap-2 rounded-xl border border-hairline bg-surface-2/45 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
      <span className={cn("mt-0.5 shrink-0", colors[color])}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}
