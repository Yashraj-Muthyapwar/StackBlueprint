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
  shape?: "rectangle" | "ellipse" | "diamond" | "cylinder" | "note";
  /** Square corners (rectangles only). */
  sharp?: boolean;
};

export type BoardEdge = {
  from: string;
  to: string;
  label?: string;
  /** Shifts the arrow up (negative) or down (positive), so a request and its response can run side by side. */
  offset?: number;
};

export type BoardRule = {
  id: string;
  /** What the learner sees in the checklist. */
  label: string;
  /** Passes when some labelled shape contains any of these words (case-insensitive). */
  node?: string[];
  /** Passes when an arrow joins a shape matching `from` to a shape matching `to`. */
  edge?: { from: string[]; to: string[]; anyDirection?: boolean };
  /**
   * Passes when at least `atLeast` pieces of text on the board match the pattern (a
   * case-insensitive regular expression), for example three delays such as "20 ms". With
   * `attached`, only text that belongs to a component or an arrow counts (written on an arrow,
   * inside a shape's name, or right next to one), so a note floating on its own does not. With
   * `distinct`, the matched values themselves must differ (four different delays, not "20 ms" twice).
   */
  text?: { pattern: string; atLeast: number; attached?: boolean; distinct?: boolean };
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
  /** Every piece of text on the board: shape labels, arrow labels and loose notes. */
  texts: string[];
  /** The text that belongs to a component or an arrow, not text floating on its own. */
  attachedTexts: string[];
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
    } else if (rule.text) {
      const re = new RegExp(rule.text.pattern, "i");
      const pool = rule.text.attached ? graph.attachedTexts : graph.texts;
      if (rule.text.distinct) {
        const found = new Set<string>();
        for (const t of pool) {
          for (const m of t.match(new RegExp(rule.text.pattern, "gi")) ?? []) {
            found.add(m.toLowerCase().replace(/\s+/g, ""));
          }
        }
        done = found.size >= rule.text.atLeast;
      } else {
        done = pool.filter((t) => re.test(t)).length >= rule.text.atLeast;
      }
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

/**
 * The Latency vs Throughput vs Bandwidth lesson's whiteboard practice: an image service whose
 * numbers differ from the lesson's product-search API. The answer shows the latency, the
 * throughput, the payload, the network load against the link, and the requests in progress.
 */
const imageApiNodes: BoardNode[] = [
  { id: "client", label: "Phone App", x: 0, y: 110, tone: "muted" },
  { id: "service", label: "Image Service (80 ms)", x: 340, y: 110, w: 250, tone: "mint" },
  {
    id: "load",
    label: "Network load: 300 x 100 KB = 30 MB/s = 240 Mbps of a 1 Gbps link",
    x: 150,
    y: 250,
    shape: "note",
    tone: "violet",
  },
  {
    id: "progress",
    label: "In progress: 300 x 0.08 s = 24 requests",
    x: 150,
    y: 300,
    shape: "note",
    tone: "amber",
  },
];

export const BOARDS: Record<string, BoardDefinition> = {
  "throughput-bandwidth-load": {
    id: "throughput-bandwidth-load",
    file: "image_service_load.board",
    title: "Work out the load on an image service",
    prompt:
      "A phone app requests thumbnails from an image service. The service completes 300 requests per second, each response is 100 KB, and the average request takes 80 ms. The link between them is 1 Gbps. Draw the app and the service with an arrow in each direction. Write the throughput on the request arrow, put the latency in the service's name, then add two notes: the network load in Mbps, and the average number of requests in progress. Double-click an arrow to write on it, or double-click a shape to edit its name.",
    rules: [
      { id: "client", label: "Add a Client", node: ["app", ...USER] },
      { id: "service", label: "Add the Image Service", node: ["image", ...SERVICE] },
      {
        id: "client-service",
        label: "Connect Client → Service",
        edge: { from: ["app", ...USER], to: ["image", ...SERVICE] },
      },
      {
        id: "service-client",
        label: "Connect Service → Client",
        edge: { from: ["image", ...SERVICE], to: ["app", ...USER] },
      },
      {
        id: "latency",
        label: "Show the latency, like 80 ms",
        text: { pattern: "\\b80\\s*ms", atLeast: 1 },
      },
      {
        id: "throughput",
        label: "Show the throughput, like 300 RPS",
        text: { pattern: "\\b300\\s*(rps|requests)", atLeast: 1 },
      },
      {
        id: "load",
        label: "Write the network load in Mbps",
        text: { pattern: "\\b240\\s*mbps", atLeast: 1 },
      },
      {
        id: "progress",
        label: "Write the requests in progress",
        text: { pattern: "\\b24\\s*(requests|in progress)", atLeast: 1 },
      },
    ],
    starter: { nodes: [], edges: [] },
    solution: {
      nodes: imageApiNodes,
      edges: [
        { from: "client", to: "service", label: "300 RPS", offset: -24 },
        { from: "service", to: "client", label: "100 KB each", offset: 24 },
      ],
    },
    passNote:
      "300 responses of 100 KB each need 240 Mbps, about a quarter of the 1 Gbps link, so the network is not the limit here. With 80 ms per request, about 24 requests are in progress at any moment.",
  },

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
