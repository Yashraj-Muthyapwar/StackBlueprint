import { motion } from "motion/react";
import type { SecondaryArray, PointerColor } from "@/lessons/types";

const COLOR_MAP: Record<PointerColor, string> = {
  mint: "var(--mint)",
  amber: "var(--amber)",
  violet: "var(--violet)",
  rose: "var(--rose)",
};

export function SecondaryStrip({ data }: { data: SecondaryArray }) {
  const arr = data.array;
  const n = arr.length;
  const CELL = n <= 10 ? 40 : n <= 16 ? 32 : 26;
  const GAP = 4;
  const highlightSet = new Set(data.highlight?.indices ?? []);
  const tone = data.highlight?.kind;
  const ringColor =
    tone === "match"
      ? "var(--mint)"
      : tone === "swap"
        ? "var(--rose)"
        : tone === "compare"
          ? "var(--violet)"
          : "transparent";

  const pointerByIdx = new Map<number, string[]>();
  for (const p of data.pointers ?? []) {
    if (!pointerByIdx.has(p.index)) pointerByIdx.set(p.index, []);
    pointerByIdx.get(p.index)!.push(p.name);
  }
  const pointerColor = new Map<string, PointerColor>();
  for (const p of data.pointers ?? []) pointerColor.set(p.name, p.color);

  return (
    <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {data.label}
      </div>
      <div className="flex flex-wrap items-end" style={{ gap: GAP }}>
        {arr.map((v, i) => {
          const isHit = highlightSet.has(i);
          const ps = pointerByIdx.get(i) ?? [];
          return (
            <div key={i} className="relative" style={{ width: CELL }}>
              {ps.length > 0 && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-0.5">
                  {ps.map((name) => (
                    <span
                      key={name}
                      className="rounded px-1 py-px font-mono text-[9px] font-semibold uppercase"
                      style={{
                        color: COLOR_MAP[pointerColor.get(name)!],
                        background: `color-mix(in oklab, ${COLOR_MAP[pointerColor.get(name)!]} 14%, transparent)`,
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
              <motion.div
                layout
                className="grid place-items-center rounded-md bg-surface-2 font-mono text-xs text-foreground"
                style={{
                  width: CELL,
                  height: CELL,
                  boxShadow: `inset 0 0 0 1px var(--hairline), 0 0 0 2px ${isHit ? ringColor : "transparent"}`,
                }}
              >
                {v}
              </motion.div>
              <div className="mt-1 text-center font-mono text-[9px] text-muted-foreground/60">
                {i}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
