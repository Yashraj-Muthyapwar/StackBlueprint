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
      rows: [
        r(1, "Application", "GET /"),
      ],
    },
    steps: [
      st([1, 2, 4], "kept", "Your browser generates an application-level request asking for the webpage.", { noteTone: "violet" }),
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
      st([3, 4], (row) => (row.key === 1 || row.key === 2 ? "added" : "kept"), "The OS wraps the payload in an IP packet, adding the source and destination IP addresses so routers know where to send it.", { noteTone: "mint" }),
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
      st([3, 4], (row) => (row.key === 1 || row.key === 2 ? "added" : "kept"), "The server processes the request and sends a response. The Source and Destination IPs are swapped to route it back to you.", { noteTone: "amber" }),
    ],
  }
];

export const STAGES_REGISTRY: Record<string, Stage[]> = {
  "ip-client-server": ipClientServer,
};

export type AnyVariant = keyof typeof STAGES_REGISTRY;
