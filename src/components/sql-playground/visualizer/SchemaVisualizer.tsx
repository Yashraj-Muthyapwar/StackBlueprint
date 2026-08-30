import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { KeyRound, Link2 } from "lucide-react";
import { SchemaSnapshot } from "../db/metadata";

/** "public.orders" reads better as just "orders". */
const short = (qualified: string) =>
  qualified.startsWith("public.") || qualified.startsWith("main.")
    ? qualified.split(".").slice(1).join(".")
    : qualified;

interface Edge {
  path: string;
  from: string;
  to: string;
  label: string;
}

export function SchemaVisualizer({
  schema,
  active,
}: {
  schema: SchemaSnapshot | null;
  active: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [focus, setFocus] = useState<string | null>(null);

  const draw = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap || !schema) return;

    const origin = wrap.getBoundingClientRect();
    const next: Edge[] = [];

    for (const fk of schema.foreignKeys) {
      const fromEl = wrap.querySelector<HTMLElement>(
        `[data-table="${CSS.escape(fk.fromTable)}"] [data-col="${CSS.escape(fk.fromColumn)}"]`,
      );
      const toEl = wrap.querySelector<HTMLElement>(
        `[data-table="${CSS.escape(fk.toTable)}"] [data-col="${CSS.escape(fk.toColumn)}"]`,
      );
      if (!fromEl || !toEl) continue;

      const a = fromEl.getBoundingClientRect();
      const b = toEl.getBoundingClientRect();
      // Leave from whichever side faces the target, so lines don't cross the cards.
      const leftToRight = b.left + b.width / 2 >= a.left + a.width / 2;

      const x1 = (leftToRight ? a.right : a.left) - origin.left + wrap.scrollLeft;
      const y1 = a.top + a.height / 2 - origin.top + wrap.scrollTop;
      const x2 = (leftToRight ? b.left : b.right) - origin.left + wrap.scrollLeft;
      const y2 = b.top + b.height / 2 - origin.top + wrap.scrollTop;

      const bow = Math.max(28, Math.abs(x2 - x1) * 0.45);
      const c1 = leftToRight ? x1 + bow : x1 - bow;
      const c2 = leftToRight ? x2 - bow : x2 + bow;

      next.push({
        path: `M ${x1} ${y1} C ${c1} ${y1}, ${c2} ${y2}, ${x2} ${y2}`,
        from: fk.fromTable,
        to: fk.toTable,
        label: `${short(fk.fromTable)}.${fk.fromColumn} → ${short(fk.toTable)}.${fk.toColumn}`,
      });
    }

    setEdges(next);
  }, [schema]);

  // Redraw whenever the schema, the container size or the tab visibility changes.
  //
  // The first frame after mounting can land before the cards have laid out, in
  // which case there is nothing to measure and no observed element whose resize
  // would trigger a retry. So try a few times over the first half second and
  // stop as soon as an attempt actually produces lines.
  useLayoutEffect(() => {
    if (!active || !schema) return;

    let cancelled = false;
    const timers: number[] = [];
    const attempt = () => {
      if (cancelled) return;
      const wrap = wrapRef.current;
      if (wrap && wrap.querySelector(".sqlx-map-card")) draw();
    };

    const frame = requestAnimationFrame(attempt);
    for (const delay of [60, 180, 400, 800]) {
      timers.push(window.setTimeout(attempt, delay));
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      for (const t of timers) clearTimeout(t);
    };
  }, [draw, active, schema]);

  useEffect(() => {
    if (!active) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const observer = new ResizeObserver(() => draw());
    observer.observe(wrap);
    // Observe the grid too: it is what grows as cards mount, and observing it
    // covers the case where no card existed when this effect first ran.
    const grid = wrap.querySelector(".sqlx-map-grid");
    if (grid) observer.observe(grid);
    for (const card of wrap.querySelectorAll(".sqlx-map-card")) observer.observe(card);

    window.addEventListener("resize", draw);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [draw, active, schema]);

  if (!schema) return <div className="sqlx-empty">Reading the catalogue…</div>;
  if (schema.tables.length === 0) {
    return (
      <div className="sqlx-empty">This database has no tables. Create one and it appears here.</div>
    );
  }

  // Foreign keys identify tables as "schema.table", so the cards must too:
  // two schemas can each hold a table called "orders".
  const key = (t: { schema: string; name: string }) => `${t.schema}.${t.name}`;

  const dimmed = (table: string) =>
    focus !== null &&
    focus !== table &&
    !schema.foreignKeys.some(
      (f) =>
        (f.fromTable === focus && f.toTable === table) ||
        (f.toTable === focus && f.fromTable === table),
    );

  return (
    <div className="sqlx-map" ref={wrapRef} onMouseLeave={() => setFocus(null)}>
      <svg className="sqlx-map-lines" aria-hidden>
        <defs>
          <marker
            id="sqlx-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M 0 1 L 7 4 L 0 7 z" fill="currentColor" />
          </marker>
        </defs>
        {edges.map((edge, i) => (
          <path
            key={i}
            d={edge.path}
            className={`sqlx-fk ${focus && focus !== edge.from && focus !== edge.to ? "dim" : ""} ${
              focus && (focus === edge.from || focus === edge.to) ? "hot" : ""
            }`}
            markerEnd="url(#sqlx-arrow)"
          >
            <title>{edge.label}</title>
          </path>
        ))}
      </svg>

      <div className="sqlx-map-grid">
        {schema.tables.map((table) => (
          <div
            key={table.name}
            className={`sqlx-map-card ${dimmed(key(table)) ? "dim" : ""} ${focus === key(table) ? "hot" : ""}`}
            data-table={`${table.schema}.${table.name}`}
            onMouseEnter={() => setFocus(key(table))}
          >
            <h4>
              <span>{table.name}</span>
              {table.rowCount !== null && <em>{table.rowCount.toLocaleString()} rows</em>}
            </h4>
            <ul>
              {table.columns.map((col) => (
                <li
                  key={col.name}
                  data-col={col.name}
                  className={col.isPrimary ? "pk" : col.isForeign ? "fk" : ""}
                >
                  <span className="glyph">
                    {col.isPrimary ? (
                      <KeyRound size={10} />
                    ) : col.isForeign ? (
                      <Link2 size={10} />
                    ) : null}
                  </span>
                  <span className="n">{col.name}</span>
                  <span className="t">{col.type}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="sqlx-map-note">
        Arrows run from the foreign key to the key it references. Hover a table to isolate its
        relationships. Anything you create shows up here too.
      </p>
    </div>
  );
}
