/**
 * The "Cycle Depot" dataset.
 *
 * One deterministic commerce dataset, expressed in SQL that both PGlite
 * (PostgreSQL) and DuckDB accept without modification. That is the whole point:
 * the same rows, the same queries, two engines, so the only thing that changes
 * when you flip engines is the dialect and the plan.
 *
 * Rows are generated from a seeded PRNG so every visitor sees identical numbers
 * and the guided queries always return the same answers.
 */

/** mulberry32: tiny deterministic PRNG. Same seed, same dataset, forever. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(r: () => number, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

/** Weighted pick: [value, weight][] */
function weighted<T>(r: () => number, xs: readonly (readonly [T, number])[]): T {
  const total = xs.reduce((s, x) => s + x[1], 0);
  let n = r() * total;
  for (const [v, w] of xs) {
    n -= w;
    if (n <= 0) return v;
  }
  return xs[xs.length - 1][0];
}

const q = (s: string | null) => (s === null ? "NULL" : `'${s.replace(/'/g, "''")}'`);
const money = (n: number) => n.toFixed(2);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

// ---------------------------------------------------------------- DDL

export const DDL = `
CREATE TABLE customers (
  id          INTEGER PRIMARY KEY,
  name        VARCHAR NOT NULL,
  email       VARCHAR NOT NULL,
  city        VARCHAR,
  country     VARCHAR NOT NULL,
  segment     VARCHAR NOT NULL,
  signup_date DATE    NOT NULL
);

CREATE TABLE products (
  id       INTEGER PRIMARY KEY,
  name     VARCHAR       NOT NULL,
  category VARCHAR       NOT NULL,
  price    DECIMAL(10,2) NOT NULL,
  cost     DECIMAL(10,2) NOT NULL,
  in_stock INTEGER       NOT NULL
);

CREATE TABLE orders (
  id           INTEGER PRIMARY KEY,
  customer_id  INTEGER NOT NULL,
  order_date   DATE    NOT NULL,
  shipped_date DATE,
  status       VARCHAR NOT NULL,
  channel      VARCHAR NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE TABLE order_items (
  id         INTEGER PRIMARY KEY,
  order_id   INTEGER       NOT NULL,
  product_id INTEGER       NOT NULL,
  quantity   INTEGER       NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE employees (
  id         INTEGER PRIMARY KEY,
  name       VARCHAR       NOT NULL,
  role       VARCHAR       NOT NULL,
  manager_id INTEGER,
  store_city VARCHAR       NOT NULL,
  hired_on   DATE          NOT NULL,
  salary     DECIMAL(10,2) NOT NULL
);
`;

// ---------------------------------------------------------------- source data

const FIRST = [
  "Amara",
  "Ben",
  "Chloe",
  "Dev",
  "Elena",
  "Farid",
  "Grace",
  "Hana",
  "Ivan",
  "Jade",
  "Kwame",
  "Lena",
  "Mateo",
  "Nadia",
  "Omar",
  "Priya",
  "Quinn",
  "Rosa",
  "Sami",
  "Tara",
  "Ugo",
  "Vera",
  "Wes",
  "Xin",
  "Yara",
  "Zane",
  "Aiko",
  "Boris",
  "Carmen",
  "Dmitri",
];
const LAST = [
  "Okafor",
  "Hall",
  "Nguyen",
  "Patel",
  "Rossi",
  "Haddad",
  "Kim",
  "Sato",
  "Petrov",
  "Silva",
  "Mensah",
  "Novak",
  "Reyes",
  "Aziz",
  "Farouk",
  "Sharma",
  "Doyle",
  "Alvarez",
  "Yilmaz",
  "Bhatt",
];
const PLACES = [
  ["Austin", "USA"],
  ["Dallas", "USA"],
  ["Portland", "USA"],
  ["Chicago", "USA"],
  ["Denver", "USA"],
  ["Seattle", "USA"],
  ["Toronto", "Canada"],
  ["Vancouver", "Canada"],
  ["Berlin", "Germany"],
  ["Munich", "Germany"],
  ["Lyon", "France"],
  ["Paris", "France"],
  ["Bristol", "UK"],
  ["Manchester", "UK"],
  ["Bengaluru", "India"],
  ["Pune", "India"],
] as const;
const SEGMENTS = [
  ["retail", 6],
  ["pro", 2],
  ["wholesale", 1],
] as const;

