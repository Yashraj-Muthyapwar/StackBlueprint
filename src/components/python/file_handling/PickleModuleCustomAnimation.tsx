import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  HardDrive,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Braces,
  Binary,
  Server,
  AlertTriangle,
  Skull,
  Terminal,
  Save,
  Trash2,
  ArrowLeftRight,
} from "lucide-react";

export function PickleModuleCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 11;

  const STEP_DURATIONS = [4000, 3000, 3000, 4500, 4000, 5000, 5000, 6000, 4000, 5000, 6000];

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % totalSteps),
      STEP_DURATIONS[step] || 4000,
    );
    return () => window.clearTimeout(id);
  }, [playing, step, isHovered]);

  const go = useCallback((delta: number) => {
    setPlaying(false);
    setStep((s) => (s + delta + totalSteps) % totalSteps);
  }, []);

  return (
    <div
      className="flex flex-col relative z-10 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative px-4 py-8 lg:px-8 lg:py-10 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step1Object key="step1" />}
          {step === 1 && <Step2Dumps key="step2" />}
          {step === 2 && <Step3Loads key="step3" />}
          {step === 3 && <Step4Dump key="step4" />}
          {step === 4 && <Step5Load key="step5" />}
          {step === 5 && <Step6Payload key="step6" />}
          {step === 6 && <Step7Server key="step7" />}
          {step === 7 && <Step8Exploit key="step8" />}
          {step === 8 && <Step9WriteTemp key="step9" />}
          {step === 9 && <Step10Crash key="step10" />}
          {step === 10 && <Step11Atomic key="step11" />}
        </AnimatePresence>
      </div>

      {/* Controls */}
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
            onClick={() => setPlaying(!playing)}
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
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded bg-surface border border-hairline text-muted-foreground shadow-sm">
            {step <= 4 ? "Phase 1: Basics" : step <= 7 ? "Phase 2: Security" : "Phase 3: Cache"}
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            {step + 1} / {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1Object() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-mint">data</span> = {"{"} <span className="text-amber">'user'</span>:{" "}
        <span className="text-amber">'Ada'</span>, <span className="text-amber">'id'</span>:{" "}
        <span className="text-violet">101</span> {"}"}
      </div>
      <div className="flex justify-center gap-16 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="memory-object"
            className="p-6 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center relative min-w-[200px] shadow-sm"
          >
            <Cpu className="size-8 text-violet mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold">
              Memory (RAM)
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 flex flex-col gap-2 w-full"
            >
              <div className="p-4 rounded-lg bg-surface border border-violet/30 shadow-sm flex flex-col items-center">
                <Braces className="size-6 text-violet/70 mb-2" />
                <span className="text-sm font-mono text-foreground">Python Dictionary</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <div className="flex flex-col items-center gap-3 opacity-30 saturate-0 pointer-events-none">
          <motion.div
            layoutId="disk"
            className="p-6 rounded-2xl bg-surface-2/40 border border-hairline flex flex-col items-center min-w-[200px]"
          >
            <HardDrive className="size-8 text-muted-foreground mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Disk
            </span>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">
        Python objects like dictionaries, lists, and classes live in memory. You can't write a
        dictionary directly to a text file.
      </p>
    </motion.div>
  );
}

function Step2Dumps() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-blue-400">import</span> pickle
        <br />
        <span className="text-mint">blob</span> = pickle.dumps(
        <span className="text-mint">data</span>)
      </div>
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="memory-object"
            className="p-6 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center min-w-[200px] shadow-sm"
          >
            <Cpu className="size-8 text-violet mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold">
              Memory (Object)
            </span>
            <div className="mt-5 p-4 rounded-lg bg-surface border border-violet/30 shadow-sm flex flex-col items-center w-full">
              <Braces className="size-6 text-violet/70 mb-2" />
              <span className="text-sm font-mono text-foreground">Python Dictionary</span>
            </div>
          </motion.div>
        </div>

        {/* Animated flow */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 20, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="flex flex-col items-center text-sky-500 font-mono text-[10px]"
          >
            <span>serialize</span>
            <ArrowRight className="size-6" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="memory-bytes"
            className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[200px] shadow-sm relative overflow-hidden"
          >
            <Cpu className="size-8 text-sky-500 mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold">
              Memory (Bytes)
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-5 w-full bg-surface border border-sky-500/30 rounded shadow-inner p-4 flex flex-col items-center"
            >
              <Binary className="size-6 text-sky-500/70 mb-2" />
              <span className="text-sm font-mono text-foreground">b'\\x80\\x04\\x95\\x18...'</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-md text-center">
        <code className="bg-surface-2 px-1 rounded">pickle.dumps()</code> serializes (packs) the
        rich Python object into a raw stream of binary bytes.
      </p>
    </motion.div>
  );
}

