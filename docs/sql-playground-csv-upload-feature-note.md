# SQL Playground: Bring Your Own Data (CSV Upload)

This specification outlines the architecture for allowing learners to load a local CSV into the SQL Playground and query it with DuckDB-WASM, entirely in the browser.

> [!NOTE]  
> The first release supports CSV files only and runs exclusively on DuckDB. It does not upload files to a server or persist file contents across sessions.

## 1. System Architecture Diagram

```mermaid
flowchart TD
    %% User Interaction
    subgraph UI["SQL Playground UI"]
        Sidebar[Sidebar Dropzone]
        Dialog[Import Preview Dialog]
    end

    %% DuckDB Processing
    subgraph DB["DuckDB-WASM Engine"]
        VFS[Virtual File System]
        Infer[read_csv_auto() / LIMIT 20]
        Table[Physical Table<br/>uploads.table_name]
    end

    %% Flow
    Sidebar --> |Drag & Drop .csv| Dialog
    Dialog --> |Registers File Buffer| VFS
    VFS --> Infer
    Infer --> |Returns Inferred Types| Dialog
    Dialog --> |Confirm Import| Table
    Table --> |Drops Buffer| VFS
```

## 2. Learner Outcome
A learner can drag a CSV onto the playground, understand what will be imported, give it a safe table name, and immediately run a useful query. They can inspect columns in the existing Schema Explorer, profile data in a temporary database, and remove the upload when done.

## 3. Scope Boundaries

> [!WARNING]  
> **Deliberately Excluded:** XLSX, JSON, Parquet, ZIP, URLs, Backend uploads, and PGlite/PostgreSQL support.

### Included
- CSV upload via drag-and-drop or file picker.
- Temporary `uploads` schema in DuckDB.
- Header-aware type inference and preview.
- File-size guardrails and clear error states.
- Explicit privacy messaging.

## 4. Technical Design

### Why DuckDB Only?
The playground already uses DuckDB-WASM and its virtual file system. Its built-in loader registers CSV bytes with `registerFileBuffer` and queries them with `read_csv`. PGlite should not be involved in the first release because it would create a separate, complex import path (`COPY`).

### Upload Workspace
- Retain the currently selected built-in dataset.
- Create an `uploads` schema on first import: `CREATE SCHEMA IF NOT EXISTS uploads`.
- Register the browser `File` contents under an internal virtual-file name.
- Create a physical table, not a view:
  ```sql
  CREATE TABLE uploads."my_upload" AS 
  SELECT * FROM read_csv('<internal-uuid>.csv', header=true, auto_detect=true);
  ```
- Drop the virtual file immediately after physical table creation to save memory.

> [!CAUTION]  
> **Privacy Standard:** The UI must explicitly state: "Your file is processed locally in this browser by DuckDB. It is not uploaded to our servers." Do not implement telemetry that captures file contents or row values.

## 5. Preview & Inference
Use DuckDB's CSV reader for preview and inference, not a separate JavaScript parser. This guarantees preview and final import use the exact same delimiter, quoting, and type-detection rules.
1. Read first 2MB for preview.
2. Run bounded `read_csv_auto` with `LIMIT 20`.
3. Display preview, then reuse full buffer for actual physical import.
