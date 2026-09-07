# SQL Playground: future dataset guide

Use this guide when proposing, building, reviewing, or removing a built-in SQL Playground dataset. It is a repeatable delivery contract, not a promise that every candidate below will be added.

For the current architecture and existing datasets, see [SQL Playground datasets](./sql-playground-datasets.md).

## What a built-in dataset is

A built-in dataset is a curated set of relational tables that can be loaded entirely in the learner's browser and queried with one or both supported engines:

- PostgreSQL, implemented with PGlite/WASM.
- DuckDB-WASM.

It is not a live connection to the source publisher. A deployment contains versioned, compressed table files in `public/datasets/`; the browser fetches and loads them when the learner selects the dataset.

SQLite remains import support for a learner's own `.sqlite` or `.db` file, rather than a third runtime engine for a built-in dataset.

## Dataset selection criteria

Approve a candidate only when it satisfies all of the following.

| Area | Requirement | Why it matters |
| --- | --- | --- |
| Teaching value | Supports a progression from filtering to joins, grouping, CTEs, windows, and query plans. | A dataset should teach more than `SELECT *`. |
| Relational design | Has at least two useful tables and documented join paths. | The Schema Explorer and relationship map should be meaningful. |
| Provenance | Has a stable, primary source URL and clear license/terms. | Learners and maintainers need to know what data they are using. |
| Privacy | Contains no personal, secret, or sensitive records. Anonymization must be documented by the publisher. | Built-in datasets are distributed to every visitor. |
| Browser fit | Compressed payload and in-memory load are practical on ordinary laptops. | Both database engines run locally in a browser tab. |
| Portability | Its schema and values load predictably into PGlite and DuckDB-WASM. | One SQL lesson should work across both engines. |
| Maintenance | Source snapshot/version, update policy, and owner are known. | Avoid a silently stale or unreproducible dataset. |

Prefer real, public, anonymized relational data over synthetic tables. Use a generated dataset only when a small, purpose-built set teaches a specific concept better and can be maintained as source code.

## Suitable functionality by dataset shape

These are selection patterns, not committed future datasets.

| Dataset shape | Good learner functionality | Minimum useful table pattern |
| --- | --- | --- |
| Commerce / marketplace | Revenue, delivery time, cohorts, customer ranking, repeat purchase, basket analysis | customers → orders → order_items → products |
| Transport / mobility | Time bucketing, delays, routes, ranking, rolling averages | trips/events → stations/routes → calendar |
| Public services / civic data | Aggregation, geographic grouping, data quality, trends | fact table → locations/categories/dates |
| Media / content catalog | Many-to-many joins, popularity, release trends | titles ↔ people/tags plus ratings/events |
| Finance (aggregated and licensed) | Window functions, moving averages, percent change | dated observations → instruments/categories |
| Small generated lab | Introductory filtering, joins, NULL behavior, predictable edge cases | 3–5 deliberately designed tables |

Avoid datasets that require a network API key, contain granular personal data, impose an incompatible distribution license, or depend on a server-only database feature.

## Required deliverables

Every new static CSV dataset needs all of the following:

1. A source directory or reproducible download location, plus source URL, license/terms, snapshot date, and any attribution text.
2. A builder at `scripts/datasets/<dataset-id>.mjs` that validates source headers, writes compressed table assets, and returns manifest data.
3. A `public/datasets/<dataset-id>/` directory containing one `.csv.gz` file per table.
4. An updated generated manifest at `src/components/sql-playground/db/datasets/manifest.generated.ts`.
5. A registry entry in `src/components/sql-playground/db/datasets/index.ts`.
6. Guided queries in `src/components/sql-playground/content/<dataset-id>.ts` and a library registration in `src/components/sql-playground/content/index.ts`.
7. Documentation: source provenance, transformations, row/table counts, limitations, and rebuild instructions.
8. Browser verification in both PGlite and DuckDB-WASM.

Generated datasets do not need a CSV builder or payload directory. They instead need schema/seed definitions in `src/components/sql-playground/db/dataset.ts`, a `source: { kind: "generated" }` registry entry, content, and both-engine verification.

## Build contract for a static dataset

The current loader accepts CSV-backed manifests. A builder must return a result shaped like this:

```ts
{
  id: "example",
  schemas: [],
  tables: [
    {
      schema: "public",
      name: "events",
      file: "events.csv.gz",
      rows: 12345,
      bytes: 67890,
      primaryKey: ["event_id"],
      columns: [
        { name: "event_id", type: "INTEGER", notNull: true },
        { name: "occurred_at", type: "TIMESTAMP", notNull: true }
      ]
    }
  ],
  foreignKeys: [],
  bytes: 67890
}
```

The dataset command in `scripts/datasets/build.mjs` imports each builder, runs all builders, and writes the shared manifest. Register the new builder there; never hand-edit the generated manifest.

Use helpers from `scripts/datasets/lib.mjs`:

- `parseCsv` to read normal RFC 4180 input.
- `writeRawCsv` when public source bytes should be retained unchanged except for gzip compression.
- `writeTable` when a documented transformation or normalization is required.

When transforming source data, document exactly what changes: renamed columns, null handling, removed fields, filtered rows, value cleanup, or derived columns. Preserve source IDs where practical. Do not silently repair, deduplicate, or discard records.

### Schema rules

