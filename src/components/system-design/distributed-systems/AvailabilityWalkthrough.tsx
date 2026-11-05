import { LessonWalkthrough } from "@/components/system-design/LessonWalkthrough";
import type { WalkthroughStep } from "@/components/system-design/walkthrough";

import { ArchScene, type ArchEdge, type ArchNode, type ArchSceneData } from "./ArchScene";

/*
 * The How stage of the Availability lesson, drawn with ArchScene. Three walkthroughs share one
 * frame: where a service has a single point of failure and how redundancy removes it, how a load
 * balancer notices a failed instance and fails over, and how a database replica takes over.
 */

type Step = WalkthroughStep & { scene: ArchSceneData };
type Mode = "spof" | "failover" | "database";

const stats = (
  a: string,
  b: string,
  c: string,
  labels: [string, string, string],
): Step["stats"] => [
  { label: labels[0], value: a, tone: "violet" },
  { label: labels[1], value: b, tone: "mint" },
  { label: labels[2], value: c, tone: "amber" },
];

const users: ArchNode = { id: "users", label: "Users", x: 16, y: 95, w: 110, h: 50 };
const lb: ArchNode = {
  id: "lb",
  label: "Load balancer",
  x: 180,
  y: 95,
  w: 150,
  h: 50,
  tone: "sky",
};
const appA: ArchNode = {
  id: "a",
  label: "App server A",
  sub: "Healthy",
  x: 410,
  y: 20,
  w: 170,
  h: 56,
  tone: "mint",
};
const appB: ArchNode = {
  id: "b",
  label: "App server B",
  sub: "Healthy",
  x: 410,
  y: 164,
  w: 170,
  h: 56,
  tone: "mint",
};
const single: ArchNode = {
  id: "app",
  label: "Application server",
  sub: "Healthy",
  x: 330,
  y: 80,
  w: 170,
  h: 80,
  tone: "mint",
};
const db: ArchNode = {
  id: "db",
  label: "Database",
  sub: "Healthy",
  x: 650,
  y: 95,
  w: 130,
  h: 50,
  tone: "violet",
};

const edge = (from: string, to: string, extra: Partial<ArchEdge> = {}): ArchEdge => ({
  from,
  to,
  ...extra,
});

/* ----------------------- single points of failure ------------------------- */

const SPOF_LABELS: [string, string, string] = ["servers up", "service", "single points"];

const SPOF_STEPS: Step[] = [
  {
    group: "One path",
    phase: "Two weak points",
    narration:
      "A SPOF is a component whose failure can make the entire service unavailable. In this architecture, both the application server and the database are possible single points of failure.",
    stats: stats("1", "up", "app, database", SPOF_LABELS),
    scene: {
      nodes: [users, { ...single, badge: "SPOF" }, { ...db, badge: "SPOF" }],
      edges: [edge("users", "app", { flow: true }), edge("app", "db", { flow: true })],
    },
  },
  {
    group: "One path",
    phase: "The server fails",
    narration:
      "If the only application server fails, users cannot reach the service. Failure here interrupts the entire service, even though the database is healthy.",
    stats: stats("0", "down", "app, database", SPOF_LABELS),
    scene: {
      nodes: [users, { ...single, state: "failed", sub: "Failed" }, db],
      edges: [edge("users", "app", { style: "off" }), edge("app", "db", { style: "off" })],
    },
  },
  {
    group: "Redundancy",
    phase: "Add a second server",
    narration:
      "Redundancy means having additional components that can provide the same essential function. Two servers behind a load balancer survive the loss of either one.",
    stats: stats("2", "up", "load balancer, database", SPOF_LABELS),
    scene: {
      nodes: [users, { ...lb, badge: "SPOF" }, appA, appB, { ...db, badge: "SPOF" }],
      edges: [
        edge("users", "lb", { flow: true }),
        edge("lb", "a", { flow: true }),
        edge("lb", "b", { flow: true }),
        edge("a", "db", { flow: true }),
        edge("b", "db", { flow: true }),
      ],
    },
  },
  {
    group: "Shared fate",
    phase: "A shared dependency fails",
    narration:
      "Redundant resources should not all depend on the same failure-prone component. Two healthy servers do not give end-to-end availability when both depend on one failed database. Two servers on one failed power supply are the same trap, called a common-mode failure.",
    stats: stats("2", "down", "database", SPOF_LABELS),
    scene: {
      nodes: [users, lb, appA, appB, { ...db, state: "failed", sub: "Failed", badge: "SPOF" }],
      edges: [
        edge("users", "lb"),
        edge("lb", "a"),
        edge("lb", "b"),
        edge("a", "db", { style: "off" }),
        edge("b", "db", { style: "off" }),
      ],
    },
  },
  {
    group: "Replicate",
    phase: "Replicate the database",
    narration:
      "Every layer now has a backup. The load-balancing tier and the failover control must also avoid single points of failure, or the weak point just moves.",
    stats: stats("2", "up", "load balancer tier", SPOF_LABELS),
    scene: {
      nodes: [
        users,
        { ...lb, badge: "make redundant" },
        appA,
        appB,
        {
          id: "p",
          label: "Primary database",
          sub: "Primary",
          x: 630,
          y: 20,
          w: 160,
          h: 56,
          tone: "violet",
        },
        {
          id: "r",
          label: "Standby replica",
          sub: "Standby",
          x: 630,
          y: 164,
          w: 160,
          h: 56,
          tone: "violet",
          state: "standby",
        },
      ],
      edges: [
        edge("users", "lb", { flow: true }),
        edge("lb", "a", { flow: true }),
        edge("lb", "b", { flow: true }),
        edge("a", "p", { flow: true }),
        edge("b", "p", { flow: true }),
        edge("p", "r", { style: "dashed", label: "replication" }),
      ],
    },
  },
];

