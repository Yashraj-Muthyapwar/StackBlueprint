import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Unlock,
} from "lucide-react";
import { cn } from "../../../lib/utils";

export function EncapsulationCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 6;

  const STEP_DURATIONS = [6000, 7000, 6000, 8000, 7000, 8000];

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % totalSteps),
      STEP_DURATIONS[step] || 5000,
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
      <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step0Concept key="step0" />}
          {step === 1 && <Step1DirectVsControlled key="step1" />}
          {step === 2 && <Step2Conventions key="step2" />}
          {step === 3 && <Step3Methods key="step3" />}
          {step === 4 && <Step4Getter key="step4" />}
          {step === 5 && <Step5Setter key="step5" />}
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
          <div className="font-mono text-xs text-muted-foreground">
            {step + 1} / {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------
// STEPS
// -----------------------------------------

function Step0Concept() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-2xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Why Encapsulation?</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
        Objects often contain critical data. We need to prevent outside code from assigning invalid
        values.
      </p>

      <div className="flex items-center gap-12">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/30">
            <AlertTriangle className="size-6" />
          </div>
          <div className="text-xs font-mono font-bold">Outside Code</div>
          <div className="text-[10px] text-muted-foreground font-mono bg-surface p-1 rounded border border-hairline">
            account.balance = -500
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative flex items-center justify-center p-6 bg-surface-2 rounded-2xl border-2 border-emerald-500/50 shadow-lg overflow-hidden"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-emerald-500/10"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -right-3 text-emerald-500/20"
          >
            <Shield className="size-20" />
          </motion.div>

          <div className="relative z-10 flex flex-col items-center gap-2">
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="bg-emerald-500/20 p-3 rounded-xl text-emerald-500 mb-1 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Shield className="size-6" />
            </motion.div>
            <div className="font-mono text-sm font-bold text-foreground drop-shadow-sm">
              BankAccount Object
            </div>
            <div className="bg-surface px-5 py-3 rounded-lg border border-hairline text-center w-full mt-2 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-bold">
                Protected Data
              </div>
              <div className="font-mono text-base font-bold text-foreground">balance: $1000</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Step1DirectVsControlled() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">
        Direct vs Controlled Access
      </h3>
      <p className="text-sm text-muted-foreground mb-10 text-center max-w-lg">
        Without rules, invalid states can happen. Encapsulation puts the rules at the door.
      </p>

      <div className="grid grid-cols-2 gap-8 w-full">
        {/* Bad: Direct Access */}
        <div className="flex flex-col items-center gap-4 bg-surface border border-hairline p-6 rounded-2xl relative">
          <div className="absolute -top-3 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/30">
            No Encapsulation
          </div>

          <div className="font-mono text-xs bg-black/5 dark:bg-white/5 p-2 rounded w-full text-center">
            account.balance = -500
          </div>

          <div className="h-8 flex items-center justify-center relative w-full">
            {/* Red animated attack beam */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 1 }}
                  animate={{ height: 32, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-1 bg-red-500 top-0 rounded-full drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                />
              )}
            </AnimatePresence>
            <motion.div
              animate={{ y: phase >= 1 ? [0, 5, 0] : 0 }}
              className="z-10 bg-surface rounded-full p-0.5"
            >
              <ArrowRight className="size-5 text-muted-foreground rotate-90" />
            </motion.div>
          </div>

          <motion.div
            animate={
              phase >= 1
                ? {
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.5)",
                    x: [-5, 5, -5, 5, 0], // Shake effect
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)",
                  }
                : {
                    backgroundColor: "var(--surface-2)",
                    borderColor: "var(--hairline)",
                    x: 0,
                    boxShadow: "none",
                  }
            }
            transition={{ duration: 0.4 }}
            className="w-full rounded-xl border p-4 flex flex-col items-center gap-2 relative overflow-hidden"
          >
            {phase >= 1 && <div className="absolute inset-0 bg-red-500/5 animate-pulse" />}
            <div className="text-[10px] text-muted-foreground font-mono relative z-10">balance</div>
            <motion.div className="font-mono text-lg font-bold text-foreground relative z-10">
              {phase >= 1 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-red-500 inline-block"
                >
                  -$500
                </motion.span>
              ) : (
                <span>$1000</span>
              )}
            </motion.div>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded relative z-10 border border-red-500/20"
              >
                <XCircle className="size-3" /> INVALID STATE
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Good: Controlled Access */}
        <div className="flex flex-col items-center gap-4 bg-surface border border-hairline p-6 rounded-2xl relative">
          <div className="absolute -top-3 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">
            Encapsulation
          </div>

          <div className="font-mono text-xs bg-black/5 dark:bg-white/5 p-2 rounded w-full text-center">
            account.withdraw(500)
          </div>

          <div className="h-8 flex flex-col items-center justify-center text-[10px] font-mono text-emerald-500 relative w-full">
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ height: 0, opacity: 1 }}
                  animate={{ height: 32, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-1 bg-emerald-500 top-0 rounded-full drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                />
              )}
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, y: 0 }}
              className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 absolute -right-20"
            >
              check balance &gt;= 500
            </motion.div>
            <motion.div
              animate={{ y: phase >= 2 ? [0, 5, 0] : 0 }}
              className="z-10 bg-surface rounded-full p-0.5"
            >
              <ArrowRight className="size-4 text-emerald-500 rotate-90" />
            </motion.div>
          </div>

          <motion.div
            animate={{
              backgroundColor: phase >= 2 ? "rgba(16, 185, 129, 0.1)" : "var(--surface-2)",
              borderColor: phase >= 2 ? "rgba(16, 185, 129, 0.5)" : "var(--hairline)",
              boxShadow: phase >= 2 ? "0 0 20px rgba(16, 185, 129, 0.2)" : "none",
              scale: phase >= 2 ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.4 }}
            className="w-full rounded-xl border p-4 flex flex-col items-center gap-2 relative overflow-hidden"
          >
            {phase >= 2 && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />}
            <div className="text-[10px] text-muted-foreground font-mono relative z-10">
              _balance
            </div>
            <motion.div className="font-mono text-lg font-bold text-foreground relative z-10">
              {phase >= 2 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-emerald-500 inline-block"
                >
                  $500
                </motion.span>
              ) : (
                <span>$1000</span>
              )}
            </motion.div>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded relative z-10 border border-emerald-500/20"
              >
                <CheckCircle2 className="size-3" /> ALLOWED
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Step2Conventions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">
        The Underscore Convention
      </h3>
      <p className="text-sm text-muted-foreground mb-8 text-center">
        Python uses naming conventions instead of strict access blockers.
      </p>

      <div className="flex items-center gap-10">
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-hairline p-4 rounded-xl flex items-center justify-between gap-6 w-64 shadow-sm">
            <div className="font-mono text-sm font-bold">self.owner</div>
            <div className="flex items-center gap-1 text-xs text-blue-500 font-bold bg-blue-500/10 px-2 py-1 rounded">
              <Unlock className="size-3" /> Public
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-amber-500/5 border-2 border-dashed border-amber-500/40 p-4 rounded-xl flex items-center justify-between gap-6 w-64 shadow-sm relative overflow-hidden"
          >
            <div className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
              self._balance
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-500/20 px-2 py-1 rounded">
              <AlertTriangle className="size-3" /> Internal
            </div>
          </motion.div>
        </div>

        <div className="bg-surface-2 p-5 rounded-2xl border border-hairline text-sm text-muted-foreground max-w-xs leading-relaxed">
          The{" "}
          <code className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 rounded font-mono">
            _
          </code>{" "}
          prefix says: <br />
          <br />
          <span className="italic text-foreground font-medium">
            "I am an internal detail. You can access me if you really need to, but you probably
            shouldn't."
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Step3Methods() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 2500);
    const t3 = setTimeout(() => setPhase(3), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Methods as Gatekeepers</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-lg">
        Methods act as gatekeepers, running validation before the internal data is touched.
      </p>

      <div className="relative w-full h-[220px] flex justify-center mt-4">
        {/* Gatekeeper Method */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 z-20">
          <div className="bg-surface border-2 border-blue-500/50 rounded-2xl p-4 shadow-lg flex flex-col items-center w-40">
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
              Gatekeeper Method
            </div>
            <div className="font-mono text-sm bg-black/5 dark:bg-white/5 w-full text-center py-2 rounded">
              deposit(
              <motion.span animate={{ color: phase >= 1 ? "#3b82f6" : "inherit" }}>200</motion.span>
              )
            </div>

            <div className="h-8 mt-2 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {phase === 0 && (
                  <span key="wait" className="text-[10px] text-muted-foreground">
                    Waiting...
                  </span>
                )}
                {phase === 1 && (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-blue-500 font-mono"
                  >
                    if amount &gt; 0:
                  </motion.span>
                )}
                {phase >= 2 && (
                  <motion.span
                    key="pass"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-500"
                  >
                    <CheckCircle2 className="size-3" /> PASSED
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Arrow path */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 800 220"
        >
          {/* The track */}
          <path
            d="M 200,110 L 500,110"
            fill="none"
            stroke="var(--hairline)"
            strokeWidth="4"
            strokeDasharray="8 8"
          />

          {/* Glowing trail */}
          {phase >= 2 && (
            <motion.path
              d="M 200,110 L 500,110"
              fill="none"
              stroke="rgba(16,185,129,0.3)"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          )}

          {phase >= 2 && (
            <motion.circle
              cx="200"
              cy="110"
              r="16"
              fill="#10b981"
              style={{ filter: "drop-shadow(0px 0px 8px rgba(16,185,129,0.8))" }}
              initial={{ cx: 200 }}
              animate={{ cx: 500 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
          {phase >= 2 && (
            <motion.text
              x="200"
              y="114"
              fill="white"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
              initial={{ x: 200 }}
              animate={{ x: 500 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              +
            </motion.text>
          )}
        </svg>

        {/* Internal State */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20">
          <div className="bg-surface-2 border-2 border-dashed border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col items-center w-48 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">
              Internal
            </div>

            <div className="text-sm font-mono text-muted-foreground mt-2 mb-1">_balance</div>

            <motion.div
              animate={{
                scale: phase >= 3 ? [1, 1.1, 1] : 1,
                color: phase >= 3 ? "#10b981" : "var(--foreground)",
              }}
              className="font-mono text-3xl font-bold"
            >
              ${phase >= 3 ? "1200" : "1000"}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step4Getter() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Property Getters</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-lg">
        A <code className="text-blue-500 bg-blue-500/10 px-1 rounded">@property</code> lets outside
        code read data naturally, while secretly running a method.
      </p>

      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Outside */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
            Outside
          </div>
          <div className="bg-surface border border-hairline p-4 rounded-xl shadow-sm">
            <div className="font-mono text-sm">
              print(<span className="text-blue-500 font-bold">account.balance</span>)
            </div>

            <div className="mt-4 h-6 border-t border-hairline pt-2 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {phase >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-emerald-500 font-bold"
                  >
                    1000
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center justify-center text-[10px] font-mono text-blue-500 w-32 relative">
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className="h-0.5 bg-blue-500 absolute top-1/2 -translate-y-1/2 left-0 origin-left"
              />
            )}
          </AnimatePresence>
          <div className="bg-background px-2 relative z-10 text-center">
            <span className="text-blue-500 bg-blue-500/10 px-1 rounded">@property</span>
            <br />
            intercepts
          </div>
        </div>

        {/* Inside */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
            Inside Class
          </div>
          <div className="bg-surface-2 border-2 border-dashed border-hairline p-4 rounded-xl shadow-sm text-sm font-mono text-left">
            <span className="text-blue-500">def</span>{" "}
            <span className="text-emerald-400">balance</span>(self):
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-500">return</span> self.
            <motion.span animate={{ color: phase >= 2 ? "#10b981" : "inherit" }}>
              _balance
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step5Setter() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 2500);
    const t3 = setTimeout(() => setPhase(3), 4500);
    const t4 = setTimeout(() => setPhase(4), 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Property Setters</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-lg">
        A <code className="text-purple-500 bg-purple-500/10 px-1 rounded">@setter</code> intercepts
        assignments to enforce rules while keeping natural syntax.
      </p>

      <div className="grid grid-cols-2 gap-8 w-full mt-4">
        {/* Assignment UI */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
            Client Code
          </div>

          <div
            className={cn(
              "bg-surface border p-4 rounded-xl font-mono text-sm transition-colors",
              phase >= 1 && phase < 3
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-hairline",
            )}
          >
            product.price = <span className="text-emerald-500 font-bold">850</span>
          </div>

          <div
            className={cn(
              "bg-surface border p-4 rounded-xl font-mono text-sm transition-colors",
              phase >= 3 ? "border-red-500/50 bg-red-500/5" : "border-hairline",
            )}
          >
            product.price = <span className="text-red-500 font-bold">-100</span>
          </div>
        </div>

        {/* Setter Logic */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex justify-between">
            <span>Setter Logic</span>
            <span className="text-purple-500 bg-purple-500/10 px-1 rounded text-[9px]">
              @price.setter
            </span>
          </div>

          <div className="bg-surface-2 border border-hairline p-4 rounded-xl font-mono text-sm shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-purple-500">def</span>{" "}
              <span className="text-emerald-400">price</span>(self,{" "}
              <span className="text-orange-400">value</span>):
            </div>
            <div className="pl-4 border-l-2 border-hairline relative">
              <AnimatePresence mode="wait">
                {phase >= 1 && phase < 3 && (
                  <motion.div
                    key="check-850"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, position: "absolute" }}
                  >
                    <span className="text-pink-500">if</span>{" "}
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded">
                      850
                    </span>{" "}
                    &gt;= 0: <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;self._price ={" "}
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded">
                      850
                    </span>
                  </motion.div>
                )}
                {phase >= 3 && (
                  <motion.div
                    key="check-100"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-pink-500">if</span>{" "}
                    <span className="text-red-500 font-bold bg-red-500/10 px-1 rounded">-100</span>{" "}
                    &gt;= 0: <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="opacity-50">
                      self._price = value
                    </span>{" "}
                    <br />
                    <span className="text-pink-500">else</span>: <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-red-500 font-bold bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                      raise ValueError
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status overlay */}
              <AnimatePresence>
                {phase === 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center text-emerald-500"
                  >
                    <CheckCircle2 className="size-8" />
                    <span className="text-[10px] font-bold mt-1">UPDATED</span>
                  </motion.div>
                )}
                {phase === 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center text-red-500"
                  >
                    <XCircle className="size-8" />
                    <span className="text-[10px] font-bold mt-1">REJECTED</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
