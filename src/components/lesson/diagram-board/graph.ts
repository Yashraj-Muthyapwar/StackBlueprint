import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

import type { DiagramGraph } from "./rules";

/*
 * Reads a drawing into the labelled components and arrows the pass rules need. It accepts the
 * ways a learner naturally draws, not only the ways Excalidraw binds things:
 *  - a label can be text inside a shape (bound), or loose text placed on or just beside a shape
 *  - a component can be a single shape or a grouped library icon
 *  - an arrow can be attached to a shape, or simply start and end on or near one
 */

type Box = { x1: number; y1: number; x2: number; y2: number; label: string };

const SHAPES = new Set(["rectangle", "ellipse", "diamond"]);
// Grouped library icons are built from these parts; "draw" is the legacy name for freedraw.
const ICON_PARTS = new Set(["rectangle", "ellipse", "diamond", "line", "freedraw", "draw"]);

/** How far outside a component a loose label or arrow end may sit and still belong to it. */
const LABEL_MARGIN = 30;
const ARROW_MARGIN = 24;

/** How far loose text may sit from an arrow and still count as that arrow's label. */
const ARROW_LABEL_MARGIN = 40;

/** Distance from a point to a line segment. */
function segmentDistance(px: number, py: number, [x1, y1, x2, y2]: number[]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

const gap = (v: number, lo: number, hi: number) => (v < lo ? lo - v : v > hi ? v - hi : 0);

/** Distance from a point to a box (0 when inside). */
function distance(b: Box, x: number, y: number) {
  return Math.hypot(gap(x, b.x1, b.x2), gap(y, b.y1, b.y2));
}

function nearest(boxes: Map<string, Box>, x: number, y: number, margin: number) {
  let best: string | null = null;
  let bestScore = Infinity;
  for (const [key, b] of boxes) {
    const d = distance(b, x, y);
    if (d > margin) continue;
    // Prefer the component the point is inside, then the one whose centre is closest.
    const score = d * 1000 + Math.hypot((b.x1 + b.x2) / 2 - x, (b.y1 + b.y2) / 2 - y);
    if (score < bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best;
}

export function toGraph(elements: readonly ExcalidrawElement[]): DiagramGraph {
  const live = elements.filter((e) => !e.isDeleted);

  // 1. Components: single shapes, plus each outermost group of icon parts.
  const boxes = new Map<string, Box>();
  const componentOf = new Map<string, string>();
  for (const e of live) {
    const type: string = e.type;
    const grouped = e.groupIds.length > 0;
    if (!(SHAPES.has(type) || (grouped && ICON_PARTS.has(type)))) continue;
    const key = grouped ? e.groupIds[e.groupIds.length - 1] : e.id;
    componentOf.set(e.id, key);
    const x1 = Math.min(e.x, e.x + e.width);
    const x2 = Math.max(e.x, e.x + e.width);
    const y1 = Math.min(e.y, e.y + e.height);
    const y2 = Math.max(e.y, e.y + e.height);
    const box = boxes.get(key);
    if (box) {
      box.x1 = Math.min(box.x1, x1);
      box.y1 = Math.min(box.y1, y1);
      box.x2 = Math.max(box.x2, x2);
      box.y2 = Math.max(box.y2, y2);
    } else {
      boxes.set(key, { x1, y1, x2, y2, label: "" });
    }
  }

  // 2. Labels: bound text first, then loose text placed on or near a component.
  const addLabel = (key: string, text: string) => {
    const box = boxes.get(key);
    if (box) box.label = `${box.label} ${text}`.trim();
  };
  // Arrow lines, so loose text next to an arrow counts as attached to it.
  const arrowIds = new Set<string>();
  const segments: number[][] = [];
  for (const a of live) {
    if (a.type !== "arrow" || a.points.length < 2) continue;
    arrowIds.add(a.id);
    for (let i = 1; i < a.points.length; i++) {
      segments.push([
        a.x + a.points[i - 1][0],
        a.y + a.points[i - 1][1],
        a.x + a.points[i][0],
        a.y + a.points[i][1],
      ]);
    }
  }
  /** Text that belongs to a component or an arrow, not text floating on its own. */
  const attachedTexts: string[] = [];
  for (const e of live) {
    if (e.type !== "text") continue;
    const owner =
      (e.containerId ? componentOf.get(e.containerId) : undefined) ??
      (e.groupIds.length ? e.groupIds[e.groupIds.length - 1] : undefined);
    if (owner && boxes.has(owner)) {
      addLabel(owner, e.text);
      attachedTexts.push(e.text);
      continue;
    }
    if (e.containerId) {
      // Text written on an arrow is a label for that arrow, not for a component.
      if (arrowIds.has(e.containerId)) attachedTexts.push(e.text);
      continue;
    }
    const cx = e.x + e.width / 2;
    const cy = e.y + e.height / 2;
    const key = nearest(boxes, cx, cy, LABEL_MARGIN);
    if (key) {
      addLabel(key, e.text);
      attachedTexts.push(e.text);
    } else if (segments.some((seg) => segmentDistance(cx, cy, seg) <= ARROW_LABEL_MARGIN)) {
      attachedTexts.push(e.text);
    }
  }

  // 3. Arrows: attached ends first, then wherever each end lands.
  const edges: DiagramGraph["edges"] = [];
  for (const e of live) {
    if (e.type !== "arrow" || e.points.length < 2) continue;
    const first = e.points[0];
    const last = e.points[e.points.length - 1];
    const from =
      (e.startBinding ? componentOf.get(e.startBinding.elementId) : undefined) ??
      nearest(boxes, e.x + first[0], e.y + first[1], ARROW_MARGIN);
    const to =
      (e.endBinding ? componentOf.get(e.endBinding.elementId) : undefined) ??
      nearest(boxes, e.x + last[0], e.y + last[1], ARROW_MARGIN);
    if (from && to && from !== to) edges.push({ from, to });
  }

  const nodes = [...boxes]
    .filter(([, b]) => b.label !== "")
    .map(([id, b]) => ({ id, label: b.label }));
  const texts = live.flatMap((e) => (e.type === "text" ? [e.text] : []));
  return { nodes, edges, texts, attachedTexts };
}