/* --------------------------- health checks, failover ---------------------- */

const FAIL_LABELS: [string, string, string] = [
  "instances up",
  "load balancer sends to",
  "failed requests",
];

const failScene = (a: Partial<ArchNode>, edges: ArchEdge[]): ArchSceneData => ({
  nodes: [users, lb, { ...appA, ...a }, appB, { ...db, x: 660, y: 95 }],
  edges,
});

const FAILOVER_STEPS: Step[] = [
  {
    group: "Check",
    phase: "Health checks",
    narration:
      "The load balancer periodically asks each instance whether it can take traffic, for example with GET /health. A useful readiness check shows an instance can safely receive requests, not merely that its process is running.",
    stats: stats("2", "A and B", "none", FAIL_LABELS),
    scene: failScene({}, [
      edge("users", "lb", { flow: true }),
      edge("lb", "a", { flow: true, label: "GET /health" }),
      edge("lb", "b", { flow: true }),
      edge("a", "db"),
      edge("b", "db"),
    ]),
  },
  {
    group: "Detect",
    phase: "An instance fails",
    narration:
      "Instance A stops working. The load balancer has not noticed yet, so requests already on their way to A can fail and will need a retry.",
    stats: stats("1", "A and B", "some", FAIL_LABELS),
    scene: failScene({ state: "failed", sub: "Failed" }, [
      edge("users", "lb", { flow: true }),
      edge("lb", "a", { flow: true, bad: true }),
      edge("lb", "b", { flow: true }),
      edge("a", "db", { style: "off" }),
      edge("b", "db"),
    ]),
  },
  {
    group: "Detect",
    phase: "Mark it unhealthy",
    narration:
      "The monitoring or load-balancing system detects the failure and marks A unhealthy. Detection is not instant: it depends on how often and how many times the check runs.",
    stats: stats("1", "B", "some", FAIL_LABELS),
    scene: failScene({ state: "failed", sub: "Unhealthy" }, [
      edge("users", "lb", { flow: true }),
      edge("lb", "a", { style: "off", label: "marked unhealthy" }),
      edge("lb", "b", { flow: true }),
      edge("a", "db", { style: "off" }),
      edge("b", "db"),
    ]),
  },
  {
    group: "Switch",
    phase: "Route to healthy instances",
    narration:
      "New requests are directed only to healthy instances, so users stop seeing errors. Requests that were in flight to A may have failed and require retry.",
    stats: stats("1", "B", "none", FAIL_LABELS),
    scene: failScene({ state: "failed", sub: "Unhealthy" }, [
      edge("users", "lb", { flow: true }),
      edge("lb", "a", { style: "off" }),
      edge("lb", "b", { flow: true }),
      edge("a", "db", { style: "off" }),
      edge("b", "db", { flow: true }),
    ]),
  },
  {
    group: "Recover",
    phase: "Recovery restores capacity",
    narration:
      "Recovery automation restores or replaces the failed instance, and it rejoins once its health check passes. Failover is not always instantaneous: detection, switching, reconnection, and recovery take time.",
    stats: stats("2", "A and B", "none", FAIL_LABELS),
    scene: failScene({ state: "new", label: "App server A", sub: "Replaced" }, [
      edge("users", "lb", { flow: true }),
      edge("lb", "a", { flow: true, label: "GET /health" }),
      edge("lb", "b", { flow: true }),
      edge("a", "db", { flow: true }),
      edge("b", "db", { flow: true }),
    ]),
  },
];

/* -------------------------- database replication -------------------------- */

const DB_LABELS: [string, string, string] = ["service", "writes not copied", "primary"];
const appServers: ArchNode = {
  id: "app",
  label: "App servers",
  x: 200,
  y: 95,
  w: 150,
  h: 50,
  tone: "mint",
};
const primary: ArchNode = {
  id: "p",
  label: "Primary database",
  sub: "Primary",
  x: 520,
  y: 22,
  w: 190,
  h: 60,
  tone: "violet",
};
const replica: ArchNode = {
  id: "r",
  label: "Replica",
  sub: "Standby copy",
  x: 520,
  y: 158,
  w: 190,
  h: 60,
  tone: "violet",
};

