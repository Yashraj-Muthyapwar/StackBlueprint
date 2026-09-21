import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Activity, ShieldAlert, Unplug, XCircle } from "lucide-react";

export function CapPartitionDiagram() {
  const [networkPartition, setNetworkPartition] = useState(false);
  const [packets, setPackets] = useState<number[]>([]);

  // Generate continuous background packets
  useEffect(() => {
    const interval = setInterval(() => {
      if (!networkPartition) {
        setPackets((prev) => [...prev.slice(-4), Date.now()]);
      } else {
        // When partitioned, we still send packets but they will get destroyed in the middle
        setPackets((prev) => [...prev.slice(-4), Date.now()]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [networkPartition]);

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex items-center justify-between border-b border-hairline bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Partition Tolerance Demo
          </span>
        </div>
        <button
          onClick={() => setNetworkPartition(!networkPartition)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors shadow-sm ${networkPartition ? "bg-rose-500/10 text-rose-500 border border-rose-500/40" : "bg-foreground text-background"}`}
        >
          {networkPartition ? <Unplug className="size-3.5" /> : <Activity className="size-3.5" />}
          {networkPartition ? "Heal Network" : "Sever Connection"}
        </button>
      </div>

      <div className="relative h-[200px] w-full bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden flex items-center justify-center gap-12">
        {/* Network Connection Line */}
        <div className="absolute top-1/2 left-24 right-24 h-[2px] -translate-y-1/2 flex">
          <div
            className={`h-full flex-1 border-t-2 border-dashed transition-colors duration-500 ${networkPartition ? "border-rose-500/20" : "border-border/50"}`}
          />
          {networkPartition && <div className="w-16" />}
          <div
            className={`h-full flex-1 border-t-2 border-dashed transition-colors duration-500 ${networkPartition ? "border-rose-500/20" : "border-border/50"}`}
          />
        </div>

        {/* Node A */}
        <div className="flex flex-col items-center gap-2 z-20">
          <span className="font-mono text-[10px] font-bold text-muted-foreground">
            Node A (Alive)
          </span>
          <div className="flex flex-col w-24 items-center justify-center rounded-xl border-2 border-mint/40 bg-mint/5 shadow-lg overflow-hidden">
            <div className="w-full bg-muted/30 py-3 flex justify-center border-b border-hairline relative">
              <Server className="size-6 text-mint" />
              <div className="absolute top-2 right-2 size-2 rounded-full bg-mint animate-pulse" />
            </div>
          </div>
        </div>

        {/* Partition Shield */}
        <AnimatePresence>
          {networkPartition && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
            >
              <div className="h-24 w-8 bg-rose-500/20 backdrop-blur-sm border-x border-rose-500/50 skew-x-[-15deg] flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <ShieldAlert className="size-6 text-rose-500 animate-pulse" />
              </div>
              <span className="absolute -bottom-6 font-mono text-[10px] text-rose-500 font-bold tracking-wider">
                NETWORK CUT
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Node B */}
        <div className="flex flex-col items-center gap-2 z-20">
          <span className="font-mono text-[10px] font-bold text-muted-foreground">
            Node B (Alive)
          </span>
          <div className="flex flex-col w-24 items-center justify-center rounded-xl border-2 border-mint/40 bg-mint/5 shadow-lg overflow-hidden">
            <div className="w-full bg-muted/30 py-3 flex justify-center border-b border-hairline relative">
              <Server className="size-6 text-mint" />
              <div className="absolute top-2 right-2 size-2 rounded-full bg-mint animate-pulse" />
            </div>
          </div>
        </div>

        {/* Animation Track */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence>
            {packets.map((id, index) => {
              const isLeftToRight = index % 2 === 0;
              const startX = isLeftToRight ? "25%" : "75%";
              const endX = isLeftToRight ? "75%" : "25%";
              const midX = "50%";

              if (!networkPartition) {
                return (
                  <motion.div
                    key={id}
                    initial={{ left: startX, opacity: 0, x: "-50%", y: "-50%" }}
                    animate={{ left: endX, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    className="absolute top-[50%] flex items-center justify-center h-4 w-4 rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.5)] z-30"
                  />
                );
              } else {
                return (
                  <motion.div
                    key={id}
                    initial={{ left: startX, opacity: 0, x: "-50%", y: "-50%" }}
                    animate={{ left: midX, opacity: [0, 1, 0], scale: [1, 1, 1.5] }}
                    transition={{ duration: 0.75, ease: "linear" }}
                    className="absolute top-[50%] flex items-center justify-center h-4 w-4 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.5)] z-30"
                  >
                    <XCircle className="size-3" />
                  </motion.div>
                );
              }
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-hairline bg-muted/20 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Partition Tolerance (P)</strong> means the system
          continues operating despite network communication failures. Notice that Node A and Node B
          are both completely healthy and running, but the cable connecting them has been cut.
          Distributed systems must assume partitions will eventually happen.
        </p>
      </div>
    </div>
  );
}
