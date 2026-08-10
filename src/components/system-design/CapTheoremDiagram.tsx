import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, MonitorSmartphone, XCircle, Activity, ShieldAlert, CheckCircle2, Save, ArrowRight, Unplug, AlertTriangle } from "lucide-react";

type Mode = "CP" | "AP";

function Packet({ label, color, fromX, toX }: { label: React.ReactNode, color: "mint" | "rose" | "blue" | "violet" | "amber", fromX: string, toX: string }) {
  const colorMap = {
    mint: "border-mint/30 bg-mint/10 text-mint shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    violet: "border-violet/30 bg-violet/10 text-violet shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    amber: "border-amber/30 bg-amber/10 text-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]",
  };

  return (
    <motion.div
      initial={{ left: fromX, opacity: 0, x: "-50%", y: "-50%" }}
      animate={{ left: toX, opacity: [0, 1, 1, 0] }}
      transition={{ 
        duration: 1.5, 
        ease: "linear", 
        left: { duration: 1.5, ease: "linear" },
        opacity: { duration: 1.5, ease: "linear", times: [0, 0.1, 0.9, 1] } 
      }}
      className={`absolute top-[50%] flex items-center justify-center h-7 px-2.5 rounded-full border backdrop-blur text-[10px] font-bold ${colorMap[color]} whitespace-nowrap z-30`}
    >
      {label}
    </motion.div>
  );
}

