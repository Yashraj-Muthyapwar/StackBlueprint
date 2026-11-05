import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Server,
  MonitorSmartphone,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
  Unplug,
  ShieldAlert,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type NetworkState = "healthy" | "partitioned";
type ModeELC = "EL" | "EC";
type ModePAC = "PA" | "PC";

function Packet({
  label,
  color,
  fromX,
  toX,
  fromY = "50%",
  toY = "50%",
  duration = 1.5,
  delay = 0,
}: {
  label: React.ReactNode;
  color: "mint" | "amber" | "blue" | "violet" | "muted" | "rose";
  fromX: string;
  toX: string;
  fromY?: string;
  toY?: string;
  duration?: number;
  delay?: number;
}) {
  const colorMap = {
    mint: "border-mint/30 bg-mint/10 text-mint shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    amber: "border-amber/30 bg-amber/10 text-amber shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    violet: "border-violet/30 bg-violet/10 text-violet shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    muted:
      "border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground shadow-[0_0_8px_rgba(148,163,184,0.3)] opacity-90",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
  };

  return (
    <motion.div
      initial={{ left: fromX, top: fromY, opacity: 0, x: "-50%", y: "-50%" }}
      animate={{ left: toX, top: toY, opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        delay,
        ease: "linear",
        left: { duration, delay, ease: "linear" },
        top: { duration, delay, ease: "linear" },
        opacity: { duration, delay, ease: "linear", times: [0, 0.1, 0.9, 1] },
      }}
      className={`absolute flex items-center justify-center h-7 px-2.5 rounded-full border backdrop-blur text-[10px] font-bold ${colorMap[color]} whitespace-nowrap z-30`}
    >
      {label}
    </motion.div>
  );
}

