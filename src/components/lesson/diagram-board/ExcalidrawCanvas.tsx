import { useCallback, useEffect, useMemo, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  ExcalidrawElement,
  NonDeletedExcalidrawElement,
} from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { toGraph } from "./graph";
import { SYSTEM_DESIGN_COMPONENTS } from "./components";
import { buildElements, whenFontReady } from "./shapes";
import type { BoardDefinition, DiagramGraph } from "./rules";

/*
 * The only module that imports Excalidraw. DiagramBoard loads it lazily on the client, so the
 * large package never reaches pages that have no board and never runs during server rendering.
 */

export type BoardController = {
  load: (scene: "starter" | "solution" | "blank") => void | Promise<void>;
  /**
   * Adds a System Design component. With a screen position (a drop) it lands there; without
   * one it lands in the middle of what the learner is looking at.
   */
  insert: (componentId: string, at?: { clientX: number; clientY: number }) => Promise<void>;
  /** Colours the selected shapes, and every shape drawn next, with this stroke or fill. */
  applyColor: (kind: "stroke" | "fill", color: string) => void;
};

/** Excalidraw UI we hide: the floating Stroke / Background panel covers the canvas whenever a
 * shape is picked, and the Library panel duplicates our palette. Excalidraw's own CSS wins by
 * specificity, hence !important. */
const BOARD_CSS = `
.sb-excalidraw .excalidraw .selected-shape-actions { display: none !important; }
/* Components come from our own palette, so Excalidraw's Library panel is hidden. */
.sb-excalidraw .excalidraw .sidebar-trigger { display: none !important; }
/* The site's global ::selection sets a light text colour in dark mode, which Excalidraw's dark
   filter then inverts to dark on dark. Keep selected text in the editor readable. */
.sb-excalidraw .excalidraw ::selection { background: rgba(99, 102, 241, 0.35); color: inherit; }
.sb-excalidraw .excalidraw .excalidraw-wysiwyg { caret-color: currentColor; }
`;
const storageKey = (id: string) => `sb-diagram:v1:${id}`;

export default function ExcalidrawCanvas({
  board,
  theme,
  onGraph,
  onReady,
}: {
  board: BoardDefinition;
  theme: "light" | "dark";
  onGraph: (graph: DiagramGraph) => void;
  onReady: (controller: BoardController) => void;
}) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const inserted = useRef(0);
  const onGraphRef = useRef(onGraph);
  onGraphRef.current = onGraph;

  const initialData = useMemo(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(board.id));
      if (saved) {
        const elements = JSON.parse(saved) as ExcalidrawElement[];
        if (Array.isArray(elements)) return { elements, scrollToContent: true };
      }
    } catch {
      /* private mode or corrupt data: fall back to the starter */
    }
    return { elements: buildElements(board.starter), scrollToContent: true };
  }, [board]);

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      onGraphRef.current(toGraph(elements));
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        try {
          window.localStorage.setItem(
            storageKey(board.id),
            JSON.stringify(elements.filter((e) => !e.isDeleted)),
          );
        } catch {
          /* storage unavailable: the drawing just is not remembered */
        }
      }, 400);
    },
    [board.id],
  );

  const handleApi = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api;
      onReady({
        load: async (scene) => {
          await whenFontReady();
          const elements =
            scene === "blank"
              ? []
              : buildElements(scene === "solution" ? board.solution : board.starter);
          api.updateScene({ elements });
          // Wait a frame so the new scene is registered, then centre and fit it.
          if (elements.length) {
            requestAnimationFrame(() =>
              api.scrollToContent(api.getSceneElements(), { fitToContent: true, animate: false }),
            );
          }
        },
        insert: async (componentId, at) => {
          const c = SYSTEM_DESIGN_COMPONENTS.find((item) => item.id === componentId);
          if (!c) return;
          await whenFontReady();
          const state = api.getAppState();
          const zoom = state.zoom.value;
          inserted.current += 1;
          const nudge = ((inserted.current - 1) % 5) * 28;
          const cx = at
            ? (at.clientX - state.offsetLeft) / zoom - state.scrollX
            : state.width / 2 / zoom - state.scrollX + nudge;
          const cy = at
            ? (at.clientY - state.offsetTop) / zoom - state.scrollY
            : state.height / 2 / zoom - state.scrollY + nudge;
          const w = c.w ?? 170;
          const h = c.h ?? (c.shape === "cylinder" ? 96 : 64);
          const id = `n-${Math.random().toString(36).slice(2, 9)}`;
          const added = buildElements({
            nodes: [
              {
                id,
                label: c.label,
                x: cx - w / 2,
                y: cy - h / 2,
                w: c.w ?? 170,
                h: c.h ?? (c.shape === "cylinder" ? undefined : 64),
                tone: c.tone,
                shape: c.shape,
                sharp: c.sharp,
              },
            ],
            edges: [],
          });
          const group = added.find((el) => el.groupIds.length)?.groupIds[0];
          api.updateScene({
            elements: [...api.getSceneElements(), ...added],
            appState: {
              selectedElementIds: Object.fromEntries(added.map((el) => [el.id, true as const])),
              selectedGroupIds: group ? { [group]: true } : {},
            },
          });
        },
        applyColor: (kind, color) => {
          const selected = api.getAppState().selectedElementIds;
          const patch =
            kind === "stroke"
              ? { strokeColor: color }
              : { backgroundColor: color, fillStyle: "solid" as const };
          api.updateScene({
            elements: api.getSceneElements().map((e) =>
              selected[e.id]
                ? ({
                    ...e,
                    ...patch,
                    version: e.version + 1,
                    versionNonce: Math.floor(Math.random() * 2 ** 31),
                  } as ExcalidrawElement)
                : e,
            ),
            appState: {
              currentItemStrokeColor:
                kind === "stroke" ? color : api.getAppState().currentItemStrokeColor,
              currentItemBackgroundColor:
                kind === "fill" ? color : api.getAppState().currentItemBackgroundColor,
              currentItemFillStyle:
                kind === "fill" ? "solid" : api.getAppState().currentItemFillStyle,
            },
          });
        },
      });
    },
    [board, onReady],
  );

  return (
    // The floating properties panel covers the canvas while drawing, so it is hidden here.
    <div className="sb-excalidraw h-full w-full">
      <style>{BOARD_CSS}</style>
      <Excalidraw
        excalidrawAPI={handleApi}
        initialData={initialData}
        onChange={handleChange}
        theme={theme}
        handleKeyboardGlobally={false}
        gridModeEnabled
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
            changeViewBackgroundColor: false,
          },
        }}
      />
    </div>
  );
}
