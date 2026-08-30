import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A two-row vertical split with a draggable divider. Small enough to own,
 * and it keeps the pane sizes in the same units the CSS grid uses.
 */
export function SplitPane({
  top,
  bottom,
  initial = 42,
  min = 18,
  max = 78,
  storageKey,
}: {
  top: ReactNode;
  bottom: ReactNode;
  initial?: number;
  min?: number;
  max?: number;
  storageKey?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(initial);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    const saved = Number(localStorage.getItem(storageKey));
    if (Number.isFinite(saved) && saved >= min && saved <= max) setPercent(saved);
  }, [storageKey, min, max]);

  const apply = useCallback(
    (next: number) => {
      const clamped = Math.min(max, Math.max(min, next));
      setPercent(clamped);
      if (storageKey) localStorage.setItem(storageKey, String(Math.round(clamped)));
    },
    [min, max, storageKey],
  );

  useEffect(() => {
    if (!dragging) return;

    const move = (e: PointerEvent) => {
      const box = containerRef.current?.getBoundingClientRect();
      if (!box) return;
      apply(((e.clientY - box.top) / box.height) * 100);
    };
    const stop = () => setDragging(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragging, apply]);

  return (
    <div
      ref={containerRef}
      className="sqlx-split"
      style={{ gridTemplateRows: `${percent}fr auto ${100 - percent}fr` }}
    >
      <div className="sqlx-split-pane">{top}</div>
      <div
        className={`sqlx-split-bar ${dragging ? "dragging" : ""}`}
        role="separator"
        aria-orientation="horizontal"
        aria-valuenow={Math.round(percent)}
        tabIndex={0}
        onPointerDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") apply(percent - 3);
          if (e.key === "ArrowDown") apply(percent + 3);
        }}
      >
        <span />
      </div>
      <div className="sqlx-split-pane">{bottom}</div>
    </div>
  );
}
