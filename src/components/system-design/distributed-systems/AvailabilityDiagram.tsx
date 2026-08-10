import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, MonitorSmartphone, Activity, ArrowRight, HeartPulse, Zap } from "lucide-react";

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

export function AvailabilityDiagram() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const maxSteps = 7;

  const [serverHealth, setServerHealth] = useState({ A: true, B: true, C: true });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && step < maxSteps) {
      const delays = [
        7000, // 0: Req 1 to Server A
        7000, // 1: Req 2 to Server B
        2000, // 2: Server B crashes
        7000, // 3: Req 3 to Server B (drops)
        3000, // 4: LB Health Check
        7000, // 5: Req 4 to Server C
        7000  // 6: Req 5 to Server A
      ];

      if (step === 2) setServerHealth(prev => ({ ...prev, B: false }));
      if (step === 0) setServerHealth({ A: true, B: true, C: true });

      timer = setTimeout(() => {
        setStep(s => s + 1);
      }, delays[step] || 3000);
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

  const getPercentage = () => {
    const alive = Object.values(serverHealth).filter(Boolean).length;
    if (alive === 3) return "99.999%";
    if (alive === 2) return "99.99%";
    if (alive === 1) return "99.9%";
    return "0.00%";
  };

  const getPath = (targetServer: 'A' | 'B' | 'C') => {
    if (targetServer === 'B') {
      return {
        x: ["calc(15% + 60px)", "50%", "50%", "calc(85% - 60px)"],
        y: ["50%", "50%", "50%", "50%"],
        times: [0, 0.35, 0.55, 1]
      };
    }
    const targetY = targetServer === 'A' ? "20%" : "80%";
    return {
      x: ["calc(15% + 60px)", "50%", "50%", "65%", "65%", "calc(85% - 60px)"],
      y: ["50%", "50%", "50%", "50%", targetY, targetY],
      times: [0, 0.35, 0.55, 0.7, 0.85, 1]
    };
  };

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex items-center justify-between border-b border-hairline bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Availability Demo</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 hidden md:flex">
            <Activity className="size-3.5 text-mint" />
            <span className="font-mono text-xs text-muted-foreground">Uptime: <span className="text-mint font-bold">{getPercentage()}</span></span>
          </div>
          <button
            onClick={handlePlayPause}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm ${isPlaying ? "bg-amber/20 text-amber border border-amber/40 hover:bg-amber/30" : "bg-foreground text-background hover:bg-foreground/90"}`}
          >
            {isPlaying ? "Pause" : step >= maxSteps ? "Replay" : "Play Animation"}
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="relative h-[340px] min-w-[700px] bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden">
          
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none z-10">
            {/* Client to LB */}
            <line x1="15%" y1="50%" x2="50%" y2="50%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            {/* LB to Split */}
            <line x1="50%" y1="50%" x2="65%" y2="50%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            {/* Vertical Split */}
            <line x1="65%" y1="20%" x2="65%" y2="80%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            {/* Split to Servers */}
            <line x1="65%" y1="20%" x2="85%" y2="20%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            <line x1="65%" y1="50%" x2="85%" y2="50%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
            <line x1="65%" y1="80%" x2="85%" y2="80%" className="stroke-border/50 stroke-2" strokeDasharray="6 6" />
          </svg>

          {/* Client Node */}
          <div className="absolute left-[15%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-3 z-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
              <MonitorSmartphone className="size-8 text-foreground" />
              <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
                 <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">User Traffic</span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-muted-foreground mt-8">CLIENT</span>
          </div>

          {/* Load Balancer Node */}
          <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-3 z-30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-mint/40 bg-background shadow-lg relative">
              <ArrowRight className="size-8 text-mint" />
              <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
                 <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                   <HeartPulse className={`size-3 ${step === 4 ? "text-rose-500 animate-pulse" : "text-mint"}`} /> 
                   Health Check
                 </span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-foreground mt-8 text-center bg-background px-2 py-0.5 rounded border border-hairline shadow-sm">LOAD BALANCER</span>
          </div>

          {/* Servers */}
          {['A', 'B', 'C'].map((id, index) => {
            const isHealthy = serverHealth[id as keyof typeof serverHealth];
            const topPositions = ["20%", "50%", "80%"];
            
            return (
              <div 
                key={id} 
                className="absolute left-[85%] -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-2 z-20"
                style={{ top: topPositions[index] }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-lg relative transition-colors duration-500 ${isHealthy ? 'border-muted-foreground/20 bg-background' : 'border-rose-500/40 bg-rose-500/10'}`}>
                  <Server className={`size-6 ${isHealthy ? 'text-foreground' : 'text-rose-500'}`} />
                  {!isHealthy && (
                     <div className="absolute -inset-1 rounded-xl border-2 border-rose-500 animate-ping opacity-20" />
                  )}
                  {isHealthy ? (
                    <div className="absolute -top-1.5 -right-1.5 size-3 bg-mint rounded-full border-2 border-background shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  ) : (
                    <div className="absolute -top-1.5 -right-1.5 size-3 bg-rose-500 rounded-full border-2 border-background shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  )}
                </div>
                <span className="font-mono text-[10px] font-bold text-muted-foreground">SERVER {id}</span>
              </div>
            );
          })}

          {/* Packets */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <Packet key="p-0" label="Req 1" color="mint" pathX={getPath('A').x} pathY={getPath('A').y} pathTimes={getPath('A').times} duration={6} />
            )}
            {step === 1 && (
              <Packet key="p-1" label="Req 2" color="mint" pathX={getPath('B').x} pathY={getPath('B').y} pathTimes={getPath('B').times} duration={6} />
            )}
            {step === 3 && (
              <Packet key="p-3" label="Req 3" color="rose" pathX={getPath('B').x} pathY={getPath('B').y} pathTimes={getPath('B').times} duration={6} dropped={true} />
            )}
            {step === 5 && (
              <Packet key="p-5" label="Req 4" color="mint" pathX={getPath('C').x} pathY={getPath('C').y} pathTimes={getPath('C').times} duration={6} />
            )}
            {step === 6 && (
              <Packet key="p-6" label="Req 5" color="mint" pathX={getPath('A').x} pathY={getPath('A').y} pathTimes={getPath('A').times} duration={6} />
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
              Real-World Example: Web Traffic
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground min-h-[60px]">
              When users visit a website, they don't connect directly to a server. They connect to a <strong>Load Balancer</strong>. The Load Balancer constantly pings the servers (Health Checks) to make sure they are alive. If a server crashes, the Load Balancer instantly detects it and stops sending traffic there, maintaining high availability for the users.
            </p>
          </div>

          <div className="w-px h-16 bg-hairline hidden md:block" />

          <div className="flex-1 space-y-2 w-full">
            <h3 className="text-sm font-bold text-foreground">What is happening?</h3>
            <p className="text-xs leading-relaxed text-muted-foreground font-mono bg-background p-2 rounded-md border border-hairline min-h-[60px] overflow-y-auto max-h-[80px]">
              {step === 0 && "Step 1: Client sends Request 1. Load Balancer receives it and routes it to Server A."}
              {step === 1 && "Step 2: Client sends Request 2. Load Balancer routes it to Server B (Round Robin)."}
              {step === 2 && "Step 3: Server B crashes unexpectedly!"}
              {step === 3 && "Step 4: Client sends Request 3. Load Balancer routes it to Server B. The request drops!"}
              {step === 4 && "Step 5: Load Balancer performs a Health Check and marks Server B as dead."}
              {step === 5 && "Step 6: Client sends Request 4. Load Balancer safely routes it to Server C, skipping B."}
              {step === 6 && "Step 7: Client sends Request 5. Load Balancer routes it back to Server A."}
              {step >= 7 && "Animation Complete. System is operating at degraded capacity (99.99%) but remains available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
