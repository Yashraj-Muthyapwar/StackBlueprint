import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Database, Download, ExternalLink, Info, Zap } from "lucide-react";
import type { Engine } from "./db/db-client";
import {
  DATASETS,
  getDataset,
  humanBytes,
  humanRows,
  type DatasetDef,
  type DatasetId,
} from "./db/datasets";
import { DatasetDownload } from "./DatasetDownload";

const DIFFICULTY_LABEL: Record<DatasetDef["difficulty"], string> = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

export function DatasetPicker({
  value,
  engine,
  warm,
  onChange,
}: {
  value: DatasetId;
  engine: Engine;
  /** Which combinations are already loaded, so the UI can say "no wait". */
  warm: (dataset: DatasetId) => boolean;
  onChange: (dataset: DatasetId) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = getDataset(value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="sqlx-dataset" ref={rootRef}>
      <button
        className="sqlx-dataset-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Database size={13} />
        <span className="nm">{active.name}</span>
        <span className="meta">
          {active.stats.tables} tables · {humanRows(active.stats.rows)}
        </span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <div className="sqlx-dataset-menu">
          <p className="head">
            Each dataset is a separate database. Switching keeps the one you were on loaded, so you
            can flip back without waiting.
          </p>

          {DATASETS.map((dataset) => {
            const supported = dataset.engines.includes(engine);
            const isWarm = warm(dataset.id);
            const selected = dataset.id === value;
            const engineNames = dataset.engines
              .map((e) => (e === "postgres" ? "PostgreSQL" : "DuckDB"))
              .join(" and ");

            return (
              <div
                key={dataset.id}
                className={`sqlx-dataset-row ${selected ? "selected" : ""} ${supported ? "" : "other-engine"}`}
              >
                <button
                  aria-current={selected}
                  // Still selectable when the current engine cannot run it: picking
                  // it switches the engine rather than refusing the click.
                  className="sqlx-dataset-item"
                  onClick={() => {
                    onChange(dataset.id);
                    setOpen(false);
                  }}
                  title={supported ? undefined : `Switches to ${engineNames}`}
                >
                  <span className="row">
                    <span className="name">
                      {selected && <Check size={12} />}
                      {dataset.name}
                    </span>
                    <span className={`level ${dataset.difficulty}`}>
                      {DIFFICULTY_LABEL[dataset.difficulty]}
                    </span>
                  </span>

                  <span className="tagline">{dataset.tagline}</span>

                  <span className="facts">
                    <span>{dataset.stats.tables} tables</span>
                    <span>{humanRows(dataset.stats.rows)}</span>
                    <span className={dataset.bytes === 0 ? "free" : "cost"}>
                      {dataset.bytes === 0 ? <Zap size={10} /> : <Download size={10} />}
                      {isWarm ? "loaded" : humanBytes(dataset.bytes)}
                    </span>
                    {!supported && <span className="only">switches to {engineNames}</span>}
                  </span>
                </button>

                <DatasetDownload dataset={dataset} />
              </div>
            );
          })}

          <div className="sqlx-dataset-about">
            <p className="title">
              <Info size={11} /> {active.name}
            </p>
            <p>{active.about}</p>
            {active.caveats?.map((caveat) => (
              <p key={caveat} className="caveat">
                {caveat}
              </p>
            ))}
            {active.credit.url && (
              <a href={active.credit.url} target="_blank" rel="noreferrer noopener">
                {active.credit.label} <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
