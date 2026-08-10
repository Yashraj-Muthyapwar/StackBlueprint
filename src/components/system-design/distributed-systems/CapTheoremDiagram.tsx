import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, MonitorSmartphone, XCircle, Activity, ShieldAlert, CheckCircle2, ArrowRight, Unplug, AlertTriangle, Building, Heart } from "lucide-react";

type Scenario = "CP" | "AP";

export function CapTheoremDiagram() {
  const [networkPartition, setNetworkPartition] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("CP");

  // State for Bank (CP)
  const [bankBalanceA, setBankBalanceA] = useState(1000);
  const [bankBalanceB, setBankBalanceB] = useState(1000);
  const [bankError, setBankError] = useState<string | null>(null);

  // State for Social (AP)
  const [likesA, setLikesA] = useState(100);
  const [likesB, setLikesB] = useState(100);
  const [pendingSyncA, setPendingSyncA] = useState(0);
  const [pendingSyncB, setPendingSyncB] = useState(0);

  // Effect to heal partition
  useEffect(() => {
    if (!networkPartition) {
      setBankError(null);
      // Heal Social (AP) divergence
      if (pendingSyncA > 0 || pendingSyncB > 0) {
        const finalLikes = Math.max(likesA, likesB) + pendingSyncA + pendingSyncB;
        // simplistic reconciliation for demo purposes
        setLikesA(likesA + pendingSyncB);
        setLikesB(likesB + pendingSyncA);
        setPendingSyncA(0);
        setPendingSyncB(0);
      }
    }
  }, [networkPartition]);

  const handleBankAction = (node: "A" | "B") => {
    setBankError(null);
    if (networkPartition) {
      setBankError(`Node ${node} rejected transaction: Cannot safely coordinate with other nodes (CP mode).`);
      return;
    }

    setBankBalanceA(prev => prev - 200);
    setBankBalanceB(prev => prev - 200);
  };

  const handleSocialAction = (node: "A" | "B") => {
    if (networkPartition) {
      if (node === "A") {
        setLikesA(prev => prev + 1);
        setPendingSyncA(prev => prev + 1);
      } else {
        setLikesB(prev => prev + 1);
        setPendingSyncB(prev => prev + 1);
      }
    } else {
      setLikesA(prev => prev + 1);
      setLikesB(prev => prev + 1);
    }
  };

  const reset = () => {
    setBankBalanceA(1000);
    setBankBalanceB(1000);
    setBankError(null);
    setLikesA(100);
    setLikesB(100);
    setPendingSyncA(0);
    setPendingSyncB(0);
  };

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-hairline bg-muted/20 px-4 py-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">CAP Interactive Demo</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <button
            onClick={() => { setScenario("CP"); reset(); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm ${scenario === "CP" ? "bg-amber/20 text-amber border border-amber/40" : "bg-surface text-muted-foreground border border-hairline hover:text-foreground"}`}
          >
            <Building className="size-3.5 inline mr-1.5" />
            Bank (CP)
          </button>
          <button
            onClick={() => { setScenario("AP"); reset(); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm ${scenario === "AP" ? "bg-mint/20 text-mint border border-mint/40" : "bg-surface text-muted-foreground border border-hairline hover:text-foreground"}`}
          >
            <Heart className="size-3.5 inline mr-1.5" />
            Social (AP)
          </button>
          <div className="h-4 w-px bg-hairline hidden md:block" />
          <button
            onClick={() => setNetworkPartition(!networkPartition)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm ${networkPartition ? "bg-rose-500/10 text-rose-500 border border-rose-500/40" : "bg-foreground text-background"}`}
          >
            {networkPartition ? <Unplug className="size-3.5" /> : <Activity className="size-3.5" />}
            {networkPartition ? "Partition Active" : "Trigger Partition"}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface text-muted-foreground border border-hairline hover:text-foreground shadow-sm ml-auto md:ml-0"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="relative h-[320px] w-full bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden flex items-center justify-between px-4 md:px-16">
        {/* Network Connection Line */}
        <div className="absolute top-1/2 left-24 right-24 h-[2px] -translate-y-1/2 flex">
           <div className="h-full flex-1 border-t-2 border-dashed border-border/50 transition-all" />
           {networkPartition && <div className="w-16" />}
           <div className="h-full flex-1 border-t-2 border-dashed border-border/50 transition-all" />
        </div>

        {/* Partition Visualization */}
        <AnimatePresence>
          {networkPartition && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
            >
              <div className="h-32 w-10 bg-rose-500/20 backdrop-blur-sm border-x border-rose-500/50 skew-x-[-15deg] flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <ShieldAlert className="size-6 text-rose-500 animate-pulse" />
              </div>
              <span className="absolute -bottom-8 font-mono text-[10px] text-rose-500 font-bold tracking-wider">PARTITION</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node A (US-West) */}
        <div className="flex flex-col items-center gap-3 z-20">
          <span className="font-mono text-xs font-bold text-muted-foreground">Node A (US-West)</span>
          <div className="flex flex-col w-40 items-center justify-center rounded-xl border-2 border-muted-foreground/20 bg-background shadow-lg overflow-hidden">
            <div className="w-full bg-muted/30 py-2 flex justify-center border-b border-hairline">
              <Server className="size-6 text-foreground" />
            </div>
            <div className="p-4 w-full flex flex-col items-center gap-2">
              {scenario === "CP" ? (
                <>
                  <div className="text-sm font-mono font-medium">Balance: ${bankBalanceA}</div>
                  <button onClick={() => handleBankAction("A")} className="mt-2 w-full px-2 py-1.5 text-[10px] font-bold rounded bg-foreground text-background hover:bg-foreground/90 transition-colors">Withdraw $200</button>
                </>
              ) : (
                <>
                  <div className="text-sm font-mono font-medium flex items-center gap-1"><Heart className="size-4 text-rose-500" /> {likesA}</div>
                  {pendingSyncA > 0 && <span className="text-[9px] text-amber animate-pulse">+{pendingSyncA} pending sync</span>}
                  <button onClick={() => handleSocialAction("A")} className="mt-2 w-full px-2 py-1.5 text-[10px] font-bold rounded bg-foreground text-background hover:bg-foreground/90 transition-colors">Like Post</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Node B (US-East) */}
        <div className="flex flex-col items-center gap-3 z-20">
          <span className="font-mono text-xs font-bold text-muted-foreground">Node B (US-East)</span>
          <div className="flex flex-col w-40 items-center justify-center rounded-xl border-2 border-muted-foreground/20 bg-background shadow-lg overflow-hidden">
            <div className="w-full bg-muted/30 py-2 flex justify-center border-b border-hairline">
              <Server className="size-6 text-foreground" />
            </div>
            <div className="p-4 w-full flex flex-col items-center gap-2">
              {scenario === "CP" ? (
                <>
                  <div className="text-sm font-mono font-medium">Balance: ${bankBalanceB}</div>
                  <button onClick={() => handleBankAction("B")} className="mt-2 w-full px-2 py-1.5 text-[10px] font-bold rounded bg-foreground text-background hover:bg-foreground/90 transition-colors">Withdraw $200</button>
                </>
              ) : (
                <>
                  <div className="text-sm font-mono font-medium flex items-center gap-1"><Heart className="size-4 text-rose-500" /> {likesB}</div>
                  {pendingSyncB > 0 && <span className="text-[9px] text-amber animate-pulse">+{pendingSyncB} pending sync</span>}
                  <button onClick={() => handleSocialAction("B")} className="mt-2 w-full px-2 py-1.5 text-[10px] font-bold rounded bg-foreground text-background hover:bg-foreground/90 transition-colors">Like Post</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Global Error Overlay for CP */}
        <AnimatePresence>
          {bankError && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-30 whitespace-nowrap"
            >
              <XCircle className="size-4" />
              {bankError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Explainer Panel */}
      <div className="border-t border-hairline bg-muted/20 p-4">
        <div className="flex flex-col gap-2 items-start">
          <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
            {scenario === "CP" ? <Building className="size-4 text-amber" /> : <Heart className="size-4 text-mint" />}
            {scenario === "CP" ? "Consistency over Availability (CP)" : "Availability over Consistency (AP)"}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {scenario === "CP" ? (
              <>
                In a financial system, <strong className="text-foreground">Consistency</strong> is critical. When the network is healthy, withdrawing $200 syncs to both nodes. 
                When a <strong>Partition</strong> occurs, the nodes cannot safely communicate. To prevent you from withdrawing the same $200 twice, the system <strong>rejects the operation</strong>, choosing Consistency (safe data) over Availability (serving the request).
              </>
            ) : (
              <>
                In a social media feed, <strong className="text-foreground">Availability</strong> is more important than immediate consistency. When a <strong>Partition</strong> occurs, both nodes continue to accept "Likes" to keep the app working for users.
                This creates <strong>temporary stale data</strong> (divergence) between the nodes. When the partition is resolved, the nodes reconcile their differences (Eventual Consistency).
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
