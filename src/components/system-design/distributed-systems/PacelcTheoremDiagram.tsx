import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Server, MonitorSmartphone, Clock, CheckCircle2, Zap, ArrowRight } from "lucide-react";

type Mode = "EC" | "EL";

function Packet({ label, color, fromX, toX, duration = 1.5, delay = 0 }: { label: React.ReactNode, color: "mint" | "amber" | "blue" | "violet" | "muted", fromX: string, toX: string, duration?: number, delay?: number }) {
  const colorMap = {
    mint: "border-mint/30 bg-mint/10 text-mint shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    amber: "border-amber/30 bg-amber/10 text-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    violet: "border-violet/30 bg-violet/10 text-violet shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    muted: "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground shadow-[0_0_8px_rgba(148,163,184,0.3)] opacity-70",
  };

  return (
    <motion.div
      initial={{ left: fromX, opacity: 0, x: "-50%", y: "-50%" }}
      animate={{ left: toX, opacity: [0, 1, 1, 0] }}
      transition={{ 
        duration, 
        delay, 
        ease: "linear", 
        left: { duration, delay, ease: "linear" },
        opacity: { duration, delay, ease: "linear", times: [0, 0.1, 0.9, 1] } 
      }}
      className={`absolute top-[50%] flex items-center justify-center h-7 px-2.5 rounded-full border backdrop-blur text-[10px] font-bold ${colorMap[color]} whitespace-nowrap z-30`}
    >
      {label}
    </motion.div>
  );
}