export function CapTheoremDiagram() {
  const [networkPartition, setNetworkPartition] = useState(false);
  const [mode, setMode] = useState<Mode>("CP");
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const maxSteps = 4; // Max steps for the full animation sequence

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && step < maxSteps) {
      const delays = [1500, 1500, 1500, 1500];
      
      timer = setTimeout(() => {
        // If there's a partition, the logic ends at step 2 (rejection/stale)
        if (networkPartition && step === 2) {
          setIsPlaying(false);
        } else {
          setStep(s => s + 1);
        }
      }, delays[step] || 1500);
    } else if (step >= maxSteps) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step, networkPartition]);

  const startAnimation = (selectedMode: Mode) => {
    setMode(selectedMode);
    setStep(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex items-center justify-between border-b border-hairline bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">CAP Theorem Demo</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setNetworkPartition(!networkPartition)}
            disabled={isPlaying}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm disabled:opacity-50 ${networkPartition ? "bg-rose-500/10 text-rose-500 border border-rose-500/40" : "bg-surface text-muted-foreground border border-hairline hover:text-foreground"}`}
          >
            {networkPartition ? <Unplug className="size-3.5" /> : <Activity className="size-3.5 text-mint" />}
            {networkPartition ? "Partition Active" : "Healthy Network"}
          </button>
          <div className="h-4 w-px bg-hairline" />
          <button
            onClick={() => startAnimation("CP")}
            disabled={isPlaying}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm ${mode === "CP" && isPlaying ? "bg-amber/20 text-amber border border-amber/40" : "bg-foreground text-background"} disabled:opacity-50`}
          >
            Request (CP)
          </button>
          <button
            onClick={() => startAnimation("AP")}
            disabled={isPlaying}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm ${mode === "AP" && isPlaying ? "bg-mint/20 text-mint border border-mint/40" : "bg-foreground text-background"} disabled:opacity-50`}
          >
            Request (AP)
          </button>
        </div>
      </div>

      <div className="relative h-[280px] w-full bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden">
        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-24 right-[50%] h-[2px] -translate-y-1/2 border-t-2 border-dashed border-border/50" />
        <div className="absolute top-1/2 left-[50%] right-24 h-[2px] -translate-y-1/2 border-t-2 border-dashed border-border/50" />

        {/* Partition Break Visualization */}
        {networkPartition && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
          >
            <div className="h-24 w-8 bg-rose-500/20 backdrop-blur-sm border-x border-rose-500/50 skew-x-[-15deg] flex items-center justify-center">
              <ShieldAlert className="size-6 text-rose-500 animate-pulse" />
            </div>
            <span className="absolute -bottom-8 font-mono text-[10px] text-rose-500 font-bold tracking-wider">NETWORK PARTITION</span>
          </motion.div>
        )}

        {/* Client Side */}
        <div className="absolute left-4 md:left-12 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 w-[120px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <MonitorSmartphone className="size-8 text-foreground" />
            
            {/* Context Box */}
            <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
              {(step >= 2 && networkPartition && mode === "CP") && (
                <span className="text-[9px] font-mono font-bold text-rose-500 flex items-center gap-1"><XCircle className="size-3" /> Error</span>
              )}
              {(step >= 2 && networkPartition && mode === "AP") && (
                <span className="text-[9px] font-mono font-bold text-violet flex items-center gap-1"><CheckCircle2 className="size-3" /> Success (Stale)</span>
              )}
              {(step >= 3 && !networkPartition) && (
                <span className="text-[9px] font-mono font-bold text-mint flex items-center gap-1"><CheckCircle2 className="size-3" /> Success</span>
              )}
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-muted-foreground mt-8">CLIENT</span>
        </div>

        {/* Node B (Local Node) */}
        <div className="absolute left-[40%] md:left-[45%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 w-[120px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-mint/40 bg-mint/5 shadow-lg relative">
            <Server className="size-8 text-mint" />
            <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
               <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1"><Save className="size-3 text-mint" /> Node B</span>
            </div>
          </div>
        </div>

        {/* Node A (Remote Node) */}
        <div className="absolute right-4 md:right-12 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 w-[120px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <Server className="size-8 text-foreground" />
            <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
               <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1"><Save className="size-3 text-muted-foreground" /> Node A</span>
            </div>
          </div>
        </div>

        {/* Animation Track */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence mode="wait">
            
            {/* Step 0: Client -> Node B */}
            {step === 0 && <Packet key="s0" label={<>Read <ArrowRight className="ml-1 size-3" /></>} color="blue" fromX="120px" toX="calc(45% - 60px)" />}

            {/* Step 1: Node B -> Node A (Checking for consensus/data) */}
            {step === 1 && !networkPartition && (
              <Packet key="s1" label={<>Sync/Check <ArrowRight className="ml-1 size-3" /></>} color="violet" fromX="calc(45% + 60px)" toX="calc(100% - 120px)" />
            )}
            
            {step === 1 && networkPartition && (
              <motion.div
                initial={{ left: "calc(45% + 60px)", opacity: 0, x: "-50%", y: "-50%" }}
                animate={{ left: "55%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.5, ease: "linear", times: [0, 0.1, 0.9, 1] }}
                className="absolute top-[50%] flex items-center justify-center h-7 px-2.5 rounded-full border backdrop-blur text-[10px] font-bold border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] whitespace-nowrap z-30"
              >
                Sync <XCircle className="ml-1 size-3" />
              </motion.div>
            )}

            {/* Step 2: Response from Node A (Healthy) OR Reject/Stale to Client (Partition) */}
            {step === 2 && !networkPartition && (
              <Packet key="s2" label={<>ACK <CheckCircle2 className="ml-1 size-3" /></>} color="mint" fromX="calc(100% - 120px)" toX="calc(45% + 60px)" />
            )}

            {step === 2 && networkPartition && mode === "CP" && (
              <Packet key="s2-cp" label={<>Reject (Need A) <XCircle className="ml-1 size-3" /></>} color="rose" fromX="calc(45% - 60px)" toX="120px" />
            )}

            {step === 2 && networkPartition && mode === "AP" && (
              <Packet key="s2-ap" label={<>Stale Data <AlertTriangle className="ml-1 size-3" /></>} color="amber" fromX="calc(45% - 60px)" toX="120px" />
            )}

            {/* Step 3: Response to Client (Healthy only) */}
            {step === 3 && !networkPartition && (
              <Packet key="s3" label={<>Success <CheckCircle2 className="ml-1 size-3" /></>} color="mint" fromX="calc(45% - 60px)" toX="120px" />
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Explainer Panel */}
      <div className="border-t border-hairline bg-muted/20 p-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <ShieldAlert className="size-4 text-rose-500" />
              Real-World Example: Network Failure
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground min-h-[60px]">
              When the network breaks (Partition), Node B can no longer talk to Node A. Node B now faces a choice: Does it prioritize <strong>Consistency (CP)</strong> and refuse to answer the client because it can't guarantee the data is up-to-date? Or does it prioritize <strong>Availability (AP)</strong> and give the client whatever data it currently has, even if it might be stale?
            </p>
          </div>

          <div className="w-px h-16 bg-hairline hidden md:block" />

          <div className="flex-1 space-y-2 w-full">
            <h3 className="text-sm font-bold text-foreground">What is happening?</h3>
            <p className="text-xs leading-relaxed text-muted-foreground font-mono bg-background p-2 rounded-md border border-hairline min-h-[60px] overflow-y-auto max-h-[80px]">
              {step === 0 && "Step 0: Client sends a request to Node B."}
              {step === 1 && !networkPartition && "Step 1: Network is healthy. Node B synchronizes with Node A."}
              {step === 1 && networkPartition && "Step 1: Network is partitioned! Node B attempts to sync with Node A but the connection fails."}
              
              {step === 2 && !networkPartition && "Step 2: Node A acknowledges the request. Consensus achieved."}
              {step === 3 && !networkPartition && "Step 3: Node B returns successful, consistent data to the client."}
              {step >= 4 && !networkPartition && "Complete: When there is no partition, both C and A are achieved."}

              {step === 2 && networkPartition && mode === "CP" && "Step 2: (CP Mode) Node B cannot reach Node A. To guarantee Consistency, it MUST reject the request. Availability is sacrificed."}
              {step === 2 && networkPartition && mode === "AP" && "Step 2: (AP Mode) Node B cannot reach Node A. To guarantee Availability, it returns its local (potentially stale) data. Consistency is sacrificed."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