function Step3Loads() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-mint">restored</span> = pickle.loads(
        <span className="text-mint">blob</span>)
      </div>
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="memory-bytes"
            className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[200px] shadow-sm relative overflow-hidden"
          >
            <Cpu className="size-8 text-sky-500 mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold">
              Memory (Bytes)
            </span>
            <div className="mt-5 w-full bg-surface border border-sky-500/30 rounded shadow-inner p-4 flex flex-col items-center">
              <Binary className="size-6 text-sky-500/70 mb-2" />
              <span className="text-sm font-mono text-foreground">b'\\x80\\x04\\x95\\x18...'</span>
            </div>
          </motion.div>
        </div>

        {/* Animated flow */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 20, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="flex flex-col items-center text-violet font-mono text-[10px]"
          >
            <span>deserialize</span>
            <ArrowRight className="size-6 text-violet" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="memory-object"
            className="p-6 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center min-w-[200px] shadow-sm"
          >
            <Cpu className="size-8 text-violet mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold">
              Memory (Object)
            </span>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-5 p-4 rounded-lg bg-surface border border-violet/30 shadow-sm flex flex-col items-center w-full"
            >
              <Braces className="size-6 text-violet/70 mb-2" />
              <span className="text-sm font-mono text-foreground">Python Dictionary</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-md text-center">
        <code className="bg-surface-2 px-1 rounded">pickle.loads()</code> takes those bytes and
        reconstructs an exact, independent copy of the original Python object.
      </p>
    </motion.div>
  );
}

function Step4Dump() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-mint/30 bg-mint/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(
        <span className="text-amber">'cache.pkl'</span>, <span className="text-amber">'wb'</span>){" "}
        <span className="text-blue-400">as</span> f:
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;pickle.dump(<span className="text-mint">data</span>, f)
      </div>
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="memory-object"
            className="p-6 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center min-w-[200px] shadow-sm"
          >
            <Cpu className="size-8 text-violet mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold">
              Memory
            </span>
            <div className="mt-5 p-4 rounded-lg bg-surface border border-violet/30 shadow-sm flex flex-col items-center w-full">
              <Braces className="size-6 text-violet/70 mb-2" />
              <span className="text-sm font-mono text-foreground">Python Dictionary</span>
            </div>
          </motion.div>
        </div>

        {/* Animated flow */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 20, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="flex flex-col items-center text-mint font-mono text-[10px]"
          >
            <span>bytes</span>
            <ArrowRight className="size-6 text-mint" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="disk-cache"
            className="p-6 rounded-2xl bg-mint/10 border border-mint/20 flex flex-col items-center min-w-[200px] shadow-sm relative overflow-hidden"
          >
            <HardDrive className="size-8 text-mint mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint font-semibold">
              Disk (Cache)
            </span>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.8 }}
              className="mt-5 w-full bg-surface border border-mint/30 rounded shadow-inner p-4 flex flex-col items-center"
            >
              <div className="text-[10px] uppercase font-mono text-muted-foreground mb-2 border-b border-hairline pb-1 w-full text-center">
                cache.pkl
              </div>
              <Binary className="size-6 text-mint/70 mb-2" />
              <span className="text-xs font-mono text-foreground/80 break-all text-center leading-tight">
                \\x80\\x04\\x95\\x18\\x00...
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">
        <code className="bg-surface-2 px-1 rounded">pickle.dump()</code> does both steps at once: it
        serializes the object and writes the raw bytes directly to a file opened in binary write (
        <code className="bg-surface-2 px-1 rounded">"wb"</code>) mode.
      </p>
    </motion.div>
  );
}

