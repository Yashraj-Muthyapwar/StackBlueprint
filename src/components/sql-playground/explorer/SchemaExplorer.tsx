import { useMemo, useState } from "react";
import { ChevronRight, Database, KeyRound, Link2, Play, Search, Table2 } from "lucide-react";
import { SchemaSnapshot } from "../db/metadata";
import type { ExampleGroup } from "../content";

interface Props {
  schema: SchemaSnapshot | null;
  groups: ExampleGroup[];
  datasetName: string;
  loading: boolean;
  onUseQuery: (sql: string, autoRun: boolean) => void;
  challengeMode?: boolean;
  children?: React.ReactNode;
}

export function SchemaExplorer({
  schema,
  groups,
  datasetName,
  loading,
  onUseQuery,
  challengeMode = false,
  children,
}: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const tables = useMemo(() => {
    if (!schema) return [];
    const needle = search.trim().toLowerCase();
    if (!needle) return schema.tables;
    return schema.tables
      .map((t) => {
        if (t.name.toLowerCase().includes(needle)) return t;
        const columns = t.columns.filter((c) => c.name.toLowerCase().includes(needle));
        return columns.length ? { ...t, columns } : null;
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [schema, search]);

  // Foreign keys are recorded against "schema.table".
  const fkTargetOf = (table: { schema: string; name: string }, column: string) => {
    const key = `${table.schema}.${table.name}`;
    const fk = schema?.foreignKeys.find((f) => f.fromTable === key && f.fromColumn === column);
    return fk ? `${fk.toTable}.${fk.toColumn}` : null;
  };

  return (
    <div className="sqlx-side">
      <div className="sqlx-side-search">
        <Search size={13} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tables and columns"
          aria-label="Search schema"
        />
      </div>

      <section>
        <h2>
          <Database size={12} /> {datasetName}
        </h2>

        {loading && !schema && <p className="sqlx-side-empty">Reading the catalogue…</p>}
        {!loading && tables.length === 0 && (
          <p className="sqlx-side-empty">{search ? "Nothing matches that." : "No tables yet."}</p>
        )}

        <div className="sqlx-tree">
          {tables.map((table) => {
            const expanded = open[table.name] ?? !!search;
            return (
              <div key={table.name} className={`sqlx-tbl ${expanded ? "open" : ""}`}>
                <div className="sqlx-tbl-head">
                  <button
                    className="toggle"
                    onClick={() => setOpen((p) => ({ ...p, [table.name]: !expanded }))}
                    aria-expanded={expanded}
                  >
                    <ChevronRight size={13} className="caret" />
                    <Table2 size={13} className="icon" />
                    <span className="name" title={table.qualified}>
                      {table.name}
                    </span>
                    {table.rowCount !== null && (
                      <span className="rows">{table.rowCount.toLocaleString()}</span>
                    )}
                  </button>
                  <button
                    className="peek"
                    title={`SELECT * FROM ${table.qualified}`}
                    onClick={() => onUseQuery(`SELECT *\nFROM ${table.qualified}\nLIMIT 50;`, true)}
                  >
                    <Play size={11} />
                  </button>
                </div>

                {expanded && (
                  <ul className="cols">
                    {table.columns.map((col) => {
                      const target = fkTargetOf(table, col.name);
                      return (
                        <li
                          key={col.name}
                          className={col.isPrimary ? "pk" : col.isForeign ? "fk" : ""}
                        >
                          <span className="glyph">
                            {col.isPrimary ? (
                              <KeyRound size={11} />
                            ) : col.isForeign ? (
                              <Link2 size={11} />
                            ) : null}
                          </span>
                          <span className="nm" title={target ? `references ${target}` : undefined}>
                            {col.name}
                          </span>
                          <span className="ty">{col.type}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {children}

      {!challengeMode && (
        <section>
          <h2>Guided queries</h2>
          <div className="sqlx-examples">
            {groups.map((group) => (
              <div key={group.group} className="sqlx-ex-group">
                <div className="label">{group.group}</div>
                <p className="blurb">{group.blurb}</p>
                {group.items.map((example) => (
                  <button
                    key={example.title}
                    className="sqlx-ex"
                    onClick={() => onUseQuery(example.sql, false)}
                  >
                    <span className="t">
                      {example.title}
                      {example.only && (
                        <span className="badge">{example.only === "duckdb" ? "duck" : "pg"}</span>
                      )}
                    </span>
                    <span className="n">{example.note}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