export function PacelcTheoremDiagram() {
  const [network, setNetwork] = useState<NetworkState>("healthy");
  const [modeELC, setModeELC] = useState<ModeELC>("EC");
  const [modePAC, setModePAC] = useState<ModePAC>("PA");

  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);

  // Reset when network changes
  useEffect(() => {
    setIsPlaying(false);
    setStep(0);
  }, [network]);

  const activeMode = network === "healthy" ? modeELC : modePAC;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (network === "healthy") {
        const delays = {
          EC: [1500, 2500, 2500, 1500],
          EL: [1500, 1500, 2500, 1500],
        };
        if (step < 4) {
          timer = setTimeout(() => setStep((s) => s + 1), delays[modeELC][step] || 2000);
        } else {
          setIsPlaying(false);
        }
      } else {
        const delays = {
          PA: [1500, 1500, 1500, 1500],
          PC: [1500, 1500, 1500, 1500],
        };
        const maxStep = modePAC === "PC" ? 4 : 3;
        if (step < maxStep) {
          timer = setTimeout(() => setStep((s) => s + 1), delays[modePAC][step] || 1500);
        } else {
          setIsPlaying(false);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step, network, modeELC, modePAC]);

  const startAnimation = () => {
    setStep(0);
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };

  const setNetworkState = (n: NetworkState) => {
    setNetwork(n);
  };

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      {/* Top Controls */}
      <div className="flex flex-col border-b border-hairline bg-muted/20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline/50">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            PACELC Unified Demo
          </span>

          <div className="flex bg-background rounded-md border border-hairline p-0.5 shadow-sm">
            <button
              onClick={() => setNetworkState("healthy")}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${network === "healthy" ? "bg-mint/10 text-mint" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Healthy Network
            </button>
            <button
              onClick={() => setNetworkState("partitioned")}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${network === "partitioned" ? "bg-rose-500/10 text-rose-500" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Partitioned Network
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
          <span className="text-xs font-medium text-foreground">
            {network === "healthy" ? "Choose Optimization (E):" : "Choose Optimization (P):"}
          </span>

          <div className="flex items-center gap-3">
            {network === "healthy" ? (
              <>
                <button
                  onClick={() => {
                    setModeELC("EC");
                    setIsPlaying(false);
                    setStep(0);
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm ${modeELC === "EC" ? "bg-amber/20 text-amber border border-amber/40" : "bg-background border border-hairline hover:bg-muted/50"}`}
                >
                  <Clock className="size-3.5" /> Consistency (EC)
                </button>
                <button
                  onClick={() => {
                    setModeELC("EL");
                    setIsPlaying(false);
                    setStep(0);
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm ${modeELC === "EL" ? "bg-mint/20 text-mint border border-mint/40" : "bg-background border border-hairline hover:bg-muted/50"}`}
                >
                  <Zap className="size-3.5" /> Latency (EL)
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setModePAC("PC");
                    setIsPlaying(false);
                    setStep(0);
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm ${modePAC === "PC" ? "bg-amber/20 text-amber border border-amber/40" : "bg-background border border-hairline hover:bg-muted/50"}`}
                >
                  <ShieldAlert className="size-3.5" /> Consistency (PC)
                </button>
                <button
                  onClick={() => {
                    setModePAC("PA");
                    setIsPlaying(false);
                    setStep(0);
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm ${modePAC === "PA" ? "bg-mint/20 text-mint border border-mint/40" : "bg-background border border-hairline hover:bg-muted/50"}`}
                >
                  <Zap className="size-3.5" /> Availability (PA)
                </button>
              </>
            )}

            <div className="w-px h-4 bg-hairline ml-2 mr-1" />

            <button
              onClick={startAnimation}
              disabled={isPlaying}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isPlaying ? "Running..." : "Simulate"}
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-[280px] w-full bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden">
        {/* Ocean Background visual hint */}
        <div className="absolute left-[50%] right-[10%] top-0 bottom-0 bg-blue-500/5 z-0 border-x border-blue-500/10" />
        <div className="absolute left-[70%] top-4 -translate-x-1/2 flex items-center gap-1 text-[10px] font-mono text-blue-500/50 uppercase tracking-widest z-0">
          <Globe className="size-3" />
          Ocean / High Latency
        </div>

        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-[10%] right-[50%] h-[2px] -translate-y-1/2 flex">
          <div
            className={`h-full flex-1 border-t-2 border-dashed transition-colors duration-500 border-border/50`}
          />
        </div>
        <div className="absolute top-1/2 left-[50%] right-[10%] h-[2px] -translate-y-1/2 flex">
          <div
            className={`h-full flex-1 border-t-2 border-dashed transition-colors duration-500 ${network === "partitioned" ? "border-rose-500/20" : "border-border/50"}`}
          />
        </div>

        {/* Partition Shield */}
        <AnimatePresence>
          {network === "partitioned" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
            >
              <div className="h-28 w-8 bg-rose-500/20 backdrop-blur-sm border-x border-rose-500/50 skew-x-[-15deg] flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <Unplug className="size-6 text-rose-500 animate-pulse" />
              </div>
              <span className="absolute -bottom-6 font-mono text-[10px] text-rose-500 font-bold tracking-wider whitespace-nowrap">
                NETWORK CUT
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Client (US) */}
        <div className="absolute left-[10%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <MonitorSmartphone className="size-6 text-foreground" />

            {/* Context Box */}
            <div className="absolute -right-20 w-16 bg-background border border-hairline rounded-md p-1 shadow-sm flex items-center justify-center">
              {isPlaying ? (
                (network === "healthy" && modeELC === "EC" && step > 0 && step < 4) ||
                (network === "partitioned" && modePAC === "PC" && step > 0 && step < 4) ? (
                  <span className="text-[9px] font-mono font-medium text-amber flex items-center gap-1">
                    <div className="size-2 rounded-full border border-amber border-t-transparent animate-spin" />{" "}
                    Wait
                  </span>
                ) : (network === "healthy" && step >= 4) ||
                  (network === "partitioned" && modePAC === "PA" && step >= 2) ? (
                  <span className="text-[9px] font-mono font-bold text-mint flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Done
                  </span>
                ) : network === "partitioned" && modePAC === "PC" && step >= 4 ? (
                  <span className="text-[9px] font-mono font-bold text-rose-500 flex items-center gap-1">
                    <XCircle className="size-3" /> Fail
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-medium text-muted-foreground">
                    Idle
                  </span>
                )
              ) : (
                <span className="text-[9px] font-mono font-medium text-muted-foreground">Idle</span>
              )}
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold text-muted-foreground mt-2 text-center">
            CLIENT
          </span>
        </div>

        {/* US Region Node */}
        <div className="absolute left-[50%] top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 w-[120px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-mint/40 bg-mint/5 shadow-lg relative">
            <Server className="size-8 text-mint" />
          </div>
          <span className="font-mono text-xs font-bold text-foreground mt-2 text-center">
            PRIMARY
            <br />
            <span className="font-normal text-muted-foreground text-[9px]">(US Region)</span>
          </span>
        </div>

        {/* EU Region Node */}
        <div className="absolute left-[90%] top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 w-[120px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <Server className="size-8 text-foreground" />
          </div>
          <span className="font-mono text-xs font-bold text-muted-foreground mt-2 text-center">
            SECONDARY
            <br />
            <span className="font-normal text-[9px]">(EU Region)</span>
          </span>
        </div>

        {/* Animation Track */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence mode="wait">
            {/* Step 0: Client -> US */}
            {step === 0 && isPlaying && (
              <Packet
                key="s0"
                label={
                  <>
                    Write <ArrowRight className="ml-1 size-3" />
                  </>
                }
                color="blue"
                fromX="calc(10% + 40px)"
                fromY="50%"
                toX="calc(50% - 60px)"
                toY="50%"
                duration={1.2}
              />
            )}

            {/* HEALTHY NETWORK ANIMATIONS */}
            {network === "healthy" && modeELC === "EC" && (
              <>
                {step === 1 && (
                  <Packet
                    key="ec1"
                    label={
                      <>
                        Syncing... <Clock className="ml-1 size-3 animate-spin-slow" />
                      </>
                    }
                    color="amber"
                    fromX="calc(50% + 60px)"
                    fromY="50%"
                    toX="calc(90% - 60px)"
                    toY="50%"
                    duration={2.5}
                  />
                )}
                {step === 2 && (
                  <Packet
                    key="ec2"
                    label={
                      <>
                        ACK <CheckCircle2 className="ml-1 size-3" />
                      </>
                    }
                    color="mint"
                    fromX="calc(90% - 60px)"
                    fromY="50%"
                    toX="calc(50% + 60px)"
                    toY="50%"
                    duration={2.5}
                  />
                )}
                {step === 3 && (
                  <Packet
                    key="ec3"
                    label={
                      <>
                        Success <CheckCircle2 className="ml-1 size-3" />
                      </>
                    }
                    color="mint"
                    fromX="calc(50% - 60px)"
                    fromY="50%"
                    toX="calc(10% + 40px)"
                    toY="50%"
                    duration={1.2}
                  />
                )}
              </>
            )}

            {network === "healthy" && modeELC === "EL" && (
              <>
                {step === 1 && (
                  <>
                    <Packet
                      key="el1a"
                      label={
                        <>
                          Success <Zap className="ml-1 size-3" />
                        </>
                      }
                      color="mint"
                      fromX="calc(50% - 60px)"
                      fromY="50%"
                      toX="calc(10% + 40px)"
                      toY="50%"
                      duration={1.2}
                    />
                    <Packet
                      key="el1b"
                      label={
                        <>
                          Async Sync <ArrowRight className="ml-1 size-3" />
                        </>
                      }
                      color="muted"
                      fromX="calc(50% + 60px)"
                      fromY="50%"
                      toX="calc(90% - 60px)"
                      toY="50%"
                      duration={2.5}
                    />
                  </>
                )}
                {step === 2 && (
                  <Packet
                    key="el2"
                    label={
                      <>
                        Async ACK <CheckCircle2 className="ml-1 size-3" />
                      </>
                    }
                    color="muted"
                    fromX="calc(90% - 60px)"
                    fromY="50%"
                    toX="calc(50% + 60px)"
                    toY="50%"
                    duration={2.5}
                  />
                )}
              </>
            )}

            {/* PARTITIONED NETWORK ANIMATIONS */}
            {network === "partitioned" && modePAC === "PA" && (
              <>
                {step === 1 && (
                  <>
                    <Packet
                      key="pa1a"
                      label={
                        <>
                          Success <Zap className="ml-1 size-3" />
                        </>
                      }
                      color="mint"
                      fromX="calc(50% - 60px)"
                      fromY="50%"
                      toX="calc(10% + 40px)"
                      toY="50%"
                      duration={1.2}
                    />
                    {/* Fails at shield (70%) */}
                    <Packet
                      key="pa1b"
                      label={<>Sync</>}
                      color="muted"
                      fromX="calc(50% + 60px)"
                      fromY="50%"
                      toX="70%"
                      toY="50%"
                      duration={1.2}
                    />
                  </>
                )}
                {step === 2 && (
                  <motion.div
                    key="pa2"
                    initial={{ left: "70%", top: "50%", opacity: 0, x: "-50%", y: "-50%" }}
                    animate={{ opacity: [0, 1, 0], scale: [1, 1.5] }}
                    transition={{ duration: 1 }}
                    className="absolute flex items-center justify-center h-5 px-2 rounded-full border backdrop-blur text-[10px] font-bold border-rose-500/30 bg-rose-500/10 text-rose-500 z-30"
                  >
                    Dropped
                  </motion.div>
                )}
              </>
            )}

            {network === "partitioned" && modePAC === "PC" && (
              <>
                {step === 1 && (
                  <Packet
                    key="pc1"
                    label={
                      <>
                        Sync Required <Clock className="ml-1 size-3 animate-spin-slow" />
                      </>
                    }
                    color="amber"
                    fromX="calc(50% + 60px)"
                    fromY="50%"
                    toX="70%"
                    toY="50%"
                    duration={1.2}
                  />
                )}
                {step === 2 && (
                  <motion.div
                    key="pc2"
                    initial={{ left: "70%", top: "50%", opacity: 0, x: "-50%", y: "-50%" }}
                    animate={{ opacity: [0, 1, 0], scale: [1, 1.5] }}
                    transition={{ duration: 1 }}
                    className="absolute flex items-center justify-center h-5 px-2 rounded-full border backdrop-blur text-[10px] font-bold border-rose-500/30 bg-rose-500/10 text-rose-500 z-30"
                  >
                    Dropped
                  </motion.div>
                )}
                {step === 3 && (
                  <Packet
                    key="pc3"
                    label={
                      <>
                        Error: Partition <AlertTriangle className="ml-1 size-3" />
                      </>
                    }
                    color="rose"
                    fromX="calc(50% - 60px)"
                    fromY="50%"
                    toX="calc(10% + 40px)"
                    toY="50%"
                    duration={1.2}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Explainer Panel */}
      <div className="border-t border-hairline bg-muted/20 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground font-mono bg-background p-3 rounded-md border border-hairline min-h-[60px] overflow-y-auto">
          {step === 0 &&
            !isPlaying &&
            "Select a network state and an optimization strategy, then click Simulate."}
          {step === 0 && isPlaying && "Step 0: US Client sends a Write request to the US Primary."}

          {/* Healthy + EC */}
          {network === "healthy" &&
            modeELC === "EC" &&
            step === 1 &&
            "Step 1: (EC) Primary forwards Write to EU Secondary. Client is BLOCKED waiting."}
          {network === "healthy" &&
            modeELC === "EC" &&
            step === 2 &&
            "Step 2: EU Secondary ACKs back to US Primary across the ocean."}
          {network === "healthy" &&
            modeELC === "EC" &&
            step === 3 &&
            "Step 3: US Primary replies Success to Client. Slower, but perfectly consistent."}
          {network === "healthy" &&
            modeELC === "EC" &&
            step >= 4 &&
            "Result: High Consistency, but High Latency."}

          {/* Healthy + EL */}
          {network === "healthy" &&
            modeELC === "EL" &&
            step === 1 &&
            "Step 1: (EL) Primary instantly replies Success (Low Latency). It simultaneously sends an async sync to EU."}
          {network === "healthy" &&
            modeELC === "EL" &&
            step === 2 &&
            "Step 2: EU Secondary ACKs back in the background. Client has already moved on."}
          {network === "healthy" &&
            modeELC === "EL" &&
            step >= 3 &&
            "Result: Low Latency, but temporarily inconsistent across regions."}

          {/* Partitioned + PA */}
          {network === "partitioned" &&
            modePAC === "PA" &&
            step === 1 &&
            "Step 1: (PA) Primary instantly replies Success (Available) but background sync fails due to partition."}
          {network === "partitioned" &&
            modePAC === "PA" &&
            step >= 2 &&
            "Result: High Availability. The system accepted the write, but EU node is out of sync (divergence)."}

          {/* Partitioned + PC */}
          {network === "partitioned" &&
            modePAC === "PC" &&
            step === 1 &&
            "Step 1: (PC) Primary attempts to sync to EU to maintain strict consistency, but network is down."}
          {network === "partitioned" &&
            modePAC === "PC" &&
            step >= 2 &&
            "Result: High Consistency. Primary rejects the write because it cannot guarantee the EU node received it. System is unavailable."}
        </p>
      </div>
    </div>
  );
}
