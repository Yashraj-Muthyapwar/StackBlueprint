import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileCode2,
  Layers,
  Search,
  Server,
  Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const r = (key: string | number, ...cells: (string | number | null)[]): Row => ({ key, cells });

const st = (
  activeLines: number[],
  rowState: ((row: Row, i: number) => RowState | undefined) | RowState,
  note: string,
  extra: Partial<StageStep> = {},
): StageStep => ({
  activeLines,
  note,
  rowState: typeof rowState === "function" ? rowState : () => rowState,
  ...extra,
});

export function sidePanel(
  title: string,
  points: string[],
  tone: Tone = "violet",
  icon?: LucideIcon,
) {
  return { title, points, tone, icon };
}

const dwDataJourney: Stage[] = [
  {
    name: "1. Source",
    sql: ["-- Mobile apps, IoT sensors, Smart devices generating events"],
    table: {
      name: "Events",
      cols: ["event_type", "payload"],
      rows: [r(1, "click", '{"btn": "checkout"}')],
    },
    steps: [st([0], "kept", "Data is generated at the source.")],
  },
  {
    name: "2. Collect",
    sql: ["-- Raw data ingested into message brokers or staging databases"],
    table: {
      name: "Kafka Topic",
      cols: ["offset", "msg"],
      rows: [r(1, 101, '{"btn": "checkout"}')],
    },
    steps: [st([0], "kept", "Captured in real-time or batches.")],
  },
  {
    name: "3. Process (ETL)",
    sql: ["-- Extract, Transform, Load (Clean & Enrich)"],
    table: { name: "Processed", cols: ["user_id", "action"], rows: [r(1, 42, "checkout")] },
    steps: [st([0], "kept", "Data is structured and cleaned.")],
  },
  {
    name: "4. Store",
    sql: ["-- Data Warehouse or Lakehouse"],
    table: { name: "Fact Table", cols: ["date", "sales"], rows: [r(1, "2026-06-28", 1500)] },
    steps: [st([0], "kept", "Stored in analytics-optimized format.")],
  },
  {
    name: "5. Consume",
    sql: ["SELECT sum(sales) FROM fact_table;"],
    table: { name: "Dashboard", cols: ["total_revenue"], rows: [r(1, 1500)] },
    steps: [st([0], "kept", "Powering BI and ML models.")],
  },
];

const dwOltpVsOlap: Stage[] = [
  {
    name: "OLTP (Running the Business)",
    sql: ["INSERT INTO orders (user, total) VALUES (1, 50);"],
    table: { name: "operational_db", cols: ["id", "user", "total"], rows: [r(1, 1, 1, 50)] },
    steps: [
      st([0], "kept", "Fast, simple reads/writes. Optimised for thousands of concurrent users.", {
        noteTone: "mint",
      }),
    ],
  },
  {
    name: "OLAP (Analyzing the Business)",
    sql: ["SELECT region, SUM(total) FROM orders GROUP BY region;"],
    table: { name: "analytical_db", cols: ["region", "revenue"], rows: [r(1, "US", 500000)] },
    steps: [
      st([0], "kept", "Complex queries over huge historical datasets. Optimised for reporting.", {
        noteTone: "violet",
      }),
    ],
  },
];

const dwStorageTypes: Stage[] = [
  {
    name: "Data Warehouse",
    sql: ["-- Schema-on-write, highly structured"],
    table: { name: "Library", cols: ["structured_data", "bi_ready"], rows: [r(1, "Yes", "Yes")] },
    steps: [st([0], "kept", "Expensive but fast. Best for BI.")],
  },
  {
    name: "Data Lake",
    sql: ["-- Schema-on-read, raw storage"],
    table: {
      name: "Garage",
      cols: ["files", "logs", "images"],
      rows: [r(1, "JSON", "text", "png")],
    },
    steps: [st([0], "kept", "Cheap storage for all data types. Great for ML.")],
  },
  {
    name: "Data Lakehouse",
    sql: ["-- Combines Warehouse reliability with Lake flexibility"],
    table: { name: "Workshop", cols: ["acid_trans", "cheap_storage"], rows: [r(1, "Yes", "Yes")] },
    steps: [
      st(
        [0],
        "kept",
        "The modern standard: open formats (Iceberg, Delta) on cheap object storage.",
      ),
    ],
  },
];

