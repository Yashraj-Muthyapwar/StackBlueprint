import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Users,
  UserCircle,
  Briefcase,
  CornerDownRight,
  Laptop,
  PenTool,
  Search,
  ArrowUp,
  Zap,
  Sparkles,
  Building2,
  Terminal,
  Paintbrush,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "../../../lib/utils";

export function InheritanceCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 6;

  const STEP_DURATIONS = [6000, 7000, 7000, 8000, 8000, 7000];

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
          {step === 0 && <Step0Tree key="step0" />}
          {step === 1 && <Step1InheritanceFlow key="step1" />}
          {step === 2 && <Step2MRO key="step2" />}
          {step === 3 && <Step3Super key="step3" />}
          {step === 4 && <Step4Override key="step4" />}
          {step === 5 && <Step5Directory key="step5" />}
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

function Step0Tree() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-[720px]"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Why Inheritance?</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
        Many objects share common behavior but still need their own specialized features.
      </p>

      <div className="relative w-full h-[250px] mt-2">
        {/* Parent */}
        <motion.div
          initial={{ y: -20, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          transition={{ delay: 0.1 }}
          className="absolute top-0 left-1/2 z-20 flex flex-col items-center gap-2"
        >
          <div className="bg-blue-500/10 p-4 rounded-2xl border-2 border-blue-500/30 flex flex-col items-center w-40 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-blue-500/10"
            />
            <Users className="size-6 text-blue-500 mb-2 relative z-10" />
            <div className="font-mono font-bold text-blue-500 relative z-10">Employee</div>
            <div className="text-[10px] text-muted-foreground mt-2 border-t border-blue-500/20 pt-2 w-full text-center relative z-10">
              name, salary
              <br />
              work()
            </div>
          </div>
        </motion.div>

        {/* SVG Branches */}
        <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 720 250">
          <motion.path
            d="M 360,115 L 360,135 L 210,135 L 210,160"
            fill="none"
            stroke="var(--hairline)"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
          <motion.path
            d="M 360,115 L 360,135 L 510,135 L 510,160"
            fill="none"
            stroke="var(--hairline)"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />

          {/* Energy flows */}
          <motion.circle
            r="4"
            fill="#3b82f6"
            style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}
            animate={{ offsetDistance: ["0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="motion-path-1"
          />
          <motion.circle
            r="4"
            fill="#3b82f6"
            style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}
            animate={{ offsetDistance: ["0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 2 }}
            className="motion-path-2"
          />
        </svg>
        <style
          dangerouslySetInnerHTML={{
            __html: `
           .motion-path-1 { offset-path: path("M 360,115 L 360,135 L 210,135 L 210,160"); }
           .motion-path-2 { offset-path: path("M 360,115 L 360,135 L 510,135 L 510,160"); }
         `,
          }}
        />

        {/* Child 1 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute top-[160px] left-[130px] z-20 flex flex-col items-center gap-2"
        >
          <div className="bg-emerald-500/10 p-3 rounded-2xl border-2 border-emerald-500/30 flex flex-col items-center w-40 backdrop-blur-md">
            <Laptop className="size-5 text-emerald-500 mb-2" />
            <div className="font-mono font-bold text-emerald-500">Developer</div>
            <div className="text-[10px] text-emerald-500/70 mt-1 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
              + write_code()
            </div>
          </div>
        </motion.div>

        {/* Child 2 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute top-[160px] left-[430px] z-20 flex flex-col items-center gap-2"
        >
          <div className="bg-purple-500/10 p-3 rounded-2xl border-2 border-purple-500/30 flex flex-col items-center w-40 backdrop-blur-md">
            <PenTool className="size-5 text-purple-500 mb-2" />
            <div className="font-mono font-bold text-purple-500">Designer</div>
            <div className="text-[10px] text-purple-500/70 mt-1 font-mono bg-purple-500/10 px-2 py-0.5 rounded">
              + create_mockup()
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Step1InheritanceFlow() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000); // Flow starts
    const t2 = setTimeout(() => setPhase(2), 2500); // Flow complete
    const t3 = setTimeout(() => setPhase(3), 3500); // Add specific
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
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Receiving Behavior</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-lg">
        A child class automatically receives the capabilities of its parent, then adds its own.
      </p>

      <div className="grid grid-cols-2 gap-20 w-full relative">
        {/* Parent */}
        <div className="bg-surface border border-hairline p-5 rounded-2xl flex flex-col items-center shadow-lg relative">
          <div className="absolute -top-3 bg-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/30">
            Parent
          </div>
          <div className="font-mono font-bold text-lg mb-4 text-foreground">Employee</div>
          <div className="w-full flex flex-col gap-2">
            <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20 font-mono text-sm text-center">
              name
            </div>
            <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20 font-mono text-sm text-center">
              salary
            </div>
            <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20 font-mono text-sm text-center">
              work()
            </div>
          </div>
        </div>

        {/* Arrow/Flow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <AnimatePresence>
            {phase >= 1 && phase < 2 && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 100, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="flex items-center gap-2 bg-emerald-500/20 text-emerald-500 font-bold text-xs px-4 py-2 rounded-full border border-emerald-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <Sparkles className="size-4" /> Inheriting...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Child */}
        <div className="bg-surface border border-hairline p-5 rounded-2xl flex flex-col items-center shadow-lg relative">
          <div className="absolute -top-3 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">
            Child
          </div>
          <div className="font-mono font-bold text-lg mb-4 text-foreground">Developer</div>
          <div className="w-full flex flex-col gap-2">
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-2 bg-emerald-500/5 p-2 rounded-lg border border-dashed border-emerald-500/30"
                >
                  <div className="text-[9px] uppercase tracking-widest text-emerald-500/70 text-center font-bold mb-1">
                    Inherited
                  </div>
                  <div className="bg-emerald-500/10 p-1.5 rounded font-mono text-xs text-center text-emerald-600 dark:text-emerald-400">
                    name
                  </div>
                  <div className="bg-emerald-500/10 p-1.5 rounded font-mono text-xs text-center text-emerald-600 dark:text-emerald-400">
                    salary
                  </div>
                  <div className="bg-emerald-500/10 p-1.5 rounded font-mono text-xs text-center text-emerald-600 dark:text-emerald-400">
                    work()
                  </div>
                </motion.div>
              )}
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/30 mt-2"
                >
                  <div className="text-[9px] uppercase tracking-widest text-purple-500/70 text-center font-bold mb-1">
                    Added
                  </div>
                  <div className="bg-purple-500/20 p-2 rounded font-mono text-sm text-center font-bold text-purple-600 dark:text-purple-400">
                    write_code()
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step2MRO() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000); // Look in child
    const t2 = setTimeout(() => setPhase(2), 2500); // Fail, move up
    const t3 = setTimeout(() => setPhase(3), 4000); // Found in parent
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
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Method Resolution</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
        Python searches the child class first. If it can't find the method, it looks up the family
        tree.
      </p>

      <div className="relative w-full h-[250px] flex flex-col items-center mt-4">
        {/* Method Call Request */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 font-mono text-sm bg-surface px-4 py-2 rounded-lg border border-hairline shadow-sm">
          developer.<span className="text-blue-500 font-bold">introduce()</span>
        </div>

        <div className="absolute left-[200px] w-48 h-full flex flex-col items-center justify-between">
          {/* Parent Class */}
          <motion.div
            animate={{
              borderColor: phase === 3 ? "rgba(16,185,129,0.5)" : "var(--hairline)",
              boxShadow: phase === 3 ? "0 0 20px rgba(16,185,129,0.2)" : "none",
            }}
            className="bg-surface p-4 rounded-xl border-2 w-full text-center relative transition-all duration-300"
          >
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
              Parent
            </div>
            <div className="font-mono font-bold text-foreground">Employee</div>
            <div className="mt-2 text-xs font-mono bg-black/5 dark:bg-white/5 p-1 rounded">
              introduce()
            </div>

            {phase === 3 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1 shadow-md"
              >
                <CheckCircle2 className="size-4" />
              </motion.div>
            )}
          </motion.div>

          {/* Path */}
          <div className="h-16 w-0.5 bg-hairline relative">
            <motion.div
              animate={{ opacity: phase === 2 ? [0, 1, 0] : 0 }}
              transition={{ duration: 1, repeat: phase === 2 ? Infinity : 0 }}
              className="absolute inset-0 w-0.5 bg-blue-500"
            />
            <motion.div
              animate={{ opacity: phase === 2 ? 1 : 0, y: phase === 2 ? -20 : 10 }}
              transition={{ duration: 1, repeat: phase === 2 ? Infinity : 0 }}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 text-blue-500"
            >
              <ArrowUp className="size-4" />
            </motion.div>
          </div>

          {/* Child Class */}
          <motion.div
            animate={{
              borderColor: phase === 1 ? "rgba(239,68,68,0.5)" : "var(--hairline)",
            }}
            className="bg-surface p-4 rounded-xl border-2 w-full text-center relative transition-all duration-300"
          >
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
              Child
            </div>
            <div className="font-mono font-bold text-foreground">Developer</div>
            <div className="mt-2 text-xs font-mono bg-black/5 dark:bg-white/5 p-1 rounded">
              write_code()
            </div>

            {phase === 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -bottom-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <XCircle className="size-4" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Search Magnifying Glass */}
        <AnimatePresence>
          {phase >= 1 && phase <= 3 && (
            <motion.div
              initial={{ x: 280, y: 190, opacity: 0 }}
              animate={{
                x: phase === 3 ? 280 : 280,
                y: phase === 3 ? 30 : 190,
                opacity: 1,
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute z-30"
            >
              <div
                className={cn(
                  "p-2 rounded-full shadow-lg backdrop-blur text-white flex items-center gap-2",
                  phase === 1
                    ? "bg-red-500/90"
                    : phase === 3
                      ? "bg-emerald-500/90"
                      : "bg-blue-500/90",
                )}
              >
                <Search className="size-4" />
                {phase === 1 && <span className="text-[10px] font-bold">Not here</span>}
                {phase === 2 && <span className="text-[10px] font-bold">Checking parent...</span>}
                {phase === 3 && <span className="text-[10px] font-bold">Found it!</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Step3Super() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500); // Leo token appears and flies
    const t2 = setTimeout(() => setPhase(2), 2500); // Leo lands, parent updates. Python token appears and flies
    const t3 = setTimeout(() => setPhase(3), 3500); // Python lands, child updates.
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
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Extending Initialization</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-lg">
        Use{" "}
        <code className="bg-surface px-1 border border-hairline rounded text-blue-500 font-bold">
          super()
        </code>{" "}
        to delegate shared initialization to the parent.
      </p>

      <div className="w-full flex items-center justify-between gap-8 mt-2 px-8 relative h-[250px]">
        {/* Input Data */}
        <div className="flex flex-col gap-4 font-mono text-sm z-20">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Creation
          </div>
          <div className="bg-surface p-4 rounded-lg border border-hairline shadow-sm whitespace-nowrap leading-relaxed">
            Developer(
            <br />
            &nbsp;&nbsp;<span className="text-orange-500 font-bold">"Leo"</span>,<br />
            &nbsp;&nbsp;<span className="text-emerald-500 font-bold">"Python"</span>
            <br />)
          </div>
        </div>

        {/* Classes */}
        <div className="flex flex-col items-center gap-6 z-20">
          {/* Parent */}
          <div
            className={cn(
              "bg-surface border-2 p-4 rounded-xl flex items-center justify-between gap-4 transition-all duration-500 shadow-sm w-[320px]",
              phase >= 2 ? "border-orange-500/50" : "border-hairline",
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                Parent
              </div>
              <div className="font-mono text-xs font-bold whitespace-nowrap">
                __init__(self, name)
              </div>
            </div>
            <div
              className={cn(
                "px-3 py-2 rounded font-mono text-sm font-bold border transition-colors shrink-0 relative flex items-center justify-center min-w-[100px]",
                phase >= 2
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                  : "bg-black/5 dark:bg-white/5 border-transparent",
              )}
            >
              {phase < 2 && <span className="text-muted-foreground opacity-50">empty</span>}
              <AnimatePresence>
                {phase === 1 && (
                  <motion.div
                    initial={{ x: -250, y: 80, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute z-30 bg-orange-500 text-white font-mono text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                  >
                    "Leo"
                  </motion.div>
                )}
              </AnimatePresence>
              {phase >= 2 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  self.name
                </motion.span>
              )}
            </div>
          </div>

          {/* Super Arrow */}
          <div className="flex flex-col items-center h-8 relative">
            <motion.div
              animate={{ opacity: phase >= 1 && phase < 2 ? [0.5, 1, 0.5] : 1 }}
              className="absolute -left-20 top-1/2 -translate-y-1/2 flex items-center text-blue-500 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded-full"
            >
              <ArrowUp className="size-3 mr-1" /> super()
            </motion.div>
            <div className="w-0.5 h-full bg-hairline"></div>
          </div>

          {/* Child */}
          <div
            className={cn(
              "bg-surface border-2 p-4 rounded-xl flex flex-col gap-2 transition-all duration-500 shadow-sm w-[320px]",
              phase >= 3 ? "border-emerald-500/50" : "border-hairline",
            )}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                  Child
                </div>
                <div className="font-mono text-xs font-bold whitespace-nowrap">
                  __init__(self, name, lang)
                </div>
              </div>
              <div
                className={cn(
                  "px-2 py-1 rounded font-mono text-xs font-bold border transition-colors shrink-0 relative flex items-center justify-center min-w-[90px]",
                  phase >= 3
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-black/5 dark:bg-white/5 border-transparent",
                )}
              >
                {phase < 3 && <span className="text-muted-foreground opacity-50">empty</span>}
                <AnimatePresence>
                  {phase === 2 && (
                    <motion.div
                      initial={{ x: -250, y: -20, opacity: 0 }}
                      animate={{ x: 0, y: 0, opacity: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute z-30 bg-emerald-500 text-white font-mono text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                    >
                      "Python"
                    </motion.div>
                  )}
                </AnimatePresence>
                {phase >= 3 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    self.lang
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step4Override() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500); // Call sent
    const t2 = setTimeout(() => setPhase(2), 3000); // Call received, different outputs
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
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Method Overriding</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-lg">
        A child can replace an inherited method with its own specialized version.
      </p>

      <div className="grid grid-cols-2 gap-12 w-full mt-4">
        {/* Employee */}
        <div className="flex flex-col items-center gap-6">
          <div className="bg-surface p-4 rounded-xl border border-hairline w-full text-center shadow-sm relative">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">
              Parent Object
            </div>
            <div className="font-mono font-bold">
              employee.<span className="text-blue-500">work()</span>
            </div>
            <UserCircle className="size-10 text-muted-foreground absolute -top-5 left-1/2 -translate-x-1/2 bg-background rounded-full" />
          </div>

          <div className="h-12 border-l-2 border-dashed border-hairline relative">
            {phase >= 1 && (
              <motion.div
                initial={{ scale: 0, top: 0 }}
                animate={{ scale: 1, top: "100%" }}
                transition={{ duration: 1 }}
                className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]"
              />
            )}
          </div>

          <div className="h-16 flex items-center justify-center">
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-blue-500/10 border border-blue-500/30 text-blue-500 font-mono text-sm px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Briefcase className="size-4" /> "Employee is working."
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Developer */}
        <div className="flex flex-col items-center gap-6">
          <div className="bg-surface p-4 rounded-xl border-2 border-emerald-500/30 w-full text-center shadow-[0_0_15px_rgba(16,185,129,0.1)] relative">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">
              Child Object
            </div>
            <div className="font-mono font-bold">
              developer.<span className="text-emerald-500">work()</span>
            </div>
            <div className="absolute -top-3 -right-3 text-[9px] bg-emerald-500 text-white font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
              Overridden
            </div>
            <Laptop className="size-10 text-emerald-500 absolute -top-5 left-1/2 -translate-x-1/2 bg-background rounded-full p-1" />
          </div>

          <div className="h-12 border-l-2 border-dashed border-hairline relative">
            {phase >= 1 && (
              <motion.div
                initial={{ scale: 0, top: 0 }}
                animate={{ scale: 1, top: "100%" }}
                transition={{ duration: 1 }}
                className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]"
              />
            )}
          </div>

          <div className="h-16 flex items-center justify-center">
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-sm px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Terminal className="size-4" /> "Developer is writing code."
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step5Directory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">
        The Result: A Clean Hierarchy
      </h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-lg">
        Different objects built on the same shared foundation.
      </p>

      <div className="bg-surface border border-hairline rounded-2xl w-full p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
        {/* UI Header */}
        <div className="flex items-center gap-3 border-b border-hairline pb-4">
          <Building2 className="size-5 text-muted-foreground" />
          <div className="font-mono font-bold text-foreground tracking-widest uppercase">
            Company Directory
          </div>
        </div>

        {/* Grid of employees */}
        <div className="grid grid-cols-2 gap-6 w-full">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-background border border-hairline rounded-xl p-4 shadow-sm flex flex-col relative"
          >
            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1">
              <Laptop className="size-3" /> Developer
            </div>

            <div className="font-bold text-lg text-foreground">Maya</div>
            <div className="text-sm text-muted-foreground mb-4">maya@company.com</div>

            <div className="border-t border-hairline pt-3 mt-auto">
              <div className="text-xs text-muted-foreground mb-1 font-mono">
                Specialized Action:
              </div>
              <div className="text-sm font-mono text-emerald-500 bg-emerald-500/5 p-2 rounded truncate border border-emerald-500/10">
                maya.write_code("Python")
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-background border border-hairline rounded-xl p-4 shadow-sm flex flex-col relative"
          >
            <div className="absolute top-4 right-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1">
              <Paintbrush className="size-3" /> Designer
            </div>

            <div className="font-bold text-lg text-foreground">Alex</div>
            <div className="text-sm text-muted-foreground mb-4">alex@company.com</div>

            <div className="border-t border-hairline pt-3 mt-auto">
              <div className="text-xs text-muted-foreground mb-1 font-mono">
                Specialized Action:
              </div>
              <div className="text-sm font-mono text-purple-500 bg-purple-500/5 p-2 rounded truncate border border-purple-500/10">
                alex.create_mockup()
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
