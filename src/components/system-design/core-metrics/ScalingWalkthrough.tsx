import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { LessonWalkthrough } from "@/components/system-design/LessonWalkthrough";
import type { WalkthroughStep } from "@/components/system-design/walkthrough";
import { WhiteboardDefs } from "@/components/system-design/whiteboard";
import { cn } from "@/lib/utils";

/*
 * The How stage: scaling up one server (vertical) and scaling out behind a load balancer
 * (horizontal), drawn in the hand-drawn whiteboard style. One lesson section per mode; both share
 * the frame and the scene. The numbers are illustrative: a server that sustains 1,000 RPS, and a
 * shared database that saturates at 3,500 RPS.
 */

type VerticalScene = {
  kind: "vertical";
  large: boolean;
  /** CPU load as a percentage, drawn as a bar. */
  load: number;
  loadLabel: string;
  check?: string;
};

type HorizontalScene = {
  kind: "horizontal";
  servers: number;
  lb: boolean;
  flow: boolean;
  /** The last server was just added. */
  added?: boolean;
  dbHot: boolean;
};

type Step = WalkthroughStep & { scene: VerticalScene | HorizontalScene };

const stats = (servers: string, capacity: string, weak: string): Step["stats"] => [
  { label: "servers", value: servers, tone: "violet" },
  { label: "capacity", value: capacity, tone: "mint" },
  { label: "weak spot", value: weak, tone: "amber" },
];

const VERTICAL_STEPS: Step[] = [
  {
    group: "Find the limit",
    phase: "Identify the limiting resource",
    narration:
      "One server handles all the traffic and its CPU is saturated at 1,000 RPS. Before buying anything, find which resource is the limit.",
    stats: stats("1", "1,000 RPS", "CPU"),
    scene: { kind: "vertical", large: false, load: 100, loadLabel: "CPU 100%" },
  },
  {
    group: "Upgrade",
    phase: "Upgrade the server",
    narration:
      "Replace it with a larger machine: more CPU cores and more RAM. Same traffic, same single server, more room.",
    stats: stats("1", "·", "·"),
    scene: { kind: "vertical", large: true, load: 50, loadLabel: "CPU 50%" },
  },
  {
    group: "Upgrade",
    phase: "Check the application can use it",
    narration:
      "Extra cores only help if the application can use them. A process that runs on one core would leave the new ones idle.",
    stats: stats("1", "·", "·"),
    scene: {
      kind: "vertical",
      large: true,
      load: 50,
      loadLabel: "CPU 50%",
      check: "Uses all 8 cores",
    },
  },
  {
    group: "Measure",
    phase: "Measure again",
    narration:
      "Load test the new machine. It sustains 1,800 RPS, not double: other limits appear. It is also still one machine, so a failure still takes the service down.",
    stats: stats("1", "1,800 RPS", "One machine"),
    scene: { kind: "vertical", large: true, load: 90, loadLabel: "CPU 90%" },
  },
];

const HORIZONTAL_STEPS: Step[] = [
  {
    group: "Deploy",
    phase: "Deploy several instances",
    narration:
      "Run three equivalent application instances. Each sustains 1,000 RPS, but nothing yet decides which one gets a request.",
    stats: stats("3", "·", "·"),
    scene: { kind: "horizontal", servers: 3, lb: false, flow: false, dbHot: false },
  },
  {
    group: "Balance",
    phase: "Place a load balancer in front",
    narration:
      "The load balancer becomes the single entry point. Users talk to it, and it talks to the instances.",
    stats: stats("3", "·", "·"),
    scene: { kind: "horizontal", servers: 3, lb: true, flow: false, dbHot: false },
  },
  {
    group: "Balance",
    phase: "Distribute requests",
    narration:
      "Requests are spread across the healthy instances. With even distribution and no other limit, three servers can take about 3,000 RPS.",
    stats: stats("3", "3,000 RPS", "·"),
    scene: { kind: "horizontal", servers: 3, lb: true, flow: true, dbHot: false },
  },
  {
    group: "Adjust",
    phase: "Add an instance as demand grows",
    narration:
      "Add or remove instances as demand changes. A fourth server raises the application capacity to 4,000 RPS.",
    stats: stats("4", "4,000 RPS", "·"),
    scene: { kind: "horizontal", servers: 4, lb: true, flow: true, added: true, dbHot: false },
  },
  {
    group: "Monitor",
    phase: "Monitor the whole system",
    narration:
      "Total capacity depends on the entire system. Four servers could take 4,000 RPS, but the shared database saturates at 3,500 RPS and caps everything there.",
    stats: stats("4", "3,500 RPS", "Database"),
    scene: { kind: "horizontal", servers: 4, lb: true, flow: true, dbHot: true },
  },
];

const VERTICAL_GROUPS = ["Find the limit", "Upgrade", "Measure"] as const;
const HORIZONTAL_GROUPS = ["Deploy", "Balance", "Adjust", "Monitor"] as const;