function Step5Load() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(
        <span className="text-amber">'cache.pkl'</span>, <span className="text-amber">'rb'</span>){" "}
        <span className="text-blue-400">as</span> f:
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint">restored</span> = pickle.load(f)
      </div>
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="disk-cache"
            className="p-6 rounded-2xl bg-mint/10 border border-mint/20 flex flex-col items-center min-w-[200px] shadow-sm relative overflow-hidden"
          >
            <HardDrive className="size-8 text-mint mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint font-semibold">
              Disk (Cache)
            </span>

            <div className="mt-5 w-full bg-surface border border-mint/30 rounded shadow-inner p-4 flex flex-col items-center">
              <div className="text-[10px] uppercase font-mono text-muted-foreground mb-2 border-b border-hairline pb-1 w-full text-center">
                cache.pkl
              </div>
              <Binary className="size-6 text-mint/70 mb-2" />
              <span className="text-xs font-mono text-foreground/80 break-all text-center leading-tight">
                \\x80\\x04\\x95\\x18\\x00...
              </span>
            </div>
          </motion.div>
        </div>

        {/* Animated flow */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 20, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="flex flex-col items-center text-violet font-mono text-[10px]"
          >
            <span>read + deserialize</span>
            <ArrowRight className="size-6 text-violet" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            layoutId="memory-object"
            className="p-6 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center min-w-[200px] shadow-sm"
          >
            <Cpu className="size-8 text-violet mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold">
              Memory (Object)
            </span>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-5 p-4 rounded-lg bg-surface border border-violet/30 shadow-sm flex flex-col items-center w-full"
            >
              <Braces className="size-6 text-violet/70 mb-2" />
              <span className="text-sm font-mono text-foreground">Python Dictionary</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">
        <code className="bg-surface-2 px-1 rounded">pickle.load()</code> reads the binary file and
        reconstructs the object in one step.
      </p>
    </motion.div>
  );
}

function Step6Payload() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-8 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-rose-400">class</span>{" "}
        <span className="text-amber">MaliciousCode</span>:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">def</span>{" "}
        <span className="text-blue-400">__reduce__</span>(
        <span className="text-rose-400">self</span>):
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span className="text-blue-400">return</span> (os.system, (
        <span className="text-amber">'rm -rf /'</span>,))
      </div>
      <div className="flex justify-center gap-12 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            layoutId="attacker"
            className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center min-w-[200px] shadow-sm"
          >
            <AlertTriangle className="size-8 text-rose-500 mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-500 font-semibold">
              Attacker
            </span>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 p-3 rounded-lg bg-surface border border-rose-500/30 shadow-sm flex flex-col items-center w-full"
            >
              <Binary className="size-6 text-rose-500/70 mb-2" />
              <span className="text-xs font-mono text-foreground text-center">
                payload.pkl
                <br />
                <span className="text-muted-foreground text-[10px]">(Malicious binary data)</span>
              </span>
            </motion.div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3 opacity-30 saturate-0 pointer-events-none relative z-10">
          <motion.div
            layoutId="disk"
            className="p-6 rounded-2xl bg-surface-2/40 border border-hairline flex flex-col items-center min-w-[200px]"
          >
            <Server className="size-8 text-muted-foreground mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Victim Server
            </span>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-md text-center">
        Because pickling handles rich objects, an attacker can craft a file that executes arbitrary
        code when unpickled.
      </p>
    </motion.div>
  );
}

function Step7Server() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-8 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-muted-foreground"># Server receives user upload and loads it</span>
        <br />
        <span className="text-mint">user_data</span> = pickle.loads(
        <span className="text-amber">untrusted_bytes</span>)
      </div>
      <div className="flex justify-center gap-12 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            layoutId="attacker"
            className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center min-w-[200px] shadow-sm"
          >
            <AlertTriangle className="size-8 text-rose-500 mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-500 font-semibold">
              Attacker
            </span>
            <div className="mt-5 p-3 rounded-lg bg-surface border border-rose-500/30 shadow-sm flex flex-col items-center w-full">
              <Binary className="size-6 text-rose-500/70 mb-2" />
              <span className="text-xs font-mono text-foreground">payload.pkl</span>
            </div>
          </motion.div>
        </div>

        {/* Animated flow */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 30, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="flex flex-col items-center text-rose-500 font-mono text-[10px]"
          >
            <span>Upload via HTTP</span>
            <ArrowRight className="size-6" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            layoutId="victim-server"
            className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[200px] shadow-sm overflow-hidden"
          >
            <Server className="size-8 text-sky-500 mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold">
              Victim Server
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-5 w-full bg-surface border border-sky-500/30 rounded shadow-inner p-3 flex flex-col items-center"
            >
              <Cpu className="size-6 text-sky-500/70 mb-2" />
              <span className="text-[10px] font-mono text-foreground bg-surface-2 px-1 rounded">
                pickle.loads()
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-md text-center">
        The server receives the file and runs{" "}
        <code className="bg-surface-2 px-1 rounded">pickle.loads()</code> on it, wrongly assuming
        it's just passive data.
      </p>
    </motion.div>
  );
}

