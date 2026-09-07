# SQL Playground: engine architecture and extension guide

This document explains how the SQL Playground executes queries today and what it would take to add another SQL or NoSQL engine. It describes the current implementation and an extension plan; it does not claim that engines beyond PostgreSQL/PGlite and DuckDB-WASM are already available.

For how datasets are built and loaded, see [SQL Playground datasets](./sql-playground-datasets.md). For requirements on future datasets, see [future dataset guide](./sql-playground-future-datasets.md).

## Current engine support

| Capability | PostgreSQL | DuckDB |
| --- | --- | --- |
| Playground label | PostgreSQL | DuckDB |
| Browser implementation | PGlite, a PostgreSQL-compatible WebAssembly database | DuckDB-WASM in a Web Worker |
| Built-in CSV datasets | Yes | Yes |
| CSV uploads | Yes | Yes |
| Query plan view | `EXPLAIN (FORMAT JSON)` | `EXPLAIN (FORMAT json)` with a text fallback |
| Schema inspection | PostgreSQL catalog and `information_schema` | `information_schema` and `duckdb_constraints()` |
| Execution location | Learner's browser | Learner's browser |

The SQL Playground does **not** currently provide a selectable SQLite, MySQL, MariaDB, SQL Server, MongoDB, Redis, Elasticsearch, or other engine.

`public/sql/sql-wasm.js` and `public/sql/sql-wasm.wasm` are not a selectable SQLite runtime. They run in `sqlite.worker.ts` only to inspect a learner-uploaded SQLite file and export a table as CSV for import into the existing workspace.

## How a query runs today

```text
Learner selects dataset + PostgreSQL or DuckDB
                  |
                  v
DBClient creates or reuses an engine:dataset session
                  |
                  +-- PostgreSQL: creates a PGlite instance
                  +-- DuckDB: starts a Worker and instantiates DuckDB-WASM
                  |
                  v
Dataset loader creates tables and loads bundled CSV/generator data
                  |
                  v
SQL editor submits one statement or a semicolon-separated script
                  |
                  v
DBClient runs statements in order and normalizes result values for React
                  |
                  +-- Results table and execution time
                  +-- Schema Explorer refresh
                  +-- Pipeline trace probes
                  +-- Engine-specific EXPLAIN plan parser
```

`src/components/sql-playground/db/db-client.ts` owns sessions. A session is identified by `engine:dataset`, so a learner can switch back to a previously loaded combination without loading it again. To control browser memory, the client keeps at most three sessions warm and disposes older ones.

The engines are local to the browser. Selecting a dataset downloads the app's deployed CSV assets, not a database from a third-party publisher. Query text and built-in data are not sent to an application server by this architecture.

## Responsibilities by module

| Module | Responsibility |
| --- | --- |
| `db/db-client.ts` | Engine type, session lifecycle, query execution, result normalization, reset, CSV upload. |
| `db/datasets/loader.ts` | Creates tables from the manifest and loads generated or CSV-backed data into PGlite/DuckDB. |
| `db/datasets/index.ts` | Declares which dataset supports which engine. |
| `db/metadata.ts` | Reads table, column, primary-key, and foreign-key metadata in each engine's catalog. |
| `db/dialect.ts` | Flags known PostgreSQL/DuckDB syntax differences before execution. |
| `db/explain.ts` | Runs and normalizes engine-specific query plans for the Plan tab. |
| `db/pipeline.ts` | Explains SQL logical order and issues measurement queries through the active engine. |
| `SqlPlayground.tsx` | Engine picker, persistence, loading/error UI, and editor language mode. |
| `sqlite.worker.ts` | SQLite-file inspection/import helper only. |
| `export/` | Produces downloadable data bundles in several SQL dialects; export dialects are not runtime engines. |

## SQL execution details

### PostgreSQL/PGlite

The Playground constructs `new PGlite()` and waits until it is ready. The loader creates typed tables, bulk-loads CSV payloads with `COPY ... FROM '/dev/blob'`, attempts keys after loading, and runs `ANALYZE`.

`pg.query()` produces rows and PostgreSQL type OIDs. The client maps familiar OIDs such as `int4`, `text`, `numeric`, and `timestamptz` to readable result-column types, then converts browser-hostile values such as `BigInt`, dates, byte arrays, and JSON-like values into render-safe results.

