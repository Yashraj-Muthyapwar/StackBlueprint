import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Crosshair, Minus, Plus, Timer } from "lucide-react";

import type { PlanNode } from "../db/explain";

const NODE_WIDTH = 232;
const NODE_HEIGHT = 112;
const GAP_X = 30;
const GAP_Y = 62;
const PADDING = 28;

export type PlanKind = "scan" | "join" | "group" | "sort" | "limit" | "other";

/** Colour family per operator, so scans, joins and sorts separate at a glance. */
export function kindOf(type: string): PlanKind {
  const t = type.toUpperCase();
  if (t.includes("SCAN") || t.includes("SEQ") || t.includes("GET")) return "scan";
  if (t.includes("JOIN") || t.includes("NESTED LOOP") || t.includes("HASH")) return "join";
  if (t.includes("AGGREGATE") || t.includes("GROUP")) return "group";
  if (t.includes("SORT") || t.includes("ORDER")) return "sort";
  if (t.includes("LIMIT") || t.includes("TOP")) return "limit";
  return "other";
}

interface Placed {
  id: number;
  node: PlanNode;
  x: number;
  y: number;
}

interface Link {
  /** Cubic path from the parent's bottom edge to the child's top edge. */
  d: string;
  from: number;
  to: number;
}

interface Layout {
  nodes: Placed[];
  links: Link[];
  width: number;
  height: number;
}

/**
 * Tidy tree layout.
 *
 * Each subtree is measured, then centred over its children. Execution plans are
 * strictly trees, so one recursive pass is enough and nothing here needs a
 * general graph layout engine.
 */
export function layout(root: PlanNode): Layout {
  const nodes: Placed[] = [];
  const links: Link[] = [];
  let nextId = 0;
  let depthMax = 0;

  const widths = new Map<PlanNode, number>();
  const measure = (node: PlanNode): number => {
    const cached = widths.get(node);
    if (cached !== undefined) return cached;
    const span =
      node.children.length === 0
        ? NODE_WIDTH
        : Math.max(
            NODE_WIDTH,
            node.children.reduce((sum, c) => sum + measure(c), 0) +
              GAP_X * (node.children.length - 1),
          );
    widths.set(node, span);
    return span;
  };

  const place = (node: PlanNode, depth: number, left: number, parent?: Placed): void => {
    const span = measure(node);
    const placed: Placed = {
      id: nextId++,
      node,
      x: left + span / 2 - NODE_WIDTH / 2,
      y: depth * (NODE_HEIGHT + GAP_Y),
    };
    nodes.push(placed);
    depthMax = Math.max(depthMax, depth);

    if (parent) {
      const x1 = parent.x + NODE_WIDTH / 2;
      const y1 = parent.y + NODE_HEIGHT;
      const x2 = placed.x + NODE_WIDTH / 2;
      const y2 = placed.y;
      const mid = y1 + (y2 - y1) / 2;
      links.push({
        d: `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`,
        from: parent.id,
        to: placed.id,
      });
    }

    let cursor = left;
    for (const child of node.children) {
      place(child, depth + 1, cursor, placed);
      cursor += measure(child) + GAP_X;
    }
  };

  place(root, 0, 0);

  return {
    nodes,
    links,
    width: measure(root),
    height: (depthMax + 1) * NODE_HEIGHT + depthMax * GAP_Y,
  };
}

