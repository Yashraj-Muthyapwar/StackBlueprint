import { readFile } from "node:fs/promises";
import { download, parseCsv, writeTable, banner, mb } from "./lib.mjs";

const BASE = "https://raw.githubusercontent.com/pltommasino/BikeStoreDB-SQL/main/data";

/**
 * The classic Bike Store teaching schema: two schemas, nine tables, small
 * enough that a beginner can hold the whole thing in their head.
 */
const TABLES = [
  {
    schema: "production",
    name: "categories",
    csv: "categories.csv",
    columns: [
      ["category_id", "INTEGER", true],
      ["category_name", "VARCHAR(255)", true],
    ],
    primaryKey: ["category_id"],
  },
  {
    schema: "production",
    name: "brands",
    csv: "brands.csv",
    columns: [
      ["brand_id", "INTEGER", true],
      ["brand_name", "VARCHAR(255)", true],
    ],
    primaryKey: ["brand_id"],
  },
  {
    schema: "production",
    name: "products",
    csv: "products.csv",
    columns: [
      ["product_id", "INTEGER", true],
      ["product_name", "VARCHAR(255)", true],
      ["brand_id", "INTEGER", true],
      ["category_id", "INTEGER", true],
      ["model_year", "SMALLINT", true],
      ["list_price", "DECIMAL(10,2)", true],
    ],
    primaryKey: ["product_id"],
  },
  {
    schema: "sales",
    name: "customers",
    csv: "customers.csv",
    columns: [
      ["customer_id", "INTEGER", true],
      ["first_name", "VARCHAR(255)", true],
      ["last_name", "VARCHAR(255)", true],
      ["phone", "VARCHAR(25)", false],
      ["email", "VARCHAR(255)", true],
      ["street", "VARCHAR(255)", false],
      ["city", "VARCHAR(50)", false],
      ["state", "VARCHAR(25)", false],
      ["zip_code", "VARCHAR(5)", false],
    ],
    primaryKey: ["customer_id"],
  },
  {
    schema: "sales",
    name: "stores",
    csv: "stores.csv",
    columns: [
      ["store_id", "INTEGER", true],
      ["store_name", "VARCHAR(255)", true],
      ["phone", "VARCHAR(25)", false],
      ["email", "VARCHAR(255)", false],
      ["street", "VARCHAR(255)", false],
      ["city", "VARCHAR(255)", false],
      ["state", "VARCHAR(10)", false],
      ["zip_code", "VARCHAR(5)", false],
    ],
    primaryKey: ["store_id"],
  },
  {
    schema: "sales",
    name: "staffs",
    csv: "staffs.csv",
    columns: [
      ["staff_id", "INTEGER", true],
      ["first_name", "VARCHAR(50)", true],
      ["last_name", "VARCHAR(50)", true],
      ["email", "VARCHAR(255)", true],
      ["phone", "VARCHAR(25)", false],
      ["active", "SMALLINT", true],
      ["store_id", "INTEGER", true],
      ["manager_id", "INTEGER", false],
    ],
    primaryKey: ["staff_id"],
  },
  {
    schema: "sales",
    name: "orders",
    csv: "orders.csv",
    columns: [
      ["order_id", "INTEGER", true],
      ["customer_id", "INTEGER", false],
      ["order_status", "SMALLINT", true],
      ["order_date", "DATE", true],
      ["required_date", "DATE", true],
      ["shipped_date", "DATE", false],
      ["store_id", "INTEGER", true],
      ["staff_id", "INTEGER", true],
    ],
    primaryKey: ["order_id"],
  },
  {
    schema: "sales",
    name: "order_items",
    csv: "order_items.csv",
    columns: [
      ["order_id", "INTEGER", true],
      ["item_id", "INTEGER", true],
      ["product_id", "INTEGER", true],
      ["quantity", "INTEGER", true],
      ["list_price", "DECIMAL(10,2)", true],
      ["discount", "DECIMAL(4,2)", true],
    ],
    primaryKey: ["order_id", "item_id"],
  },
  {
    schema: "production",
    name: "stocks",
    csv: "stocks.csv",
    columns: [
      ["store_id", "INTEGER", true],
      ["product_id", "INTEGER", true],
      ["quantity", "INTEGER", false],
    ],
    primaryKey: ["store_id", "product_id"],
  },
];

const FOREIGN_KEYS = [
  ["production.products", ["brand_id"], "production.brands", ["brand_id"]],
  ["production.products", ["category_id"], "production.categories", ["category_id"]],
  ["production.stocks", ["store_id"], "sales.stores", ["store_id"]],
  ["production.stocks", ["product_id"], "production.products", ["product_id"]],
  ["sales.staffs", ["store_id"], "sales.stores", ["store_id"]],
  ["sales.staffs", ["manager_id"], "sales.staffs", ["staff_id"]],
  ["sales.orders", ["customer_id"], "sales.customers", ["customer_id"]],
  ["sales.orders", ["store_id"], "sales.stores", ["store_id"]],
  ["sales.orders", ["staff_id"], "sales.staffs", ["staff_id"]],
  ["sales.order_items", ["order_id"], "sales.orders", ["order_id"]],
  ["sales.order_items", ["product_id"], "production.products", ["product_id"]],
].map(([fromTable, fromColumns, toTable, toColumns]) => ({
  fromTable,
  fromColumns,
  toTable,
  toColumns,
}));

export async function buildBikeStore() {
  banner("Bike Store");

  const manifest = [];
  let totalBytes = 0;

  for (const table of TABLES) {
    const file = await download(`${BASE}/${table.csv}`, `bikestore-${table.csv}`);
    const rows = parseCsv(await readFile(file, "utf8"));

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const body = rows.slice(1).filter((r) => r.length >= header.length && r.some((c) => c !== ""));

    // Map by header name so a column reordering upstream cannot corrupt the load.
    const index = table.columns.map(([name]) => {
      const at = header.indexOf(name);
      if (at === -1) throw new Error(`${table.name}: source is missing column "${name}"`);
      return at;
    });

    const out = body.map((r) =>
      index.map((at, col) => {
        const value = (r[at] ?? "").trim();
        // The source writes NULL for absent ship dates and phone numbers.
        if (value === "NULL" || value === "\\N") return "";
        if (/DATE/i.test(table.columns[col][1])) return value.slice(0, 10);
        return value;
      }),
    );

    const key = `${table.schema}.${table.name}`;
    const stats = await writeTable(
      "bikestore",
      key.replace(".", "__"),
      table.columns.map((c) => c[0]),
      out,
    );
    totalBytes += stats.bytes;

    manifest.push({
      schema: table.schema,
      name: table.name,
      file: `${key.replace(".", "__")}.csv.gz`,
      columns: table.columns.map(([name, type, notNull]) => ({ name, type, notNull })),
      primaryKey: table.primaryKey,
      rows: stats.rows,
      bytes: stats.bytes,
    });
  }

  console.log(
    `  ${manifest.length} tables · ${manifest.reduce((s, t) => s + t.rows, 0).toLocaleString()} rows · ${mb(totalBytes)} gzipped`,
  );

  return {
    id: "bikestore",
    schemas: ["production", "sales"],
    tables: manifest,
    foreignKeys: FOREIGN_KEYS,
    bytes: totalBytes,
  };
}
