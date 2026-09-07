# SQL Playground datasets

This document describes the built-in SQL Playground datasets, how their files are built, and what happens when a learner runs a query.

## Included datasets

| Dataset | Contents | Source and coverage | Playground copy |
| --- | --- | --- | --- |
| Cycle Depot | 5 small store tables, 507 rows | Hand-built for this lab | Created in the browser; no download. |
| Ergast Formula 1 | 14 linked racing tables, 701,439 rows | Ergast Formula 1 archive, 1950–2024 | Source values are preserved, with SQL-friendly identifier and null normalization. |
| Marvel Character Networks | 5 tables, 207,727 rows | Supplied Marvel visualization snapshot | All 8 supplied JSON files are retained as compressed originals; SQL tables flatten their existing arrays. |
| Olist | 9 linked e-commerce tables, 1,550,922 rows | Olist's public, anonymized Brazilian marketplace release, 2016–2018 | The source CSV content is retained and gzip-compressed for delivery. |
| eCommerce Events History in Cosmetics Shop | 1 event table, 184,099 rows | Supplied 48-hour slice of Kaggle's Cosmetics Shop history: 2020-01-01 00:00:00+00:00 through 2020-01-03 00:00:00+00:00 | The supplied CSV is preserved byte-for-byte after gzip compression. |
| My Workspace | No built-in tables | Learner-provided CSV or SQLite data | Temporary, browser-local workspace. |

Bike Store, TPC-H, and AdventureWorks are not part of the current Playground.

## Provenance and data fidelity

### Ergast Formula 1

The Ergast dataset was built from the supplied `ergast_2024` source directory. It contains the complete 14-table CSV snapshot used by the Playground, including races, results, standings, qualifying, lap times, and pit stops. The archive is historical and ends with the 2024 season; it is not a live Formula 1 feed.

The build deliberately makes two portability changes so the same SQL works in PostgreSQL/PGlite and DuckDB-WASM:

- Camel-case source identifiers become lower snake case, for example `raceId` becomes `race_id` and `laptimes` becomes `lap_times`.
- Literal `NULL` cells in the source CSV become empty CSV cells, which both engines load as SQL `NULL`.

It does not intentionally remove business fields or data rows. Therefore this is an import-ready transformation of the Ergast snapshot, not a byte-for-byte copy of its CSV files.

### Marvel Character Networks

Marvel is built only from the eight JSON files supplied in `marvel-data`. The folder does not include publisher, license, or source-URL metadata, so the Playground labels it accurately as a supplied snapshot rather than claiming it is an official Marvel release.

All eight input JSON files are copied byte-for-byte after decompression to `public/datasets/marvel/source/*.json.gz`. The SQL tables are a mechanical projection of the existing arrays, not synthetic content:

- `characters` uses the 1,491 supplied graph nodes and their existing comics, series, and stories counts.
- `character_links` contains all 205,607 supplied co-appearance links across those three network types.
- `screen_titles`, `screen_title_characters`, and `end_credit_links` flatten the supplied MCU, Netflix, and X-Men title arrays without inventing titles, casts, or destinations.

The only added values are zero-based array positions, exposed as relational keys such as `character_id` and `title_position`. They preserve the source ordering needed by the link endpoints; they are not generated Marvel data. The five SQL payloads loaded by the browser total about 625 KB compressed. The preserved JSON source assets are retained separately for auditability and are not loaded into the database session.

### Olist

Olist is the real, anonymized Brazilian e-commerce dataset published by Olist. It contains orders, payments, items, products, sellers, customers, reviews, category translations, and geolocation data. The public release covers orders from 2016 to 2018 and preserves anonymous hash identifiers.

The Olist builder validates every expected header, records the observed row counts in the manifest, then writes the source CSV bytes to the deployed `.csv.gz` file. Compression is the only payload transformation. The default source is a GitHub mirror of the public release; for strongest provenance, rebuild from a verified Kaggle download using `--olist-source`.

Useful public references:

- [Olist public dataset on Kaggle](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
- [Ergast Developer API](https://ergast.com/mrd/)

### eCommerce Events History in Cosmetics Shop — 48-hour slice

This dataset is built from the supplied `2020-Jan_48h.csv`, identified with the [eCommerce Events History in Cosmetics Shop Kaggle dataset](https://www.kaggle.com/datasets/mkechinov/ecommerce-events-history-in-cosmetics-shop). It intentionally represents only a **48-hour slice**, not the full January file or the full multi-month release.

The `events` table retains all 184,099 supplied rows and every original CSV column: `timestamp`, `event_time`, `event_type`, `product_id`, `category_id`, `category_code`, `brand`, `price`, `user_id`, and `user_session`. Its exact observed time boundaries are:

- Start: `2020-01-01 00:00:00+00:00`
- End: `2020-01-03 00:00:00+00:00`

The builder validates the header, row count, and both boundaries before it writes `public/datasets/cosmetics_48h/2020-Jan_48h.csv.gz`. The decompressed file is byte-for-byte identical to the supplied CSV; the typed SQL table is loaded from that original-column payload without filtering or synthetic rows.

## Build-time workflow

```text
verified CSV source files
        |
        v
scripts/datasets/<dataset>.mjs
        |
        +-- validates expected headers and source rows
        +-- applies Ergast identifier/null normalization only
        +-- preserves the Cosmetics and Olist source CSV payloads unchanged
        +-- gzip-compresses each table
        v
public/datasets/<dataset>/*.csv.gz
        |
        +-- emits table names, types, row counts, keys, and relationships
        v
src/components/sql-playground/db/datasets/manifest.generated.ts
```

The dataset registry in `src/components/sql-playground/db/datasets/index.ts` uses that manifest to populate the picker, Schema Explorer, relationship map, and load progress.

### Rebuild data assets

Run the following from the repository root. The command rebuilds every built-in package because they share one generated manifest.

```bash
npm run datasets -- \
  --ergast-source=/absolute/path/to/ergast_2024 \
  --marvel-source=/absolute/path/to/marvel-data \
  --olist-source=/absolute/path/to/olist_csv_directory \
  --cosmetics-source=/absolute/path/to/2020-Jan_48h.csv
```

The Olist directory must contain the nine public-release files named by `scripts/datasets/olist.mjs`, such as `olist_orders_dataset.csv` and `olist_order_items_dataset.csv`. If `--olist-source` is omitted, the script uses its configured public-source mirror. Ergast, Marvel, and Cosmetics always require their supplied source path.

Do not hand-edit `src/components/sql-playground/db/datasets/manifest.generated.ts`; it is generated by the dataset command.

## Browser loading and query workflow

```text
Learner selects a dataset and SQL engine
        |
        v
Browser fetches only that dataset's compressed CSV table files
        |
        v
loader.ts creates empty typed tables from the generated manifest
        |
        +-- PGlite/PostgreSQL: bulk COPY into tables, then adds keys and ANALYZE
        +-- DuckDB-WASM: registers each CSV in DuckDB's virtual filesystem,
        |   reads it with the declared column types, then drops the temporary file
        v
The selected WASM database runs the learner's SQL locally in the browser
        |
        v
Results, schema details, query plan, and charts use that local session
```

The data is bundled with the deployed site under `public/datasets/`; selecting Ergast, Marvel, Olist, or Cosmetics downloads its compressed table payloads into the browser on first use. It is not downloaded from Kaggle or Ergast when a learner clicks the dataset. Cycle Depot has no download because it is generated in memory.

Both built-in data packages can run on either PostgreSQL/PGlite or DuckDB-WASM. SQLite is not a third selectable query engine: `public/sql/sql-wasm.js` and `public/sql/sql-wasm.wasm` support browser-side inspection/import of learner-uploaded SQLite files. SQL queries themselves run on PGlite or DuckDB-WASM.

## Runtime details and limitations

- Built-in data is loaded into the selected engine's browser-local session. There is no server-side database for these datasets.
- PGlite uses `COPY` for bulk loading, adds primary/foreign keys where source data permits, then runs `ANALYZE`.
- DuckDB-WASM loads the CSV with manifest-declared types. Its temporary virtual CSV file is removed after insertion.
- Some source relationships may contain orphan records. A rejected foreign-key constraint does not prevent loading; relationships remain visible through the manifest.
- My Workspace is separate from built-in datasets and is temporary. Reloading the page clears uploaded data.

## What must be versioned and deployed

Keep these files in Git whenever a dataset changes:

- `public/datasets/ergast/`, `public/datasets/olist/`, and `public/datasets/cosmetics_48h/` — the compressed table payloads.
- `public/datasets/marvel/` — the five SQL payloads and preserved source JSON assets.
- `src/components/sql-playground/db/datasets/manifest.generated.ts` — metadata matching those payloads.
- `scripts/datasets/build.mjs`, `scripts/datasets/ergast.mjs`, `scripts/datasets/olist.mjs`, and `scripts/datasets/cosmetics-48h.mjs` — reproducible build logic.
- Any matching registry, loader, and guided-query changes under `src/components/sql-playground/`.
- `public/sql/sql-wasm.js` and `public/sql/sql-wasm.wasm` — required only for SQLite-file import support.

Do not commit generated site output, `node_modules`, local source downloads, or temporary Olist/Ergast extraction folders.

## Verification checklist

After rebuilding the data, run:

```bash
npm run build
```

Then open the SQL Playground and, for each engine, select Ergast, Marvel, Olist, and Cosmetics. Confirm that the expected table count appears in Schema Explorer, run a small `SELECT ... LIMIT 10`, and test one join where applicable. For Ergast, the 2024 calendar query should return 24 races. For Marvel, Schema Explorer should show five tables, including 205,607 `character_links`. For Olist, the `orders` table should contain 99,441 rows. For Cosmetics, Schema Explorer should show one `events` table with 184,099 rows and its first/last timestamps should match the documented 48-hour boundaries.
