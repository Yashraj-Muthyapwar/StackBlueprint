# SQL Playground: Bring Your Own Data (CSV Upload)

## Purpose

Let a learner load a CSV from their device into the SQL Playground and query it with DuckDB-WASM, entirely in the browser. The feature should make the playground useful for real data exploration without changing its promise as a safe, private learning environment.

The first release supports CSV files only and runs on DuckDB only. It does not upload files to a server, persist file contents, or modify the built-in course datasets.

## Learner outcome

A learner can drag a CSV onto the playground, understand what will be imported, give it a safe table name, and immediately run a useful query such as:

```sql
SELECT *
FROM my_upload
LIMIT 50;
```

They can inspect columns in the existing Schema Explorer, profile the data, make changes in a temporary database, and remove the upload when they are done.

## Scope

### Included in the first release

- CSV upload through a sidebar button and drag-and-drop target.
- DuckDB-only session. Choosing upload switches from PostgreSQL to DuckDB, with a clear explanation.
- Header-aware type inference with an import preview.
- User-editable table name, sanitized to a valid DuckDB identifier.
- A temporary `uploads` schema, with uploaded tables addressed as `uploads.my_upload`.
- Schema Explorer visibility, including column names, inferred types, and row count.
- A generated starter query and a small set of first-step queries.
- Replace, add, and remove controls for uploaded tables.
- File-size guardrails, progress feedback, cancellation, and clear errors.
- Explicit privacy messaging: files remain on the device for the current browser session.

### Deliberately excluded

- XLSX, JSON, Parquet, ZIP, URLs, and folder upload.
- Uploading data to a backend, account sync, or cross-device persistence.
- Import into PGlite/PostgreSQL.
- Automatically repairing malformed data or silently discarding bad rows.
- Sharing uploaded data through links or exported playground bundles.

These exclusions keep the first version trustworthy and easy to understand. Additional formats can reuse the same upload workspace later.

## Product flow

1. The sidebar displays an **Upload CSV** button beneath the dataset selector. It is also a visible drop target when a file is dragged over the window.
2. If PostgreSQL is active, the user is told: “Uploads run locally in DuckDB. Switch engine and continue?” The default action is **Switch to DuckDB and upload**. The existing PostgreSQL dataset remains intact.
3. The file picker accepts `.csv` and `text/csv`; drag-and-drop applies the same checks.
4. The import dialog shows filename, size, detected delimiter, whether a header was found, a preview of the first 20 rows, inferred column types, and the target table name.
5. The learner may rename the table, adjust delimiter/header handling, and choose **Import**. Advanced import settings remain collapsed by default.
6. During import, the dialog shows meaningful phases: “Reading file”, “Detecting columns”, “Creating table”, and “Counting rows”. It offers **Cancel** until the table creation starts.
7. On success, the table appears in a dedicated **My data** group in Schema Explorer. The editor receives a starter query, the result is run automatically, and a success message states the resulting table name and row count.
8. The user can upload additional CSVs into the same temporary DuckDB workspace, query them together, or remove individual tables. **Clear my data** removes all user-uploaded tables after confirmation.
9. Resetting a built-in dataset must not unexpectedly delete uploaded tables. The upload workspace has its own explicit clear action. Reloading the page clears uploads in the first release.

## UI details

### Sidebar

Add a compact `My data` section above `Guided queries`:

- **Upload CSV** button, with a keyboard-accessible file input.
- A drop overlay only while a compatible drag is active. It must not make the page impossible to scroll or hide the editor cursor.
- Imported table cards show table name, row count, column count, and actions: preview, rename, remove.
- If no file has been uploaded, use concise copy: “Load a CSV from your device. It stays in this browser.”
- When PostgreSQL is selected, retain the button but label the DuckDB requirement in its tooltip and confirmation.

### Import dialog

- Title: `Import CSV into DuckDB`.
- Show the original filename separately from the editable database table name.
- Default table name: lowercase filename stem, whitespace and punctuation converted to underscores, prefixed with `upload_` if it begins with a number, and made unique with `_2`, `_3`, and so on.
- Warn, rather than fail, when a table name has been changed for safety. Always show the exact SQL identifier that will be created.
- Preview no more than 20 rows and 25 columns. State when additional columns are hidden.
- Type selector per column is out of scope for the minimal UI, but users must be able to switch a problematic column to `VARCHAR` before import. This escape hatch avoids a false inference blocking a learner.
- If parsing finds invalid rows, show their count and examples before the user commits. Never default to `ignore_errors = true`.

### First-use help

After a successful first import, show a dismissible tip with three actions:

- `Browse rows`: `SELECT * FROM uploads.<table> LIMIT 50;`
- `Understand columns`: `SUMMARIZE uploads.<table>;`
- `Count missing values`: a generated query for the selected table.

This keeps the feature useful for beginners who do not yet know how to inspect unfamiliar data.

## Technical design

### Why DuckDB only

The playground already uses a long-lived DuckDB-WASM connection and its virtual file system. Its built-in loader registers CSV bytes with `registerFileBuffer` and queries them with `read_csv`. Reuse that mechanism. PGlite should not be involved in the first release because it would create a separate import path, add memory pressure, and weaken the simple “local DuckDB workspace” mental model.