function Step8Exploit() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <motion.div
        animate={{ opacity: [1, 0.8, 1, 0.5, 1], x: [-1, 2, -2, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.2 }}
        className="mb-8 p-4 rounded-xl border border-rose-500/50 bg-rose-500/20 font-mono text-sm shadow-[0_0_15px_rgba(244,63,94,0.5)] w-full max-w-lg border-dashed"
      >
        <span className="text-rose-400 font-bold">CRITICAL ERROR: Connection lost.</span>
      </motion.div>
      <div className="flex justify-center gap-12 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3 relative z-10 opacity-30 saturate-0">
          <motion.div
            layoutId="attacker"
            className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center min-w-[200px] shadow-sm"
          >
            <AlertTriangle className="size-8 text-rose-500 mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-500 font-semibold">
              Attacker
            </span>
            <div className="mt-5 p-3 rounded-lg bg-surface border border-rose-500/30 shadow-sm flex flex-col items-center w-full">
              <Binary className="size-6 text-rose-500/70 mb-2" />
              <span className="text-xs font-mono text-foreground">payload.pkl</span>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            layoutId="victim-server"
            initial={{
              backgroundColor: "rgba(14, 165, 233, 0.1)",
              borderColor: "rgba(14, 165, 233, 0.2)",
              boxShadow: "0 0 0 rgba(244, 63, 94, 0)",
            }}
            animate={{
              backgroundColor: "rgba(244, 63, 94, 0.15)",
              borderColor: "rgba(244, 63, 94, 0.6)",
              boxShadow: "0 0 40px rgba(244, 63, 94, 0.3)",
            }}
            className="p-6 rounded-2xl flex flex-col items-center min-w-[200px] relative overflow-hidden border-2"
          >
            <motion.div
              animate={{ rotate: [-5, 5, -5], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Skull className="size-8 text-rose-500 mb-3" />
            </motion.div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-500 font-semibold">
              Compromised
            </span>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 w-full bg-slate-900 border border-rose-500/30 rounded shadow-inner p-3 flex flex-col"
            >
              <div className="flex items-center gap-1 text-[10px] text-rose-400 mb-1 border-b border-rose-500/30 pb-1">
                <Terminal className="size-3" /> Shell Executed
              </div>
              <span className="text-xs font-mono text-rose-400">Executing: rm -rf /</span>
              <span className="text-[10px] font-mono text-muted-foreground mt-1">
                Data deleted.
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-md text-center">
        Before the <code className="bg-surface-2 px-1 rounded">loads()</code> function even
        finishes, the malicious code executes.{" "}
        <strong className="text-rose-400 font-semibold">Never unpickle untrusted data.</strong>
      </p>
    </motion.div>
  );
}

function Step9WriteTemp() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-8 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-muted-foreground"># Write to a temporary file first</span>
        <br />
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(
        <span className="text-amber">'.cache.pkl.tmp'</span>,{" "}
        <span className="text-amber">'wb'</span>) <span className="text-blue-400">as</span> f:
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;pickle.dump(<span className="text-mint">new_data</span>, f)
      </div>
      <div className="flex justify-center gap-12 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            layoutId="memory-new"
            className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[160px] shadow-sm"
          >
            <Cpu className="size-8 text-sky-500 mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold">
              Memory
            </span>
            <div className="mt-5 p-3 rounded-lg bg-surface border border-sky-500/30 shadow-sm flex flex-col items-center w-full">
              <span className="text-xs font-mono text-foreground">new_data</span>
            </div>
          </motion.div>
        </div>

        {/* Animated flow */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 20, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="flex flex-col items-center text-sky-500 font-mono text-[10px]"
          >
            <span>writing...</span>
            <ArrowRight className="size-6" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            layoutId="disk-dir"
            className="p-6 rounded-2xl bg-surface-2/40 border border-hairline flex flex-col items-center min-w-[200px] shadow-sm"
          >
            <HardDrive className="size-8 text-muted-foreground mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Disk Directory
            </span>

            <div className="mt-5 w-full flex flex-col gap-2">
              <div className="bg-surface border border-hairline rounded p-2 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <Binary className="size-3" /> cache.pkl
                </div>
                <span className="text-[9px] text-muted-foreground uppercase">Old Data</span>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3 }}
                className="bg-surface border border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.2)] rounded p-2 flex items-center justify-between origin-left"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-sky-500">
                  <Save className="size-3" /> .cache.pkl.tmp
                </div>
                <span className="text-[9px] text-sky-500 uppercase">Writing...</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-md text-center">
        Never write directly to your final cache path. Write to a temporary sibling file instead.
      </p>
    </motion.div>
  );
}

