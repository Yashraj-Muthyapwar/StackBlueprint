/**
 * Board definitions and the pass rules for the global DiagramBoard.
 *
 * A board describes a diagram exercise as data: a prompt, optional starter shapes, an example
 * answer, and rules about the diagram's structure (which components exist, what connects to
 * what). Rules check structure only, never layout, so any reasonable drawing can pass.
 * Lessons reference a board by id: `{ kind: "diagram-board", boardId: "url-shortener-basic" }`.
 */

export type BoardNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  tone?: "mint" | "violet" | "amber" | "muted" | "sky" | "rose";
  /** Defaults to a rounded rectangle. A cylinder is drawn as one grouped component. */
  shape?: "rectangle" | "ellipse" | "diamond" | "cylinder";
  /** Square corners (rectangles only). */
  sharp?: boolean;
};

export type BoardEdge = { from: string; to: string; label?: string };

export type BoardRule = {
  id: string;
  /** What the learner sees in the checklist. */
  label: string;
  /** Passes when some labelled shape contains any of these words (case-insensitive). */
  node?: string[];
  /** Passes when an arrow joins a shape matching `from` to a shape matching `to`. */
  edge?: { from: string[]; to: string[]; anyDirection?: boolean };
};

export type BoardDefinition = {
  id: string;
  file: string;
  title: string;
  prompt: string;
  rules: BoardRule[];
  /** Shapes already on the board when the learner starts. Empty means a blank board. */
  starter: { nodes: BoardNode[]; edges: BoardEdge[] };
  /** The "Show example" answer. */
  solution: { nodes: BoardNode[]; edges: BoardEdge[] };
  /** Shown beside the badge once every rule passes. */
  passNote: string;
};

/** What the checker needs from a drawing: labelled shapes and the arrows joining them. */
export type DiagramGraph = {
  nodes: { id: string; label: string }[];
  edges: { from: string; to: string }[];
};

const matches = (label: string, words: string[]) => {
  const text = label.toLowerCase();
  return words.some((w) => text.includes(w.toLowerCase()));
};

export function evaluateRules(rules: BoardRule[], graph: DiagramGraph) {
  return rules.map((rule) => {
    let done = false;
    if (rule.node) {
      done = graph.nodes.some((n) => matches(n.label, rule.node!));
    } else if (rule.edge) {
      const { from, to, anyDirection } = rule.edge;
      const byId = new Map(graph.nodes.map((n) => [n.id, n.label]));
      done = graph.edges.some((e) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (a === undefined || b === undefined) return false;
        return (
          (matches(a, from) && matches(b, to)) ||
          (!!anyDirection && matches(a, to) && matches(b, from))
        );
      });
    }
    return { rule, done };
  });
}

/* --------------------------------- Boards --------------------------------- */

const USER = ["user", "client", "browser"];
const SERVICE = ["service", "shortener", "server", "api", "app"];
const DATABASE = ["database", "db", "storage", "store"];
const CACHE = ["cache", "redis"];

const flowNodes: BoardNode[] = [
  { id: "user", label: "User", x: 0, y: 120, tone: "muted" },
  { id: "service", label: "URL Shortener Service", x: 340, y: 120, w: 250, tone: "mint" },
  { id: "db", label: "Database", x: 780, y: 107, tone: "violet", shape: "cylinder" },
];

export const BOARDS: Record<string, BoardDefinition> = {
  "url-shortener-basic": {
    id: "url-shortener-basic",
    file: "url_shortener_basic.board",
    title: "Draw the basic flow",
    prompt:
      "A user submits a long URL. The service creates a short code and stores the mapping in a database. Draw the three components and the arrows between them.",
    rules: [
      { id: "user", label: "Add a User", node: USER },
      { id: "service", label: "Add the URL Shortener Service", node: SERVICE },
      { id: "db", label: "Add a Database", node: DATABASE },
      { id: "user-service", label: "Connect User → Service", edge: { from: USER, to: SERVICE } },
      {
        id: "service-db",
        label: "Connect Service → Database",
        edge: { from: SERVICE, to: DATABASE },
      },
    ],
    starter: { nodes: [], edges: [] },
    solution: {
      nodes: flowNodes,
      edges: [
        { from: "user", to: "service", label: "long URL" },
        { from: "service", to: "db", label: "a7Bx9 → URL" },
      ],
    },
    passNote:
      "That is the basic flow. It covers the functions, not the latency or availability targets yet.",
  },
};
