import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, MonitorSmartphone, CheckCircle2, ArrowRight, Heart } from "lucide-react";

function Packet({ label, color, fromX, toX, fromY = "50%", toY = "50%", delay = 0, onComplete, duration = 1.5 }: { label: React.ReactNode, color: "mint" | "blue" | "violet" | "amber", fromX: string, toX: string, fromY?: string, toY?: string, delay?: number, onComplete?: () => void, duration?: number }) {
  const colorMap = {
    mint: "border-mint/30 bg-mint/10 text-mint shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    violet: "border-violet/30 bg-violet/10 text-violet shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    amber: "border-amber/30 bg-amber/10 text-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  };

  return (
    <motion.div
      initial={{ left: fromX, top: fromY, opacity: 0, x: "-50%", y: "-50%" }}
      animate={{ left: toX, top: toY, opacity: [0, 1, 1, 0] }}
      transition={{ 
        delay,
        duration, 
        ease: "linear", 
        left: { delay, duration, ease: "linear" },
        top: { delay, duration, ease: "linear" },
        opacity: { delay, duration, ease: "linear", times: [0, 0.1, 0.9, 1] } 
      }}
      onAnimationComplete={onComplete}
      className={`absolute flex items-center justify-center h-7 px-2.5 rounded-full border backdrop-blur text-[10px] font-bold ${colorMap[color]} whitespace-nowrap z-30`}
    >
      {label}
    </motion.div>
  );
}

export function CapAvailabilityDiagram() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [likesA, setLikesA] = useState(150);
  const [likesB, setLikesB] = useState(100);
  const [clientData, setClientData] = useState<number | null>(null);

  const startAnimation = () => {
    setStep(1);
    setIsPlaying(true);
    setLikesA(150);
    setLikesB(100);
    setClientData(null);
  };

  // Step 1: Client -> Request feed from Node B
  // Step 2: Node B -> Immediately responds with stale data (100) OR triggers a slow sync in background
  // Step 3: Background sync happens while Client gets fast response

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (step === 1) {
        timer = setTimeout(() => {
          setStep(2);
        }, 1200);
      } else if (step === 2) {
        timer = setTimeout(() => {
          setClientData(100); // gets stale data quickly
          setStep(3);
        }, 1200);
      } else if (step === 3) {
        // Sync finishes in background
        timer = setTimeout(() => {
          setLikesB(150);
          setStep(4);
          setIsPlaying(false);
        }, 1500);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex items-center justify-between border-b border-hairline bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Availability Demo</span>
        </div>
        <button
          onClick={startAnimation}
          disabled={isPlaying}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-foreground text-background transition-colors shadow-sm disabled:opacity-50"
        >
          {isPlaying ? "Requesting..." : "Simulate Fast Response"}
        </button>
      </div>

      <div className="relative h-[240px] w-full bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden">
        {/* Network Connections */}
        <div className="absolute top-1/2 left-24 right-24 h-[2px] -translate-y-1/2 flex justify-between">
          <div className="h-full flex-1 border-t-2 border-dashed border-border/50" />
        </div>
        <div className="absolute top-1/4 left-24 w-[calc(50%-60px)] h-[calc(25%+2px)] border-l-2 border-t-2 rounded-tl-xl border-dashed border-border/50" />
        <div className="absolute top-1/4 right-24 w-[calc(50%-60px)] h-[calc(25%+2px)] border-r-2 border-t-2 rounded-tr-xl border-dashed border-border/50" />

        {/* Client */}
        <div className="absolute left-1/2 top-4 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <MonitorSmartphone className="size-6 text-foreground" />
            <div className="absolute -right-24 bg-background border border-hairline rounded p-1 shadow-sm flex items-center justify-center min-w-[60px]">
              <span className="text-[10px] font-mono font-bold flex items-center gap-1 text-foreground">
                <Heart className="size-3 text-rose-500" /> {clientData !== null ? clientData : '???'}
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold text-muted-foreground">CLIENT</span>
        </div>

        {/* Node A (Source of Truth for Likes) */}
        <div className="absolute left-12 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 z-20">
          <span className="font-mono text-[10px] font-bold text-muted-foreground">Node A</span>
          <div className={`flex flex-col w-28 items-center justify-center rounded-xl border-2 border-muted-foreground/20 bg-background shadow-lg overflow-hidden`}>
            <div className="w-full bg-muted/30 py-1.5 flex justify-center border-b border-hairline">
              <Server className="size-5 text-foreground" />
            </div>
            <div className="py-2 w-full flex flex-col items-center">
               <span className="text-xs font-mono font-medium flex items-center gap-1"><Heart className="size-3 text-rose-500" /> {likesA}</span>
            </div>
          </div>
        </div>

        {/* Node B (Answering Node) */}
        <div className="absolute right-12 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 z-20">
          <span className="font-mono text-[10px] font-bold text-muted-foreground">Node B</span>
          <div className={`flex flex-col w-28 items-center justify-center rounded-xl border-2 ${step === 2 ? 'border-mint/50 bg-mint/10' : 'border-muted-foreground/20 bg-background'} shadow-lg overflow-hidden transition-colors`}>
            <div className="w-full bg-muted/30 py-1.5 flex justify-center border-b border-hairline">
              <Server className="size-5 text-foreground" />
            </div>
            <div className="py-2 w-full flex flex-col items-center">
               <span className="text-xs font-mono font-medium flex items-center gap-1"><Heart className="size-3 text-rose-500" /> {likesB}</span>
            </div>
          </div>
        </div>

        {/* Animation Track */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence>
            {step === 1 && <Packet key="s1" label={<>Get Feed <ArrowRight className="ml-1 size-3" /></>} color="blue" fromX="50%" fromY="40px" toX="calc(100% - 120px)" toY="50%" duration={1.2} />}
            {/* Immediate Response from B */}
            {step === 2 && <Packet key="s2" label={<>100 Likes <CheckCircle2 className="ml-1 size-3" /></>} color="mint" fromX="calc(100% - 120px)" fromY="50%" toX="50%" toY="40px" duration={1.2} />}
            {/* Background Sync from A -> B while B responds */}
            {step >= 2 && step <= 3 && <Packet key="s3" label={<>Background Sync</>} color="amber" fromX="120px" fromY="50%" toX="calc(100% - 120px)" toY="50%" duration={2.5} />}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-hairline bg-muted/20 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Availability</strong> means every request receives a fast response, even if nodes aren't perfectly synchronized yet.
          Here, the client gets a quick answer from Node B. Even though the data is slightly stale (100 vs 150), the system prioritized answering the user over waiting for the background sync to finish.
        </p>
      </div>
    </div>
  );
}
