import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ArchScene, type ArchSceneData } from "./ArchScene";

/*
 * Active-active against active-passive. Failing server A shows the difference: in active-active
 * the survivor is already serving and only needs spare capacity, while in active-passive the
 * standby must first detect the failure and take over.
 */

type Mode = "active-active" | "active-passive";
const FAILOVER_MS = 1600;

export function ActiveModes() {
  const [mode, setMode] = useState<Mode>("active-active");
  const [failed, setFailed] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!(failed && mode === "active-passive")) return;
    setSwitching(true);
    const t = window.setTimeout(() => setSwitching(false), FAILOVER_MS);
    return () => window.clearTimeout(t);
  }, [failed, mode]);

  const choose = (m: Mode) => {
    setMode(m);
    setFailed(false);
    setSwitching(false);
  };

  const active = mode === "active-active";
  const scene: ArchSceneData = {
    nodes: [
      { id: "t", label: "Traffic", x: 320, y: 8, w: 160, h: 46 },
      {
        id: "a",
        label: "Server A",
        x: 110,
        y: 150,
        w: 240,
        h: 66,
        tone: "mint",
        state: failed ? "failed" : "ok",
        sub: failed ? "Failed" : "Active",
      },
      active
        ? {
            id: "b",
            label: "Server B",
            x: 450,
            y: 150,
            w: 240,
            h: 66,
            tone: "mint",
            sub: failed ? "Active, carries all traffic" : "Active",
          }
        : {
            id: "b",
            label: "Server B",
            x: 450,
            y: 150,
            w: 240,
            h: 66,
            tone: "mint",
            state: !failed ? "standby" : switching ? "standby" : "promoted",
            sub: !failed ? "Standby" : switching ? "Taking over..." : "Active",
          },
    ],
    edges: [
      failed ? { from: "t", to: "a", style: "off" } : { from: "t", to: "a", flow: true },
      active
        ? { from: "t", to: "b", flow: true }
        : !failed || switching
          ? { from: "t", to: "b", style: "dashed" }
          : { from: "t", to: "b", flow: true },
    ],
  };

  const note = !failed
    ? active
      ? "Both instances serve requests during normal operation."
      : "One instance serves requests. The dashed line is the standby failover path, not normal traffic."
    : active
      ? "Traffic shifts to the survivor straight away, provided it has enough spare capacity for all of it."
      : switching
        ? "The failure must be detected and the standby switched in. Requests fail or wait until then."
        : "The standby has taken over. Failover is done, but it was not instantaneous.";

  return (
    <section
      aria-label="Active-active and active-passive architectures: fail server A to see how each recovers"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <div role="group" aria-label="Architecture" className="flex gap-1.5">
          {(["active-active", "active-passive"] as const).map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={mode === m ? "default" : "outline"}
              aria-pressed={mode === m}
              className="h-7 px-2.5 text-xs capitalize"
              onClick={() => choose(m)}
            >
              {m.replace("-", "-")}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant={failed ? "outline" : "default"}
          className="h-7 px-2.5 text-xs"
          onClick={() => setFailed((f) => !f)}
        >
          {failed ? "Bring server A back" : "Fail server A"}
        </Button>
      </div>

      <div className="h-[15rem] px-3 pt-2 sm:px-5">
        <ArchScene
          scene={scene}
          ariaLabel={`${mode} architecture${failed ? " with server A failed" : ""}`}
        />
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-2 pt-1 sm:px-5">
        <Chip
          label="Normal traffic"
          value={active ? "Multiple active instances" : "Primary handles traffic"}
        />
        <Chip
          label="Main challenge"
          value={active ? "Coordination and spare capacity" : "Failover detection and switching"}
        />
      </div>
      <p
        className={cn(
          "px-4 pb-4 text-center text-sm sm:px-5",
          switching ? "text-amber-600 dark:text-amber-400" : "text-foreground/90",
        )}
      >
        {note}
      </p>
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
