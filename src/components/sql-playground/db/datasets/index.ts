import type { Engine } from "../db-client";
import {
  ERGAST_MANIFEST,
  MARVEL_MANIFEST,
  OLIST_MANIFEST,
  COSMETICS_48H_MANIFEST,
  SQL_LAB_MANIFEST,
  type DatasetManifest,
  type ManifestColumn,
  type ManifestForeignKey,
  type ManifestTable,
} from "./manifest.generated";

export type DatasetId = "cosmetics_48h" | "cycledepot" | "ergast" | "marvel" | "olist" | "sql_lab" | "my-workspace";

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
  | { kind: "csv"; manifest: DatasetManifest };
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
    id: "ergast",
    name: "Ergast Formula 1",
    tagline: "Formula 1 race data through the 2024 season. 14 linked tables.",
    about:
      "A historical Formula 1 archive spanning 1950 through 2024. Follow drivers, constructors, circuits, qualifying, pit stops, results and more, with enough lap-level data to make analytical queries and query plans meaningful.",
    difficulty: "intermediate",
    engines: ["postgres", "duckdb"],
    source: { kind: "csv", manifest: ERGAST_MANIFEST },
    bytes: ERGAST_MANIFEST.bytes,
    stats: {
      tables: ERGAST_MANIFEST.tables.length,
      rows: sumRows(ERGAST_MANIFEST),
    },
    credit: {
      label: "Ergast Developer API",
      url: "https://ergast.com/mrd/",
    },
    caveats: [
      "The supplied snapshot ends with the 2024 season. Identifiers are normalized to lower snake_case for portable, unquoted SQL in both engines.",
    ],
  },
  {
    id: "marvel",
    name: "Marvel Character Networks",
    tagline: "1,491 characters and 205k supplied co-appearance links.",
    about:
      "A supplied historical Marvel visualization snapshot: character co-appearance networks across comics, series and stories, plus MCU, Netflix and X-Men screen-title casts. The original JSON files ship alongside SQL-ready projections of their arrays.",
    difficulty: "intermediate",
    engines: ["postgres", "duckdb"],
    source: { kind: "csv", manifest: MARVEL_MANIFEST },
    bytes: MARVEL_MANIFEST.bytes,
    stats: { tables: MARVEL_MANIFEST.tables.length, rows: sumRows(MARVEL_MANIFEST) },
    credit: { label: "Supplied Marvel data snapshot", url: "" },
    caveats: [
      "The snapshot has no publisher metadata in its supplied folder. Source JSON is preserved unchanged under the deployed dataset; SQL tables only flatten its arrays and add positional keys.",
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
    id: "cosmetics_48h",
    name: "eCommerce Events History in Cosmetics Shop",
    tagline: "48-hour January 2020 slice: 184k real store events.",
    about: "184,099 Cosmetics Shop events from a 48-hour January 2020 Kaggle slice.",
    difficulty: "intermediate",
    engines: ["postgres", "duckdb"],
    source: { kind: "csv", manifest: COSMETICS_48H_MANIFEST },
    bytes: COSMETICS_48H_MANIFEST.bytes,
    stats: { tables: COSMETICS_48H_MANIFEST.tables.length, rows: sumRows(COSMETICS_48H_MANIFEST) },
    credit: {
      label: "Kaggle: eCommerce Events History in Cosmetics Shop",
      url: "https://www.kaggle.com/datasets/mkechinov/ecommerce-events-history-in-cosmetics-shop",
    },
    caveats: [
      "48-hour UTC slice: 2020-01-01 00:00 to 2020-01-03 00:00; not the full Kaggle dataset.",
    ],
  },
  {
    id: "sql_lab",
    name: "ShopFlow SQL Lab",
    tagline: "Synthetic online-store operations for SQL engineering.",
    about:
      "A deterministic, production-style store database for practicing schema design, constraints, indexes, plans, transactions, views, and recursive SQL.",
    difficulty: "advanced",
    engines: ["postgres", "duckdb"],
    source: { kind: "csv", manifest: SQL_LAB_MANIFEST },
    bytes: SQL_LAB_MANIFEST.bytes,
    stats: { tables: SQL_LAB_MANIFEST.tables.length, rows: sumRows(SQL_LAB_MANIFEST) },
    credit: { label: "Generated for the SQL Playground", url: "" },
    caveats: [
      "Synthetic, deterministic data (seed 42). Both engines share the schema; inspect plans and behavior instead of assuming they match.",
    ],
  }
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