export function PacelcTheoremDiagram() {
  const [mode, setMode] = useState<Mode>("EC");
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const maxSteps = 4;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && step < maxSteps) {
      const delays = {
        EC: [1500, 2500, 2500, 1500],
        EL: [1500, 1500, 2500, 1500]
      };
      
      timer = setTimeout(() => {
        setStep(s => s + 1);
      }, delays[mode][step] || 2000);
    } else if (step >= maxSteps) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step, mode, maxSteps]);

  const startAnimation = (selectedMode: Mode) => {
    setMode(selectedMode);
    setStep(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex items-center justify-between border-b border-hairline bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">PACELC Demo (No Partition)</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => startAnimation("EC")}
            disabled={isPlaying}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm disabled:opacity-50 ${mode === "EC" && isPlaying ? "bg-amber/20 text-amber border border-amber/40 hover:bg-amber/30" : "bg-foreground text-background hover:bg-foreground/90"}`}
          >
            <Clock className="size-3.5" />
            Consistency (EC)
          </button>
          <div className="h-4 w-px bg-hairline" />
          <button
            onClick={() => startAnimation("EL")}
            disabled={isPlaying}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm disabled:opacity-50 ${mode === "EL" && isPlaying ? "bg-mint/20 text-mint border border-mint/40 hover:bg-mint/30" : "bg-foreground text-background hover:bg-foreground/90"}`}
          >
            <Zap className="size-3.5" />
            Latency (EL)
          </button>
        </div>
      </div>

      <div className="relative h-[280px] w-full bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden">
        
        {/* Ocean Background visual hint */}
        <div className="absolute left-[45%] right-[25%] top-0 bottom-0 bg-blue-500/5 z-0 border-x border-blue-500/10" />
        <div className="absolute left-[55%] top-4 -translate-x-1/2 flex items-center gap-1 text-[10px] font-mono text-blue-500/50 uppercase tracking-widest z-0">
          <Globe className="size-3" />
          Ocean / High Latency
        </div>

        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-24 right-[55%] h-[2px] -translate-y-1/2 border-t-2 border-dashed border-border/50" />
        <div className="absolute top-1/2 left-[55%] right-24 h-[2px] -translate-y-1/2 border-t-2 border-dashed border-border/50" />

        {/* Client (US) */}
        <div className="absolute left-4 md:left-12 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 w-[120px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <MonitorSmartphone className="size-8 text-foreground" />
            
            {/* Context Box */}
            <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
              {((mode === "EC" && step === 4) || (mode === "EL" && step >= 2)) ? (
                <span className="text-[9px] font-mono font-bold text-mint flex items-center gap-1"><CheckCircle2 className="size-3" /> Done</span>
              ) : (step > 0 && mode === "EC") ? (
                <span className="text-[9px] font-mono font-medium text-amber flex items-center gap-1"><div className="size-2 rounded-full border border-amber border-t-transparent animate-spin" /> Waiting...</span>
              ) : (
                <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">Idle</span>
              )}
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-muted-foreground mt-8 text-center">CLIENT<br/><span className="font-normal text-[9px]">(US Region)</span></span>
        </div>

        {/* US Region Node */}
        <div className="absolute left-[35%] md:left-[40%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 w-[120px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-mint/40 bg-mint/5 shadow-lg relative">
            <Server className="size-8 text-mint" />
          </div>
          <span className="font-mono text-xs font-bold text-foreground mt-8 text-center">PRIMARY<br/><span className="font-normal text-muted-foreground text-[9px]">(US Region)</span></span>
        </div>

        {/* EU Region Node */}
        <div className="absolute right-4 md:right-12 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 w-[120px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <Server className="size-8 text-foreground" />
          </div>
          <span className="font-mono text-xs font-bold text-muted-foreground mt-8 text-center">SECONDARY<br/><span className="font-normal text-[9px]">(EU Region)</span></span>
        </div>

        {/* Animation Track */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence mode="wait">
            
            {/* Step 0: Client -> US */}
            {step === 0 && <Packet key="s0" label={<>Write <ArrowRight className="ml-1 size-3" /></>} color="blue" fromX="120px" toX="calc(40% - 60px)" />}

            {/* EC Mode */}
            {mode === "EC" && (
              <>
                {/* Step 1: US -> EU (Slow) */}
                {step === 1 && (
                  <Packet key="ec1" label={<>Syncing... <Clock className="ml-1 size-3 animate-spin-slow" /></>} color="amber" fromX="calc(40% + 60px)" toX="calc(100% - 120px)" duration={2.5} />
                )}
                {/* Step 2: EU -> US (Slow) */}
                {step === 2 && (
                  <Packet key="ec2" label={<>ACK <CheckCircle2 className="ml-1 size-3" /></>} color="mint" fromX="calc(100% - 120px)" toX="calc(40% + 60px)" duration={2.5} />
                )}
                {/* Step 3: US -> Client */}
                {step === 3 && (
                  <Packet key="ec3" label={<>Success <CheckCircle2 className="ml-1 size-3" /></>} color="mint" fromX="calc(40% - 60px)" toX="120px" />
                )}
              </>
            )}

            {/* EL Mode */}
            {mode === "EL" && (
              <>
                {/* Step 1: US -> Client AND US -> EU (Background) */}
                {step === 1 && (
                  <>
                    <Packet key="el1a" label={<>Success <Zap className="ml-1 size-3" /></>} color="mint" fromX="calc(40% - 60px)" toX="120px" />
                    <Packet key="el1b" label={<>Async Sync <ArrowRight className="ml-1 size-3" /></>} color="muted" fromX="calc(40% + 60px)" toX="calc(100% - 120px)" duration={2.5} />
                  </>
                )}
                {/* Step 2: EU -> US (Background ACK) */}
                {step === 2 && (
                  <Packet key="el2" label={<>Async ACK <CheckCircle2 className="ml-1 size-3" /></>} color="muted" fromX="calc(100% - 120px)" toX="calc(40% + 60px)" duration={2.5} />
                )}
              </>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Explainer Panel */}
      <div className="border-t border-hairline bg-muted/20 p-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Globe className="size-4 text-blue-500" />
              Real-World Example: Geo-Replication
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground min-h-[60px]">
              CAP Theorem talks about failures. <strong>PACELC Theorem</strong> talks about normal operation. Even when the network is healthy, the speed of light limits how fast data can travel across the ocean. You must choose: Do you make the user wait for the data to cross the ocean and back to ensure <strong>Consistency (EC)</strong>? Or do you reply instantly to give the user low <strong>Latency (EL)</strong> while syncing across the ocean in the background?
            </p>
          </div>

          <div className="w-px h-16 bg-hairline hidden md:block" />

          <div className="flex-1 space-y-2 w-full">
            <h3 className="text-sm font-bold text-foreground">What is happening?</h3>
            <p className="text-xs leading-relaxed text-muted-foreground font-mono bg-background p-2 rounded-md border border-hairline min-h-[60px] overflow-y-auto max-h-[80px]">
              {step === 0 && "Step 0: US Client sends a Write request to the US Primary."}

              {mode === "EC" && step === 1 && "Step 1: (EC Mode) Primary forwards Write to EU Secondary. Client is BLOCKED waiting."}
              {mode === "EC" && step === 2 && "Step 2: EU Secondary ACKs back to US Primary across the ocean."}
              {mode === "EC" && step === 3 && "Step 3: US Primary replies Success to Client. Very slow, but perfectly consistent globally."}
              {mode === "EC" && step >= 4 && "Complete: High Consistency, but High Latency."}

              {mode === "EL" && step === 1 && "Step 1: (EL Mode) Primary instantly replies Success to Client (Low Latency). It simultaneously sends an async sync to EU."}
              {mode === "EL" && step === 2 && "Step 2: EU Secondary ACKs back in the background. Client has already moved on."}
              {mode === "EL" && step >= 3 && "Complete: Low Latency, but temporarily inconsistent across regions."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
