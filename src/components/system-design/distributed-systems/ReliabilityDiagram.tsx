import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Database, AlertTriangle, Zap, ShieldAlert, RefreshCcw, Settings, Clock, MonitorSmartphone } from "lucide-react";

function Packet({
  label,
  color,
  pathX,
  pathY,
  pathTimes,
  duration = 2.5,
  dropped = false
}: {
  label: React.ReactNode;
  color: "mint" | "rose" | "amber" | "blue" | "violet";
  pathX: string[];
  pathY: string[];
  pathTimes: number[];
  duration?: number;
  dropped?: boolean;
}) {
  const colorMap = {
    mint: "border-mint/30 bg-mint/10 text-mint shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]",
    amber: "border-amber/30 bg-amber/10 text-amber shadow-[0_0_12px_rgba(245,158,11,0.8)]",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]",
    violet: "border-violet/30 bg-violet/10 text-violet shadow-[0_0_12px_rgba(139,92,246,0.8)]",
  };

  return (
    <motion.div
      initial={{ left: pathX[0], top: pathY[0], opacity: 0, x: "-50%", y: "-50%", scale: 1 }}
      animate={{ 
        left: pathX, 
        top: pathY, 
        opacity: [0, 1, 1, 0],
        scale: dropped ? [1, 1, 1, 0.5] : 1,
      }}
      transition={{ 
        duration, 
        ease: "linear",
        left: { duration, ease: "linear", times: pathTimes },
        top: { duration, ease: "linear", times: pathTimes },
        opacity: { duration, ease: "linear", times: dropped ? [0, 0.1, 0.8, 1] : [0, 0.1, 0.9, 1] },
        ...(dropped ? { scale: { duration, ease: "linear", times: [0, 0.1, 0.8, 1] } } : {})
      }}
      className={`absolute flex items-center justify-center h-7 px-2.5 rounded-full border backdrop-blur-md text-[10px] font-bold ${colorMap[color]} whitespace-nowrap z-40`}
    >
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-current opacity-40 z-[-1]"
      />
      {label}
    </motion.div>
  );
}