### Upload workspace

- Retain the current selected built-in dataset and its tables.
- Create an `uploads` schema on first import: `CREATE SCHEMA IF NOT EXISTS uploads`.
- Register the browser `File` contents under an internal virtual-file name that cannot collide with a user table name, for example `upload-<crypto-random-uuid>.csv`.
- Create a physical table, not a view over the virtual file:

```sql
CREATE TABLE uploads."my_upload" AS
SELECT *
FROM read_csv('<internal virtual name>', header = true, auto_detect = true);
```

- Drop the virtual file after table creation. The database table remains queryable for the current session without holding a second copy of the uploaded file in the virtual file system.
- Only expose the generated, quoted table identifier to SQL. Never interpolate a raw filename or table name into a query.

### New database-client API

Keep file and connection details out of React components. Extend the client with a narrow DuckDB-specific API, conceptually:

```ts
type CsvImportOptions = {
  file: File;
  tableName: string;
  header: boolean;
  delimiter?: string;
  overrides?: Record<string, string>;
};

type CsvImportResult = {
  schema: "uploads";
  table: string;
  qualified: string;
  rowCount: number;
  columns: Field[];
};

db.previewCsv(file, options): Promise<CsvPreview>
db.importCsv(dataset, options, signal?): Promise<CsvImportResult>
db.removeUpload(dataset, table): Promise<void>
db.clearUploads(dataset): Promise<void>
```

The existing client keys sessions by `engine:dataset`. Uploads should belong to the active `duckdb:<dataset>` session, rather than inventing a dataset id for every file. The UI must clearly say that switching to another built-in dataset opens a different temporary workspace.

### Preview and inference

Use DuckDB's CSV reader for preview and inference, not a separate JavaScript parser. That guarantees the preview and final import use the same delimiter, quoting, escape, header, and type-detection rules.

Recommended flow:

1. Read at most the first 2 MB of the file for initial preview when possible. Large previews must not read the entire file into React state.
2. Register preview bytes to DuckDB's virtual file system.
3. Run a bounded `read_csv_auto` / `read_csv` query with `LIMIT 20` and retrieve inferred field types.
4. Display the preview, then either reuse the full file buffer for import or release it on cancellation.
5. On import, create the physical table using the selected options and query `COUNT(*)` once.

The exact DuckDB-WASM CSV options should be verified against the installed package version during implementation. The feature must use parameter-safe values wherever the API permits and carefully quote any generated SQL values.

### Schema and completion integration

- After a successful import or removal, call the existing schema refresh flow so the table appears in completion, Schema Explorer, and Schema map.
- Update schema metadata to recognize the `uploads` schema as user data. Existing filtering already includes non-system schemas, so this should primarily be a display grouping change.
- Mark upload tables as `user-uploaded` in the UI model; do not infer primary or foreign keys for the first release.
- Schema map should either include uploads in a visually separate cluster or offer a toggle. A large flat CSV should not make a course dataset's relationship map unreadable.

### Lifecycle and memory

- Uploads live in the DuckDB-WASM process only. Do not store raw CSV contents in `localStorage`, IndexedDB, analytics, logs, or error reports.
- The existing warm-session eviction may dispose the DuckDB instance. When that happens, clearly mark the associated uploaded tables as unavailable rather than implying persistence.
- On page refresh, show no uploaded tables. A future opt-in IndexedDB feature can add persistence, but it must show storage use and a delete control.
- Resetting the built-in database must retain `uploads`; `Clear my data` drops only the `uploads` schema and recreates it lazily.

## Validation and guardrails

### File acceptance

- Accept a single regular file with `.csv` extension or `text/csv` MIME type. MIME type alone is not reliable, so extension plus parsing determines support.
- Initial recommended limit: 50 MB. Expose the limit in the UI before file selection. This is conservative for mobile and WASM memory; make it configurable after profiling supported devices.
- Reject empty files, files over the limit, directory drops, and formats that cannot be parsed as text CSV.
- If the first non-empty content cannot be decoded as UTF-8, explain that the first release requires UTF-8 CSV. Do not corrupt data through silent replacement.

### Table-name validation

- Normalize the suggested table name, but preserve the original filename as display metadata.
- Restrict user input to a sensible identifier policy: letters, numbers, underscores, 63-character display limit, and a non-numeric start.
- Reserve `uploads` and system schema names.
- Quote all generated identifiers regardless of validation.
- On collision, offer **Replace existing table** and **Create as `<name>_2`**. Never overwrite silently.

### Data validation

- Header detection can be wrong. Let users toggle “First row contains column names” and update preview.
- Detect duplicate or blank headers and generate stable names such as `column_1`, `column_2`; make the mapping visible before import.
- If type inference fails because one value differs, show which columns and sample values caused the conflict. Offer `VARCHAR` for those columns.
- If any parsing errors remain, block the default import until the learner explicitly chooses either a corrected setting or “Import valid rows and report skipped rows.” The latter is an advanced, explicit option.
- Prevent `INSTALL`, `LOAD`, `ATTACH`, `COPY TO`, and filesystem/network-reading SQL from being generated by this feature. User-entered SQL remains subject to the existing playground model; document any DuckDB-WASM restrictions separately.

