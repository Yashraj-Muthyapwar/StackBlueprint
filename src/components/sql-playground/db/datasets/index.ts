import type { Engine } from "../db-client";
import {
  ADVENTUREWORKS_MANIFEST,
  BIKESTORE_MANIFEST,
  OLIST_MANIFEST,
  type DatasetManifest,
  type ManifestColumn,
  type ManifestForeignKey,
  type ManifestTable,
} from "./manifest.generated";

export type DatasetId = "cycledepot" | "bikestore" | "adventureworks" | "olist" | "tpch" | "my-workspace";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface DatasetDef {
  id: DatasetId;
  name: string;
  /** One line for the picker. */
  tagline: string;
  /** A paragraph for the detail panel. */
  about: string;
  difficulty: Difficulty;
  /** Engines this dataset can run on. */
  engines: Engine[];
  /** How the data gets into the engine. */
  source:
    | { kind: "generated" }
    | { kind: "blank" }
    | { kind: "csv"; manifest: DatasetManifest }
    | { kind: "tpch"; scaleFactor: number };
  /** Compressed bytes fetched on first use. 0 means nothing is downloaded. */
  bytes: number;
  /** Headline numbers for the picker. */
  stats: { tables: number; rows: number };
  /** Where the data came from, shown in the UI. */
  credit: { label: string; url: string };
  /** Notes worth surfacing, e.g. curation decisions. */
  caveats?: string[];
}

const sumRows = (m: DatasetManifest) => m.tables.reduce((total, t) => total + t.rows, 0);

export const DATASETS: DatasetDef[] = [
  {
    id: "my-workspace",
    name: "My Workspace",
    tagline: "Upload your own data to explore.",
    about:
      "A blank canvas for your own data. Upload CSVs into this private, temporary DuckDB or PostgreSQL session to perform analysis. Data is never sent to a server.",
    difficulty: "beginner",
    engines: ["duckdb", "postgres"],
    source: { kind: "blank" },
    bytes: 0,
    stats: { tables: 0, rows: 0 },
    credit: { label: "Local Data", url: "" },
  },
  {
    id: "cycledepot",
    name: "Cycle Depot",
    tagline: "A small, hand-built store. Loads instantly.",
    about:
      "Five tables generated in the browser, so there is nothing to download and nothing to wait for. Built for the fundamentals: joins, grouping, NULL handling and window functions, with deliberate quirks like customers who never ordered and line items priced below list.",
    difficulty: "beginner",
    engines: ["postgres", "duckdb"],
    source: { kind: "generated" },
    bytes: 0,
    stats: { tables: 5, rows: 507 },
    credit: { label: "Generated for this lab", url: "" },
  },
  {
    id: "bikestore",
    name: "Bike Store",
    tagline: "The classic teaching schema: two schemas, nine tables.",
    about:
      "A bicycle retailer with stores, staff, stock and orders, split across a production and a sales schema. Small enough to hold in your head, and the schema most SQL courses build their first joins on.",
    difficulty: "beginner",
    engines: ["postgres", "duckdb"],
    source: { kind: "csv", manifest: BIKESTORE_MANIFEST },
    bytes: BIKESTORE_MANIFEST.bytes,
    stats: { tables: BIKESTORE_MANIFEST.tables.length, rows: sumRows(BIKESTORE_MANIFEST) },
    credit: {
      label: "pltommasino/BikeStoreDB-SQL",
      url: "https://github.com/pltommasino/BikeStoreDB-SQL",
    },
  },
  {
    id: "adventureworks",
    name: "AdventureWorks",
    tagline: "Microsoft's reference OLTP database. 67 tables, 5 schemas.",
    about:
      "A fictional bicycle-parts wholesaler with roughly 20,000 customers and 31,000 sales orders averaging four line items each, spanning people, HR, production, purchasing and sales. Big enough that query plans start to matter and the difference between a good and a bad join order is visible.",
    difficulty: "intermediate",
    engines: ["postgres", "duckdb"],
    source: { kind: "csv", manifest: ADVENTUREWORKS_MANIFEST },
    bytes: ADVENTUREWORKS_MANIFEST.bytes,
    stats: {
      tables: ADVENTUREWORKS_MANIFEST.tables.length,
      rows: sumRows(ADVENTUREWORKS_MANIFEST),
    },
    credit: {
      label: "lorint/AdventureWorks-for-Postgres",
      url: "https://github.com/lorint/AdventureWorks-for-Postgres",
    },
    caveats: [
      "Every business row is here. Product photos, XML columns and password hashes were removed: they are 90% of the original download and teach nothing about SQL.",
    ],
  },
  {
    id: "olist",
    name: "Olist",
    tagline: "100k real Brazilian e-commerce orders, 2016 to 2018.",
    about:
      "Genuine marketplace data: orders with full delivery timestamps, payments, freight, sellers, products and customer reviews in Portuguese. The delivery timestamps are the draw, since they let you measure real lateness, not a synthetic status column.",
    difficulty: "intermediate",
    engines: ["postgres", "duckdb"],
    source: { kind: "csv", manifest: OLIST_MANIFEST },
    bytes: OLIST_MANIFEST.bytes,
    stats: { tables: OLIST_MANIFEST.tables.length, rows: sumRows(OLIST_MANIFEST) },
    credit: {
      label: "Olist via Kaggle",
      url: "https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce",
    },
    caveats: [
      "Complete public release: all nine source tables are included, including geolocation, with the original anonymized hash identifiers preserved.",
    ],
  },
  {
    id: "tpch",
    name: "TPC-H",
    tagline: "The industry decision-support benchmark, generated on the fly.",
    about:
      "Eight tables of synthetic wholesale data plus the 22 official benchmark queries: correlated subqueries, anti-joins, multi-level aggregation and the kind of query planners are built to fight. DuckDB generates it natively, so nothing is downloaded and you can raise the scale factor whenever you want more rows.",
    difficulty: "advanced",
    engines: ["duckdb"],
    source: { kind: "tpch", scaleFactor: 0.05 },
    bytes: 0,
    stats: { tables: 8, rows: 375_000 },
    credit: {
      label: "TPC-H specification",
      url: "https://www.tpc.org/tpch/",
    },
    caveats: [
      "DuckDB only. TPC-H is a columnar analytics benchmark, and its heavier queries are what a column store exists for.",
    ],
  },
];

export const DEFAULT_DATASET: DatasetId = "cycledepot";

export function getDataset(id: DatasetId): DatasetDef {
  const found = DATASETS.find((d) => d.id === id);
  if (!found) throw new Error(`Unknown dataset: ${id}`);
  return found;
}

export function datasetSupports(id: DatasetId, engine: Engine): boolean {
  return getDataset(id).engines.includes(engine);
}

/** Fully qualified name, quoted so reserved words and mixed case survive. */
export function qualify(table: ManifestTable): string {
  return table.schema && table.schema !== "public"
    ? `"${table.schema}"."${table.name}"`
    : `"${table.name}"`;
}

export function humanBytes(bytes: number): string {
  if (bytes === 0) return "no download";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function humanRows(rows: number): string {
  if (rows >= 1_000_000) return `${(rows / 1_000_000).toFixed(1)}M rows`;
  if (rows >= 1_000) return `${Math.round(rows / 1000)}k rows`;
  return `${rows} rows`;
}

export type { DatasetManifest, ManifestColumn, ManifestForeignKey, ManifestTable };