export function ReliabilityDiagram() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const maxSteps = 9;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && step < maxSteps) {
      const delays = [
        7000, // 0: Req 1
        7000, // 1: Req 2
        2000, // 2: Crash (no packet)
        7000, // 3: Req 3 timeout
        7000, // 4: Req 4 timeout -> Breaker Trips
        7000, // 5: Req 5 fallback
        7000, // 6: Req 6 fallback -> Breaker Half-Open
        7000, // 7: Test Req Success -> Breaker Closed
        7000, // 8: Req 8 Normal
      ];
      timer = setTimeout(() => setStep(s => s + 1), delays[step] || 3000);
    } else if (step >= maxSteps) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const handlePlayPause = () => {
    if (step >= maxSteps) {
      setStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const cbState = step >= 8 ? "CLOSED" : step >= 7 ? "HALF_OPEN" : step >= 5 ? "OPEN" : "CLOSED";
  const serviceBHealth = step >= 7 ? "HEALTHY" : step >= 2 ? "FAILING" : "HEALTHY";

  const getPath = (target: 'B' | 'CACHE') => {
    if (target === 'B') {
      return {
        x: ["calc(15% + 60px)", "50%", "50%", "65%", "65%", "calc(85% - 60px)"],
        y: ["50%", "50%", "50%", "50%", "30%", "30%"],
        times: [0, 0.35, 0.55, 0.7, 0.85, 1]
      };
    }
    return {
      x: ["calc(15% + 60px)", "50%", "50%", "65%", "65%", "calc(85% - 60px)"],
      y: ["50%", "50%", "50%", "50%", "70%", "70%"],
      times: [0, 0.35, 0.55, 0.7, 0.85, 1]
    };
  };

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex items-center justify-between border-b border-hairline bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Circuit Breaker Demo</span>
        </div>
        <button
          onClick={handlePlayPause}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm ${isPlaying ? "bg-amber/20 text-amber border border-amber/40 hover:bg-amber/30" : "bg-foreground text-background hover:bg-foreground/90"}`}
        >
          {isPlaying ? "Pause" : step >= maxSteps ? "Replay" : "Play Animation"}
        </button>
      </div>

      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="relative h-[340px] min-w-[700px] bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden">
          
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none z-10">
            {/* Client to Service A */}
            <line x1="15%" y1="50%" x2="50%" y2="50%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            
            {/* Trunk */}
            <line x1="50%" y1="50%" x2="65%" y2="50%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            {/* Vertical Split */}
            <line x1="65%" y1="30%" x2="65%" y2="70%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            
            {/* Branch to Service B */}
            <line x1="65%" y1="30%" x2="85%" y2="30%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            {/* Branch to Cache */}
            <line x1="65%" y1="70%" x2="85%" y2="70%" className="stroke-border/50 stroke-2 opacity-60" strokeDasharray="6 6" />
          </svg>

          {/* Client Node */}
          <div className="absolute left-[15%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-3 z-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
              <MonitorSmartphone className="size-8 text-foreground" />
              <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
                 <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">Client Requests</span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-muted-foreground mt-8">CLIENT</span>
          </div>

          {/* Service A */}
          <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-3 z-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
              <Server className="size-8 text-foreground" />
            </div>
            <span className="font-mono text-xs font-bold text-foreground mt-8 text-center bg-background px-2 py-0.5 rounded border border-hairline shadow-sm">SERVICE A</span>
          </div>

          {/* Circuit Breaker UI on Branch B */}
          <div className="absolute left-[75%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-[120px] z-30">
             <motion.div 
               animate={{ rotate: cbState === "OPEN" ? -45 : 0 }}
               className={`absolute top-0 h-2 w-12 rounded-full transition-colors duration-500 origin-left border shadow-sm ${cbState === "CLOSED" || cbState === "HALF_OPEN" ? "bg-mint border-mint" : "bg-rose-500 border-rose-500"}`}
               style={{ marginLeft: -18 }}
             />
             <div className="mt-8 flex flex-col items-center">
               <motion.div 
                  animate={{ borderColor: cbState === "OPEN" ? "rgb(244 63 94 / 0.5)" : cbState === "HALF_OPEN" ? "rgb(245 158 11 / 0.5)" : "rgb(16 185 129 / 0.5)" }}
                  className="flex items-center gap-1.5 bg-background border-2 rounded px-2 py-1 shadow-md"
               >
                 <Zap className={`size-3.5 ${cbState === "OPEN" ? "text-rose-500" : cbState === "HALF_OPEN" ? "text-amber" : "text-mint"}`} />
                 <span className={`text-[10px] font-mono font-bold ${cbState === "OPEN" ? "text-rose-500" : cbState === "HALF_OPEN" ? "text-amber" : "text-mint"}`}>
                   {cbState}
                 </span>
               </motion.div>
             </div>
          </div>

          {/* Service B */}
          <div className="absolute left-[85%] top-[30%] -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-3 z-20">
            <motion.div 
               animate={{ 
                 borderColor: serviceBHealth === "FAILING" ? "rgba(244,63,94,0.4)" : "rgba(16,185,129,0.4)",
                 backgroundColor: serviceBHealth === "FAILING" ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.05)"
               }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 shadow-lg relative"
            >
              {serviceBHealth === "FAILING" ? <ShieldAlert className="size-8 text-rose-500" /> : <Database className="size-8 text-mint" />}
              {serviceBHealth === "FAILING" && (
                <motion.div className="absolute -inset-1 rounded-2xl border-2 border-rose-500 animate-ping opacity-20" />
              )}
              <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
                 <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                   {serviceBHealth === "FAILING" ? "Unresponsive" : "Dependency"}
                 </span>
              </div>
            </motion.div>
            <span className="font-mono text-xs font-bold text-foreground mt-8 text-center bg-background px-2 py-0.5 rounded shadow-sm border border-hairline">SERVICE B</span>
          </div>

          {/* Cache */}
          <div className="absolute left-[85%] top-[70%] -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-3 z-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-amber/40 border-dashed bg-background shadow-lg relative opacity-80">
              <RefreshCcw className={`size-6 ${cbState === "OPEN" ? "text-amber animate-spin-slow" : "text-muted-foreground"}`} />
            </div>
            <span className="font-mono text-[10px] font-bold text-muted-foreground text-center tracking-wider">CACHE</span>
          </div>

          {/* Packets */}
          <AnimatePresence mode="wait">
            {(step === 0 || step === 1) && (
              <Packet key={`p-${step}`} label="Normal" color="mint" pathX={getPath('B').x} pathY={getPath('B').y} pathTimes={getPath('B').times} duration={6} />
            )}
            
            {(step === 3 || step === 4) && (
              <Packet key={`p-${step}`} label={<>Timeout <Clock className="ml-1 size-3" /></>} color="rose" pathX={getPath('B').x} pathY={getPath('B').y} pathTimes={getPath('B').times} duration={6} dropped={true} />
            )}

            {(step === 5 || step === 6) && (
              <Packet key={`p-${step}`} label={<>Fallback <AlertTriangle className="ml-1 size-3" /></>} color="amber" pathX={getPath('CACHE').x} pathY={getPath('CACHE').y} pathTimes={getPath('CACHE').times} duration={6} />
            )}

            {step === 7 && (
              <Packet key={`p-${step}`} label={<>Test <Settings className="ml-1 size-3 animate-spin" /></>} color="mint" pathX={getPath('B').x} pathY={getPath('B').y} pathTimes={getPath('B').times} duration={6} />
            )}

            {step === 8 && (
              <Packet key={`p-${step}`} label="Normal" color="mint" pathX={getPath('B').x} pathY={getPath('B').y} pathTimes={getPath('B').times} duration={6} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Explainer Panel */}
      <div className="border-t border-hairline bg-muted/20 p-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Zap className="size-4 text-mint" />
              Real-World Example: Failing Fast
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground min-h-[60px]">
              If Service B goes down, Service A will start experiencing timeouts. Instead of continuing to hammer a dead service (and exhausting its own resources waiting), the <strong>Circuit Breaker</strong> trips OPEN. It immediately "fails fast", routing traffic to a fallback cache. Periodically, it allows a single test request through (HALF-OPEN) to see if Service B has recovered.
            </p>
          </div>
          <div className="w-px h-16 bg-hairline hidden md:block" />
          <div className="flex-1 space-y-2 w-full">
            <h3 className="text-sm font-bold text-foreground">What is happening?</h3>
            <p className="text-xs leading-relaxed text-muted-foreground font-mono bg-background p-2 rounded-md border border-hairline min-h-[60px] overflow-y-auto max-h-[80px]">
              {step === 0 && "Step 1: Circuit Breaker is CLOSED. Normal traffic flows."}
              {step === 1 && "Step 2: Traffic successfully reaching Dependency."}
              {step === 2 && "Step 3: Service B crashes!"}
              {step === 3 && "Step 4: Request 3 hangs and TIMEOUTS."}
              {step === 4 && "Step 5: Request 4 TIMEOUTS. Circuit Breaker failure threshold exceeded!"}
              {step === 5 && "Step 6: Circuit Breaker snaps OPEN. Request 5 fails fast and routes to Cache."}
              {step === 6 && "Step 7: Request 6 fails fast. Service A resources are protected."}
              {step === 7 && "Step 8: Timeout period expires. Breaker is HALF-OPEN. Sending test request to B."}
              {step === 8 && "Step 9: Test succeeds! Service B has recovered. Breaker is CLOSED again."}
              {step >= 9 && "Animation Complete. System self-healed."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