const DATABASE_STEPS: Step[] = [
  {
    group: "Replicate",
    phase: "The primary handles writes",
    narration:
      "The primary handles writes. A replica maintains a copy of the data and may serve reads, depending on the design.",
    stats: stats("up", "0", "primary", DB_LABELS),
    scene: {
      nodes: [users, appServers, primary, replica],
      edges: [
        edge("users", "app", { flow: true }),
        edge("app", "p", { flow: true, label: "writes" }),
        edge("p", "r", { style: "dashed", label: "replication" }),
      ],
    },
  },
  {
    group: "Replicate",
    phase: "The replica can lag",
    narration:
      "With asynchronous replication the replica may be a little behind. With synchronous replication the primary waits for the replica, which is safer but slower. Here the last 2 writes have not been copied yet.",
    stats: stats("up", "2", "primary", DB_LABELS),
    scene: {
      nodes: [users, appServers, primary, { ...replica, sub: "2 writes behind" }],
      edges: [
        edge("users", "app", { flow: true }),
        edge("app", "p", { flow: true, label: "writes" }),
        edge("p", "r", { style: "dashed", label: "replication", flow: true }),
      ],
    },
  },
  {
    group: "Fail",
    phase: "The primary fails",
    narration:
      "Writes stop and the service is down. Could recent writes be lost? The 2 writes that were not copied are only on the failed primary.",
    stats: stats("down", "2 at risk", "none", DB_LABELS),
    scene: {
      nodes: [users, appServers, { ...primary, state: "failed", sub: "Failed" }, replica],
      edges: [
        edge("users", "app"),
        edge("app", "p", { style: "off" }),
        edge("p", "r", { style: "off" }),
      ],
    },
  },
  {
    group: "Promote",
    phase: "Promote the replica",
    narration:
      "An eligible replica may be promoted. The system must make sure the old primary cannot come back and also act as primary: two primaries at once would corrupt the data.",
    stats: stats("recovering", "2 at risk", "none yet", DB_LABELS),
    scene: {
      nodes: [
        users,
        appServers,
        { ...primary, state: "failed", sub: "Failed" },
        {
          ...replica,
          label: "Replica",
          state: "promoted",
          sub: "Promoted",
          badge: "one primary only",
        },
      ],
      edges: [
        edge("users", "app"),
        edge("app", "p", { style: "off" }),
        edge("app", "r", { style: "dashed" }),
      ],
    },
  },
  {
    group: "Promote",
    phase: "The application reconnects",
    narration:
      "The application reconnects to the new primary and the service is up again. The 2 uncopied writes are lost. How much loss is acceptable is the recovery point objective, covered in the trade-offs.",
    stats: stats("up", "2 lost", "the former replica", DB_LABELS),
    scene: {
      nodes: [
        users,
        appServers,
        { ...primary, state: "failed", sub: "Failed" },
        { ...replica, label: "New primary", state: "promoted", sub: "Primary" },
      ],
      edges: [
        edge("users", "app", { flow: true }),
        edge("app", "p", { style: "off" }),
        edge("app", "r", { flow: true, label: "writes" }),
      ],
    },
  },
];

const CONFIG: Record<
  Mode,
  { steps: Step[]; groups: string[]; file: string; label: string; aria: string }
> = {
  spof: {
    steps: SPOF_STEPS,
    groups: ["One path", "Redundancy", "Shared fate", "Replicate"],
    file: "remove_spof.board",
    label: "Find the weak point, then back it up",
    aria: "Walkthrough: a service with one application server and one database, then redundancy added and a shared database failure",
  },
  failover: {
    steps: FAILOVER_STEPS,
    groups: ["Check", "Detect", "Switch", "Recover"],
    file: "health_checks.board",
    label: "A load balancer fails over",
    aria: "Walkthrough: a load balancer health-checks two servers, detects a failure, routes around it and recovers",
  },
  database: {
    steps: DATABASE_STEPS,
    groups: ["Replicate", "Fail", "Promote"],
    file: "db_failover.board",
    label: "A replica takes over",
    aria: "Walkthrough: a primary database replicates to a replica, fails, and the replica is promoted",
  },
};

export function AvailabilityWalkthrough({ mode }: { mode: Mode }) {
  const c = CONFIG[mode];
  return (
    <LessonWalkthrough
      ariaLabel={c.aria}
      fileName={c.file}
      label={c.label}
      groups={c.groups}
      steps={c.steps}
      stageClassName="h-[15.5rem]"
      renderStage={(step) => (
        <div className="h-full w-full max-w-[860px] py-1">
          <ArchScene scene={step.scene} ariaLabel={step.phase} />
        </div>
      )}
    />
  );
}