const PRODUCTS: readonly (readonly [string, string, number, number])[] = [
  ["Trailhead 29 Hardtail", "Mountain Bikes", 1299.0, 780.0],
  ["Trailhead 29 Carbon", "Mountain Bikes", 2450.0, 1520.0],
  ["Boulder Full Suspension", "Mountain Bikes", 3199.0, 2010.0],
  ["Switchback Enduro", "Mountain Bikes", 4150.0, 2680.0],
  ["Meridian Road Alloy", "Road Bikes", 1150.0, 690.0],
  ["Meridian Road Carbon", "Road Bikes", 2890.0, 1770.0],
  ["Aero Sprint Pro", "Road Bikes", 5400.0, 3450.0],
  ["Gravel Runner GX", "Road Bikes", 1980.0, 1210.0],
  ["City Commuter 7", "City Bikes", 720.0, 415.0],
  ["City Commuter Step-Thru", "City Bikes", 690.0, 398.0],
  ["Volt E-Commuter", "City Bikes", 2260.0, 1490.0],
  ["Volt E-Cargo", "City Bikes", 3890.0, 2560.0],
  ["Shellcap Road Helmet", "Helmets", 129.0, 62.0],
  ["Shellcap MIPS Pro", "Helmets", 219.0, 108.0],
  ["Kidsafe Helmet", "Helmets", 59.0, 24.0],
  ["Thermal Bib Tights", "Apparel", 149.0, 68.0],
  ["Featherweight Jersey", "Apparel", 89.0, 32.0],
  ["Stormshell Rain Jacket", "Apparel", 189.0, 84.0],
  ["Grip Gloves", "Apparel", 45.0, 17.0],
  ["Hydraulic Disc Brake Set", "Components", 340.0, 195.0],
  ["11-Speed Cassette", "Components", 128.0, 71.0],
  ["Carbon Seatpost", "Components", 210.0, 118.0],
  ["Tubeless Tire Pair", "Components", 118.0, 54.0],
  ["Alloy Handlebar", "Components", 96.0, 44.0],
  ["Torque Wrench Kit", "Accessories", 84.0, 38.0],
  ["Frame Pump", "Accessories", 39.0, 14.0],
  ["Insulated Bottle", "Accessories", 28.0, 9.0],
  ["Rear Pannier Rack", "Accessories", 74.0, 33.0],
  ["1200lm Front Light", "Accessories", 92.0, 41.0],
  ["GPS Cycling Computer", "Accessories", 349.0, 196.0],
];

const STATUS = [
  ["delivered", 11],
  ["shipped", 4],
  ["pending", 3],
  ["cancelled", 2],
  ["returned", 1],
] as const;
const CHANNEL = [
  ["web", 6],
  ["store", 3],
  ["partner", 1],
] as const;

