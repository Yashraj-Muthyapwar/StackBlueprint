import { db, Engine } from "./db-client";
import { getDataset, type DatasetId } from "./datasets";

export interface ColumnMeta {
  name: string;
  type: string;
  isPrimary: boolean;
  isForeign: boolean;
  isNullable: boolean;
}

export interface TableMeta {
  /** Bare table name, for display. */
  name: string;
  schema: string;
  /** Quoted schema.table, safe to paste straight into a query. */
  qualified: string;
  columns: ColumnMeta[];
  rowCount: number | null;
}

export interface ForeignKeyMeta {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export interface SchemaSnapshot {
  tables: TableMeta[];
  foreignKeys: ForeignKeyMeta[];
}

const USER_SCHEMAS = `('pg_catalog', 'information_schema', 'pg_toast', 'system', 'temp')`;

async function postgresSchema(dataset: DatasetId): Promise<SchemaSnapshot> {
  const cols = await db.runOrThrow(
    "postgres",
    dataset,
    `SELECT c.table_schema AS sch,
            c.table_name  AS tbl,
            c.column_name AS col,
            c.data_type   AS ty,
            c.is_nullable AS nullable,
            c.ordinal_position AS pos
     FROM information_schema.columns c
     JOIN information_schema.tables t
       ON t.table_name = c.table_name AND t.table_schema = c.table_schema
     WHERE c.table_schema NOT IN ${USER_SCHEMAS}
       AND t.table_type = 'BASE TABLE'
     ORDER BY c.table_name, c.ordinal_position`,
  );

  const pks = await db.runOrThrow(
    "postgres",
    dataset,
    `SELECT tc.table_schema AS sch, tc.table_name AS tbl, kcu.column_name AS col
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON kcu.constraint_name = tc.constraint_name
      AND kcu.table_schema    = tc.table_schema
     WHERE tc.constraint_type = 'PRIMARY KEY'
       AND tc.table_schema NOT IN ${USER_SCHEMAS}`,
  );

  // Read foreign keys from the catalogue rather than information_schema. The
  // obvious information_schema join has two faults that both showed up on
  // AdventureWorks: joining key_column_usage to constraint_column_usage on the
  // constraint name alone builds a cross product for composite keys, inventing
  // pairs like (productid -> specialofferid); and matching the referenced table
  // on the referencing table's schema drops every cross-schema key, which is 20
  // of AdventureWorks' 89. unnest(conkey, confkey) walks both column lists in
  // step instead, so each key contributes exactly its own columns.
  const fks = await db.runOrThrow(
    "postgres",
    dataset,
    `SELECT child_ns.nspname  AS from_schema,
            child.relname     AS from_table,
            child_col.attname AS from_column,
            parent_ns.nspname AS to_schema,
            parent.relname    AS to_table,
            parent_col.attname AS to_column
     FROM pg_constraint con
     JOIN pg_class child        ON child.oid = con.conrelid
     JOIN pg_namespace child_ns ON child_ns.oid = child.relnamespace
     JOIN pg_class parent        ON parent.oid = con.confrelid
     JOIN pg_namespace parent_ns ON parent_ns.oid = parent.relnamespace
     JOIN LATERAL unnest(con.conkey, con.confkey)
            WITH ORDINALITY AS cols(child_attnum, parent_attnum, ord) ON true
     JOIN pg_attribute child_col
       ON child_col.attrelid = con.conrelid AND child_col.attnum = cols.child_attnum
     JOIN pg_attribute parent_col
       ON parent_col.attrelid = con.confrelid AND parent_col.attnum = cols.parent_attnum
     WHERE con.contype = 'f'
       AND child_ns.nspname NOT IN ${USER_SCHEMAS}`,
  );

  return assemble(
    cols.rows.map((r) => ({
      sch: r.sch,
      tbl: r.tbl,
      col: r.col,
      ty: r.ty,
      nullable: r.nullable === "YES",
    })),
    pks.rows.map((r) => `${r.sch}.${r.tbl}.${r.col}`),
    fks.rows.map((r) => ({
      fromTable: `${r.from_schema}.${r.from_table}`,
      fromColumn: r.from_column,
      toTable: `${r.to_schema}.${r.to_table}`,
      toColumn: r.to_column,
    })),
  );
}

async function duckdbSchema(dataset: DatasetId): Promise<SchemaSnapshot> {
  const cols = await db.runOrThrow(
    "duckdb",
    dataset,
    `SELECT table_schema AS sch,
            table_name  AS tbl,
            column_name AS col,
            data_type   AS ty,
            is_nullable AS nullable
     FROM information_schema.columns
     WHERE table_schema NOT IN ${USER_SCHEMAS}
     ORDER BY table_name, ordinal_position`,
  );

  const pkNames: string[] = [];
  const fks: ForeignKeyMeta[] = [];

  // duckdb_constraints() has changed shape across releases, so read the one
  // column that has always been there and parse it.
  try {
    const cons = await db.runOrThrow(
      "duckdb",
      dataset,
      `SELECT schema_name AS sch, table_name AS tbl,
              constraint_type AS ty, constraint_text AS txt
       FROM duckdb_constraints()`,
    );
    for (const row of cons.rows) {
      const text = String(row.txt ?? "");
      if (row.ty === "PRIMARY KEY") {
        const m = /PRIMARY KEY\s*\(([^)]*)\)/i.exec(text);
        if (m) for (const c of m[1].split(",")) pkNames.push(`${row.sch}.${row.tbl}.${clean(c)}`);
      } else if (row.ty === "FOREIGN KEY") {
        const m = /FOREIGN KEY\s*\(([^)]*)\)\s*REFERENCES\s+([^\s(]+)\s*\(([^)]*)\)/i.exec(text);
        if (m) {
          const from = m[1].split(",").map(clean);
          const to = m[3].split(",").map(clean);
          from.forEach((c, i) => {
            fks.push({
              fromTable: `${row.sch}.${row.tbl}`,
              fromColumn: c,
              // constraint_text names the parent table unqualified.
              toTable: `${row.sch}.${clean(m[2])}`,
              toColumn: to[i] ?? to[0],
            });
          });
        }
      }
    }
  } catch {
    // Constraint introspection is a nicety; the column list is the essential part.
  }

  return assemble(
    cols.rows.map((r) => ({
      sch: r.sch,
      tbl: r.tbl,
      col: r.col,
      ty: String(r.ty).toLowerCase(),
      nullable: r.nullable === "YES",
    })),
    pkNames,
    fks,
  );
}