function Step10Crash() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-8 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-muted-foreground"># If process crashes mid-write...</span>
        <br />
        <span className="text-rose-400">Exception: MemoryError or Power Failure</span>
      </div>
      <div className="flex justify-center gap-12 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3 relative z-10 opacity-30 saturate-0">
          <motion.div
            layoutId="memory-new"
            className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[160px] shadow-sm"
          >
            <Cpu className="size-8 text-sky-500 mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold">
              Memory
            </span>
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            layoutId="disk-dir"
            className="p-6 rounded-2xl bg-surface-2/40 border border-hairline flex flex-col items-center min-w-[200px] shadow-sm relative"
          >
            <HardDrive className="size-8 text-muted-foreground mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Disk Directory
            </span>

            <div className="mt-5 w-full flex flex-col gap-2 relative">
              <div className="bg-mint/10 border border-mint/30 rounded p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-mint">
                  <Binary className="size-3" /> cache.pkl
                </div>
                <span className="text-[9px] text-mint uppercase font-semibold">Safe (Intact)</span>
              </div>

              <motion.div
                animate={{ x: [-2, 2, -2, 2, 0], y: [1, -1, 1, -1, 0] }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-rose-500/10 border border-rose-500/40 rounded p-2 flex items-center justify-between relative overflow-hidden mt-1"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
                  <Trash2 className="size-3" /> .cache.pkl.tmp
                </div>
                <span className="text-[9px] text-rose-400 uppercase font-bold">Corrupted</span>

                {/* Strikethrough line */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1.1, opacity: 1, rotate: -2 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 10 }}
                  className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 origin-left"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -right-4 -top-4 bg-surface rounded-full p-1 shadow-md"
            >
              <AlertTriangle className="size-8 text-rose-500 fill-rose-500/20" />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-md text-center">
        If a crash happens mid-write, the{" "}
        <code className="bg-surface-2 px-1 rounded">cache.pkl</code> is safe. Only the temporary
        file is corrupted.
      </p>
    </motion.div>
  );
}

function Step11Atomic() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-8 p-4 rounded-xl border border-mint/30 bg-mint/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-muted-foreground"># Once write succeeds, atomically replace</span>
        <br />
        <span className="text-mint">temporary_path</span>.replace(
        <span className="text-amber">'cache.pkl'</span>)
      </div>
      <div className="flex justify-center gap-12 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3 relative z-10 opacity-0 pointer-events-none w-[160px]">
          {/* Spacer */}
        </div>

        <div className="flex flex-col items-center gap-3 relative z-10 -ml-24">
          <motion.div
            layoutId="disk-dir"
            className="p-6 rounded-2xl bg-surface-2/40 border border-hairline flex flex-col items-center min-w-[280px] shadow-sm relative"
          >
            <HardDrive className="size-8 text-muted-foreground mb-3" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Disk Directory
            </span>

            <div className="mt-5 w-full flex flex-col gap-2">
              {/* Atomic swap animation */}
              <div className="relative h-16 w-full">
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ delay: 0.5, duration: 0.2 }}
                  className="absolute inset-x-0 top-0 bg-surface border border-hairline rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <Binary className="size-3" /> cache.pkl
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase">Deleted</span>
                </motion.div>

                <motion.div
                  initial={{ y: 32 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-x-0 top-0 bg-mint/10 border border-mint/40 shadow-[0_0_15px_rgba(64,224,180,0.15)] rounded p-2 flex items-center justify-between z-10"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-mint font-semibold">
                    <Save className="size-3" /> cache.pkl
                  </div>
                  <span className="text-[9px] text-mint uppercase font-semibold">New Data</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute inset-x-0 top-8 bg-sky-500/10 border border-sky-500/40 rounded p-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-sky-500">
                    <Save className="size-3" /> .cache.pkl.tmp
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -right-6 top-1/2 -translate-y-1/2 bg-mint/20 text-mint rounded-full px-3 py-1 text-[10px] font-mono font-bold border border-mint/30 shadow-sm flex items-center gap-1"
            >
              <ArrowLeftRight className="size-3" /> Atomic
            </motion.div>
          </motion.div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-md text-center">
        The operating system's <code className="bg-surface-2 px-1 rounded">replace()</code> swaps
        the file atomically. A reader will only ever see the complete old file or complete new file.
      </p>
    </motion.div>
  );
}
