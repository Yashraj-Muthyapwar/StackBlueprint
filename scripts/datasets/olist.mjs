import { readFile } from "node:fs/promises";
import path from "node:path";
import { download, parseCsv, writeRawCsv, banner, mb } from "./lib.mjs";

const BASE = "https://raw.githubusercontent.com/tunguyenn99/ecommerce-data-modeling/main/dataset";

/**
 * Olist's complete public release: real Brazilian e-commerce orders,
 * 2016-2018. The output retains the original source CSVs, including the
 * geolocation table and anonymous hash identifiers.
 */
const TABLES = [
  {
    name: "geolocation",
    csv: "olist_geolocation_dataset.csv",
    columns: [
      ["geolocation_zip_code_prefix", "INTEGER", true],
      ["geolocation_lat", "DECIMAL(11,8)", true],
      ["geolocation_lng", "DECIMAL(11,8)", true],
      ["geolocation_city", "VARCHAR(64)", true],
      ["geolocation_state", "VARCHAR(2)", true],
    ],
    primaryKey: [],
  },
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

export async function buildOlist({ sourceDir } = {}) {
  banner("Olist (complete public release)");

  const manifest = [];
  let totalBytes = 0;

  for (const table of TABLES) {
    const file = sourceDir
      ? path.join(sourceDir, table.csv)
      : await download(`${BASE}/${table.csv}`, `olist-${table.csv}`);
    const source = await readFile(file);
    const rows = parseCsv(source.toString("utf8"));

    const header = rows[0].map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const index = table.columns.map(([name]) => {
      const at = header.indexOf(name);
      if (at === -1) throw new Error(`olist ${table.name}: source is missing "${name}"`);
      return at;
    });

    const body = rows.slice(1).filter((r) => r.length >= header.length);
    const columns = table.columns.map(([name, type, notNull]) => ({ name, type, notNull }));
    const stats = await writeRawCsv("olist", table.csv, source, body.length);
    totalBytes += stats.bytes;

    manifest.push({
      schema: "public",
      name: table.name,
      file: `${table.csv}.gz`,
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
