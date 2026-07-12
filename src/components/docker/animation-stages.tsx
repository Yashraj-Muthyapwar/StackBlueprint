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

const vmVsContainer: Stage[] = [
  {
    name: "1. The VM stack",
    blurb: "Every app gets a full guest operating system",
    sql: [
      "Infrastructure",
      "  └─ Host OS",
      "      └─ Hypervisor",
      "          └─ Guest OS  (Heavy: ~20 GB, minutes to boot)",
      "              └─ App",
    ],
    table: {
      name: "Virtual Machine",
      cols: ["layer", "size", "boot"],
      rows: [
        r(1, "Guest OS", "~20 GB", "Minutes"),
        r(2, "Hypervisor", "Overhead", "N/A"),
        r(3, "App", "Small", "After OS boot"),
      ],
    },
    steps: [
      st([0, 1, 2, 3, 4], "kept",
        "A VM virtualizes hardware. Each one boots its own kernel and ships a full OS. Powerful isolation, but you pay in disk, RAM, and boot time.",
        { side: sidePanel("VM cost", ["• Full guest OS per app", "• GB-sized images", "• Minutes to boot", "• Strong isolation"], "rose", HardDrive) }),
    ],
  },
  {
    name: "2. The container stack",
    blurb: "Apps share the host kernel through the Docker Engine",
    sql: [
      "Infrastructure",
      "  └─ Host OS (shared kernel)",
      "      └─ Docker Engine",
      "          └─ Container  (Light: MBs, seconds to start)",
      "              └─ App + Libs",
    ],
    table: {
      name: "Docker Container",
      cols: ["layer", "size", "boot"],
      rows: [
        r(1, "App + Libs", "MBs", "Seconds"),
        r(2, "Docker Engine", "Thin layer", "Instant"),
        r(3, "Host Kernel", "Shared", "Already running"),
      ],
    },
    steps: [
      st([0, 1, 2, 3, 4], "kept",
        "Containers skip the guest OS entirely. They share the host kernel and start as a process. Same portability, fraction of the weight.",
        { side: sidePanel("Container win", ["• No guest OS", "• MB-sized images", "• Seconds to start", "• Near-native speed"], "mint", Container) }),
    ],
  },
  {
    name: "3. Shared kernel proof",
    blurb: "Same kernel version on host and inside the container",
    sql: [
      "# Host",
      "uname -r",
      "# → 5.15.0-76-generic",
      "",
      "# Container",
      "docker run --rm alpine uname -r",
      "# → 5.15.0-76-generic  (identical!)",
    ],
    table: {
      name: "Kernel check",
      cols: ["where", "command", "result"],
      rows: [
        r(1, "Host", "uname -r", "5.15.0-76-generic"),
        r(2, "Container", "uname -r", "5.15.0-76-generic"),
      ],
    },
    steps: [
      st([0, 1, 2], "kept",
        "Run uname -r on the host and inside any container. The version matches because the container borrows the host kernel.",
        { noteTone: "mint", highlightCols: [2] }),
      st([4, 5, 6], "kept",
        "The container feels like its own machine (own filesystem, own IP, own PID 1) but it is a process with a mask, not a separate computer.",
        { noteTone: "violet" }),
    ],
  },
];

const clientServer: Stage[] = [
  {
    name: "1. You type a command",
    blurb: "The CLI is just a messenger",
    sql: [
      "$ docker run -d -p 8080:80 nginx",
      "",
      "Client (docker CLI)",
      "  → packages this as a REST API request",
    ],
    table: {
      name: "Docker Client",
      cols: ["component", "role"],
      rows: [
        r(1, "docker CLI", "Remote control for humans"),
        r(2, "docker compose", "Multi-container remote control"),
      ],
    },
    steps: [
      st([0, 2, 3], "kept",
        "Every docker command you type is translated into an HTTP request. The CLI never touches containers directly.",
        { side: sidePanel("Remember", ["• CLI = client", "• Sends REST API calls", "• Works even over TCP"], "mint", Server) }),
    ],
  },
  {
    name: "2. The daemon responds",
    blurb: "dockerd does the heavy lifting",
    sql: [
      "REST API  →  dockerd (daemon)",
      "",
      "dockerd:",
      "  • Pulls / builds images",
      "  • Creates & starts containers",
      "  • Manages networks & volumes",
    ],
    table: {
      name: "Docker Daemon",
      cols: ["object", "managed by"],
      rows: [
        r(1, "Images", "dockerd"),
        r(2, "Containers", "dockerd"),
        r(3, "Volumes", "dockerd"),
        r(4, "Networks", "dockerd"),
      ],
    },
    steps: [
      st([0, 2, 3, 4, 5], "kept",
        "The daemon is a persistent background process. It owns every Docker object on the machine and executes whatever the client requests.",
        { noteTone: "violet", highlightCols: [1] }),
    ],
  },
  {
    name: "3. Engine must be running",
    blurb: "No daemon = no server info",
    sql: [
      "$ docker version",
      "",
      "Engine OFF:",
      "  Client: 24.0.x  ✓",
      "  Server: FAILED  ✗",
      "",
      "Engine ON:",
      "  Client: 24.0.x  ✓",
      "  Server: 24.0.y  ✓",
    ],
    table: {
      name: "docker version",
      cols: ["state", "client", "server"],
      rows: [
        r(1, "Engine stopped", "OK", "FAILED"),
        r(2, "Engine running", "OK", "OK"),
      ],
    },
    steps: [
      st([3, 4, 5], (row) => (row.key === 1 ? "dropped" : "kept"),
        "If the daemon is not running, the client cannot connect. You will see: Cannot connect to the Docker daemon.",
        { noteTone: "rose", highlightCols: [2] }),
      st([7, 8, 9], "kept",
        "Start Docker Desktop or run systemctl start docker. Once the engine is up, every command works.",
        { noteTone: "mint", highlightCols: [2] }),
    ],
  },
];

export const STAGES_REGISTRY: Record<string, Stage[]> = {
  "docker-vm-vs-container": vmVsContainer,
  "docker-client-server": clientServer,
};

export type AnyVariant = keyof typeof STAGES_REGISTRY;
