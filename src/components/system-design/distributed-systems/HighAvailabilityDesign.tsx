import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ArchScene, type ArchEdge, type ArchNode } from "./ArchScene";

/*
 * The e-commerce design from the lesson, with failures the learner can inject. The service is up
 * while a load balancer, at least one application server and a database (the primary, or the
 * replica once promoted) are all working. A single-zone deployment loses everything to one zone
 * outage, which is why multi-zone helps but is no guarantee on its own.
 */

type Part = "lb" | "a" | "b" | "p" | "r";
const NAMES: Record<Part, string> = {
  lb: "load balancer",
  a: "server A",
  b: "server B",
  p: "primary database",
  r: "replica",
};
const ORDER: Part[] = ["lb", "a", "b", "p", "r"];

export function HighAvailabilityDesign() {
  const [failed, setFailed] = useState<Set<Part>>(new Set());
  const [multiZone, setMultiZone] = useState(true);

  const toggle = (p: Part) =>
    setFailed((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  const zoneOutage = () =>
    setFailed(new Set<Part>(multiZone ? ["a", "p"] : ["lb", "a", "b", "p", "r"]));

  const lbUp = !failed.has("lb");
  const appsUp = (["a", "b"] as const).filter((p) => !failed.has(p)).length;
  const primaryUp = !failed.has("p");
  const replicaUp = !failed.has("r");
  const promoted = !primaryUp && replicaUp;
  const dbUp = primaryUp || replicaUp;
  const up = lbUp && appsUp > 0 && dbUp;
  const degraded = up && failed.size > 0;
  const status = !up ? "Down" : degraded ? "Up, no spare redundancy" : "Up";

  const reason = !up
    ? !lbUp
      ? "The only load balancer failed, so nothing can reach the healthy servers."
      : appsUp === 0
        ? "Both application servers failed."
        : "The primary and the replica both failed, so there is no database to serve requests."
    : promoted
      ? "The primary failed and the replica was promoted after the failure was detected."
      : failed.size
        ? "The service still works, but one more failure in the same layer would take it down."
        : "Every layer has a backup except the load balancer in this simplified design.";

  const node = (
    id: Part,
    base: Omit<ArchNode, "state" | "sub">,
    healthy: string,
    live?: string,
  ): ArchNode => ({
    ...base,
    state: failed.has(id) ? "failed" : live ? "promoted" : "ok",
    sub: failed.has(id) ? "Failed" : (live ?? healthy),
  });

  const nodes: ArchNode[] = [
    { id: "users", label: "Users", x: 16, y: 95, w: 110, h: 50 },
    node(
      "lb",
      { id: "lb", label: "Load balancer", x: 180, y: 95, w: 150, h: 50, tone: "sky" },
      "Healthy",
    ),
    node(
      "a",
      { id: "a", label: "App server A", x: 410, y: 20, w: 170, h: 56, tone: "mint" },
      "Healthy",
    ),
    node(
      "b",
      { id: "b", label: "App server B", x: 410, y: 164, w: 170, h: 56, tone: "mint" },
      "Healthy",
    ),
    node(
      "p",
      { id: "p", label: "Primary database", x: 630, y: 20, w: 160, h: 56, tone: "violet" },
      "Primary",
    ),
    failed.has("r")
      ? node("r", { id: "r", label: "Standby replica", x: 630, y: 164, w: 160, h: 56 }, "")
      : promoted
        ? node(
            "r",
            { id: "r", label: "New primary", x: 630, y: 164, w: 160, h: 56, tone: "violet" },
            "",
            "Promoted",
          )
        : {
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
  ];

  const flow = up;
  const edges: ArchEdge[] = [
    { from: "users", to: "lb", style: lbUp ? "solid" : "off", flow: flow && lbUp },
    {
      from: "lb",
      to: "a",
      style: !lbUp || failed.has("a") ? "off" : "solid",
      flow: flow && lbUp && !failed.has("a"),
    },
    {
      from: "lb",
      to: "b",
      style: !lbUp || failed.has("b") ? "off" : "solid",
      flow: flow && lbUp && !failed.has("b"),
    },
    {
      from: "a",
      to: "p",
      style: failed.has("a") || !primaryUp ? "off" : "solid",
      flow: flow && !failed.has("a") && primaryUp,
    },
    {
      from: "b",
      to: "p",
      style: failed.has("b") || !primaryUp ? "off" : "solid",
      flow: flow && !failed.has("b") && primaryUp,
    },
    {
      from: "p",
      to: "r",
      style: primaryUp && replicaUp ? "dashed" : "off",
      label: primaryUp && replicaUp ? "replication" : undefined,
    },
  ];
  if (promoted) {
    edges.push(
      {
        from: "a",
        to: "r",
        style: failed.has("a") ? "off" : "solid",
        flow: flow && !failed.has("a"),
      },
      {
        from: "b",
        to: "r",
        style: failed.has("b") ? "off" : "solid",
        flow: flow && !failed.has("b"),
      },
    );
  }

  return (
    <section
      aria-label="A highly available design with a load balancer, two application servers, a primary database and a standby replica. Break components or a whole zone to see whether the service stays up."
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Break something
        </p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 px-2 text-xs"
          disabled={failed.size === 0}
          onClick={() => setFailed(new Set())}
        >
          <RotateCcw className="size-3.5" /> Reset
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pt-3 sm:px-5">
        {ORDER.map((p) => (
          <Button
            key={p}
            type="button"
            size="sm"
            variant={failed.has(p) ? "default" : "outline"}
            aria-pressed={failed.has(p)}
            className="h-7 px-2.5 text-xs"
            onClick={() => toggle(p)}
          >
            {failed.has(p) ? "Restore" : "Fail"} {NAMES[p]}
          </Button>
        ))}
      </div>

      <div className="h-[15rem] px-3 pt-2 sm:px-5">
        <ArchScene scene={{ nodes, edges }} ariaLabel={`Service status: ${status}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-2 pt-1 sm:px-5">
        <span
          className={cn(
            "rounded-md border px-2 py-1 font-mono text-[12px] font-semibold",
            !up
              ? "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : degraded
                ? "border-amber/50 bg-amber/10 text-amber-600 dark:text-amber-400"
                : "border-mint/50 bg-mint/10 text-mint",
          )}
        >
          Service: {status}
        </span>
        <Chip label="App servers up" value={`${appsUp} of 2`} />
        <Chip
          label="Database serving"
          value={primaryUp ? "primary" : replicaUp ? "promoted replica" : "none"}
        />
      </div>
      <p className="px-4 pb-3 text-center text-sm text-foreground/90 sm:px-5">{reason}</p>

      <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 sm:px-5">
        <span className="text-xs text-muted-foreground">Deployment</span>
        <div role="group" aria-label="Deployment zones" className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={!multiZone ? "default" : "outline"}
            aria-pressed={!multiZone}
            className="h-7 px-2.5 text-xs"
            onClick={() => {
              setMultiZone(false);
              setFailed(new Set());
            }}
          >
            One zone
          </Button>
          <Button
            type="button"
            size="sm"
            variant={multiZone ? "default" : "outline"}
            aria-pressed={multiZone}
            className="h-7 px-2.5 text-xs"
            onClick={() => {
              setMultiZone(true);
              setFailed(new Set());
            }}
          >
            Two zones
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          onClick={zoneOutage}
        >
          Zone 1 outage
        </Button>
        <span className="text-xs text-muted-foreground">
          {multiZone
            ? "Zone 1 holds server A and the primary. Zone 2 holds server B and the replica."
            : "Everything runs in zone 1."}
        </span>
      </div>
    </section>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <strong className="text-[12px] text-foreground">{value}</strong>
    </span>
  );
}
