import { useEffect, useRef, useState } from "react";
import { ArrowDown, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Engine, QueryResult } from "../db/db-client";
import type { DatasetId } from "../db/datasets";
import { tracePipeline, PipelineTrace, Stage } from "../db/pipeline";

function TrendIcon({ trend }: { trend: Stage["trend"] }) {
  if (trend === "grow") return <TrendingUp size={12} />;
  if (trend === "shrink") return <TrendingDown size={12} />;
  if (trend === "same") return <Minus size={12} />;
  return null;
}

export function QueryFlowVisualizer({
  engine,
  dataset,
  sql,
  result,
  active,
}: {
  engine: Engine;
  dataset: DatasetId;
  sql: string;
  result: QueryResult | null;
  active: boolean;
}) {
  const [trace, setTrace] = useState<PipelineTrace | null>(null);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    if (!active || !sql.trim()) return;

    const id = ++requestId.current;
    let cancelled = false;
    setBusy(true);

    tracePipeline(engine, dataset, sql, result?.rows.length ?? null, result?.fields.length ?? null)
      .then(async (next) => {
        if (cancelled || id !== requestId.current) return;
        setTrace(next);
        setBusy(false);
        setRevealed(0);
        // Walk the stages in so the order registers as a sequence, not a list.
        for (let i = 1; i <= next.stages.length; i++) {
          await new Promise((r) => setTimeout(r, 90));
          if (cancelled || id !== requestId.current) return;
          setRevealed(i);
        }
      })
      .catch(() => {
        if (cancelled || id !== requestId.current) return;
        setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [engine, dataset, sql, result, active]);

  if (busy && !trace) {
    return <div className="sqlx-empty">Tracing the pipeline…</div>;
  }
  if (!trace) {
    return <div className="sqlx-empty">Run a SELECT and its evaluation order appears here.</div>;
  }
  if (trace.stages.length === 0) {
    return <div className="sqlx-empty">{trace.message}</div>;
  }

  const peak = Math.max(1, ...trace.stages.map((s) => s.rows ?? 0));

  return (
    <div className="sqlx-pipe">
      <header>
        <h3>Evaluation order</h3>
        <p>
          You wrote SELECT first, but the engine starts at FROM. Each bar is a real{" "}
          <code>COUNT(*)</code> of the rows leaving that clause
          {trace.measured ? "." : ", where it could be measured."}
        </p>
        {trace.message && <p className="warn">{trace.message}</p>}
      </header>

      <ol className="sqlx-stages">
        {trace.stages.map((stage, i) => {
          const on = i < revealed;
          const width = stage.rows === null ? 0 : Math.max(2, (stage.rows / peak) * 100);
          return (
            <li
              key={`${stage.keyword}-${i}`}
              className={`sqlx-stage ${on ? "on" : ""} ${stage.trend ?? ""}`}
            >
              {i > 0 && (
                <span className="link" aria-hidden>
                  <ArrowDown size={12} />
                </span>
              )}
              <div className="body">
                <div className="top">
                  <span className="step">{String(i + 1).padStart(2, "0")}</span>
                  <span className="kw">{stage.keyword}</span>
                  <span className="title">{stage.title}</span>
                  <span className="count">
                    {stage.rows === null ? (
                      <em>not measured</em>
                    ) : (
                      <>
                        <TrendIcon trend={stage.trend} />
                        <b>{stage.rows.toLocaleString()}</b>
                        <span>
                          {stage.keyword === "GROUP BY" || stage.keyword === "HAVING"
                            ? "groups"
                            : "rows"}
                        </span>
                        {stage.columns !== undefined && (
                          <span className="cols">· {stage.columns} cols</span>
                        )}
                      </>
                    )}
                  </span>
                </div>

                <div className="bar" aria-hidden>
                  <span style={{ width: `${on ? width : 0}%` }} />
                </div>

                <p className="why">{stage.why}</p>
                <code className="snip" title={stage.snippet}>
                  {stage.snippet}
                </code>
              </div>
            </li>
          );
        })}
      </ol>

      <footer>
        Why it matters: aliases created in SELECT do not exist yet when WHERE runs, which is why
        filtering on an alias fails. HAVING works because it comes after GROUP BY.
      </footer>
    </div>
  );
}
