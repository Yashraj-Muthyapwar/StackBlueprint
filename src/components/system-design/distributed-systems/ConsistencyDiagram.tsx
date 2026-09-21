import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  MonitorSmartphone,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Save,
} from "lucide-react";

type Mode = "STRONG" | "EVENTUAL";

function Packet({
  label,
  color,
  pathX,
  pathY,
  pathTimes,
  duration = 2.5,
}: {
  label: React.ReactNode;
  color: "mint" | "violet" | "blue" | "amber" | "muted-foreground";
  pathX: string[];
  pathY: string[];
  pathTimes: number[];
  duration?: number;
}) {
  const colorMap = {
    mint: "border-mint/30 bg-mint/10 text-mint shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    violet: "border-violet/30 bg-violet/10 text-violet shadow-[0_0_12px_rgba(139,92,246,0.8)]",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]",
    amber: "border-amber/30 bg-amber/10 text-amber shadow-[0_0_12px_rgba(245,158,11,0.8)]",
    "muted-foreground":
      "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground shadow-[0_0_12px_rgba(148,163,184,0.8)]",
  };

  return (
    <motion.div
      initial={{ left: pathX[0], top: pathY[0], opacity: 0, x: "-50%", y: "-50%", scale: 1 }}
      animate={{
        left: pathX,
        top: pathY,
        opacity: [0, 1, 1, 0],
        scale: 1,
      }}
      transition={{
        duration,
        ease: "linear",
        left: { duration, ease: "linear", times: pathTimes },
        top: { duration, ease: "linear", times: pathTimes },
        opacity: { duration, ease: "linear", times: [0, 0.1, 0.9, 1] },
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

export function ConsistencyDiagram() {
  const [mode, setMode] = useState<Mode>("STRONG");
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);

  const maxSteps = mode === "STRONG" ? 3 : 2;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && step < maxSteps) {
      const delays = {
        STRONG: [4000, 7500, 7500],
        EVENTUAL: [4000, 7500],
      };
      timer = setTimeout(() => setStep((s) => s + 1), delays[mode][step] || 2500);
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
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Consistency Demo
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => startAnimation("STRONG")}
            disabled={isPlaying}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm disabled:opacity-50 ${mode === "STRONG" && isPlaying ? "bg-amber/20 text-amber border border-amber/40 hover:bg-amber/30" : "bg-foreground text-background hover:bg-foreground/90"}`}
          >
            <ShieldCheck className="size-3.5" />
            Strong (Wait)
          </button>
          <div className="h-4 w-px bg-hairline" />
          <button
            onClick={() => startAnimation("EVENTUAL")}
            disabled={isPlaying}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm disabled:opacity-50 ${mode === "EVENTUAL" && isPlaying ? "bg-mint/20 text-mint border border-mint/40 hover:bg-mint/30" : "bg-foreground text-background hover:bg-foreground/90"}`}
          >
            <Zap className="size-3.5" />
            Eventual (Fast)
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto hide-scrollbar">
        <div className="relative h-[280px] min-w-[700px] bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden">
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none z-10">
            {/* Client to Leader */}
            <line
              x1="15%"
              y1="50%"
              x2="50%"
              y2="50%"
              className="stroke-border/50 stroke-2"
              strokeDasharray="6 6"
            />
            {/* Leader to Split */}
            <line
              x1="50%"
              y1="50%"
              x2="65%"
              y2="50%"
              className="stroke-border/50 stroke-2"
              strokeDasharray="6 6"
            />
            {/* Vertical Split */}
            <line
              x1="65%"
              y1="30%"
              x2="65%"
              y2="70%"
              className="stroke-border/50 stroke-2"
              strokeDasharray="6 6"
            />
            {/* Split to Followers */}
            <line
              x1="65%"
              y1="30%"
              x2="85%"
              y2="30%"
              className="stroke-border/50 stroke-2"
              strokeDasharray="6 6"
            />
            <line
              x1="65%"
              y1="70%"
              x2="85%"
              y2="70%"
              className="stroke-border/50 stroke-2"
              strokeDasharray="6 6"
            />
          </svg>

          {/* Client Node */}
          <div className="absolute left-[15%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-3 z-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
              <MonitorSmartphone className="size-8 text-foreground" />
              <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
                {(mode === "STRONG" && step >= 2) || (mode === "EVENTUAL" && step >= 1) ? (
                  <span className="text-[9px] font-mono font-bold text-mint flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Unblocked
                  </span>
                ) : step > 0 ? (
                  <span className="text-[9px] font-mono font-medium text-amber flex items-center gap-1">
                    <div className="size-2 rounded-full border border-amber border-t-transparent animate-spin" />{" "}
                    Blocked
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                    Idle
                  </span>
                )}
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-muted-foreground mt-8">CLIENT</span>
          </div>

          {/* Leader Node */}
          <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-3 z-30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-mint/40 bg-background shadow-lg relative">
              <Database className="size-8 text-mint" />
              <div className="absolute -bottom-10 w-28 bg-background border border-hairline rounded-md p-1.5 shadow-sm flex items-center justify-center gap-2">
                <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                  <Save className="size-3 text-mint" /> LEADER
                </span>
              </div>
            </div>
          </div>

          {/* Follower Nodes */}
          {["A", "B"].map((id, index) => (
            <div
              key={id}
              className="absolute left-[85%] -translate-x-1/2 -translate-y-1/2 w-[120px] flex flex-col items-center gap-2 z-20"
              style={{ top: index === 0 ? "30%" : "70%" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
                <Database className="size-6 text-foreground" />
                <div className="absolute -top-1.5 -right-1.5 size-3 bg-mint rounded-full border-2 border-background shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <span className="font-mono text-[10px] font-bold text-muted-foreground">
                FOLLOWER {id}
              </span>
            </div>
          ))}

          {/* Packets */}
          <AnimatePresence mode="wait">
            {mode === "STRONG" && step === 0 && (
              <Packet
                key="s0"
                label={
                  <>
                    Write <ArrowRight className="ml-1 size-3" />
                  </>
                }
                color="blue"
                pathX={["calc(15% + 60px)", "calc(50% - 60px)"]}
                pathY={["50%", "50%"]}
                pathTimes={[0, 1]}
                duration={4.5}
              />
            )}
            {mode === "STRONG" && step === 1 && (
              <>
                <Packet
                  key="s1a"
                  label="Replicate"
                  color="violet"
                  pathX={["calc(50% + 60px)", "65%", "65%", "calc(85% - 60px)"]}
                  pathY={["50%", "50%", "30%", "30%"]}
                  pathTimes={[0, 0.35, 0.65, 1]}
                  duration={6}
                />
                <Packet
                  key="s1b"
                  label="Replicate"
                  color="violet"
                  pathX={["calc(50% + 60px)", "65%", "65%", "calc(85% - 60px)"]}
                  pathY={["50%", "50%", "70%", "70%"]}
                  pathTimes={[0, 0.35, 0.65, 1]}
                  duration={6}
                />
              </>
            )}
            {mode === "STRONG" && step === 2 && (
              <>
                <Packet
                  key="s2a"
                  label={
                    <>
                      ACK <CheckCircle2 className="ml-1 size-3" />
                    </>
                  }
                  color="mint"
                  pathX={["calc(85% - 60px)", "65%", "65%", "calc(50% + 60px)"]}
                  pathY={["30%", "30%", "50%", "50%"]}
                  pathTimes={[0, 0.35, 0.65, 1]}
                  duration={6}
                />
                <Packet
                  key="s2b"
                  label={
                    <>
                      ACK <CheckCircle2 className="ml-1 size-3" />
                    </>
                  }
                  color="mint"
                  pathX={["calc(85% - 60px)", "65%", "65%", "calc(50% + 60px)"]}
                  pathY={["70%", "70%", "50%", "50%"]}
                  pathTimes={[0, 0.35, 0.65, 1]}
                  duration={6}
                />

                {/* Final ACK back to Client */}
                <Packet
                  key="s2c"
                  label={
                    <>
                      Success <CheckCircle2 className="ml-1 size-3" />
                    </>
                  }
                  color="mint"
                  pathX={["calc(50% - 60px)", "calc(15% + 60px)"]}
                  pathY={["50%", "50%"]}
                  pathTimes={[0, 1]}
                  duration={4.5}
                />
              </>
            )}

            {mode === "EVENTUAL" && step === 0 && (
              <Packet
                key="e0"
                label={
                  <>
                    Write <ArrowRight className="ml-1 size-3" />
                  </>
                }
                color="blue"
                pathX={["calc(15% + 60px)", "calc(50% - 60px)"]}
                pathY={["50%", "50%"]}
                pathTimes={[0, 1]}
                duration={4.5}
              />
            )}
            {mode === "EVENTUAL" && step === 1 && (
              <>
                {/* Instant ACK to client */}
                <Packet
                  key="e1-ack"
                  label={
                    <>
                      Success <CheckCircle2 className="ml-1 size-3" />
                    </>
                  }
                  color="mint"
                  pathX={["calc(50% - 60px)", "calc(15% + 60px)"]}
                  pathY={["50%", "50%"]}
                  pathTimes={[0, 1]}
                  duration={4.5}
                />

                {/* Background Sync */}
                <Packet
                  key="e1-repA"
                  label="Async Sync"
                  color="amber"
                  pathX={["calc(50% + 60px)", "65%", "65%", "calc(85% - 60px)"]}
                  pathY={["50%", "50%", "30%", "30%"]}
                  pathTimes={[0, 0.35, 0.65, 1]}
                  duration={6}
                />
                <Packet
                  key="e1-repB"
                  label="Async Sync"
                  color="amber"
                  pathX={["calc(50% + 60px)", "65%", "65%", "calc(85% - 60px)"]}
                  pathY={["50%", "50%", "70%", "70%"]}
                  pathTimes={[0, 0.35, 0.65, 1]}
                  duration={6}
                />
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
              {mode === "STRONG" ? (
                <ShieldCheck className="size-4 text-amber" />
              ) : (
                <Zap className="size-4 text-mint" />
              )}
              Real-World Example: {mode === "STRONG" ? "Banking System" : "Social Media Feed"}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground min-h-[60px]">
              {mode === "STRONG"
                ? "In a banking system, correctness is paramount. When you deposit money, the database (Leader) must ensure all backup copies (Followers) have saved the transaction before telling you it succeeded. This guarantees you never read a stale balance, but it makes the write slower."
                : "In a social media feed, speed is paramount. When you like a post, the database (Leader) tells you it succeeded immediately. It then synchronizes that like to the backup copies (Followers) in the background. You get a fast response, but for a few milliseconds, someone reading from a Follower might not see your like."}
            </p>
          </div>
          <div className="w-px h-16 bg-hairline hidden md:block" />
          <div className="flex-1 space-y-2 w-full">
            <h3 className="text-sm font-bold text-foreground">What is happening?</h3>
            <p className="text-xs leading-relaxed text-muted-foreground font-mono bg-background p-2 rounded-md border border-hairline min-h-[60px] overflow-y-auto max-h-[80px]">
              {mode === "STRONG" &&
                step === 0 &&
                "Step 1: Client sends a Write request to the Leader."}
              {mode === "STRONG" &&
                step === 1 &&
                "Step 2: Leader forwards the Write to all Followers. Client is BLOCKED."}
              {mode === "STRONG" &&
                step === 2 &&
                "Step 3: Followers write the data and send an ACK back to the Leader. Leader replies Success to Client."}
              {mode === "STRONG" &&
                step >= 3 &&
                "Step 4: Complete. High Consistency, High Latency."}

              {mode === "EVENTUAL" &&
                step === 0 &&
                "Step 1: Client sends a Write request to the Leader."}
              {mode === "EVENTUAL" &&
                step === 1 &&
                "Step 2: Leader instantly replies Success to Client. Client is UNBLOCKED. Simultaneously, Leader starts background async sync to Followers."}
              {mode === "EVENTUAL" &&
                step >= 2 &&
                "Step 3: Complete. Low Latency, Eventual Consistency."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
