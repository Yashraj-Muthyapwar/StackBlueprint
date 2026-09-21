import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Laptop,
  CheckCircle2,
  MousePointer2,
  Workflow,
} from "lucide-react";

export function TypesOfMethodsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 5;

  const STEP_DURATIONS = [7000, 9000, 9000, 8000, 10000];

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
          {step === 0 && <Step0CoreIdea key="step0" />}
          {step === 1 && <Step1InstanceMethod key="step1" />}
          {step === 2 && <Step2ClassMethod key="step2" />}
          {step === 3 && <Step3StaticMethod key="step3" />}
          {step === 4 && <Step4DecisionFlowchart key="step4" />}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Restart"
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
            onClick={() => setPlaying((p) => !p)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label={playing ? "Pause" : "Play"}
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground mr-2">
              {step + 1} / {totalSteps}
            </span>
            {Array.from({ length: totalSteps }).map((_, i) => {
              const isActive = i === step;
              return (
                <motion.span
                  key={i}
                  animate={{
                    backgroundColor: isActive ? "var(--mint, #40e0b4)" : "var(--hairline, #2a2a35)",
                    width: isActive ? 24 : 8,
                  }}
                  transition={{ duration: 0.2 }}
                  className="h-1 rounded-full cursor-pointer"
                  onClick={() => {
                    setPlaying(false);
                    setStep(i);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step0CoreIdea() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Three Types of Methods</h3>
      <p className="text-sm text-muted-foreground mb-12 text-center">
        Methods define what objects and classes can do, based on the information they need.
      </p>

      <div className="flex justify-center gap-6 w-full">
        {/* Instance Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-56 bg-surface border-2 border-blue-500/30 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="bg-blue-500/10 py-3 border-b border-blue-500/30 flex flex-col items-center gap-2">
            <span className="font-mono text-sm text-blue-500 font-bold uppercase tracking-wider">
              Instance Method
            </span>
          </div>
          <div className="p-5 flex flex-col items-center text-center space-y-4">
            <div className="text-xs text-muted-foreground">Works with an object</div>
            <div className="px-3 py-1.5 bg-surface-2 rounded-md font-mono text-xs text-foreground shadow-inner w-full">
              Needs: <span className="text-blue-500 font-bold">self</span>
            </div>
          </div>
        </motion.div>

        {/* Class Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-56 bg-surface border-2 border-emerald-500/30 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="bg-emerald-500/10 py-3 border-b border-emerald-500/30 flex flex-col items-center gap-2">
            <span className="font-mono text-sm text-emerald-500 font-bold uppercase tracking-wider">
              Class Method
            </span>
          </div>
          <div className="p-5 flex flex-col items-center text-center space-y-4">
            <div className="text-xs text-muted-foreground">Works with the class</div>
            <div className="px-3 py-1.5 bg-surface-2 rounded-md font-mono text-xs text-foreground shadow-inner w-full">
              Needs: <span className="text-emerald-500 font-bold">cls</span>
            </div>
          </div>
        </motion.div>

        {/* Static Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-56 bg-surface border-2 border-violet-500/30 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="bg-violet-500/10 py-3 border-b border-violet-500/30 flex flex-col items-center gap-2">
            <span className="font-mono text-sm text-violet-500 font-bold uppercase tracking-wider">
              Static Method
            </span>
          </div>
          <div className="p-5 flex flex-col items-center text-center space-y-4">
            <div className="text-xs text-muted-foreground">Independent utility</div>
            <div className="px-3 py-1.5 bg-surface-2 rounded-md font-mono text-xs text-foreground shadow-inner w-full">
              Needs: <span className="text-violet-500 font-bold">neither</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Step1InstanceMethod() {
  const [called, setCalled] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setCalled(true), 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">1. Instance Method</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center">
        Uses <code className="text-blue-500">self</code> to access object-specific data.
      </p>

      <div className="relative font-mono text-sm bg-surface border border-hairline rounded-lg px-4 py-3 mb-10 shadow-sm w-[350px]">
        <div className="text-muted-foreground mb-2"># Calling the method</div>
        <span className="text-blue-500">laptop</span>.
        <span className="text-amber-500">display_details</span>()
      </div>

      <div className="flex justify-between items-center w-full max-w-2xl relative z-10 px-10">
        {/* Object */}
        <div className="w-48 bg-surface border-2 border-blue-500/50 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)] relative">
          <div className="bg-blue-500/10 py-2 border-b border-blue-500/50 flex justify-center items-center gap-2">
            <Laptop className="size-4 text-blue-500" />
            <span className="font-mono text-sm text-blue-500 font-bold">laptop (self)</span>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-muted-foreground">name</span>
              <span className="text-amber-500">"Laptop"</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-muted-foreground">price</span>
              <span className="text-violet-500">900</span>
            </div>
          </div>
        </div>

        {/* Action Animation */}
        <div className="flex flex-col items-center justify-center flex-1 relative h-32">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 100">
            <path
              d="M 0,50 L 200,50"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <motion.path
              d="M 0,50 L 200,50"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: called ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />
          </svg>
        </div>

        {/* Method Node */}
        <motion.div
          animate={{
            scale: called ? [1, 1.1, 1] : 1,
            borderColor: called ? "rgba(59,130,246,0.8)" : "var(--hairline)",
          }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="w-56 bg-surface border border-hairline rounded-xl overflow-hidden shadow-sm relative"
        >
          <div className="bg-surface-2 py-2 border-b border-hairline flex justify-center items-center">
            <span className="font-mono text-sm text-foreground font-semibold">
              display_details(<span className="text-blue-500">self</span>)
            </span>
          </div>
          <div className="p-4 flex flex-col items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Output:
            </span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: called ? 1 : 0 }}
              transition={{ delay: 1 }}
              className="bg-black/80 text-white font-mono text-xs px-3 py-1.5 rounded"
            >
              Laptop: $900
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Step2ClassMethod() {
  const [tax, setTax] = useState("0.08");

  useEffect(() => {
    const id = setTimeout(() => setTax("0.09"), 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">2. Class Method</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center">
        Uses <code className="text-emerald-500">cls</code> to modify class-level data shared by all
        objects.
      </p>

      <div className="relative font-mono text-sm bg-surface border border-hairline rounded-lg px-4 py-3 mb-6 shadow-sm w-[400px]">
        <div className="text-muted-foreground mb-2"># Calling the method</div>
        <span className="text-emerald-500 font-bold">Product</span>.
        <span className="text-amber-500">update_tax_rate</span>(0.09)
      </div>

      <div className="relative flex flex-col items-center w-full">
        {/* Class Method Node */}
        <motion.div
          animate={{ scale: tax === "0.09" ? [1.1, 1] : 1 }}
          className="relative z-10 px-6 py-2 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col items-center gap-1"
        >
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
            Shared Class Attribute
          </span>
          <div className="font-mono text-sm text-foreground flex items-center gap-2">
            <span className="text-emerald-500">cls.tax_rate</span> =
            <motion.span
              key={tax}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-bold bg-emerald-500 px-1.5 rounded"
            >
              {tax}
            </motion.span>
          </div>
        </motion.div>

        {/* Connectors */}
        <svg
          className="absolute top-10 left-0 w-full h-24 pointer-events-none opacity-50 z-0"
          viewBox="0 0 600 100"
        >
          <path
            d="M300,10 Q200,50 200,100"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <path
            d="M300,10 Q400,50 400,100"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <motion.path
            d="M300,10 Q200,50 200,100"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: tax === "0.09" ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.path
            d="M300,10 Q400,50 400,100"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: tax === "0.09" ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          />
        </svg>

        {/* Instances Reacting */}
        <div className="flex gap-20 mt-16 relative z-10 w-full justify-center">
          {["laptop", "headphones"].map((item) => (
            <div
              key={item}
              className="w-44 bg-surface border border-hairline rounded-xl overflow-hidden shadow-sm"
            >
              <div className="bg-surface-2 py-1.5 border-b border-hairline flex justify-center items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                  {item}
                </span>
              </div>
              <div className="p-3">
                <div className="text-[10px] text-muted-foreground font-mono text-center mb-1">
                  uses tax_rate:
                </div>
                <motion.div
                  key={tax}
                  initial={{ backgroundColor: "rgba(16,185,129,0)" }}
                  animate={{ backgroundColor: ["rgba(16,185,129,0.3)", "rgba(16,185,129,0)"] }}
                  transition={{ duration: 1 }}
                  className="text-xs font-mono text-emerald-500 text-center py-1 rounded font-bold"
                >
                  {tax}
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Step3StaticMethod() {
  const [called, setCalled] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setCalled(true), 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">3. Static Method</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center">
        Does not use <code className="text-blue-500">self</code> or{" "}
        <code className="text-emerald-500">cls</code>. Independent utility.
      </p>

      <div className="relative font-mono text-sm bg-surface border border-hairline rounded-lg px-4 py-3 mb-10 shadow-sm w-[400px]">
        <div className="text-muted-foreground mb-2"># Calling the method</div>
        <span className="text-foreground font-bold">Product</span>.
        <span className="text-amber-500">is_valid_price</span>(
        <span className="text-violet-500">100</span>)
      </div>

      <div className="flex justify-between items-center w-full max-w-2xl relative z-10 px-10">
        {/* Input Value */}
        <div className="w-24 flex justify-center">
          <div className="bg-surface-2 border border-violet-500/30 rounded-xl p-4 shadow-sm relative">
            <div className="font-mono text-lg text-violet-500 font-bold">100</div>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface text-[9px] text-muted-foreground uppercase tracking-widest px-1">
              Value
            </span>
          </div>
        </div>

        {/* Action Animation */}
        <div className="flex flex-col items-center justify-center flex-1 relative h-32">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 100">
            <path
              d="M 0,50 L 200,50"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <motion.path
              d="M 0,50 L 200,50"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: called ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />
          </svg>
        </div>

        {/* Method Node */}
        <motion.div
          animate={{
            scale: called ? [1, 1.1, 1] : 1,
            borderColor: called ? "rgba(139,92,246,0.8)" : "var(--hairline)",
          }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="w-56 bg-surface border-2 border-violet-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.15)] relative"
        >
          <div className="bg-violet-500/10 py-2 border-b border-violet-500/30 flex justify-center items-center">
            <span className="font-mono text-sm text-foreground font-semibold">
              is_valid_price(<span className="text-violet-500">price</span>)
            </span>
          </div>
          <div className="p-4 flex flex-col items-center gap-2 bg-surface">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Return:
            </span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: called ? 1 : 0 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-2 bg-mint/10 border border-mint/30 text-mint font-mono text-sm px-3 py-1.5 rounded-md"
            >
              <CheckCircle2 className="size-4" /> True
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Step4DecisionFlowchart() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id1 = setTimeout(() => setPhase(1), 1500);
    const id2 = setTimeout(() => setPhase(2), 3500);
    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-1 text-foreground">Decision Tree</h3>
      <p className="text-sm text-muted-foreground mb-3 text-center">
        Follow the questions to choose the right method type.
      </p>

      <div className="w-full overflow-x-auto flex justify-center pb-2">
        <div className="relative min-w-[720px] w-[720px] h-[290px]">
          {/* Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 720 290">
            {/* Q1 to Instance (Yes) */}
            <motion.path
              d="M 300,60 L 300,90 L 120,90 L 120,100"
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />
            {/* Q1 to Q2 (No) */}
            <motion.path
              d="M 300,60 L 300,90 L 480,90 L 480,100"
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />
            {/* Q2 to Class (Yes) */}
            <motion.path
              d="M 480,160 L 480,180 L 360,180 L 360,200"
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />
            {/* Q2 to Static (No) */}
            <motion.path
              d="M 480,160 L 480,180 L 600,180 L 600,200"
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            />
          </svg>

          {/* Labels for paths (Yes/No) */}
          <AnimatePresence>
            {phase >= 1 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute text-xs font-bold text-blue-500 z-10 bg-transparent"
                  style={{ left: 195, top: 74 }}
                >
                  Yes
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute text-xs font-bold text-muted-foreground z-10 bg-transparent"
                  style={{ left: 382, top: 74 }}
                >
                  No
                </motion.div>
              </>
            )}
            {phase >= 2 && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute text-xs font-bold text-emerald-500 z-10 bg-transparent"
                  style={{ left: 405, top: 164 }}
                >
                  Yes
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute text-xs font-bold text-muted-foreground z-10 bg-transparent"
                  style={{ left: 532, top: 164 }}
                >
                  No
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Q1: Need object data? */}
          <div
            className="absolute flex justify-center w-56 z-20"
            style={{ left: 300 - 112, top: 0 }}
          >
            <div className="bg-surface-2 px-3 py-2 rounded-lg font-mono text-xs text-foreground border border-hairline text-center shadow-sm w-full">
              Access specific object state? <br />{" "}
              <span className="text-[10px] text-muted-foreground">
                e.g., read or modify <code className="text-blue-500">self.price</code>
              </span>
            </div>
          </div>

          {/* Instance Method */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute w-40 flex flex-col items-center z-20"
                style={{ left: 120 - 80, top: 100 }}
              >
                <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-lg p-2.5 w-full text-center shadow-sm">
                  <div className="font-bold text-blue-500 text-[11px] uppercase tracking-wider mb-0.5">
                    Instance
                  </div>
                  <div className="font-mono text-xs text-foreground">self</div>
                  <div className="font-mono text-[9px] text-muted-foreground border-t border-blue-500/20 pt-1 mt-1.5">
                    def get_price(self):
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Q2: Need class data? */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute flex justify-center w-56 z-20"
                style={{ left: 480 - 112, top: 100 }}
              >
                <div className="bg-surface-2 px-3 py-2 rounded-lg font-mono text-xs text-foreground border border-hairline text-center shadow-sm w-full">
                  Access shared class state? <br />{" "}
                  <span className="text-[10px] text-muted-foreground">
                    e.g., read or modify <code className="text-emerald-500">cls.tax</code>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Class Method */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute w-40 flex flex-col items-center z-20"
                style={{ left: 360 - 80, top: 200 }}
              >
                <div className="bg-emerald-500/10 border-2 border-emerald-500/50 rounded-lg p-2.5 w-full text-center shadow-sm">
                  <div className="font-bold text-emerald-500 text-[11px] uppercase tracking-wider mb-0.5">
                    Class
                  </div>
                  <div className="font-mono text-xs text-foreground">cls</div>
                  <div className="font-mono text-[9px] text-muted-foreground border-t border-emerald-500/20 pt-1 mt-1.5">
                    def set_tax(cls):
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Static Method */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute w-40 flex flex-col items-center z-20"
                style={{ left: 600 - 80, top: 200 }}
              >
                <div className="bg-violet-500/10 border-2 border-violet-500/50 rounded-lg p-2.5 w-full text-center shadow-sm">
                  <div className="font-bold text-violet-500 text-[11px] uppercase tracking-wider mb-0.5">
                    Static
                  </div>
                  <div className="font-mono text-xs text-muted-foreground italic">none</div>
                  <div className="font-mono text-[9px] text-muted-foreground border-t border-violet-500/20 pt-1 mt-1.5">
                    def is_valid(p):
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
