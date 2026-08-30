import { readFile } from "node:fs/promises";
import { download, parseCsv, writeTable, banner, mb } from "./lib.mjs";

const BASE = "https://raw.githubusercontent.com/tunguyenn99/ecommerce-data-modeling/main/dataset";

/**
 * Olist: ~100k real Brazilian e-commerce orders, 2016-2018.
 *
 * The geolocation table is deliberately left out. It is a million rows of
 * lat/long noise, over half the download, and none of the SQL it teaches is
 * anything the other seven tables do not already cover.
 */
const TABLES = [
  {
    name: "customers",
    csv: "olist_customers_dataset.csv",
    columns: [
      ["customer_id", "VARCHAR(32)", true],
      ["customer_unique_id", "VARCHAR(32)", true],
      ["customer_zip_code_prefix", "INTEGER", true],
      ["customer_city", "VARCHAR(64)", true],
      ["customer_state", "VARCHAR(2)", true],
    ],
    primaryKey: ["customer_id"],
  },
  {
    name: "sellers",
    csv: "olist_sellers_dataset.csv",
    columns: [
      ["seller_id", "VARCHAR(32)", true],
      ["seller_zip_code_prefix", "INTEGER", true],
      ["seller_city", "VARCHAR(64)", true],
      ["seller_state", "VARCHAR(2)", true],
    ],
    primaryKey: ["seller_id"],
  },
  {
    name: "products",
    csv: "olist_products_dataset.csv",
    columns: [
      ["product_id", "VARCHAR(32)", true],
      ["product_category_name", "VARCHAR(64)", false],
      ["product_name_lenght", "INTEGER", false],
      ["product_description_lenght", "INTEGER", false],
      ["product_photos_qty", "INTEGER", false],
      ["product_weight_g", "INTEGER", false],
      ["product_length_cm", "INTEGER", false],
      ["product_height_cm", "INTEGER", false],
      ["product_width_cm", "INTEGER", false],
    ],
    primaryKey: ["product_id"],
  },
  {
    name: "product_category_translation",
    csv: "product_category_name_translation.csv",
    columns: [
      ["product_category_name", "VARCHAR(64)", true],
      ["product_category_name_english", "VARCHAR(64)", true],
    ],
    primaryKey: ["product_category_name"],
  },
  {
    name: "orders",
    csv: "olist_orders_dataset.csv",
    columns: [
      ["order_id", "VARCHAR(32)", true],
      ["customer_id", "VARCHAR(32)", true],
      ["order_status", "VARCHAR(16)", true],
      ["order_purchase_timestamp", "TIMESTAMP", true],
      ["order_approved_at", "TIMESTAMP", false],
      ["order_delivered_carrier_date", "TIMESTAMP", false],
      ["order_delivered_customer_date", "TIMESTAMP", false],
      ["order_estimated_delivery_date", "TIMESTAMP", false],
    ],
    primaryKey: ["order_id"],
  },
  {
    name: "order_items",
    csv: "olist_order_items_dataset.csv",
    columns: [
      ["order_id", "VARCHAR(32)", true],
      ["order_item_id", "INTEGER", true],
      ["product_id", "VARCHAR(32)", true],
      ["seller_id", "VARCHAR(32)", true],
      ["shipping_limit_date", "TIMESTAMP", true],
      ["price", "DECIMAL(10,2)", true],
      ["freight_value", "DECIMAL(10,2)", true],
    ],
    primaryKey: ["order_id", "order_item_id"],
  },
  {
    name: "order_payments",
    csv: "olist_order_payments_dataset.csv",
    columns: [
      ["order_id", "VARCHAR(32)", true],
      ["payment_sequential", "INTEGER", true],
      ["payment_type", "VARCHAR(24)", true],
      ["payment_installments", "INTEGER", true],
      ["payment_value", "DECIMAL(10,2)", true],
    ],
    primaryKey: ["order_id", "payment_sequential"],
  },
  {
    name: "order_reviews",
    csv: "olist_order_reviews_dataset.csv",
    columns: [
      ["review_id", "VARCHAR(32)", true],
      ["order_id", "VARCHAR(32)", true],
      ["review_score", "INTEGER", true],
      ["review_comment_title", "VARCHAR(128)", false],
      ["review_comment_message", "TEXT", false],
      ["review_creation_date", "TIMESTAMP", true],
      ["review_answer_timestamp", "TIMESTAMP", true],
    ],
    // review_id repeats in the source, so it is not a usable key on its own.
    primaryKey: [],
  },
];

