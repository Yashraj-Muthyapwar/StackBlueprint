import { banner, mb, writeTable } from "./lib.mjs";

/**
 * ShopFlow SQL Lab is deliberately synthetic. This fixed-seed generator is the
 * source of truth; generated CSVs are reproducible and engine-neutral.
 */
const SEED = 42;
const COUNTS = {
  customers: 2_000,
  addresses: 2_800,
  products: 800,
  orders: 15_000,
  employees: 60,
  warehouses: 2,
};

function random(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (value) => String(value).padStart(2, "0");
const money = (value) => (Math.round(value * 100) / 100).toFixed(2);
const pick = (values, rng) => values[Math.floor(rng() * values.length)];
const timestamp = (dayOffset, hour, minute) => {
  const date = new Date(Date.UTC(2024, 0, 1 + dayOffset, hour, minute, 0));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:00`;
};
const timestampAfter = (value, hours) => {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  date.setUTCHours(date.getUTCHours() + hours);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:00`;
};

const CATEGORIES = [
  [1, "", "Store"],
  [2, 1, "Electronics"],
  [3, 1, "Home and Kitchen"],
  [4, 1, "Outdoors"],
  [5, 1, "Office"],
  [6, 1, "Wellness"],
  [7, 1, "Accessories"],
  [8, 2, "Computers"],
  [9, 2, "Mobile"],
  [10, 2, "Audio"],
  [11, 3, "Cookware"],
  [12, 3, "Lighting"],
  [13, 3, "Storage"],
  [14, 4, "Camping"],
  [15, 4, "Cycling"],
  [16, 4, "Travel"],
  [17, 5, "Desks"],
  [18, 5, "Writing"],
  [19, 5, "Organization"],
  [20, 6, "Fitness"],
  [21, 6, "Personal Care"],
  [22, 6, "Recovery"],
  [23, 7, "Bags"],
  [24, 7, "Cases"],
  [25, 7, "Wearables"],
  [26, 8, "Monitors"],
  [27, 8, "Peripherals"],
  [28, 9, "Chargers"],
  [29, 10, "Headphones"],
  [30, 14, "Tents"],
];

const FIRST_NAMES = ["Avery", "Jordan", "Maya", "Noah", "Sofia", "Ethan", "Priya", "Leo", "Hana", "Miles"];
const LAST_NAMES = ["Chen", "Morgan", "Rivera", "Patel", "Kim", "Nguyen", "Bennett", "Brooks", "Diaz", "Singh"];
const COUNTRIES = ["US", "CA", "GB", "DE"];
const CITIES = ["Austin", "Toronto", "London", "Berlin", "Seattle", "Vancouver", "Manchester", "Hamburg"];

const column = (name, type, notNull = false, defaultValue) => ({ name, type, notNull, defaultValue });

function table(name, header, rows, columns, primaryKey, inlineConstraints) {
  return { schema: "public", name, header, rows, columns, primaryKey, inlineConstraints };
}

function foreignKey(fromTable, fromColumns, toTable, toColumns) {
  return { fromTable: `public.${fromTable}`, fromColumns, toTable: `public.${toTable}`, toColumns };
}

export async function buildSqlLab() {
  banner("ShopFlow SQL Lab (deterministic synthetic data)");
  const rng = random(SEED);

  const customers = [];
  for (let id = 1; id <= COUNTS.customers; id++) {
    const first = FIRST_NAMES[(id - 1) % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor((id - 1) / FIRST_NAMES.length) % LAST_NAMES.length];
    customers.push([id, first, last, `${first.toLowerCase()}.${last.toLowerCase()}${id}@shopflow.test`, pick(COUNTRIES, rng), timestamp(Math.floor(rng() * 365), Math.floor(rng() * 24), Math.floor(rng() * 60))]);
  }

  const addresses = [];
  for (let id = 1; id <= COUNTS.addresses; id++) {
    const customerId = id <= COUNTS.customers ? id : 1 + Math.floor(rng() * COUNTS.customers);
    addresses.push([id, customerId, id <= COUNTS.customers ? "shipping" : "billing", `${100 + id} Market Street`, pick(CITIES, rng), "Central", `${10000 + (id % 89999)}`, customers[customerId - 1][4], id <= COUNTS.customers ? "true" : "false"]);
  }

  const products = [];
  const productPrices = new Map();
  for (let id = 1; id <= COUNTS.products; id++) {
    const categoryId = 8 + ((id - 1) % 23);
    const price = money(12 + ((id * 37) % 280) + rng() * 20);
    const cost = money(Number(price) * (0.42 + rng() * 0.24));
    productPrices.set(id, price);
    products.push([id, categoryId, `${CATEGORIES[categoryId - 1][2]} Product ${id}`, price, cost, id % 19 === 0 ? "false" : "true"]);
  }

  const employees = [
    [1, "", "Evelyn Stone", "Executive", "Chief Executive Officer"],
    [2, 1, "Logan Reed", "Engineering", "VP Engineering"],
    [3, 1, "Sienna Patel", "Operations", "VP Operations"],
    [4, 2, "Amir Shah", "Engineering", "Engineering Manager"],
    [5, 2, "Riley Park", "Engineering", "Data Engineering Manager"],
    [6, 3, "Morgan Bell", "Operations", "Warehouse Manager"],
    [7, 3, "Casey Fox", "Operations", "Support Manager"],
  ];
  const departments = ["Engineering", "Operations", "Support", "Finance"];
  for (let id = 8; id <= COUNTS.employees; id++) {
    const managerId = id <= 20 ? 4 + ((id - 8) % 4) : 8 + ((id - 21) % 13);
    const department = departments[(id - 8) % departments.length];
    employees.push([id, managerId, `${FIRST_NAMES[id % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(id / 3) % LAST_NAMES.length]}`, department, id <= 20 ? "Team Lead" : "Specialist"]);
  }

  const orders = [];
  const orderItems = [];
  const payments = [];
  const shipments = [];
  let orderItemCount = 0;
  for (let orderId = 1; orderId <= COUNTS.orders; orderId++) {
    const roll = rng();
    const status = roll < 0.05 ? "pending" : roll < 0.15 ? "cancelled" : roll < 0.3 ? "paid" : roll < 0.5 ? "shipped" : "delivered";
    const customerId = orderId % 53 === 0 ? 1 + Math.floor(rng() * 40) : 1 + Math.floor(rng() * COUNTS.customers);
    const orderDate = timestamp(Math.floor(rng() * 365), Math.floor(rng() * 24), Math.floor(rng() * 60));
    const chosen = new Set();
    const lineCount = 1 + Math.floor(rng() * 4);
    let total = 0;
    for (let line = 0; line < lineCount; line++) {
      let productId;
      do {
        // The final 80 products deliberately never sell, useful for anti-join practice.
        productId = rng() < 0.55 ? 1 + Math.floor(rng() * 160) : 161 + Math.floor(rng() * 560);
      } while (chosen.has(productId));
      chosen.add(productId);
      const quantity = 1 + Math.floor(rng() * 4);
      const unitPrice = productPrices.get(productId);
      total += quantity * Number(unitPrice);
      orderItems.push([orderId, productId, quantity, unitPrice]);
      orderItemCount++;
    }
    const totalAmount = money(total);
    orders.push([orderId, customerId, orderDate, status, totalAmount]);

    const paymentStatus = status === "pending" ? "pending" : status === "cancelled" ? "failed" : "successful";
    payments.push([orderId, orderId, paymentStatus === "pending" ? "" : orderDate, paymentStatus === "successful" ? totalAmount : "0.00", paymentStatus]);
    // Cancelled orders never enter fulfilment. Every other order has a
    // shipment record whose timestamps must follow its state transition.
    if (status !== "cancelled") {
      const shipmentStatus = status === "shipped" || status === "delivered" ? status : "pending";
      const shippedAt = shipmentStatus === "pending" ? "" : timestampAfter(orderDate, 6 + Math.floor(rng() * 72));
      const deliveredAt = shipmentStatus === "delivered" ? timestampAfter(shippedAt, 1 + Math.floor(rng() * 120)) : "";
      shipments.push([shipments.length + 1, orderId, shippedAt, deliveredAt, shipmentStatus === "pending" ? "" : pick(["NorthStar", "ParcelCo", "SwiftShip"], rng), shipmentStatus]);
    }
  }

  const inventory = [];
  for (let productId = 1; productId <= COUNTS.products; productId++) {
    for (let warehouseId = 1; warehouseId <= COUNTS.warehouses; warehouseId++) {
      const reorderLevel = 8 + ((productId + warehouseId) % 18);
      const quantity = productId % 37 === 0 ? 0 : productId % 11 === 0 ? reorderLevel - 2 : reorderLevel + 12 + Math.floor(rng() * 140);
      inventory.push([productId, warehouseId, quantity, reorderLevel]);
    }
  }

  const definitions = [
    table("customers", ["customer_id", "first_name", "last_name", "email", "country", "created_at"], customers, [column("customer_id", "INTEGER", true), column("first_name", "VARCHAR(50)", true), column("last_name", "VARCHAR(50)", true), column("email", "VARCHAR(150)", true), column("country", "VARCHAR(50)", true), column("created_at", "TIMESTAMP", true)], ["customer_id"], ["PRIMARY KEY (\"customer_id\")", "UNIQUE (\"email\")"]),
    table("categories", ["category_id", "parent_category_id", "category_name"], CATEGORIES, [column("category_id", "INTEGER", true), column("parent_category_id", "INTEGER"), column("category_name", "VARCHAR(100)", true)], ["category_id"], ["PRIMARY KEY (\"category_id\")", "UNIQUE (\"category_name\")", "FOREIGN KEY (\"parent_category_id\") REFERENCES \"categories\" (\"category_id\")"]),
    table("products", ["product_id", "category_id", "product_name", "price", "cost", "active"], products, [column("product_id", "INTEGER", true), column("category_id", "INTEGER", true), column("product_name", "VARCHAR(150)", true), column("price", "DECIMAL(10,2)", true), column("cost", "DECIMAL(10,2)", true), column("active", "BOOLEAN", true, "TRUE")], ["product_id"], ["PRIMARY KEY (\"product_id\")", "FOREIGN KEY (\"category_id\") REFERENCES \"categories\" (\"category_id\")", "CHECK (\"price\" >= 0)", "CHECK (\"cost\" >= 0)"]),
    table("employees", ["employee_id", "manager_id", "employee_name", "department", "title"], employees, [column("employee_id", "INTEGER", true), column("manager_id", "INTEGER"), column("employee_name", "VARCHAR(100)", true), column("department", "VARCHAR(50)", true), column("title", "VARCHAR(100)", true)], ["employee_id"], ["PRIMARY KEY (\"employee_id\")", "FOREIGN KEY (\"manager_id\") REFERENCES \"employees\" (\"employee_id\")", "CHECK (\"manager_id\" IS NULL OR \"manager_id\" <> \"employee_id\")"]),
    table("addresses", ["address_id", "customer_id", "address_type", "line1", "city", "region", "postal_code", "country", "is_default"], addresses, [column("address_id", "INTEGER", true), column("customer_id", "INTEGER", true), column("address_type", "VARCHAR(20)", true), column("line1", "VARCHAR(150)", true), column("city", "VARCHAR(80)", true), column("region", "VARCHAR(80)", true), column("postal_code", "VARCHAR(20)", true), column("country", "VARCHAR(50)", true), column("is_default", "BOOLEAN", true, "FALSE")], ["address_id"], ["PRIMARY KEY (\"address_id\")", "FOREIGN KEY (\"customer_id\") REFERENCES \"customers\" (\"customer_id\")", "CHECK (\"address_type\" IN ('shipping', 'billing'))"]),
    table("orders", ["order_id", "customer_id", "order_date", "status", "total_amount"], orders, [column("order_id", "INTEGER", true), column("customer_id", "INTEGER", true), column("order_date", "TIMESTAMP", true), column("status", "VARCHAR(20)", true), column("total_amount", "DECIMAL(12,2)", true)], ["order_id"], ["PRIMARY KEY (\"order_id\")", "FOREIGN KEY (\"customer_id\") REFERENCES \"customers\" (\"customer_id\")", "CHECK (\"status\" IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled'))", "CHECK (\"total_amount\" >= 0)"]),
    table("order_items", ["order_id", "product_id", "quantity", "unit_price"], orderItems, [column("order_id", "INTEGER", true), column("product_id", "INTEGER", true), column("quantity", "INTEGER", true), column("unit_price", "DECIMAL(10,2)", true)], ["order_id", "product_id"], ["PRIMARY KEY (\"order_id\", \"product_id\")", "FOREIGN KEY (\"order_id\") REFERENCES \"orders\" (\"order_id\")", "FOREIGN KEY (\"product_id\") REFERENCES \"products\" (\"product_id\")", "CHECK (\"quantity\" > 0)", "CHECK (\"unit_price\" >= 0)"]),
    table("payments", ["payment_id", "order_id", "payment_date", "amount", "status"], payments, [column("payment_id", "INTEGER", true), column("order_id", "INTEGER", true), column("payment_date", "TIMESTAMP"), column("amount", "DECIMAL(12,2)", true), column("status", "VARCHAR(20)", true)], ["payment_id"], ["PRIMARY KEY (\"payment_id\")", "FOREIGN KEY (\"order_id\") REFERENCES \"orders\" (\"order_id\")", "CHECK (\"amount\" >= 0)", "CHECK (\"status\" IN ('pending', 'successful', 'failed'))"]),
    table("shipments", ["shipment_id", "order_id", "shipped_at", "delivered_at", "carrier", "status"], shipments, [column("shipment_id", "INTEGER", true), column("order_id", "INTEGER", true), column("shipped_at", "TIMESTAMP"), column("delivered_at", "TIMESTAMP"), column("carrier", "VARCHAR(50)"), column("status", "VARCHAR(20)", true)], ["shipment_id"], ["PRIMARY KEY (\"shipment_id\")", "UNIQUE (\"order_id\")", "FOREIGN KEY (\"order_id\") REFERENCES \"orders\" (\"order_id\")", "CHECK (\"status\" IN ('pending', 'shipped', 'delivered'))", "CHECK ((\"status\" = 'pending' AND \"shipped_at\" IS NULL AND \"delivered_at\" IS NULL) OR (\"status\" = 'shipped' AND \"shipped_at\" IS NOT NULL AND \"delivered_at\" IS NULL) OR (\"status\" = 'delivered' AND \"shipped_at\" IS NOT NULL AND \"delivered_at\" IS NOT NULL AND \"delivered_at\" >= \"shipped_at\"))"]),
    table("inventory", ["product_id", "warehouse_id", "quantity", "reorder_level"], inventory, [column("product_id", "INTEGER", true), column("warehouse_id", "INTEGER", true), column("quantity", "INTEGER", true), column("reorder_level", "INTEGER", true)], ["product_id", "warehouse_id"], ["PRIMARY KEY (\"product_id\", \"warehouse_id\")", "FOREIGN KEY (\"product_id\") REFERENCES \"products\" (\"product_id\")", "CHECK (\"quantity\" >= 0)", "CHECK (\"reorder_level\" >= 0)"]),
  ];

  const tables = [];
  for (const definition of definitions) {
    const stats = await writeTable("sql_lab", definition.name, definition.header, definition.rows);
    tables.push({ ...definition, ...stats });
  }
  const bytes = tables.reduce((sum, value) => sum + value.bytes, 0);
  console.log(`  ${tables.length} tables · ${tables.reduce((sum, value) => sum + value.rows, 0).toLocaleString()} rows · ${mb(bytes)} gzipped (${orderItemCount.toLocaleString()} order items)`);

  return {
    id: "sql_lab",
    schemas: [],
    tables,
    foreignKeys: [
      foreignKey("addresses", ["customer_id"], "customers", ["customer_id"]),
      foreignKey("categories", ["parent_category_id"], "categories", ["category_id"]),
      foreignKey("products", ["category_id"], "categories", ["category_id"]),
      foreignKey("orders", ["customer_id"], "customers", ["customer_id"]),
      foreignKey("order_items", ["order_id"], "orders", ["order_id"]),
      foreignKey("order_items", ["product_id"], "products", ["product_id"]),
      foreignKey("payments", ["order_id"], "orders", ["order_id"]),
      foreignKey("shipments", ["order_id"], "orders", ["order_id"]),
      foreignKey("employees", ["manager_id"], "employees", ["employee_id"]),
      foreignKey("inventory", ["product_id"], "products", ["product_id"]),
    ],
    setup: {
      common: [
        "CREATE INDEX idx_orders_customer ON orders (customer_id)",
        "CREATE INDEX idx_orders_date ON orders (order_date)",
        "CREATE INDEX idx_order_items_product ON order_items (product_id)",
        "CREATE VIEW customer_order_summary AS SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS order_count, COALESCE(SUM(o.total_amount), 0) AS lifetime_value FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id GROUP BY c.customer_id, c.first_name, c.last_name",
        "CREATE VIEW low_stock_products AS SELECT p.product_id, p.product_name, i.warehouse_id, i.quantity, i.reorder_level FROM products p JOIN inventory i ON i.product_id = p.product_id WHERE i.quantity <= i.reorder_level",
      ],
    },
    bytes,
  };
}
