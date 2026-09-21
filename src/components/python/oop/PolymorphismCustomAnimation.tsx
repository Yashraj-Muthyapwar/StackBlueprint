import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  RotateCcw,
  ArrowRight,
  Bell,
  Terminal,
  Database,
  FileText,
  Smartphone,
  ArrowDown,
  Play,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PolymorphismCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 4;

  const STEP_DURATIONS = [6000, 6000, 6000, 6000];

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % totalSteps),
      STEP_DURATIONS[step] || 6000,
    );
    return () => window.clearTimeout(id);
  }, [playing, step, isHovered]);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + totalSteps) % totalSteps);
    },
    [totalSteps],
  );

  return (
    <div
      className="flex flex-col relative z-10 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step1Operator key="step1" />}
          {step === 1 && <Step2Function key="step2" />}
          {step === 2 && <Step3Class key="step3" />}
          {step === 3 && <Step4DuckTyping key="step4" />}
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
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          {step + 1} / {totalSteps}
        </div>
      </div>
    </div>
  );
}

function Step1Operator() {
  const [mode, setMode] = useState<"int" | "str" | "list">("int");

  useEffect(() => {
    const modes: ("int" | "str" | "list")[] = ["int", "str", "list"];
    const t = setInterval(() => {
      setMode((m) => modes[(modes.indexOf(m) + 1) % modes.length]);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">1. Operator Polymorphism</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-lg">
        The{" "}
        <code className="bg-surface px-1 border border-hairline rounded text-blue-500 font-bold">
          +
        </code>{" "}
        operator behaves differently based on the objects.
      </p>

      <div className="flex flex-col items-center gap-8 w-full">
        <div className="flex gap-2 p-1 bg-surface border border-hairline rounded-lg">
          <button
            onClick={() => setMode("int")}
            className={cn(
              "px-3 py-1 rounded text-xs font-bold font-mono transition-colors",
              mode === "int"
                ? "bg-blue-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Numbers
          </button>
          <button
            onClick={() => setMode("str")}
            className={cn(
              "px-3 py-1 rounded text-xs font-bold font-mono transition-colors",
              mode === "str"
                ? "bg-emerald-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Strings
          </button>
          <button
            onClick={() => setMode("list")}
            className={cn(
              "px-3 py-1 rounded text-xs font-bold font-mono transition-colors",
              mode === "list"
                ? "bg-amber-500 text-white shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Lists
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-surface border-2 border-hairline px-6 py-4 rounded-xl shadow-sm text-center font-mono text-xl font-bold w-40 flex items-center justify-center h-20 overflow-hidden relative">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={mode + "-left"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={
                  mode === "int"
                    ? "text-blue-500"
                    : mode === "str"
                      ? "text-emerald-500"
                      : "text-amber-500"
                }
              >
                {mode === "int" ? "10" : mode === "str" ? '"Stack "' : "[1, 2]"}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="w-12 h-12 rounded-full bg-surface border-2 border-hairline flex items-center justify-center shadow-lg z-10 shrink-0">
            <Plus className="size-6 text-foreground" />
          </div>

          <div className="bg-surface border-2 border-hairline px-6 py-4 rounded-xl shadow-sm text-center font-mono text-xl font-bold w-40 flex items-center justify-center h-20 overflow-hidden relative">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={mode + "-right"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={
                  mode === "int"
                    ? "text-blue-500"
                    : mode === "str"
                      ? "text-emerald-500"
                      : "text-amber-500"
                }
              >
                {mode === "int" ? "20" : mode === "str" ? '"Blueprint"' : "[3, 4]"}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <ArrowDown className="size-6 text-muted-foreground mb-4" />
          <div className="bg-black text-white dark:bg-white dark:text-black font-mono text-xl font-bold px-8 py-3 rounded-xl shadow-xl overflow-hidden relative h-14 min-w-[200px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={mode + "-result"}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
              >
                {mode === "int" ? "30" : mode === "str" ? '"StackBlueprint"' : "[1, 2, 3, 4]"}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-4">
            {mode === "int"
              ? "Addition"
              : mode === "str"
                ? "String Concatenation"
                : "List Concatenation"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step2Function() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const current = [
    { val: '"Python"', col: "text-emerald-500", res: "6", type: "string length" },
    { val: "[1, 2, 3]", col: "text-amber-500", res: "3", type: "list items" },
    { val: '{"a": 1}', col: "text-purple-500", res: "1", type: "dictionary keys" },
  ][phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">2. Function Polymorphism</h3>
      <p className="text-sm text-muted-foreground mb-12 text-center max-w-lg">
        The{" "}
        <code className="bg-surface px-1 border border-hairline rounded text-blue-500 font-bold">
          len()
        </code>{" "}
        function accepts many different data types.
      </p>

      <div className="flex flex-col items-center relative">
        <div className="bg-surface border-2 border-blue-500/30 px-8 py-6 rounded-2xl shadow-lg relative z-20 overflow-hidden min-w-[300px]">
          <div className="absolute top-2 left-3 text-[10px] text-blue-500 uppercase tracking-widest font-bold">
            Built-in Function
          </div>
          <div className="font-mono text-3xl font-bold flex items-center justify-center mt-2">
            len(
            <div className="mx-2 w-48 h-12 bg-black/5 dark:bg-white/5 rounded border border-hairline relative flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={current.val}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className={current.col}
                >
                  {current.val}
                </motion.span>
              </AnimatePresence>
            </div>
            )
          </div>
        </div>

        <div className="w-1 h-12 bg-hairline relative">
          <motion.div
            className="w-full bg-blue-500 absolute top-0 left-0"
            animate={{ height: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="bg-background border-2 border-hairline px-8 py-4 rounded-xl shadow-sm text-center relative min-w-[200px]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface px-2 py-0.5 rounded text-[10px] text-muted-foreground uppercase tracking-widest font-bold border border-hairline">
            Output
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current.res}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="font-mono text-4xl font-black text-foreground"
            >
              {current.res}
            </motion.div>
            <motion.div
              key={current.type}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground mt-1"
            >
              {current.type}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function Step3Class() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const targets = [
    {
      cls: "EmailNotification",
      out: "Sending an email.",
      col: "text-blue-600",
      bg: "bg-blue-500",
      Icon: FileText,
    },
    {
      cls: "SMSNotification",
      out: "Sending an SMS.",
      col: "text-emerald-600",
      bg: "bg-emerald-500",
      Icon: Smartphone,
    },
    {
      cls: "PushNotification",
      out: "Sending a push alert.",
      col: "text-purple-600",
      bg: "bg-purple-500",
      Icon: Bell,
    },
  ];

  const current = targets[phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">3. Class Polymorphism</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-lg">
        Different classes can implement methods with the same name.
      </p>

      <div className="flex items-center gap-12 w-full justify-center mt-4">
        {/* Loop source */}
        <div className="bg-surface p-4 rounded-xl border-2 border-hairline relative">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Looping
          </div>
          <div className="font-mono text-sm leading-loose whitespace-nowrap overflow-x-auto">
            <span className="text-pink-600">for</span>{" "}
            <span className="text-foreground">notification</span>{" "}
            <span className="text-pink-600">in</span> notifications:
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;notification.
            <span className="text-blue-500 font-bold">send()</span>
          </div>

          {/* Animated trigger */}
          <motion.div
            key={phase}
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, x: 100, y: (phase - 1) * 60 }}
            transition={{ duration: 1 }}
            className="absolute right-0 top-12 z-50"
          >
            <div className="bg-blue-500 text-white px-2 py-1 rounded shadow-lg font-mono text-[10px] font-bold flex items-center gap-1">
              .send() <ArrowRight className="size-3" />
            </div>
          </motion.div>
        </div>

        {/* Classes */}
        <div className="flex flex-col gap-4 relative">
          {targets.map((t, i) => (
            <div
              key={i}
              className={cn(
                "bg-surface border-2 p-3 rounded-lg flex items-center gap-4 transition-all duration-300 w-64",
                phase === i ? "border-blue-500 shadow-md scale-105" : "border-hairline opacity-50",
              )}
            >
              <div className={cn("p-2 rounded-lg text-white", t.bg)}>
                <t.Icon className="size-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  Class
                </div>
                <div
                  className={cn(
                    "font-mono text-sm font-bold",
                    phase === i ? t.col : "text-foreground",
                  )}
                >
                  {t.cls}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Output console */}
        <div className="bg-black/90 dark:bg-black text-green-400 font-mono text-xs p-4 rounded-xl shadow-xl w-64 h-32 flex flex-col relative border border-hairline">
          <div className="flex items-center gap-2 mb-2 text-white/50 border-b border-white/10 pb-2">
            <Terminal className="size-3" /> Terminal
          </div>
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-2 w-full"
              >
                &gt; {current.out}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step4DuckTyping() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPhase((p) => (p + 1) % 2);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">4. Duck Typing</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-lg">
        If it walks like a duck and quacks like a duck... Python trusts it.
      </p>

      <div className="flex items-center gap-16 w-full justify-center">
        {/* Unrelated Objects */}
        <div className="flex flex-col gap-8 relative">
          <div
            className={cn(
              "bg-surface border-2 p-4 rounded-xl shadow-sm transition-all duration-500 w-56 flex flex-col items-center relative",
              phase === 0
                ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-105"
                : "border-hairline opacity-50",
            )}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
              No shared parent
            </div>
            <FileText className="size-8 text-emerald-500 mb-2" />
            <div className="font-mono text-sm font-bold">FileLogger</div>
            <div className="w-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs text-center py-1 mt-2 rounded border border-emerald-500/20">
              .write(msg)
            </div>
          </div>

          <div
            className={cn(
              "bg-surface border-2 p-4 rounded-xl shadow-sm transition-all duration-500 w-56 flex flex-col items-center relative",
              phase === 1
                ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-105"
                : "border-hairline opacity-50",
            )}
          >
            <Database className="size-8 text-purple-500 mb-2" />
            <div className="font-mono text-sm font-bold">DatabaseLogger</div>
            <div className="w-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-xs text-center py-1 mt-2 rounded border border-purple-500/20">
              .write(msg)
            </div>
          </div>

          {/* Connecting lines */}
          <svg className="absolute w-24 h-full left-full top-0 -z-10" viewBox="0 0 100 200">
            <motion.path
              d="M 0,50 C 50,50 50,100 100,100"
              fill="none"
              stroke={phase === 0 ? "#10b981" : "transparent"}
              strokeWidth="2"
              strokeDasharray="4 4"
              animate={{ strokeDashoffset: -20 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d="M 0,150 C 50,150 50,100 100,100"
              fill="none"
              stroke={phase === 1 ? "#a855f7" : "transparent"}
              strokeWidth="2"
              strokeDasharray="4 4"
              animate={{ strokeDashoffset: -20 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </div>

        {/* Target Function */}
        <div className="bg-surface border-2 border-blue-500/30 p-6 rounded-2xl shadow-xl w-80 relative z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest shadow-sm">
            Target Function
          </div>

          <div className="font-mono text-sm font-bold mb-4 bg-black/5 dark:bg-white/5 p-2 rounded whitespace-nowrap overflow-x-auto">
            <span className="text-pink-600">def</span>{" "}
            <span className="text-blue-500">save_log</span>(logger):
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;logger.write(msg)
          </div>

          <div className="text-xs text-muted-foreground border-t border-hairline pt-4 text-center">
            This function doesn't care about the object's class, as long as it has a{" "}
            <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-foreground font-mono">
              write()
            </code>{" "}
            method.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
