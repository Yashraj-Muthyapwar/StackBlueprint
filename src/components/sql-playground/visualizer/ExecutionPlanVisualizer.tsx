import { useEffect, useState } from "react";
import { AlertTriangle, Gauge, GitBranch, ListTree, Timer, FileCode2 } from "lucide-react";
import { Engine } from "../db/db-client";
import type { DatasetId } from "../db/datasets";
import { explainQuery, maxCost, maxRows, PlanNode, PlanResult } from "../db/explain";
import { PlanGraph, kindOf } from "./PlanGraph";

function PlanTree({
  node,
  depth,
  costPeak,
  rowPeak,
  analyzed,
}: {
  node: PlanNode;
  depth: number;
  costPeak: number;
  rowPeak: number;
  analyzed: boolean;
}) {
  const estimate = node.estimatedRows;
  const actual = node.actualRows;
  // A planner estimate more than 10x off is the single most useful thing to spot.
  const misestimated =
    analyzed &&
    actual !== undefined &&
    estimate !== undefined &&
    estimate > 0 &&
    actual > 0 &&
    (actual / estimate > 10 || estimate / actual > 10);

  const share = costPeak > 0 && node.cost !== undefined ? (node.cost / costPeak) * 100 : null;
  const rowShare = rowPeak > 0 ? ((actual ?? estimate ?? 0) / rowPeak) * 100 : 0;

  return (
    <li className="sqlx-plan-node" style={{ ["--depth" as any]: depth }}>
      <div className={`node kind-${kindOf(node.type)}`}>
        <div className="node-head">
          <span className="op">{node.type}</span>
          {node.target && <span className="on">on {node.target}</span>}
          {misestimated && (
            <span className="flag" title="The planner's row estimate is off by more than 10x">
              <AlertTriangle size={11} /> estimate off
            </span>
          )}
        </div>

        <div className="node-metrics">
          {node.cost !== undefined && (
            <span className="metric">
              cost <b>{node.cost.toFixed(2)}</b>
            </span>
          )}
          {estimate !== undefined && (
            <span className="metric">
              est. rows <b>{estimate.toLocaleString()}</b>
            </span>
          )}
          {actual !== undefined && (
            <span className="metric actual">
              actual <b>{Math.round(actual).toLocaleString()}</b>
            </span>
          )}
          {node.actualMs !== undefined && (
            <span className="metric">
              <Timer size={10} /> <b>{node.actualMs.toFixed(2)} ms</b>
            </span>
          )}
        </div>

        <div className="node-bar" aria-hidden>
          <span className="rows" style={{ width: `${Math.min(100, rowShare)}%` }} />
          {share !== null && (
            <span className="cost" style={{ width: `${Math.min(100, share)}%` }} />
          )}
        </div>

        {node.detail && node.detail.length > 0 && (
          <ul className="node-detail">
            {node.detail.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
      </div>

      {node.children.length > 0 && (
        <ul className="children">
          {node.children.map((child, i) => (
            <PlanTree
              key={i}
              node={child}
              depth={depth + 1}
              costPeak={costPeak}
              rowPeak={rowPeak}
              analyzed={analyzed}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

type PlanView = "graph" | "tree" | "raw";

export function ExecutionPlanVisualizer({
  engine,
  dataset,
  sql,
  ready,
  active,
  dark,
}: {
  engine: Engine;
  dataset: DatasetId;
  sql: string;
  ready: boolean;
  active: boolean;
  dark: boolean;
}) {
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [analyze, setAnalyze] = useState(false);
  const [view, setView] = useState<PlanView>("graph");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!active || !ready || !sql.trim()) return;
    let cancelled = false;
    setBusy(true);

    explainQuery(engine, dataset, sql, analyze).then((next) => {
      if (cancelled) return;
      setPlan(next);
      setBusy(false);
    });

    return () => {
      cancelled = true;
    };
  }, [engine, dataset, sql, ready, analyze, active]);

  const header = (
    <header className="sqlx-plan-head">
      <div>
        <h3>Physical plan · {engine === "postgres" ? "PostgreSQL" : "DuckDB"}</h3>
        <p>
          Read it inside out: the deepest nodes run first and feed their parents.
          {engine === "postgres"
            ? " Cost is in arbitrary planner units, not milliseconds."
            : " DuckDB reports estimated cardinality per operator."}
        </p>
      </div>
      <div className="sqlx-plan-actions">
        <label className="sqlx-switch">
          <input type="checkbox" checked={analyze} onChange={(e) => setAnalyze(e.target.checked)} />
          <span>
            <Gauge size={12} /> Run and measure
          </span>
        </label>
        <div className="sqlx-viewswitch" role="tablist" aria-label="Plan view">
          {(
            [
              ["graph", "Graph", GitBranch],
              ["tree", "Tree", ListTree],
              ["raw", "Raw", FileCode2],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              role="tab"
              aria-selected={view === id}
              className={view === id ? "active" : ""}
              onClick={() => setView(id)}
              title={`${label} view`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );

  if (!ready) return <div className="sqlx-empty">Waiting for the engine…</div>;

  if (busy && !plan) {
    return (
      <div className="sqlx-plan">
        {header}
        <div className="sqlx-empty">Planning…</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="sqlx-plan">
        {header}
        <div className="sqlx-empty">Write a query to see how the engine intends to run it.</div>
      </div>
    );
  }

  if (plan.error) {
    return (
      <div className="sqlx-plan">
        {header}
        <div className="sqlx-error">
          <div className="sqlx-error-head">
            <AlertTriangle size={15} />
            <span>No plan available</span>
          </div>
          <pre className="sqlx-error-body">{plan.error}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className={`sqlx-plan ${view === "graph" ? "is-graph" : ""}`}>
      {header}

      {analyze && (plan.planningMs !== undefined || plan.executionMs !== undefined) && (
        <div className="sqlx-plan-timing">
          {plan.planningMs !== undefined && (
            <span>
              planning <b>{plan.planningMs.toFixed(2)} ms</b>
            </span>
          )}
          {plan.executionMs !== undefined && (
            <span>
              execution <b>{plan.executionMs.toFixed(2)} ms</b>
            </span>
          )}
        </div>
      )}

      {view === "raw" || !plan.root ? (
        <pre className="sqlx-plan-raw">{plan.raw || "The engine returned an empty plan."}</pre>
      ) : view === "graph" ? (
        <PlanGraph
          root={plan.root}
          rowPeak={maxRows(plan.root)}
          costPeak={maxCost(plan.root)}
          analyzed={plan.analyzed}
          dark={dark}
        />
      ) : (
        <ul className="sqlx-plan-tree">
          <PlanTree
            node={plan.root}
            depth={0}
            costPeak={maxCost(plan.root)}
            rowPeak={maxRows(plan.root)}
            analyzed={plan.analyzed}
          />
        </ul>
      )}

      <footer className="sqlx-plan-legend">
        <span className="k scan">scan</span>
        <span className="k join">join</span>
        <span className="k group">aggregate</span>
        <span className="k sort">sort</span>
        <span className="k limit">limit</span>
        <span className="hint">
          The wide bar is rows through the operator; the thin overlay is its share of total cost.
        </span>
      </footer>
    </div>
  );
}