const EMPLOYEES: readonly (readonly [
  number,
  string,
  string,
  number | null,
  string,
  string,
  number,
])[] = [
  [1, "Marta Kowalski", "CEO", null, "Austin", "2016-02-01", 210000],
  [2, "Deni Whitfield", "VP Retail", 1, "Austin", "2017-05-15", 168000],
  [3, "Rahul Menon", "VP Operations", 1, "Denver", "2017-09-04", 165000],
  [4, "Sofia Duarte", "Store Manager", 2, "Austin", "2018-03-19", 112000],
  [5, "Tom Riedel", "Store Manager", 2, "Portland", "2019-01-07", 108000],
  [6, "Anika Bose", "Store Manager", 2, "Chicago", "2019-06-24", 110000],
  [7, "Luis Ferrer", "Mechanic", 4, "Austin", "2020-02-10", 64000],
  [8, "Greta Lund", "Mechanic", 4, "Austin", "2021-08-02", 61000],
  [9, "Peter Osei", "Sales Associate", 5, "Portland", "2021-11-15", 52000],
  [10, "Yuki Tanabe", "Sales Associate", 5, "Portland", "2022-04-01", 51000],
  [11, "Hassan Bakr", "Warehouse Lead", 3, "Denver", "2020-07-20", 78000],
  [12, "Iris Cardoso", "Warehouse Associate", 11, "Denver", "2022-09-12", 47000],
];

// ---------------------------------------------------------------- generation

/** Emits `INSERT INTO t (...) VALUES (...),(...);` in batches so no single statement gets huge. */
function insertBatches(table: string, cols: string[], rows: string[][], batch = 80): string[] {
  const out: string[] = [];
  for (let i = 0; i < rows.length; i += batch) {
    const chunk = rows.slice(i, i + batch);
    out.push(
      `INSERT INTO ${table} (${cols.join(", ")}) VALUES\n` +
        chunk.map((r) => `  (${r.join(", ")})`).join(",\n") +
        ";",
    );
  }
  return out;
}

export interface DatasetTableInfo {
  name: string;
  rows: number;
  blurb: string;
}

let cached: { statements: string[]; tables: DatasetTableInfo[] } | null = null;