### DuckDB-WASM

DuckDB runs in a dedicated Web Worker so query execution does not block the UI. On first boot, the application selects a DuckDB-WASM bundle, starts a worker, opens one long-lived connection, and loads the selected dataset.

For each CSV table, the loader registers source bytes in DuckDB's virtual filesystem, reads it with manifest-declared types, inserts it into a physical table, and drops the temporary virtual file. Results arrive through Apache Arrow; the client normalizes Arrow decimals, dates, large integers, arrays, and structs before the UI renders them.

### Multi-statement scripts and reset

The client splits semicolon-separated scripts while respecting strings, comments, quoted identifiers, and dollar-quoted PostgreSQL text. It runs statements in order and shows the final useful result set. If one statement fails, the error identifies its position in the submitted script where possible.

Resetting a session drops user schemas/tables for the selected engine and reloads the dataset from its original bundled source. It does not contact the original data provider.

## SQL dialect support

PostgreSQL and DuckDB are intentionally both exposed so learners can see SQL portability boundaries. Most standard SELECT, joins, CTEs, aggregates, and window functions work in both. The editor flags a focused set of known differences, such as DuckDB `QUALIFY` and PostgreSQL `DISTINCT ON`.

The dialect checker is a teaching aid, not a complete parser or compatibility guarantee. New engines require their own rules and user-facing alternatives. Never assume a query can run unchanged simply because it uses the word “SQL.”

## Three ways to add another engine

Choose the execution model before selecting a product or writing UI code.

| Model | Best for | Benefits | Costs and constraints |
| --- | --- | --- | --- |
| Browser-local WASM | An engine with a stable browser-compatible WASM build, such as a future selectable SQLite runtime | Privacy, offline-capable datasets, no database server | Download size, browser memory, worker integration, and limited native extensions. |
| Remote sandbox | Native engines that should run as their real server product, such as MySQL/MariaDB or SQL Server | Highest behavioral fidelity and server features | Requires a backend, authentication/rate limits, isolated per-user databases, query limits, cleanup, observability, and a privacy policy. |
| Import/export compatibility | Formats that learners need to bring in or take out, without learning that engine's query language | Smallest scope; useful interoperability | Does not make the format a Playground execution engine. This is the current SQLite-file behavior. |

Do not label an import/export feature as an “engine.” A selectable engine must execute user queries, expose schema metadata, reset safely, and give meaningful errors in the Playground.

## Adding a browser-local SQL engine

SQLite is the most natural next candidate because the app already has a browser-side SQLite reader for imports. Turning it into a true SQL engine is still a separate feature: the current worker only lists tables and extracts CSV; it does not participate in sessions, query execution, metadata, plan rendering, or reset.

Use this delivery sequence for any browser-local SQL engine:

1. **Validate the runtime.** Confirm its WASM package/license, asset delivery, worker model, browser support, payload size, memory behavior, and whether it can load the Playground's CSV-backed schemas.
2. **Design an engine adapter.** Generalize the current `Handle` in `db-client.ts` so each engine supplies `boot`, `exec`, `reload`, `dispose`, optional `uploadCsv`, result normalization, and clear error conversion.
3. **Extend the engine registry.** Add the engine ID and display metadata in one registry instead of adding another hard-coded UI branch. The current engine picker, saved preference recovery, editor language mode, history labels, and switch-engine copy contain PostgreSQL/DuckDB assumptions that must be generalized.
4. **Implement loading.** Add a loader path that creates manifest-declared tables and imports generated/CSV data without relying on PostgreSQL `COPY` or DuckDB virtual files.
5. **Implement metadata.** Add catalog queries or an adapter method that yields the shared `SchemaSnapshot` shape: tables, columns, nullability, primary keys, and foreign keys.
6. **Implement plans or intentionally omit them.** Add an `EXPLAIN` adapter/parser only if the engine exposes a useful plan. Otherwise disable the Plan tab with a precise explanation rather than showing a broken view.
7. **Define dialect behavior.** Add only tested incompatibility rules. Update formatter language support and engine-specific guided queries as needed.
8. **Verify lifecycle.** Test first boot, dataset load, cancellation, result rendering, CSV upload, reset, session eviction, errors, and clean worker disposal.

