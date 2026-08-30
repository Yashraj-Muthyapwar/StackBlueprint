import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Download, Loader2 } from "lucide-react";

import type { DatasetDef } from "./db/datasets";
import { buildDatasetBundle } from "./export/bundle";
import { DIALECTS, type DialectId } from "./export/dialects";
import { saveBlob } from "./export/zip";

type Phase =
  | { kind: "idle" }
  | { kind: "working"; dialect: DialectId; fraction: number; label: string }
  | { kind: "done"; label: string }
  | { kind: "failed"; message: string };

/**
 * Export one dataset as a zip that will load into a local database.
 *
 * Everything is built in the browser: the CSVs come from the same files the lab
 * loads, and the DDL is generated per dialect, so no server round trip and no
 * copy of the data has to exist anywhere else.
 */
export function DatasetDownload({ dataset }: { dataset: DatasetDef }) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const rootRef = useRef<HTMLDivElement>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = async (dialect: DialectId) => {
    setPhase({ kind: "working", dialect, fraction: 0, label: "starting" });
    try {
      const result = await buildDatasetBundle(dataset.id, dialect, (p) => {
        if (alive.current) {
          setPhase({ kind: "working", dialect, fraction: p.fraction, label: p.label });
        }
      });
      saveBlob(result.blob, result.filename);
      if (!alive.current) return;
      setPhase({
        kind: "done",
        label: `${result.tables} tables · ${result.rows.toLocaleString()} rows`,
      });
      setOpen(false);
      setTimeout(() => alive.current && setPhase({ kind: "idle" }), 4000);
    } catch (e) {
      if (!alive.current) return;
      setPhase({ kind: "failed", message: e instanceof Error ? e.message : String(e) });
    }
  };

  const working = phase.kind === "working";

  return (
    <div className="sqlx-dl" ref={rootRef}>
      <button
        className={`sqlx-dl-trigger ${phase.kind === "done" ? "done" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!working) setOpen((o) => !o);
        }}
        disabled={working}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Download ${dataset.name} for local use`}
        title={`Download ${dataset.name} to practise locally`}
      >
        {working ? (
          <Loader2 size={12} className="spin" />
        ) : phase.kind === "done" ? (
          <Check size={12} />
        ) : (
          <Download size={12} />
        )}
      </button>

      {working && (
        <div className="sqlx-dl-progress" role="status">
          <span style={{ width: `${Math.max(4, phase.fraction * 100)}%` }} />
          <em>{phase.label}</em>
        </div>
      )}

      {phase.kind === "failed" && (
        <p className="sqlx-dl-error" role="alert">
          <AlertTriangle size={11} /> {phase.message}
        </p>
      )}

      {open && !working && (
        <div className="sqlx-dl-menu" role="menu" onClick={(e) => e.stopPropagation()}>
          <p className="head">
            Download <b>{dataset.name}</b> for
          </p>
          {DIALECTS.map((d) => (
            <button key={d.id} role="menuitem" onClick={() => run(d.id)}>
              <span className="name">{d.label}</span>
              <span className="blurb">{d.blurb}</span>
            </button>
          ))}
          <p className="foot">
            A zip with the schema, a load script and one CSV per table. Nothing leaves your browser.
          </p>
        </div>
      )}
    </div>
  );
}
