import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { ArrayStep, Pointer } from "@/lessons/types";

const COLOR_MAP: Record<Pointer["color"], string> = {
  mint: "var(--mint)",
  amber: "var(--amber)",
  violet: "var(--violet)",
  rose: "var(--rose)",
};

export function ElevationMapCanvas({ step }: { step: ArrayStep }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const array = (step.array as number[]) ?? [];
  const waterLevels = step.waterLevels ?? new Array(array.length).fill(0);
  const pointers = step.pointers ?? [];
  
  const n = array.length;
  if (n === 0) return null;

  const maxTerrain = Math.max(...array);
  const maxWater = Math.max(...array.map((h, i) => h + (waterLevels[i] || 0)));
  const maxH = Math.max(maxWater, 1);

  // Parse L_max and R_max from status if they exist
  let lMax = 0, rMax = 0;
  if (step.status) {
    const lMatch = step.status.match(/L_max = (\d+)/);
    const rMatch = step.status.match(/R_max = (\d+)/);
    if (lMatch) lMax = parseInt(lMatch[1], 10);
    if (rMatch) rMax = parseInt(rMatch[1], 10);
  }

  // Layout math
  const padding = 64; // horizontal padding
  const GAP = n > 15 ? 1 : 2; // small gap between bars
  const desiredWidth = containerWidth > 0 ? containerWidth - padding * 2 : 600;
  const CELL = Math.max((desiredWidth - (n - 1) * GAP) / n, 8); // at least 8px wide bars
  
  // Height math
  const CHART_HEIGHT = 180;
  const unitHeight = CHART_HEIGHT / maxH;
  
  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden flex flex-col items-center justify-center pt-8 pb-24">
      {/* Status */}
      {step.status && (
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2">
          <motion.div
            key={step.status}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-hairline bg-surface/90 px-4 py-1.5 font-mono text-[11px] text-foreground backdrop-blur-md shadow-sm whitespace-nowrap"
          >
            {step.status}
          </motion.div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        className="relative flex items-end"
        style={{ width: n * CELL + (n - 1) * GAP, height: CHART_HEIGHT, gap: GAP }}
      >
        {/* Background Grid Lines */}
        {Array.from({ length: maxH + 1 }).map((_, i) => (
          i > 0 && (
            <div 
              key={i} 
              className="absolute w-full border-b border-hairline/30 z-0"
              style={{ bottom: i * unitHeight }}
            />
          )
        ))}

        {/* Left Max Guide */}
        <motion.div
          initial={false}
          animate={{ y: -lMax * unitHeight, opacity: lMax > 0 ? 1 : 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className="absolute left-0 w-[45%] border-t-2 border-dashed border-mint/60 z-30 pointer-events-none"
          style={{ bottom: 0 }}
        >
          <span className="absolute -top-6 left-0 text-[10px] font-mono text-mint font-bold bg-surface/90 px-1.5 py-0.5 rounded-sm shadow-sm backdrop-blur-sm">L_max = {lMax}</span>
        </motion.div>
        
        {/* Right Max Guide */}
        <motion.div
          initial={false}
          animate={{ y: -rMax * unitHeight, opacity: rMax > 0 ? 1 : 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className="absolute right-0 w-[45%] border-t-2 border-dashed border-amber/60 z-30 pointer-events-none"
          style={{ bottom: 0 }}
        >
          <span className="absolute -top-6 right-0 text-[10px] font-mono text-amber font-bold bg-surface/90 px-1.5 py-0.5 rounded-sm shadow-sm backdrop-blur-sm">R_max = {rMax}</span>
        </motion.div>

        {array.map((val, i) => {
          const water = waterLevels[i] || 0;
          const isHighlighted = step.highlight?.indices.includes(i);

          return (
            <div key={i} className="relative flex flex-col justify-end group" style={{ width: CELL, height: CHART_HEIGHT }}>
              {/* Water Block */}
              <AnimatePresence>
                {water > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: water * unitHeight, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="w-full overflow-hidden shadow-[0_0_14px_rgba(14,165,233,0.28)] rounded-t-[2px]"
                    style={{ position: "absolute", bottom: val * unitHeight, zIndex: 10 }}
                  >
                    {/* drifting body */}
                    <div
                      className="water-body absolute inset-0"
                      style={{ animationDelay: `${(i % 5) * -0.9}s` }}
                    />
                    {/* rippling surface highlight */}
                    <div
                      className="water-surface absolute top-0 left-0 h-[3px] w-[200%] opacity-70"
                      style={{ animationDelay: `${(i % 3) * -0.8}s` }}
                    />
                    <div className="absolute inset-x-0 top-0 h-px bg-sky-200/80" />
                  </motion.div>
                )}
              </AnimatePresence>


              
              {/* Terrain Block */}
              <motion.div
                initial={false}
                animate={{ height: val * unitHeight }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                className={cn(
                  "w-full rounded-t-[3px] shadow-sm transition-colors border-t border-white/10",
                  isHighlighted ? "bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "bg-gradient-to-t from-slate-800 to-slate-500 dark:from-slate-700 dark:to-slate-400"
                )}
                style={{ zIndex: 20 }}
              />
              
              {/* Value Label (only shown if val > 0 or if we hover) */}
              <div className={cn(
                "absolute -bottom-7 w-full text-center font-mono text-[10px] transition-opacity",
                val > 0 ? "text-foreground/70" : "text-foreground/30"
              )}>
                {val}
              </div>
            </div>
          );
        })}

        {/* Pointers */}
        {pointers.map((p, i) => {
          const sharing = pointers.filter((q) => q.index === p.index);
          const shareIdx = sharing.findIndex((q) => q.name === p.name);
          const offset = sharing.length > 1 ? (shareIdx - (sharing.length - 1) / 2) * 22 : 0;
          const x = p.index * (CELL + GAP) + CELL / 2 + offset;
          const color = COLOR_MAP[p.color];
          const isHighlight = step.highlight?.indices.includes(p.index);
          

          
          return (
            <motion.div
              key={p.name}
              initial={false}
              animate={{ x: x - 12 }} // center the 24px wide pointer
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="absolute -bottom-20 z-40 flex flex-col items-center"
              style={{ width: 24 }}
            >
              {/* Connection line shooting up to the terrain */}
              {isHighlight && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: CHART_HEIGHT + 30, opacity: 0.3 }}
                  className="absolute bottom-10 w-px border-l border-dashed z-0"
                  style={{ borderColor: color }}
                />
              )}
              
              <div
                className="mb-1 h-3 w-0.5 z-10"
                style={{ backgroundColor: color }}
              />
              <div
                className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md z-10"
                style={{ backgroundColor: color }}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="mt-0.5 text-[9px] font-mono font-bold uppercase tracking-wider opacity-90 z-10" style={{ color }}>
                {p.name}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