export function ScalingWalkthrough({ mode }: { mode: "vertical" | "horizontal" }) {
  const vertical = mode === "vertical";
  return (
    <LessonWalkthrough
      ariaLabel={
        vertical
          ? "Scaling one server up: find the limiting resource, upgrade the machine, check the application uses it, and measure again"
          : "Scaling out: deploy several instances, put a load balancer in front, distribute requests, add instances and watch the shared database"
      }
      fileName={vertical ? "scale_up.board" : "scale_out.board"}
      label={vertical ? "Make one machine bigger" : "Add more machines"}
      groups={vertical ? VERTICAL_GROUPS : HORIZONTAL_GROUPS}
      steps={vertical ? VERTICAL_STEPS : HORIZONTAL_STEPS}
      stageClassName="h-[15.5rem]"
      renderStage={(step) => (
        <div className="h-full w-full max-w-[860px] py-1">
          <ScalingScene scene={step.scene} />
        </div>
      )}
    />
  );
}

/* ---------------------------------- Scene --------------------------------- */

const USERS_X = 46;
const MID = 120;
const DB = { x: 650, y: 76, w: 100, h: 88 };
const SERVER_X = 400;
const SERVER_W = 150;
const SERVER_H = 46;
const serverY = (i: number) => 8 + i * 58;

