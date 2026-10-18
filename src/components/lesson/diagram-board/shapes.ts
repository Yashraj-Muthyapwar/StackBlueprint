import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

import { TONES } from "./tones";
import type { BoardEdge, BoardNode } from "./rules";

/*
 * Turns board data into Excalidraw elements. Each component is one labelled shape, with the
 * label bound inside it, so renaming works the usual way (double-click the shape).
 */

type Skeleton = NonNullable<Parameters<typeof convertToExcalidrawElements>[0]>[number];

const DEFAULT_W = 150;
const DEFAULT_H = 70;
const CYLINDER_H = 96;

const heightOf = (n: BoardNode) => n.h ?? (n.shape === "cylinder" ? CYLINDER_H : DEFAULT_H);

/** A cylinder is a few grouped parts: bottom cap, body, side lines, top cap, and the label. */
function cylinder(n: BoardNode): Skeleton[] {
  const tone = TONES[n.tone ?? "muted"];
  const w = n.w ?? DEFAULT_W;
  const h = heightOf(n);
  const eh = Math.min(26, h * 0.28);
  const stroke = { strokeColor: tone.stroke, strokeWidth: 2 };
  const fill = { backgroundColor: tone.fill, fillStyle: "solid" as const };
  return [
    {
      type: "ellipse",
      id: `${n.id}__bottom`,
      x: n.x,
      y: n.y + h - eh,
      width: w,
      height: eh,
      ...stroke,
      ...fill,
    },
    // The body is the arrow anchor, so it keeps the component's own id.
    {
      type: "rectangle",
      id: n.id,
      x: n.x,
      y: n.y + eh / 2,
      width: w,
      height: h - eh,
      strokeColor: "transparent",
      ...fill,
      roundness: null,
    },
    {
      type: "line",
      id: `${n.id}__l`,
      x: n.x,
      y: n.y + eh / 2,
      points: [
        [0, 0],
        [0, h - eh],
      ],
      ...stroke,
    },
    {
      type: "line",
      id: `${n.id}__r`,
      x: n.x + w,
      y: n.y + eh / 2,
      points: [
        [0, 0],
        [0, h - eh],
      ],
      ...stroke,
    },
    {
      type: "ellipse",
      id: `${n.id}__top`,
      x: n.x,
      y: n.y,
      width: w,
      height: eh,
      ...stroke,
      ...fill,
    },
    {
      type: "text",
      id: `${n.id}__label`,
      text: n.label,
      fontSize: 16,
      textAlign: "center",
      x: n.x,
      y: n.y,
    },
  ] as Skeleton[];
}

function plainShape(n: BoardNode): Skeleton {
  const tone = TONES[n.tone ?? "muted"];
  const shape = n.shape ?? "rectangle";
  return {
    type: shape,
    id: n.id,
    x: n.x,
    y: n.y,
    width: n.w ?? DEFAULT_W,
    height: heightOf(n),
    strokeColor: tone.stroke,
    backgroundColor: tone.fill,
    fillStyle: "solid",
    roundness: n.sharp || shape === "diamond" ? null : { type: 3 },
    label: { text: n.label, fontSize: 18 },
  } as Skeleton;
}

/** Excalidraw measures text with the font that is ready, so load its hand-drawn font first. */
export function whenFontReady(): Promise<unknown> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  return Promise.all([
    document.fonts.load('16px "Excalifont"'),
    document.fonts.load('18px "Excalifont"'),
  ]).catch(() => undefined);
}

export function buildElements(scene: { nodes: BoardNode[]; edges: BoardEdge[] }) {
  const byId = new Map(scene.nodes.map((n) => [n.id, n]));

  const arrows = scene.edges.flatMap((e): Skeleton[] => {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b) return [];
    const ax = a.x + (a.w ?? DEFAULT_W);
    const ay = a.y + heightOf(a) / 2;
    return [
      {
        type: "arrow",
        x: ax,
        y: ay,
        width: b.x - ax,
        height: b.y + heightOf(b) / 2 - ay,
        strokeColor: "#475569",
        start: { id: a.id },
        end: { id: b.id },
        ...(e.label ? { label: { text: e.label, fontSize: 14 } } : {}),
      } as Skeleton,
    ];
  });

  const elements = convertToExcalidrawElements(
    [
      ...scene.nodes.flatMap((n) => (n.shape === "cylinder" ? cylinder(n) : [plainShape(n)])),
      ...arrows,
    ],
    // Keep our ids: grouping and label placement below look the parts up by id.
    { regenerateIds: false },
  );

  // Group each cylinder so it moves as one component, and centre its label on the body.
  const byElementId = new Map(elements.map((el) => [el.id, el]));
  for (const n of scene.nodes) {
    if (n.shape !== "cylinder") continue;
    for (const el of elements) {
      if (el.id === n.id || el.id.startsWith(`${n.id}__`)) {
        (el as unknown as { groupIds: string[] }).groupIds = [`g-${n.id}`];
      }
    }
    const label = byElementId.get(`${n.id}__label`);
    if (label) {
      const h = heightOf(n);
      const eh = Math.min(26, h * 0.28);
      const cx = n.x + (n.w ?? DEFAULT_W) / 2;
      const cy = n.y + eh + (h - eh) / 2;
      // Pad the text box: width is measured with whatever font was ready, and a box that is a
      // little too narrow clips the last letters.
      const width = label.width + 16;
      Object.assign(label, { width, x: cx - width / 2, y: cy - label.height / 2 });
    }
  }
  return elements;
}
