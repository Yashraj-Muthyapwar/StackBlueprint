import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { SYSTEM_DESIGN_COMPONENTS, type ComponentGroup, type SystemComponent } from "./components";
import type { BoardController } from "./ExcalidrawCanvas";
import { TONES } from "./tones";

/*
 * The grouped, searchable list of System Design components. Click an item to drop it in the
 * middle of the board, or drag it to where it should go. Items arrive named and shaped, so they
 * count toward a board's goals without any renaming.
 */

const GROUP_ORDER: ComponentGroup[] = [
  "Clients",
  "Edge and networking",
  "Compute",
  "Data stores",
  "Messaging and streaming",
  "Platform",
];

function ShapeIcon({ c }: { c: SystemComponent }) {
  const { stroke, fill } = TONES[c.tone];
  const common = { stroke, fill, strokeWidth: 1.6 };
  return (
    <svg viewBox="0 0 30 22" className="h-[18px] w-[26px] shrink-0" aria-hidden>
      {c.shape === "ellipse" ? (
        <ellipse cx="15" cy="11" rx="12" ry="8" {...common} />
      ) : c.shape === "diamond" ? (
        <path d="M15 2 L28 11 L15 20 L2 11 Z" {...common} />
      ) : c.shape === "cylinder" ? (
        <>
          <path d="M4 5 V17 C4 20 26 20 26 17 V5" {...common} />
          <ellipse cx="15" cy="5" rx="11" ry="3.2" {...common} />
        </>
      ) : (
        <rect x="2" y="3" width="26" height="16" rx={c.sharp ? 0 : 4} {...common} />
      )}
    </svg>
  );
}

export function ComponentPalette({
  controller,
  boardRef,
}: {
  controller: BoardController | null;
  /** The canvas area: a drag that ends inside it (but outside this palette) is a drop. */
  boardRef: RefObject<HTMLElement | null>;
}) {
  const [query, setQuery] = useState("");
  const [ghost, setGhost] = useState<{ label: string; x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROUP_ORDER.map((group) => ({
      group,
      items: SYSTEM_DESIGN_COMPONENTS.filter(
        (c) => c.group === group && (!q || c.label.toLowerCase().includes(q)),
      ),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const startDrag = (c: SystemComponent) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!controller || e.button !== 0) return;
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    let moved = false;
    const move = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 6) moved = true;
      if (moved) setGhost({ label: c.label, x: ev.clientX, y: ev.clientY });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setGhost(null);
      if (!moved) {
        void controller.insert(c.id);
        return;
      }
      const inside = (el: Element | null | undefined) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return (
          ev.clientX >= r.left &&
          ev.clientX <= r.right &&
          ev.clientY >= r.top &&
          ev.clientY <= r.bottom
        );
      };
      if (inside(boardRef.current) && !inside(rootRef.current)) {
        void controller.insert(c.id, { clientX: ev.clientX, clientY: ev.clientY });
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={rootRef}
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-hairline bg-card/95 shadow-lg backdrop-blur"
    >
      <div className="border-b border-hairline p-2">
        <label className="flex items-center gap-2 rounded-md border border-hairline bg-background px-2 py-1.5">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components"
            aria-label="Search components"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </label>
        <p className="mt-1.5 px-0.5 text-[11px] leading-snug text-muted-foreground">
          Click to add, or drag onto the board.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-2">
        {groups.length === 0 ? (
          <p className="px-1 py-3 text-xs text-muted-foreground">No component matches.</p>
        ) : null}
        {groups.map(({ group, items }) => (
          <section key={group}>
            <h3 className="mb-1 px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group}
            </h3>
            <ul className="space-y-1">
              {items.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    disabled={!controller}
                    onPointerDown={startDrag(c)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && controller) {
                        e.preventDefault();
                        void controller.insert(c.id);
                      }
                    }}
                    className={cn(
                      "flex w-full cursor-grab touch-none select-none items-center gap-2 rounded-md border border-transparent px-1.5 py-1 text-left text-xs font-medium text-foreground/90 outline-none transition-colors",
                      "hover:border-hairline hover:bg-surface-2/60 focus-visible:border-mint/60 active:cursor-grabbing disabled:opacity-50",
                    )}
                  >
                    <ShapeIcon c={c} />
                    <span className="min-w-0 truncate">{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {ghost ? (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-md border border-mint/60 bg-background/90 px-3 py-1.5 text-xs font-medium text-mint shadow-lg"
          style={{ left: ghost.x, top: ghost.y }}
        >
          {ghost.label}
        </div>
      ) : null}
    </div>
  );
}