- Use lower `snake_case` table and column names unless there is a documented reason not to.
- Choose portable column types accepted by both PGlite and DuckDB-WASM, such as `INTEGER`, `BIGINT`, `DOUBLE PRECISION`, `DECIMAL(p,s)`, `VARCHAR(n)`, `TEXT`, `DATE`, `TIME`, `TIMESTAMP`, and `BOOLEAN`.
- Declare `notNull` only where the source guarantees it.
- Declare real primary keys where they are unique. Leave `primaryKey` empty rather than inventing one.
- Add known foreign keys for the relationship map. The loader tolerates invalid source relationships, but document intentional exceptions.
- Use a safe empty-string null convention for CSV-backed tables: loaders treat `nullstr = ''` as SQL `NULL`.

## Integration workflow

```text
1. Assess candidate: license, privacy, teaching value, size, and source stability
                         |
2. Freeze a named source snapshot and record its URL/date/version
                         |
3. Inspect headers, row counts, keys, nulls, encodings, and join integrity
                         |
4. Implement builder and schema/relationship metadata
                         |
5. Generate .csv.gz assets and manifest
                         |
6. Register picker metadata and guided queries
                         |
7. Load and query in PGlite and DuckDB-WASM
                         |
8. Document provenance, limitations, and update/removal policy
                         |
9. Commit payloads, manifest, source code, and documentation together
```

### Registry requirements

Add the dataset ID to the `DatasetId` union and registry in `src/components/sql-playground/db/datasets/index.ts`. A static dataset should use `source: { kind: "csv", manifest: ... }`, declare both engines when supported, and include:

- Clear learner-facing name, tagline, and description.
- Accurate compressed size, table count, and row count from the manifest.
- Source credit label and canonical URL.
- Caveats such as snapshot date, anonymization, transformations, or missing coverage.

If an engine cannot support the dataset, explicitly omit it from `engines`; do not let users select a combination that fails during loading.

### Guided query requirements

Add examples in `src/components/sql-playground/content/<dataset-id>.ts` and register them in the content library. Include a safe starter query plus groups that progressively demonstrate:

1. Table discovery and a limited preview.
2. Filters, sorting, and `NULL` handling.
3. At least one meaningful join.
4. Aggregation and `HAVING`.
5. A CTE or window-function analysis where the data supports it.
6. A query worth opening in the plan or pipeline views.

Use manifest names exactly, order output when a query needs deterministic display, use `LIMIT` for exploratory examples, and keep examples compatible with both engines unless marked engine-specific.

## Browser loading behavior

At runtime, `src/components/sql-playground/db/datasets/loader.ts` performs this sequence for CSV datasets:

1. Fetches each table from `/datasets/<dataset-id>/<file>`, where `file` is the manifest filename such as `events.csv.gz`.
2. Lets the server/browser decompress it when possible; otherwise uses the browser `DecompressionStream` fallback.
3. Creates typed empty tables using the generated manifest.
4. Loads the records:
   - PGlite uses bulk `COPY` with the CSV bytes.
   - DuckDB-WASM uses a temporary virtual CSV file, then `read_csv` with declared types.
5. Adds primary and foreign keys in PGlite where the source permits, then runs `ANALYZE`.
6. Runs learner SQL locally against the selected engine session.

The source publisher is never contacted during this process. Deployment must include the generated payload files, or the dataset will fail to load.

## Performance and payload budget

Measure compressed payload, raw CSV size, load time, and browser memory before approving a dataset. Test on a typical laptop and a constrained browser profile. A dataset that is useful but too large should be reduced transparently through a documented snapshot, date range, or table subset—not through an undocumented row cap.

Keep guided queries selective. Avoid default examples that scan very large detail tables without a filter or `LIMIT`. Prefer a small generated dataset for lessons where instant loading is more valuable than realism.

## Quality, privacy, and legal checks

Before release, confirm:

- The dataset's license permits redistribution in a public web deployment and any attribution requirements are visible.
- The source does not expose personal data, credentials, private text, or sensitive identifiers.
- The source snapshot is retained or can be independently retrieved.
- The documented source URL is primary whenever possible, rather than a convenience mirror.
- Source row counts, headers, primary keys, foreign-key coverage, and representative values have been checked.
- Type conversion, encoding, delimiter, quoting, and null handling work in both engines.
- The dataset does not require server-side extensions, network files, API calls, or unsupported SQL to load.

## Release checklist

```text
[ ] Source, license/terms, attribution, snapshot date, and update policy documented
[ ] Privacy review complete; no sensitive records distributed
[ ] Builder validates expected headers and reports row counts
[ ] Any transformations documented and reproducible
[ ] Compressed payloads generated under public/datasets/<dataset-id>/
[ ] Manifest regenerated; no manual edits
[ ] Dataset registry is accurate and engine support is explicit
[ ] Guided queries and starter query added
[ ] Schema Explorer and relationship map show expected tables and relationships
[ ] PGlite load, preview, join, and query plan verified
[ ] DuckDB-WASM load, preview, join, and query plan verified
[ ] npm run build passes
[ ] Payloads, manifest, scripts, queries, and documentation are committed together
```

## Updating or removing a dataset

Treat a source refresh as a versioned content change. Record the new snapshot date, rerun the builder, compare table/row counts and keys, update guided queries if the schema changed, and re-test both engines.

To remove a dataset, remove its registry ID and content entry first, then its builder, generated payload directory, and documentation references. Regenerate the manifest, search the repository for the dataset ID/name, and run a production build. This prevents stale picker entries, queries, or missing-file load failures.