The first refactor should create a data-driven engine registry similar to this conceptual shape:

```ts
type EngineAdapter = {
  id: Engine;
  label: string;
  editorLanguage: string;
  boot(dataset: DatasetId, hooks: EngineHooks): Promise<Handle>;
  fetchSchema(dataset: DatasetId): Promise<SchemaSnapshot>;
  explain?(dataset: DatasetId, sql: string, analyze: boolean): Promise<PlanResult>;
  capabilities: {
    csvUpload: boolean;
    queryPlan: boolean;
    pipeline: boolean;
  };
};
```

This is a target design, not an interface that exists today. Do the adapter refactor before a third SQL engine; otherwise each new engine multiplies conditionals across the UI and database modules.

## Adding a remote SQL engine

Use a remote sandbox only with explicit product approval. It changes the trust model from “runs locally in your browser” to “query runs on an application-managed database.”

Required additions include:

- An authenticated API that creates an isolated, short-lived database session per learner.
- Dataset loading on the server or a snapshot/image strategy; do not accept arbitrary database connection strings from the browser.
- Query classification, statement/row/time/memory limits, cancellation, and abuse protection.
- Safe handling of DDL/DML, file/network access, extensions, and administrative commands.
- Session expiration and deletion, audit/telemetry policy, rate limiting, and cost controls.
- A streaming or paginated results protocol and a clear privacy notice.
- Server-side equivalents for schema metadata, explain plans, uploads, and reset.

The UI should state which actions leave the device and which remain local. Existing local-only privacy copy must be revised before a remote engine ships.

## Adding a NoSQL flavor

NoSQL is not a SQL dialect switch. A document, key-value, graph, or search database needs its own language, data model, loader, editor experience, and learning goals.

| Flavor | What would change | Example learner features |
| --- | --- | --- |
| Document database | JSON/BSON import, collection browser, document query editor, aggregation-pipeline results | filtering nested fields, projections, aggregation pipelines, indexes |
| Key-value store | Key/namespace browser and command editor; usually a remote sandbox | expiry, lists/sets, transactions, pub/sub concepts |
| Graph database | Node/edge loader, graph explorer, graph query editor | pattern matching, paths, traversal, graph projections |
| Search engine | Index/mapping setup, JSON request editor, relevance/result diagnostics | filtering, faceting, analyzers, scoring |

Do not run a NoSQL language through the SQL statement splitter, SQL formatter, pipeline tracer, or SQL dialect checker. Create a separate `QueryLanguageAdapter` or a separate Playground mode. It may share generic session lifecycle, result rendering, and dataset-selection ideas, but it must own parsing, metadata, loading, validation, query-plan support, and guided exercises.

A sensible first NoSQL release should use a pre-bundled, non-sensitive snapshot and one explicitly scoped mode (for example, document queries only). Avoid exposing arbitrary external clusters or credentials in the browser.

## Required test matrix for every engine

Before enabling an engine in the picker, verify all applicable cases:

```text
[ ] First boot works on supported browsers and reports useful progress/errors
[ ] Built-in generated dataset loads
[ ] Built-in CSV dataset loads with correct types, nulls, row counts, and joins
[ ] Results render dates, decimals, large integers, arrays, and structured values safely
[ ] Single statements and multi-statement scripts behave predictably
[ ] Invalid syntax and missing table/column errors are understandable
[ ] Schema Explorer and relationship map work or have an explicit limitation
[ ] Reset restores the original dataset and removes learner changes
[ ] CSV and SQLite import behavior is documented and tested, if supported
[ ] Query plan and pipeline views work or are visibly unavailable with an explanation
[ ] Session memory is bounded; eviction and disposal are clean
[ ] Dataset and engine switch behavior does not lose the wrong draft/session
[ ] Privacy, network, licensing, and security documentation matches reality
[ ] Production build and browser smoke tests pass
```

## Decision checklist

Before starting implementation, write down the proposed engine, execution model, target query language, first dataset, browser/server resource budget, supported features, unsupported features, source/license obligations, and success tests. Get approval for any remote execution or third-party service before adding it.

The product should add an engine when it improves a clear learner outcome—not merely because the engine exists. A small, well-integrated SQLite or document-learning mode is more valuable than a long picker of partial, unreliable backends.