const clean = (s: string) => s.trim().replace(/^["'`]|["'`]$/g, "");

/** "public" in PostgreSQL and "main" in DuckDB mean the same thing. */
function isDefaultSchema(schema: string): boolean {
  return !schema || schema === "public" || schema === "main";
}

/** Only qualify when the table is not in the default schema. */
function qualifiedName(schema: string, table: string): string {
  return isDefaultSchema(schema) ? `"${table}"` : `"${schema}"."${table}"`;
}

function assemble(
  cols: { sch: string; tbl: string; col: string; ty: string; nullable: boolean }[],
  pkKeys: string[],
  fks: ForeignKeyMeta[],
): SchemaSnapshot {
  const pkSet = new Set(pkKeys);
  const fkSet = new Set(fks.map((f) => `${f.fromTable}.${f.fromColumn}`));
  const byTable = new Map<string, { schema: string; name: string; columns: ColumnMeta[] }>();

  for (const c of cols) {
    const key = `${c.sch}.${c.tbl}`;
    let entry = byTable.get(key);
    if (!entry) {
      entry = { schema: c.sch, name: c.tbl, columns: [] };
      byTable.set(key, entry);
    }
    entry.columns.push({
      name: c.col,
      type: shortType(c.ty),
      isPrimary: pkSet.has(`${key}.${c.col}`),
      isForeign: fkSet.has(`${key}.${c.col}`),
      isNullable: c.nullable,
    });
  }

  const tables: TableMeta[] = [...byTable.values()]
    .map((t) => ({
      name: t.name,
      schema: t.schema,
      qualified: qualifiedName(t.schema, t.name),
      columns: t.columns,
      rowCount: null,
    }))
    .sort((a, b) =>
      a.schema === b.schema ? a.name.localeCompare(b.name) : a.schema.localeCompare(b.schema),
    );

  return { tables, foreignKeys: fks };
}

export function shortType(ty: string): string {
  return ty
    .replace("character varying", "varchar")
    .replace("double precision", "double")
    .replace("timestamp without time zone", "timestamp")
    .replace("timestamp with time zone", "timestamptz")
    .replace(/^integer$/, "int")
    .replace(/^bigint$/, "bigint")
    .replace(/^boolean$/, "bool")
    .replace(/^numeric$/, "numeric");
}

/**
 * Relationships the dataset declares, whether or not the engine accepted the
 * constraint. Some upstream sources carry orphan rows, so a FOREIGN KEY can be
 * rejected at load time even though the relationship is real and worth drawing.
 */
function declaredForeignKeys(dataset: DatasetId): ForeignKeyMeta[] {
  const source = getDataset(dataset).source;
  if (source.kind !== "csv") return [];

  const out: ForeignKeyMeta[] = [];
  for (const fk of source.manifest.foreignKeys) {
    fk.fromColumns.forEach((column, i) => {
      out.push({
        fromTable: fk.fromTable,
        fromColumn: column,
        toTable: fk.toTable,
        toColumn: fk.toColumns[i] ?? fk.toColumns[0],
      });
    });
  }
  return out;
}

export async function fetchSchema(engine: Engine, dataset: DatasetId): Promise<SchemaSnapshot> {
  const snapshot =
    engine === "postgres" ? await postgresSchema(dataset) : await duckdbSchema(dataset);

  // Merge the declared keys in, keyed so a constraint the engine did accept is
  // not listed twice.
  const known = new Set(
    snapshot.foreignKeys.map((f) => `${f.fromTable}.${f.fromColumn}->${f.toTable}.${f.toColumn}`),
  );

  // Manifests name unqualified tables "public.orders", but DuckDB reports the
  // same table in schema "main". Resolve by bare name whenever either side is a
  // default schema, or every declared key silently drops on one engine.
  const byQualified = new Map<string, TableMeta>();
  const byBareName = new Map<string, TableMeta>();
  for (const t of snapshot.tables) {
    byQualified.set(`${t.schema}.${t.name}`, t);
    if (isDefaultSchema(t.schema)) byBareName.set(t.name, t);
  }

  const resolve = (ref: string): TableMeta | undefined => {
    const direct = byQualified.get(ref);
    if (direct) return direct;
    const dot = ref.indexOf(".");
    if (dot === -1) return byBareName.get(ref);
    const schema = ref.slice(0, dot);
    const name = ref.slice(dot + 1);
    return isDefaultSchema(schema) ? byBareName.get(name) : undefined;
  };

  for (const fk of declaredForeignKeys(dataset)) {
    const from = resolve(fk.fromTable);
    const to = resolve(fk.toTable);
    // Skip anything pointing at a table the user has since dropped.
    if (!from || !to) continue;

    // Record it under the schema names this engine actually uses, so the
    // schema map can match it to the rendered cards.
    const resolved: ForeignKeyMeta = {
      fromTable: `${from.schema}.${from.name}`,
      fromColumn: fk.fromColumn,
      toTable: `${to.schema}.${to.name}`,
      toColumn: fk.toColumn,
    };
    const key = `${resolved.fromTable}.${resolved.fromColumn}->${resolved.toTable}.${resolved.toColumn}`;
    if (known.has(key)) continue;
    known.add(key);
    snapshot.foreignKeys.push(resolved);

    const column = from.columns.find((c) => c.name === resolved.fromColumn);
    if (column) column.isForeign = true;
  }

  // Row counts, one cheap query for all tables. If a table vanished mid-flight
  // (the user dropped it) we just leave the count null rather than failing.
  const CHUNK = 20;
  for (let i = 0; i < snapshot.tables.length; i += CHUNK) {
    const chunk = snapshot.tables.slice(i, i + CHUNK);
    const union = chunk
      .map((t) => `SELECT '${t.schema}.${t.name}' AS t, COUNT(*) AS n FROM ${t.qualified}`)
      .join(" UNION ALL ");
    try {
      const counts = await db.runOrThrow(engine, dataset, union);
      const map = new Map(counts.rows.map((r) => [r.t, Number(r.n)]));
      for (const t of chunk) t.rowCount = map.get(`${t.schema}.${t.name}`) ?? null;
    } catch {
      // One bad table should not cost the whole chunk its counts.
    }
  }

  return snapshot;
}

/** Shape the schema for CodeMirror's SQL autocompletion. */
export function toCompletionSchema(snapshot: SchemaSnapshot): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const t of snapshot.tables) {
    const columns = t.columns.map((c) => c.name);
    // Offer both "orders" and "sales.orders": either is valid to type.
    out[t.name] = columns;
    if (t.schema && t.schema !== "public" && t.schema !== "main") {
      out[`${t.schema}.${t.name}`] = columns;
    }
  }
  return out;
}