const dwOrganizingData: Stage[] = [
  {
    name: "Data Mart",
    sql: ["-- A dedicated slice of the warehouse for one team"],
    table: { name: "marketing_mart", cols: ["campaign", "clicks"], rows: [r(1, "Summer", 400)] },
    steps: [st([0], "kept", "A departmental bookshelf.")],
  },
  {
    name: "Data Mesh",
    sql: ["-- Decentralized ownership (Domain-Driven)"],
    table: {
      name: "data_products",
      cols: ["domain", "owner"],
      rows: [r(1, "Finance", "finance_team"), r(2, "Ops", "ops_team")],
    },
    steps: [st([0], "kept", "A cultural shift: each team treats data as a product.")],
  },
  {
    name: "Data Fabric",
    sql: ["-- Universal metadata layer connecting silos"],
    table: { name: "virtual_layer", cols: ["source1", "source2"], rows: [r(1, "AWS", "On-Prem")] },
    steps: [st([0], "kept", "An architectural layer linking disparate systems.")],
  },
];

const dwDatabaseFamilies: Stage[] = [
  {
    name: "Relational (SQL)",
    sql: ["SELECT * FROM users JOIN orders;"],
    table: { name: "SQL", cols: ["ACID", "Schema"], rows: [r(1, "Strong", "Rigid")] },
    steps: [st([0], "kept", "The default for transactional integrity.")],
  },
  {
    name: "Document (NoSQL)",
    sql: ["db.collection.find({ 'user': 'ada' })"],
    table: { name: "MongoDB", cols: ["id", "json_blob"], rows: [r(1, "doc1", "{...}")] },
    steps: [st([0], "kept", "Flexible schemas, great for rapid iteration.")],
  },
  {
    name: "Specialized",
    sql: ["-- Key-Value (Redis), Graph (Neo4j), Vector (Pinecone)"],
    table: {
      name: "Special",
      cols: ["type", "use_case"],
      rows: [r(1, "Vector", "AI/RAG"), r(2, "Graph", "Fraud")],
    },
    steps: [st([0], "kept", "Purpose-built engines for specific workloads.")],
  },
];

const dwStorageComputeSeparation: Stage[] = [
  {
    name: "1. Traditional (Coupled)",
    sql: ["-- On-premise architecture: Compute + Storage tied together", "SELECT * FROM sales;"],
    table: { name: "Server Node", cols: ["CPU", "Storage"], rows: [r(1, "90%", "Full")] },
    steps: [st([0, 1], "kept", "If you need more storage, you must buy more CPU too.")],
  },
  {
    name: "2. Cloud Storage (Decoupled)",
    sql: ["-- Infinite, cheap cloud object storage (e.g. AWS S3)", "-- Data is centralized here"],
    table: {
      name: "Cloud Storage",
      cols: ["Bucket", "Data Size"],
      rows: [r(1, "s3://warehouse", "Petabytes")],
    },
    steps: [st([0, 1], "kept", "Storage is isolated and scales infinitely at low cost.")],
  },
  {
    name: "3. Cloud Compute (Decoupled)",
    sql: [
      "-- Virtual Warehouses spun up on-demand to query the storage",
      "CREATE WAREHOUSE marketing_wh;",
    ],
    table: { name: "Compute Cluster", cols: ["Status", "Cost"], rows: [r(1, "Running", "$/hour")] },
    steps: [st([0, 1], "kept", "Compute is only paid for when running.")],
  },
  {
    name: "4. Multi-Cluster",
    sql: [
      "-- Multiple teams query the exact same storage simultaneously",
      "USE WAREHOUSE finance_wh; SELECT * FROM s3_data;",
    ],
    table: {
      name: "Active Clusters",
      cols: ["Team", "Query"],
      rows: [r(1, "Finance", "SELECT..."), r(2, "Marketing", "SELECT...")],
    },
    steps: [st([0, 1], "kept", "No resource contention between teams.")],
  },
];

export const STAGES_REGISTRY: Record<string, Stage[]> = {
  "dw-data-journey": dwDataJourney,
  "dw-oltp-vs-olap": dwOltpVsOlap,
  "dw-storage-types": dwStorageTypes,
  "dw-organizing-data": dwOrganizingData,
  "dw-database-families": dwDatabaseFamilies,
  "dw-storage-compute-separation": dwStorageComputeSeparation,
};

export type AnyVariant = keyof typeof STAGES_REGISTRY;