function ScalingScene({ scene }: { scene: Step["scene"] }) {
  const uid = useId().replace(/:/g, "");
  const reduced = !!useReducedMotion();

  const dot = (key: string, from: [number, number], to: [number, number], delay: number) =>
    reduced ? (
      <circle
        key={key}
        cx={(from[0] + to[0]) / 2}
        cy={(from[1] + to[1]) / 2}
        r={4.5}
        className="fill-mint"
      />
    ) : (
      <motion.circle
        key={key}
        r={4.5}
        className="fill-mint"
        initial={{ cx: from[0], cy: from[1] }}
        animate={{ cx: [from[0], to[0]], cy: [from[1], to[1]] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "linear", delay }}
      />
    );

  const arrow = (key: string, from: [number, number], to: [number, number], on: boolean) => (
    <path
      key={key}
      d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`}
      strokeWidth={on ? 2.4 : 2}
      fill="none"
      strokeLinecap="round"
      className={on ? "stroke-mint/80" : "stroke-muted-foreground/50"}
      markerEnd={`url(#${uid}-arrow)`}
    />
  );

  return (
    <svg
      viewBox="0 0 800 240"
      role="img"
      aria-label={
        scene.kind === "vertical"
          ? "One application server in front of a database, shown before and after an upgrade"
          : `${scene.servers} application servers ${scene.lb ? "behind a load balancer " : ""}in front of a shared database`
      }
      className="h-full w-full"
    >
      <WhiteboardDefs uid={uid} />

      {/* users */}
      <g className="stroke-foreground" fill="none" strokeWidth={2} strokeLinecap="round">
        <circle cx={USERS_X} cy={MID - 18} r={11} />
        <path
          d={`M${USERS_X - 22} ${MID + 14} Q${USERS_X} ${MID - 14} ${USERS_X + 22} ${MID + 14}`}
        />
      </g>
      <text
        x={USERS_X}
        y={MID + 40}
        textAnchor="middle"
        className="fill-foreground font-mono text-[11px] font-semibold"
      >
        Users
      </text>

      {/* database */}
      <g>
        <rect
          x={DB.x}
          y={DB.y}
          width={DB.w}
          height={DB.h}
          rx={14}
          strokeWidth={2.2}
          filter={`url(#${uid}-rough)`}
          className={cn(
            "transition-colors",
            scene.kind === "horizontal" && scene.dbHot
              ? "fill-amber/15 stroke-amber"
              : "fill-background stroke-violet",
          )}
        />
        <text
          x={DB.x + DB.w / 2}
          y={DB.y + 38}
          textAnchor="middle"
          className="fill-foreground text-[14px] font-semibold"
        >
          Database
        </text>
        <text
          x={DB.x + DB.w / 2}
          y={DB.y + 58}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[10.5px]"
        >
          {scene.kind === "horizontal" && scene.dbHot ? "caps at 3,500 RPS" : "shared"}
        </text>
      </g>

      {scene.kind === "vertical" ? (
        <VerticalServer scene={scene} uid={uid} arrow={arrow} dot={dot} />
      ) : (
        <HorizontalFleet scene={scene} uid={uid} arrow={arrow} dot={dot} />
      )}
    </svg>
  );
}

type Helpers = {
  uid: string;
  arrow: (key: string, from: [number, number], to: [number, number], on: boolean) => ReactNode;
  dot: (key: string, from: [number, number], to: [number, number], delay: number) => ReactNode;
};

function VerticalServer({ scene, uid, arrow, dot }: { scene: VerticalScene } & Helpers) {
  const x = 380;
  const w = 210;
  const h = scene.large ? 176 : 124;
  const y = MID - h / 2;
  const hot = scene.load >= 100;
  const barW = w - 40;

  return (
    <g>
      {arrow("in", [USERS_X + 36, MID], [x - 4, MID], true)}
      {arrow("out", [x + w + 4, MID], [DB.x - 4, MID], true)}
      {dot("d1", [USERS_X + 36, MID], [x - 8, MID], 0)}
      {dot("d2", [USERS_X + 36, MID], [x - 8, MID], 0.65)}

      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        strokeWidth={2.4}
        filter={`url(#${uid}-rough)`}
        className={cn(
          "transition-all duration-500",
          hot ? "fill-amber/10 stroke-amber" : "fill-mint/10 stroke-mint",
        )}
      />
      <text
        x={x + w / 2}
        y={y + 28}
        textAnchor="middle"
        className="fill-foreground text-[14px] font-semibold"
      >
        Application server
      </text>
      <text
        x={x + w / 2}
        y={y + 48}
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[11px]"
      >
        {scene.large ? "8 vCPU, 32 GB RAM" : "4 vCPU, 16 GB RAM"}
      </text>

      <rect x={x + 20} y={y + 64} width={barW} height={12} rx={6} className="fill-surface-2" />
      <rect
        x={x + 20}
        y={y + 64}
        width={(barW * scene.load) / 100}
        height={12}
        rx={6}
        className={cn("transition-all duration-500", hot ? "fill-amber" : "fill-mint")}
      />
      <text
        x={x + w / 2}
        y={y + 94}
        textAnchor="middle"
        className="fill-foreground font-mono text-[11px] font-semibold"
      >
        {scene.loadLabel}
      </text>
      {scene.check ? (
        <text
          x={x + w / 2}
          y={y + 120}
          textAnchor="middle"
          className="fill-mint font-mono text-[11.5px] font-semibold"
        >
          {"✓"} {scene.check}
        </text>
      ) : null}
      {scene.large ? (
        <text
          x={x + w / 2}
          y={y + h - 14}
          textAnchor="middle"
          className="fill-muted-foreground text-[10.5px]"
        >
          Still one machine
        </text>
      ) : null}
    </g>
  );
}

function HorizontalFleet({ scene, uid, arrow, dot }: { scene: HorizontalScene } & Helpers) {
  const LB = { x: 190, y: MID - 30, w: 120, h: 60 };
  const entry: [number, number] = scene.lb ? [LB.x - 4, MID] : [SERVER_X - 4, MID];

  return (
    <g>
      {scene.lb ? (
        <>
          {arrow("users-lb", [USERS_X + 36, MID], entry, scene.flow)}
          {scene.flow ? dot("u-lb", [USERS_X + 36, MID], [LB.x - 6, MID], 0) : null}
          <rect
            x={LB.x}
            y={LB.y}
            width={LB.w}
            height={LB.h}
            rx={12}
            strokeWidth={2.2}
            filter={`url(#${uid}-rough)`}
            className="fill-sky-500/10 stroke-sky-500"
          />
          <text
            x={LB.x + LB.w / 2}
            y={LB.y + 26}
            textAnchor="middle"
            className="fill-foreground text-[13px] font-semibold"
          >
            Load
          </text>
          <text
            x={LB.x + LB.w / 2}
            y={LB.y + 43}
            textAnchor="middle"
            className="fill-foreground text-[13px] font-semibold"
          >
            balancer
          </text>
        </>
      ) : (
        <text
          x={200}
          y={MID + 14}
          textAnchor="middle"
          className="fill-muted-foreground text-[34px] font-semibold"
        >
          ?
        </text>
      )}

      {Array.from({ length: scene.servers }, (_, i) => {
        const y = serverY(i);
        const fresh = scene.added && i === scene.servers - 1;
        const cy = y + SERVER_H / 2;
        return (
          <g key={i}>
            {scene.lb
              ? arrow(`lb-${i}`, [LB.x + LB.w + 4, MID], [SERVER_X - 4, cy], scene.flow)
              : null}
            {scene.lb && scene.flow
              ? dot(`d-${i}`, [LB.x + LB.w + 6, MID], [SERVER_X - 8, cy], i * 0.3)
              : null}
            {arrow(`db-${i}`, [SERVER_X + SERVER_W + 4, cy], [DB.x - 4, DB.y + DB.h / 2], false)}
            <rect
              x={SERVER_X}
              y={y}
              width={SERVER_W}
              height={SERVER_H}
              rx={12}
              strokeWidth={2.2}
              filter={`url(#${uid}-rough)`}
              className={cn("stroke-mint", fresh ? "fill-mint/25" : "fill-mint/10")}
            />
            <text
              x={SERVER_X + SERVER_W / 2}
              y={y + 20}
              textAnchor="middle"
              className="fill-foreground text-[13px] font-semibold"
            >
              Server {i + 1}
              {fresh ? " (new)" : ""}
            </text>
            <text
              x={SERVER_X + SERVER_W / 2}
              y={y + 36}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[10.5px]"
            >
              1,000 RPS
            </text>
          </g>
        );
      })}
    </g>
  );
}
