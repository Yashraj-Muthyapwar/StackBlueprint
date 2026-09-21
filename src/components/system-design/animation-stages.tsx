import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { Container, HardDrive, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const r = (key: string | number, ...cells: (string | number | null)[]): Row => ({ key, cells });

const st = (
  activeLines: number[],
  rowState: ((row: Row, i: number) => RowState | undefined) | RowState,
  note: string,
  extra: Partial<StageStep> = {},
): StageStep => ({
  activeLines,
  note,
  rowState: typeof rowState === "function" ? rowState : () => rowState,
  ...extra,
});

const TONE_CLASSES: Record<Tone, string> = {
  mint: "border-mint/40 bg-mint/10 text-mint",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  amber: "border-amber/40 bg-amber/10 text-amber",
  violet: "border-violet/40 bg-violet/10 text-violet",
  neutral: "border-hairline bg-surface-2/40 text-muted-foreground",
};

const sidePanel = (title: string, points: string[], tone: Tone = "violet", Icon?: LucideIcon) => (
  <div className={`rounded-lg border p-3 ${TONE_CLASSES[tone]}`}>
    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">
      {Icon ? <Icon className="size-3.5" /> : null}
      {title}
    </div>
    {points.map((p, i) => (
      <div key={i} className="mt-1 font-mono text-[12px] text-foreground/85">
        {p}
      </div>
    ))}
  </div>
);

const ipClientServer: Stage[] = [
  {
    name: "1. The Request",
    blurb: "Client builds the data payload",
    sql: [
      "Client Device (192.168.1.5)",
      "  └─ Browser requests 'google.com'",
      "",
      "Payload: HTTP GET /",
    ],
    table: {
      name: "Client State",
      cols: ["layer", "data"],
      rows: [r(1, "Application", "GET /")],
    },
    steps: [
      st(
        [1, 2, 4],
        "kept",
        "Your browser generates an application-level request asking for the webpage.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "2. The IP Packet",
    blurb: "Wrapping the request with IP routing info",
    sql: [
      "IP Packet Constructed",
      "┌─────────────────────────────────────┐",
      "│ Src IP: 192.168.1.5 (You)           │",
      "│ Dst IP: 142.250.190.46 (Google)     │",
      "│ Protocol: TCP                       │",
      "├─────────────────────────────────────┤",
      "│ Payload: HTTP GET /                 │",
      "└─────────────────────────────────────┘",
    ],
    table: {
      name: "Packet Header",
      cols: ["field", "value"],
      rows: [
        r(1, "Source IP", "192.168.1.5"),
        r(2, "Dest IP", "142.250.190.46"),
        r(3, "Protocol", "TCP (6)"),
      ],
    },
    steps: [
      st(
        [3, 4],
        (row) => (row.key === 1 || row.key === 2 ? "added" : "kept"),
        "The OS wraps the payload in an IP packet, adding the source and destination IP addresses so routers know where to send it.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "3. The Response",
    blurb: "Server replies to the Source IP",
    sql: [
      "Response Packet from Google",
      "┌─────────────────────────────────────┐",
      "│ Src IP: 142.250.190.46 (Google)     │",
      "│ Dst IP: 192.168.1.5 (You)           │",
      "│ Protocol: TCP                       │",
      "├─────────────────────────────────────┤",
      "│ Payload: HTTP 200 OK (HTML)         │",
      "└─────────────────────────────────────┘",
    ],
    table: {
      name: "Packet Header",
      cols: ["field", "value"],
      rows: [
        r(1, "Source IP", "142.250.190.46"),
        r(2, "Dest IP", "192.168.1.5"),
        r(3, "Protocol", "TCP (6)"),
      ],
    },
    steps: [
      st(
        [3, 4],
        (row) => (row.key === 1 || row.key === 2 ? "added" : "kept"),
        "The server processes the request and sends a response. The Source and Destination IPs are swapped to route it back to you.",
        { noteTone: "amber" },
      ),
    ],
  },
];

const availabilityAnimation: Stage[] = [
  {
    name: "1. Sequential Dependency",
    blurb: "Both must work for the system to be available",
    sql: ["Client Request", "  └─► [Service A: 99.9%]", "        └─► [Service B: 99.9%]"],
    table: {
      name: "Total Availability",
      cols: ["Calculation", "Result"],
      rows: [r(1, "0.999 × 0.999", "99.8001%")],
    },
    steps: [
      st(
        [1, 2],
        "kept",
        "In sequence, failure probabilities multiply. More components mean higher chance of failure.",
        { noteTone: "rose" },
      ),
    ],
  },
  {
    name: "2. Parallel Redundancy",
    blurb: "Only one needs to work for the system to be available",
    sql: ["Client Request", "  ├─► [Service A: 99.9%]", "  └─► [Service B: 99.9%]"],
    table: {
      name: "Total Availability",
      cols: ["Calculation", "Result"],
      rows: [r(1, "1 - (0.001 × 0.001)", "99.9999%")],
    },
    steps: [
      st(
        [1, 2],
        "kept",
        "In parallel, both must fail simultaneously for an outage to occur. Redundancy dramatically improves availability.",
        { noteTone: "mint" },
      ),
    ],
  },
];

const reliabilityAnimation: Stage[] = [
  {
    name: "1. Circuit Breaker: CLOSED",
    blurb: "Traffic flows normally to the healthy dependency",
    sql: ["Service A ────► Service B (Healthy)", "", "State: [CLOSED]"],
    steps: [
      st([0], "kept", "Under normal conditions, requests pass through and succeed.", {
        noteTone: "mint",
      }),
    ],
  },
  {
    name: "2. Dependency Fails",
    blurb: "Errors spike, causing latency to build up",
    sql: ["Service A ────► Service B (Failing!)", "  ERROR: Timeout", "", "State: [CLOSED]"],
    steps: [
      st(
        [0, 1],
        "kept",
        "Service B stops responding. Waiting for timeouts consumes resources on Service A, risking cascading failure.",
        { noteTone: "rose" },
      ),
    ],
  },
  {
    name: "3. Circuit Breaker: OPEN",
    blurb: "Failing fast to protect the system",
    sql: [
      "Service A ──X── Service B (Failing)",
      "  ↳ FALLBACK: Return cached data",
      "",
      "State: [OPEN]",
    ],
    steps: [
      st(
        [0, 1],
        "kept",
        "The breaker trips. Subsequent requests fail immediately (or fallback) without waiting, allowing Service B time to recover.",
        { noteTone: "amber" },
      ),
    ],
  },
];

const consistencyAnimation: Stage[] = [
  {
    name: "1. Strong Consistency",
    blurb: "Wait for replicas before acknowledging",
    sql: [
      "1. Client writes X=50 to Leader",
      "2. Leader replicates X=50 to Followers",
      "3. Followers ACK to Leader",
      "4. Leader ACKs to Client",
      "5. Client reads X from Follower -> gets 50",
    ],
    steps: [
      st([1, 2], "kept", "The write operation blocks until replication is confirmed.", {
        noteTone: "amber",
      }),
      st(
        [4],
        "kept",
        "Because of the synchronous coordination, any subsequent read is guaranteed to see the latest data.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "2. Eventual Consistency",
    blurb: "Acknowledge immediately, replicate later",
    sql: [
      "1. Client writes X=50 to Leader",
      "2. Leader ACKs to Client",
      "3. Client reads X from Follower -> gets OLD_VALUE",
      "4. Leader replicates X=50 to Followers (later)",
    ],
    steps: [
      st([1], "kept", "The system replies faster because it doesn't wait for replication.", {
        noteTone: "mint",
      }),
      st(
        [2],
        "kept",
        "However, a read can hit a replica that hasn't caught up yet, returning stale data.",
        { noteTone: "rose" },
      ),
      st([3], "kept", "Eventually, the replicas converge and all hold the same value.", {
        noteTone: "violet",
      }),
    ],
  },
];

const capTheoremAnimation: Stage[] = [
  {
    name: "1. The Partition",
    blurb: "Network fails between Node A and B",
    sql: [
      "Node A (Inventory: 1)  <-X->  Node B (Inventory: 1)",
      "",
      "User requests to buy item from Node B.",
    ],
    steps: [
      st(
        [0],
        "kept",
        "The nodes are online but cannot communicate with each other. This is the 'P' (Partition) in CAP.",
        { noteTone: "rose" },
      ),
    ],
  },
  {
    name: "2. CP (Consistency Preferred)",
    blurb: "Reject to prevent conflicts",
    sql: [
      "Node A (Inventory: 1)  <-X->  Node B (Inventory: 1)",
      "",
      "Node B: 'I cannot verify with A. Purchase REJECTED.'",
    ],
    steps: [
      st(
        [2],
        "kept",
        "Sacrifice Availability: B rejects the request to ensure we don't accidentally oversell the last item.",
        { noteTone: "amber" },
      ),
    ],
  },
  {
    name: "3. AP (Availability Preferred)",
    blurb: "Accept and risk inconsistency",
    sql: [
      "Node A (Inventory: 1)  <-X->  Node B (Inventory: 1)",
      "",
      "Node B: 'I will assume we have it. Purchase ACCEPTED.'",
    ],
    steps: [
      st(
        [2],
        "kept",
        "Sacrifice Consistency: B accepts the request. We stay available, but if A also sold the item, we have an oversell conflict to resolve later.",
        { noteTone: "violet" },
      ),
    ],
  },
];

const pacelcTheoremAnimation: Stage[] = [
  {
    name: "1. The ELC Trade-off (No Partition)",
    blurb: "Even when healthy, we must choose between Latency and Consistency",
    sql: [
      "Client ──► [US Region]",
      "              │",
      "           (Ocean)",
      "              │",
      "           [EU Region]",
    ],
    steps: [
      st(
        [1, 2, 3],
        "kept",
        "During normal operation, the network round-trip between regions takes time.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "2. Optimizing for Consistency (EC)",
    blurb: "Wait for the long round trip",
    sql: ["Client ──► [US] ──► [EU] ──► [US] ──► ACK", "", "Latency: HIGH", "Consistency: STRONG"],
    steps: [
      st(
        [0],
        "kept",
        "Synchronous replication forces the client to wait for the cross-ocean trip, hurting latency but ensuring EU is instantly consistent.",
        { noteTone: "amber" },
      ),
    ],
  },
  {
    name: "3. Optimizing for Latency (EL)",
    blurb: "Acknowledge fast, replicate later",
    sql: [
      "Client ──► [US] ──► ACK",
      "            ↳ ──► [EU] (Background)",
      "",
      "Latency: LOW",
      "Consistency: EVENTUAL",
    ],
    steps: [
      st(
        [0, 1],
        "kept",
        "Asynchronous replication gives the client a fast response, but EU will be temporarily stale.",
        { noteTone: "mint" },
      ),
    ],
  },
];

const systemDesignEvolution: Stage[] = [
  {
    name: "1. Start with the baseline",
    blurb: "One request path for a modest workload",
    sql: [
      "Client ──► Application ──► Database",
      "",
      "Constraint: modest traffic",
      "Decision: keep the architecture small",
    ],
    table: {
      name: "What the baseline owns",
      cols: ["component", "responsibility"],
      rows: [
        r(1, "Application", "Request handling and business logic"),
        r(2, "Database", "Durable application data"),
      ],
    },
    steps: [
      st(
        [0, 2, 3],
        "kept",
        "A simple request path is easier to operate and reason about. Keep it until a concrete constraint says otherwise.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "2. Reads become the bottleneck",
    blurb: "Repeated reads add latency and database load",
    sql: [
      "Client ──► Application ──► Cache ──► Database",
      "                         │ hit",
      "                         └────► return quickly",
      "Constraint: high repeated-read traffic",
    ],
    table: {
      name: "New trade-off",
      cols: ["gain", "cost"],
      rows: [
        r(1, "Lower read latency", "Invalidation rules"),
        r(2, "Less database load", "Stale data is possible"),
      ],
    },
    steps: [
      st(
        [0, 1, 2, 3],
        (row) => (row.key === 1 ? "added" : "kept"),
        "A cache is justified by a read bottleneck. It speeds repeated reads, but the design must define when data can be stale.",
        { noteTone: "amber" },
      ),
    ],
  },
  {
    name: "3. Work arrives in bursts",
    blurb: "Move non-urgent work off the request path",
    sql: [
      "Client ──► Application ──► Database",
      "                 │",
      "                 └──► Queue ──► Worker",
      "Constraint: bursty, slow background work",
    ],
    table: {
      name: "New trade-off",
      cols: ["gain", "cost"],
      rows: [
        r(1, "Absorb bursts", "Results can be delayed"),
        r(2, "Protect request latency", "Backlog and retry handling"),
      ],
    },
    steps: [
      st(
        [1, 2, 3, 4],
        (row) => (row.key === 1 ? "added" : "kept"),
        "A queue decouples background work such as notifications or media processing. The request can finish sooner, while a worker processes the job later.",
        { noteTone: "violet" },
      ),
    ],
  },
];

export const STAGES_REGISTRY: Record<string, Stage[]> = {
  "ip-client-server": ipClientServer,
  "availability-anim": availabilityAnimation,
  "reliability-anim": reliabilityAnimation,
  "consistency-anim": consistencyAnimation,
  "cap-theorem-anim": capTheoremAnimation,
  "pacelc-theorem-anim": pacelcTheoremAnimation,
  "system-design-evolution": systemDesignEvolution,
};

export type AnyVariant = keyof typeof STAGES_REGISTRY;