## Privacy and trust

The UI must state, near the upload action and in the import dialog:

> Your file is processed locally in this browser by DuckDB. It is not uploaded to our servers and is cleared when this page reloads.

Do not make claims about browser extensions, shared computers, or screenshots. Add a short “Do not upload sensitive data on a shared device” note in the expanded privacy detail. Avoid telemetry that captures filenames, table names, contents, row values, or schema names. Aggregate event counts may be collected only if product analytics policy permits and must contain no file metadata.

## Accessibility

- The upload action must be operable by keyboard and screen reader, not drag-and-drop only.
- Announce status changes with a polite live region: file accepted, preview ready, import progress, success, failure, cancellation.
- Keep the file input visibly discoverable and provide a standard button fallback.
- The dialog uses focus trapping, Escape-to-close only when no import is running, labeled controls, and error text associated with its field.
- Preview tables need accessible headers, a caption, and a nonvisual summary of row/column counts.
- No essential state may depend only on color or drop-zone animation.

## Error states and copy

| Situation | Learner-facing response | Recovery |
| --- | --- | --- |
| PostgreSQL active | “CSV uploads use DuckDB, which runs locally in your browser.” | Switch engine and continue, or cancel. |
| Unsupported file | “Choose a UTF-8 CSV file.” | Choose another file. |
| Too large | “This file is 78 MB. The current limit is 50 MB to keep the browser responsive.” | Choose a smaller file or split it. |
| Empty file | “This CSV has no rows to import.” | Choose another file. |
| Header/type issue | “We could not reliably read `revenue` as a number.” | Change column type to text or adjust import settings. |
| Name collision | “`uploads.sales` already exists.” | Replace it or choose a new name. |
| Browser memory / DuckDB failure | “DuckDB ran out of room while importing this file.” | Try a smaller file, reload the playground, then retry. |
| Session evicted or reloaded | “Your uploaded tables are no longer in this temporary workspace.” | Upload the file again. |

## Acceptance criteria

### Functional

- A learner can select or drop a valid CSV and import it into DuckDB without a network request containing the file.
- The imported table can be queried using the displayed, quoted `uploads.<table>` name.
- It appears in Schema Explorer and CodeMirror completion immediately after import.
- Uploading a second CSV enables a join between the two tables.
- Removing one upload removes only that table. Clearing uploads removes all user-uploaded tables and preserves the built-in dataset.
- Refreshing the page removes uploads and explains that behavior if the user returns to the workspace.
- A malformed, empty, oversize, or non-UTF-8 file produces a specific error without breaking the existing dataset session.
- Switching from PostgreSQL to DuckDB is explicit and never loses a user's SQL draft.

### Quality

- All file content stays client-side; no raw contents, filenames, or schemas are logged or sent to analytics.
- Import controls work with keyboard, screen reader, and pointer input.
- The UI remains usable during parsing, with cancellation before table creation and no unbounded preview rendering.
- Existing built-in datasets, guided queries, history, reset behavior, pipeline view, and plan view continue to work without regression.

### Tests

- Unit tests: name normalization, SQL identifier quoting, collisions, file-size/type checks, and import-option construction.
- Integration tests: import a small CSV, query it, verify schema refresh, import two tables and join them, remove one table, clear all uploads.
- Error tests: invalid CSV, duplicate headers, invalid UTF-8, cancelled import, DuckDB error, and session disposal.
- Browser smoke tests: click upload, keyboard-select a file, drag-and-drop a file, switch from PostgreSQL confirmation, and verify no upload request is sent over the network.

## Delivery plan

### Phase 1: safe import foundation

- DuckDB client APIs, file validation, single-file import to `uploads`, generated starter query, schema refresh, and remove/clear operations.
- Deliver only button-based upload first if it shortens verification; drag-and-drop can follow immediately.

### Phase 2: learner experience

- Preview dialog, inference controls, row/column count, first-use queries, drag-and-drop, and the dedicated `My data` schema group.

### Phase 3: resilience and polish

- Import progress/cancellation, memory-pressure messaging, better bad-row handling, visual separation in the schema map, and full accessibility/browser test coverage.

## Future extensions

- Additional local formats: Parquet first, then JSON and XLSX.
- Optional IndexedDB persistence with an explicit storage quota, list of saved files, and delete-all control.
- A small data-profile panel: null percentage, distinct count, min/max, and sample values.
- Column renaming and type casting after import through generated, transparent SQL.
- Chart suggestions based on uploaded data, paired with the proposed Chart tab.

## Decisions to confirm before implementation

1. Is 50 MB the right initial file limit for the intended devices, or should desktop users receive a higher opt-in limit?
2. Should an uploaded table coexist with the current course dataset, as proposed, or should upload open an isolated blank DuckDB workspace?
3. May users explicitly opt into browser persistence later, or should uploads always vanish on refresh?
4. Do we want the advanced “import valid rows and report skipped rows” path in version one, or should any malformed row block import until corrected?