function NodeCard({
  placed,
  rowPeak,
  costPeak,
  analyzed,
  dimmed,
  onHover,
}: {
  placed: Placed;
  rowPeak: number;
  costPeak: number;
  analyzed: boolean;
  dimmed: boolean;
  onHover: (id: number | null) => void;
}) {
  const node = placed.node;
  const estimate = node.estimatedRows;
  const actual = node.actualRows;

  // A planner estimate more than 10x off is the single most useful thing to spot.
  const misestimated =
    analyzed &&
    actual !== undefined &&
    estimate !== undefined &&
    estimate > 0 &&
    actual > 0 &&
    (actual / estimate > 10 || estimate / actual > 10);

  const rowShare = rowPeak > 0 ? ((actual ?? estimate ?? 0) / rowPeak) * 100 : 0;
  const costShare = costPeak > 0 && node.cost !== undefined ? (node.cost / costPeak) * 100 : null;

  return (
    <div
      className={`sqlx-gnode kind-${kindOf(node.type)} ${dimmed ? "dim" : ""}`}
      style={{ left: placed.x, top: placed.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
      onMouseEnter={() => onHover(placed.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="gnode-head">
        <span className="op">{node.type}</span>
        {misestimated && (
          <span className="flag" title="The planner's row estimate is off by more than 10x">
            <AlertTriangle size={10} />
          </span>
        )}
      </div>

      {node.target && <div className="gnode-target">{node.target}</div>}

      <div className="gnode-metrics">
        {estimate !== undefined && (
          <span>
            est <b>{estimate.toLocaleString()}</b>
          </span>
        )}
        {actual !== undefined && (
          <span className="actual">
            actual <b>{Math.round(actual).toLocaleString()}</b>
          </span>
        )}
        {node.cost !== undefined && (
          <span>
            cost <b>{node.cost.toFixed(0)}</b>
          </span>
        )}
        {node.actualMs !== undefined && (
          <span>
            <Timer size={9} /> <b>{node.actualMs.toFixed(1)}ms</b>
          </span>
        )}
      </div>

      <div className="gnode-bar" aria-hidden>
        <span className="rows" style={{ width: `${Math.min(100, rowShare)}%` }} />
        {costShare !== null && (
          <span className="cost" style={{ width: `${Math.min(100, costShare)}%` }} />
        )}
      </div>

      {node.detail && node.detail.length > 0 && (
        <div className="gnode-detail" title={node.detail.join("\n")}>
          {node.detail[0]}
          {node.detail.length > 1 && <em> +{node.detail.length - 1}</em>}
        </div>
      )}
    </div>
  );
}

/**
 * The plan as a pan-and-zoom node diagram.
 *
 * Drawn directly rather than through a graph library: the layout is a plain tree
 * we already compute exactly, so owning the transform keeps the whole thing to
 * one absolutely-positioned layer over one SVG, with no measurement handshake to
 * go wrong.
 */
export function PlanGraph({
  root,
  rowPeak,
  costPeak,
  analyzed,
}: {
  root: PlanNode;
  rowPeak: number;
  costPeak: number;
  analyzed: boolean;
  /** Accepted for symmetry with the other views; colours come from CSS tokens. */
  dark?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const plan = useMemo(() => layout(root), [root]);
  const [view, setView] = useState({ x: 0, y: PADDING, scale: 1 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const boxW = wrap.clientWidth - PADDING * 2;
    const boxH = wrap.clientHeight - PADDING * 2;
    if (boxW <= 0 || boxH <= 0) return;

    const scale = Math.min(1, Math.max(0.2, Math.min(boxW / plan.width, boxH / plan.height)));
    setView({
      scale,
      x: (wrap.clientWidth - plan.width * scale) / 2,
      y: PADDING,
    });
  }, [plan]);

  // Fit when the plan arrives, and again whenever the panel is resized.
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(frame);
  }, [fit]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => fit());
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [fit]);

  const zoomBy = useCallback((factor: number, originX?: number, originY?: number) => {
    setView((v) => {
      const wrap = wrapRef.current;
      const cx = originX ?? (wrap ? wrap.clientWidth / 2 : 0);
      const cy = originY ?? (wrap ? wrap.clientHeight / 2 : 0);
      const scale = Math.min(2, Math.max(0.15, v.scale * factor));
      // Keep whatever sits under the cursor fixed while scaling.
      return {
        scale,
        x: cx - ((cx - v.x) * scale) / v.scale,
        y: cy - ((cy - v.y) * scale) / v.scale,
      };
    });
  }, []);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const box = wrapRef.current?.getBoundingClientRect();
    zoomBy(
      e.deltaY < 0 ? 1.12 : 1 / 1.12,
      box ? e.clientX - box.left : undefined,
      box ? e.clientY - box.top : undefined,
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".sqlx-gnode")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setView((v) => ({ ...v, x: d.vx + (e.clientX - d.x), y: d.vy + (e.clientY - d.y) }));
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  /** A node stays lit when it, or something it connects to, is hovered. */
  const related = useMemo(() => {
    if (hovered === null) return null;
    const set = new Set<number>([hovered]);
    for (const link of plan.links) {
      if (link.from === hovered) set.add(link.to);
      if (link.to === hovered) set.add(link.from);
    }
    return set;
  }, [hovered, plan.links]);

  return (
    <div className="sqlx-plan-graph" ref={wrapRef}>
      <div
        className={`sqlx-graph-surface ${dragging ? "grabbing" : ""}`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="sqlx-graph-canvas"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            width: plan.width,
            height: plan.height,
          }}
        >
          <svg className="sqlx-graph-links" width={plan.width} height={plan.height} aria-hidden>
            {plan.links.map((link, i) => (
              <path
                key={i}
                d={link.d}
                className={
                  related && !(related.has(link.from) && related.has(link.to)) ? "dim" : ""
                }
              />
            ))}
          </svg>

          {plan.nodes.map((placed) => (
            <NodeCard
              key={placed.id}
              placed={placed}
              rowPeak={rowPeak}
              costPeak={costPeak}
              analyzed={analyzed}
              dimmed={!!related && !related.has(placed.id)}
              onHover={setHovered}
            />
          ))}
        </div>
      </div>

      <div className="sqlx-graph-controls">
        <button onClick={() => zoomBy(1.2)} title="Zoom in">
          <Plus size={13} />
        </button>
        <button onClick={() => zoomBy(1 / 1.2)} title="Zoom out">
          <Minus size={13} />
        </button>
        <button onClick={fit} title="Fit to view">
          <Crosshair size={13} />
        </button>
        <span className="zoom">{Math.round(view.scale * 100)}%</span>
      </div>

      <p className="sqlx-graph-hint">
        Drag to pan · scroll to zoom · hover a node to trace what feeds it
      </p>
    </div>
  );
}