const FOREIGN_KEYS = [
  ["orders", ["customer_id"], "customers", ["customer_id"]],
  ["order_items", ["order_id"], "orders", ["order_id"]],
  ["order_items", ["product_id"], "products", ["product_id"]],
  ["order_items", ["seller_id"], "sellers", ["seller_id"]],
  ["order_payments", ["order_id"], "orders", ["order_id"]],
  ["order_reviews", ["order_id"], "orders", ["order_id"]],
  [
    "products",
    ["product_category_name"],
    "product_category_translation",
    ["product_category_name"],
  ],
].map(([fromTable, fromColumns, toTable, toColumns]) => ({
  fromTable: `public.${fromTable}`,
  fromColumns,
  toTable: `public.${toTable}`,
  toColumns,
}));

/**
 * Every id in Olist is an opaque 32-character hex hash. Random hex does not
 * compress, so those columns alone are ~22 MB of the 26 MB download while
 * carrying no information: they are surrogate keys, and their values mean
 * nothing outside the join.
 *
 * With `ids: "int"` each distinct hash is mapped to a stable integer, shared
 * across every table so all foreign keys still line up. Row counts, columns and
 * relationships are untouched; only the key representation changes.
 * `ids: "hash"` keeps the original strings, byte for byte.
 */
const ID_COLUMNS = new Set([
  "customer_id",
  "customer_unique_id",
  "seller_id",
  "product_id",
  "order_id",
  "review_id",
]);

function makeIdPool() {
  const pools = new Map();
  return (column, value) => {
    if (value === "") return "";
    // customer_id and customer_unique_id index the same person space; keep the
    // rest in their own namespaces so ids stay small and readable.
    const space = column === "customer_unique_id" ? "customer_unique_id" : column;
    let pool = pools.get(space);
    if (!pool) {
      pool = new Map();
      pools.set(space, pool);
    }
    let mapped = pool.get(value);
    if (mapped === undefined) {
      mapped = pool.size + 1;
      pool.set(value, mapped);
    }
    return String(mapped);
  };
}

export async function buildOlist({ ids = "int" } = {}) {
  banner(`Olist (${ids} ids)`);

  const manifest = [];
  let totalBytes = 0;
  const compact = ids === "int";
  const mapId = makeIdPool();

  for (const table of TABLES) {
    const file = await download(`${BASE}/${table.csv}`, `olist-${table.csv}`);
    const rows = parseCsv(await readFile(file, "utf8"));

    const header = rows[0].map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const index = table.columns.map(([name]) => {
      const at = header.indexOf(name);
      if (at === -1) throw new Error(`olist ${table.name}: source is missing "${name}"`);
      return at;
    });

    const body = rows.slice(1).filter((r) => r.length >= header.length);
    const out = body.map((r) =>
      index.map((at, col) => {
        const [name, type] = table.columns[col];
        let value = (r[at] ?? "").trim();
        if (value === "NULL" || value === "\\N") return "";
        // Review text carries raw newlines; keep them but collapse the CRs.
        if (type === "TEXT") value = value.replace(/\r/g, "");
        if (compact && ID_COLUMNS.has(name)) return mapId(name, value);
        return value;
      }),
    );

    const columns = table.columns.map(([name, type, notNull]) => ({
      name,
      type: compact && ID_COLUMNS.has(name) ? "INTEGER" : type,
      notNull,
    }));

    const stats = await writeTable(
      "olist",
      table.name,
      columns.map((c) => c.name),
      out,
    );
    totalBytes += stats.bytes;

    manifest.push({
      schema: "public",
      name: table.name,
      file: `${table.name}.csv.gz`,
      columns,
      primaryKey: table.primaryKey,
      rows: stats.rows,
      bytes: stats.bytes,
    });
  }

  console.log(
    `  ${manifest.length} tables · ${manifest.reduce((s, t) => s + t.rows, 0).toLocaleString()} rows · ${mb(totalBytes)} gzipped`,
  );

  return {
    id: "olist",
    schemas: [],
    tables: manifest,
    foreignKeys: FOREIGN_KEYS,
    bytes: totalBytes,
  };
}