/** Build the full seed script. Cached: generation is deterministic, so once is enough. */
export function buildSeed(): { statements: string[]; tables: DatasetTableInfo[] } {
  if (cached) return cached;

  const r = rng(20240817);
  const START = new Date("2023-01-02T00:00:00Z");

  // -- customers ----------------------------------------------------------
  const CUSTOMER_COUNT = 60;
  const customers: string[][] = [];
  for (let id = 1; id <= CUSTOMER_COUNT; id++) {
    const first = pick(r, FIRST);
    const last = pick(r, LAST);
    const [city, country] = pick(r, PLACES);
    // A few customers never filled in a city. NULL handling has to be teachable.
    const cityVal = r() < 0.07 ? null : city;
    const signup = addDays(START, between(r, 0, 540));
    customers.push([
      String(id),
      q(`${first} ${last}`),
      q(`${first.toLowerCase()}.${last.toLowerCase()}${id}@example.com`),
      q(cityVal),
      q(country),
      q(weighted(r, SEGMENTS)),
      q(iso(signup)),
    ]);
  }

  // -- products -----------------------------------------------------------
  const products = PRODUCTS.map((p, i) => [
    String(i + 1),
    q(p[0]),
    q(p[1]),
    money(p[2]),
    money(p[3]),
    String(between(r, 0, 140)),
  ]);

  // -- orders + order_items ----------------------------------------------
  // Customers 1..48 order; 49..60 never do, so LEFT JOIN ... IS NULL has a real answer.
  const ORDERING_CUSTOMERS = 48;
  const orders: string[][] = [];
  const items: string[][] = [];
  let itemId = 1;
  let orderId = 1;

  for (let c = 1; c <= ORDERING_CUSTOMERS; c++) {
    // Pro and wholesale buyers order more; approximate that with a skewed count.
    const n = weighted(r, [
      [1, 4],
      [2, 5],
      [3, 4],
      [4, 3],
      [5, 2],
      [6, 1],
      [8, 1],
    ] as const);
    for (let k = 0; k < n; k++) {
      const placed = addDays(START, between(r, 120, 900));
      const status = weighted(r, STATUS);
      const shipped =
        status === "delivered" || status === "shipped" || status === "returned"
          ? iso(addDays(placed, between(r, 1, 9)))
          : null;

      orders.push([
        String(orderId),
        String(c),
        q(iso(placed)),
        q(shipped),
        q(status),
        q(weighted(r, CHANNEL)),
      ]);

      // 1..4 distinct products per order
      const lineCount = weighted(r, [
        [1, 5],
        [2, 4],
        [3, 2],
        [4, 1],
      ] as const);
      const used = new Set<number>();
      for (let l = 0; l < lineCount; l++) {
        let pid = between(r, 1, PRODUCTS.length);
        let guard = 0;
        while (used.has(pid) && guard++ < 8) pid = between(r, 1, PRODUCTS.length);
        used.add(pid);

        const list = PRODUCTS[pid - 1][2];
        // Bikes sell one at a time; accessories go out in handfuls.
        const heavy = list > 600;
        const qty = heavy
          ? 1
          : weighted(r, [
              [1, 6],
              [2, 3],
              [3, 2],
              [4, 1],
            ] as const);
        // Occasional discount so unit_price != products.price is a real lesson.
        const discount = r() < 0.22 ? [0.05, 0.1, 0.15][between(r, 0, 2)] : 0;

        items.push([
          String(itemId++),
          String(orderId),
          String(pid),
          String(qty),
          money(list * (1 - discount)),
        ]);
      }
      orderId++;
    }
  }

  const employees = EMPLOYEES.map((e) => [
    String(e[0]),
    q(e[1]),
    q(e[2]),
    e[3] === null ? "NULL" : String(e[3]),
    q(e[4]),
    q(e[5]),
    money(e[6]),
  ]);

  const statements = [
    ...insertBatches(
      "customers",
      ["id", "name", "email", "city", "country", "segment", "signup_date"],
      customers,
    ),
    ...insertBatches("products", ["id", "name", "category", "price", "cost", "in_stock"], products),
    ...insertBatches(
      "orders",
      ["id", "customer_id", "order_date", "shipped_date", "status", "channel"],
      orders,
    ),
    ...insertBatches(
      "order_items",
      ["id", "order_id", "product_id", "quantity", "unit_price"],
      items,
    ),
    ...insertBatches(
      "employees",
      ["id", "name", "role", "manager_id", "store_city", "hired_on", "salary"],
      employees,
    ),
  ];

  const tables: DatasetTableInfo[] = [
    { name: "customers", rows: customers.length, blurb: "One row per shopper. Some have no city." },
    { name: "products", rows: products.length, blurb: "Catalogue with list price and unit cost." },
    {
      name: "orders",
      rows: orders.length,
      blurb: "Order headers. shipped_date is NULL until it ships.",
    },
    {
      name: "order_items",
      rows: items.length,
      blurb: "Line items. unit_price can differ from list price.",
    },
    {
      name: "employees",
      rows: employees.length,
      blurb: "Self-referencing hierarchy via manager_id.",
    },
  ];

  cached = { statements, tables };
  return cached;
}

/** Table -> columns, used to drive editor autocompletion. */
export const SCHEMA_HINT: Record<string, string[]> = {
  customers: ["id", "name", "email", "city", "country", "segment", "signup_date"],
  products: ["id", "name", "category", "price", "cost", "in_stock"],
  orders: ["id", "customer_id", "order_date", "shipped_date", "status", "channel"],
  order_items: ["id", "order_id", "product_id", "quantity", "unit_price"],
  employees: ["id", "name", "role", "manager_id", "store_city", "hired_on", "salary"],
};

export const STARTER_SQL = `-- Cycle Depot. Same data on PostgreSQL and DuckDB.
-- Cmd/Ctrl + Enter runs. Select some text first to run only that.

SELECT c.name,
       c.city,
       COUNT(*)                          AS orders,
       SUM(oi.quantity * oi.unit_price)  AS revenue
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id   = o.id
WHERE o.status = 'delivered'
GROUP BY c.name, c.city
ORDER BY revenue DESC
LIMIT 10;`;
