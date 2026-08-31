import type { ChallengeDefinition, ChallengeDataset, ChallengeEngine } from "./types";

export const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "cycle-depot-customer-directory",
    version: 1,
    title: "Build a customer directory",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a simple customer directory for the Cycle Depot team.",
    requirements: [
      "Use the customers table.",
      "Return every customer's id, name, and country.",
      "Rename the name column to customer_name.",
      "Return exactly these columns: id, customer_name, and country.",
    ],
    requiredTables: ["customers"],
    starterSql: `-- Cycle Depot practice: build a customer directory.
-- Return id, name as customer_name, and country from customers.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT and list the three fields you need.",
      "Use AS to rename name: name AS customer_name.",
    ],
    solutionSql: {
      postgres: "SELECT id, name AS customer_name, country FROM customers;",
      duckdb: "SELECT id, name AS customer_name, country FROM customers;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT id, name AS customer_name, country FROM customers;",
        duckdb: "SELECT id, name AS customer_name, country FROM customers;",
      },
      requiredColumns: ["id", "customer_name", "country"],
      columnOrder: "exact",
      rowOrder: "any",
    },
    success: {
      title: "Customer directory complete",
      body: "Correct. You selected the requested fields and used an alias to give the customer name a clearer heading.",
      nextConcept: "Filtering customers with WHERE",
    },
  },
  {
    id: "cycle-depot-product-price-with-tax",
    version: 1,
    title: "Preview product prices with tax",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a price preview for the Cycle Depot merchandising team.",
    requirements: [
      "Use the products table.",
      "Return every product's name and price.",
      "Calculate price * 1.08.",
      "Name the calculated column price_with_tax.",
      "Return exactly these columns: name, price, and price_with_tax.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot price preview.
-- Return name, price, and price * 1.08 AS price_with_tax from products.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, price FROM products.",
      "Add price * 1.08 and use AS price_with_tax to name the calculated result.",
    ],
    solutionSql: {
      postgres: "SELECT name, price, price * 1.08 AS price_with_tax FROM products;",
      duckdb: "SELECT name, price, price * 1.08 AS price_with_tax FROM products;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT name, price, price * 1.08 AS price_with_tax FROM products;",
        duckdb: "SELECT name, price, price * 1.08 AS price_with_tax FROM products;",
      },
      requiredColumns: ["name", "price", "price_with_tax"],
      columnOrder: "exact",
      rowOrder: "any",
      numericTolerance: 0.001,
    },
    success: {
      title: "Price preview complete",
      body: "Correct. You created a calculated value for every product and gave it a clear result-column name.",
      nextConcept: "Filter products with WHERE",
    },
  },
  {
    id: "cycle-depot-ready-to-sell-premium-products",
    version: 1,
    title: "Find ready-to-sell premium products",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Find products the Cycle Depot team can promote now.",
    requirements: [
      "Use the products table.",
      "Return the name, price, and in_stock columns.",
      "Keep products priced at least 2000.",
      "Keep products with at least 50 units in stock.",
      "Use AND so both requirements must be true.",
      "Return exactly these columns: name, price, and in_stock.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot inventory check.
-- Return name, price, and in_stock for products that meet both requirements.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, price, in_stock FROM products.",
      "Add WHERE, then join price >= 2000 and in_stock >= 50 with AND.",
    ],
    solutionSql: {
      postgres: "SELECT name, price, in_stock FROM products WHERE price >= 2000 AND in_stock >= 50;",
      duckdb: "SELECT name, price, in_stock FROM products WHERE price >= 2000 AND in_stock >= 50;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT name, price, in_stock FROM products WHERE price >= 2000 AND in_stock >= 50;",
        duckdb: "SELECT name, price, in_stock FROM products WHERE price >= 2000 AND in_stock >= 50;",
      },
      requiredColumns: ["name", "price", "in_stock"],
      columnOrder: "exact",
      rowOrder: "any",
      numericTolerance: 0.001,
    },
    success: {
      title: "Promotion list complete",
      body: "Correct. You used comparison operators and AND to keep only products that meet both business requirements.",
      nextConcept: "More detailed WHERE filtering",
    },
  },
  {
    id: "cycle-depot-featured-products-logic",
    version: 1,
    title: "Build a featured product list",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a featured-products list for the Cycle Depot campaign team.",
    requirements: [
      "Use the products table.",
      "Return exactly these columns: name, category, price, and in_stock.",
      "Keep Road Bikes with at least 90 units in stock.",
      "Also keep products that are not Road Bikes and have a price of at least 4000.",
      "Use AND, OR, NOT, and parentheses to make the two groups clear.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot featured products.
-- Return name, category, price, and in_stock for either qualifying group.
-- Use parentheses to keep each group easy to read.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, category, price, in_stock FROM products.",
      "Your first parenthesized group is category = 'Road Bikes' AND in_stock >= 90.",
      "Connect it with OR to a second group: NOT category = 'Road Bikes' AND price >= 4000.",
    ],
    solutionSql: {
      postgres: "SELECT name, category, price, in_stock FROM products WHERE (category = 'Road Bikes' AND in_stock >= 90) OR (NOT category = 'Road Bikes' AND price >= 4000);",
      duckdb: "SELECT name, category, price, in_stock FROM products WHERE (category = 'Road Bikes' AND in_stock >= 90) OR (NOT category = 'Road Bikes' AND price >= 4000);",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT name, category, price, in_stock FROM products WHERE (category = 'Road Bikes' AND in_stock >= 90) OR (NOT category = 'Road Bikes' AND price >= 4000);",
        duckdb: "SELECT name, category, price, in_stock FROM products WHERE (category = 'Road Bikes' AND in_stock >= 90) OR (NOT category = 'Road Bikes' AND price >= 4000);",
      },
      requiredColumns: ["name", "category", "price", "in_stock"],
      columnOrder: "exact",
      rowOrder: "any",
      numericTolerance: 0.001,
    },
    success: {
      title: "Featured product list complete",
      body: "Correct. You combined two business rules with AND, OR, and NOT to produce the right three products.",
      nextConcept: "Range and set filtering with IN and BETWEEN",
    },
  },
  {
    id: "cycle-depot-premium-bike-range",
    version: 1,
    title: "Build a premium bike range",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Build a Cycle Depot shortlist of mid-priced Road and Mountain Bikes.",
    requirements: [
      "Use the products table.",
      "Return exactly these columns: name, category, and price.",
      "Start with the Road Bikes, Mountain Bikes, and City Bikes categories using IN.",
      "Exclude City Bikes using NOT IN.",
      "Keep prices from 2000 through 4000 using BETWEEN.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot premium bike range.
-- Return name, category, and price for the qualifying products.
-- Use IN, NOT IN, and BETWEEN in the WHERE clause.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, category, price FROM products.",
      "Use category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') for the allowed set.",
      "Add category NOT IN ('City Bikes') and price BETWEEN 2000 AND 4000 with AND.",
    ],
    solutionSql: {
      postgres: "SELECT name, category, price FROM products WHERE category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') AND category NOT IN ('City Bikes') AND price BETWEEN 2000 AND 4000;",
      duckdb: "SELECT name, category, price FROM products WHERE category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') AND category NOT IN ('City Bikes') AND price BETWEEN 2000 AND 4000;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT name, category, price FROM products WHERE category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') AND category NOT IN ('City Bikes') AND price BETWEEN 2000 AND 4000;",
        duckdb: "SELECT name, category, price FROM products WHERE category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') AND category NOT IN ('City Bikes') AND price BETWEEN 2000 AND 4000;",
      },
      requiredColumns: ["name", "category", "price"],
      columnOrder: "exact",
      rowOrder: "any",
      numericTolerance: 0.001,
    },
    success: {
      title: "Premium bike range complete",
      body: "Correct. You used a set, an exclusion, and an inclusive price range to find the three matching products.",
      nextConcept: "Pattern matching with LIKE and ILIKE",
    },
  },
  {
    id: "cycle-depot-road-product-search",
    version: 1,
    title: "Search the Road product catalog",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "The merchandising team needs Road product names, but not helmets.",
    requirements: [
      "Use the products table.",
      "Return exactly the name and category columns.",
      "Match product names containing road without letter-case sensitivity.",
      "Exclude product names containing Helmet.",
      "Use ILIKE and NOT LIKE.",
      "Sort by id so the result is deterministic.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot product search.
-- Return name and category for Road product names, excluding helmets.
-- Use ILIKE and NOT LIKE, then order by id.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, category FROM products.",
      "Use name ILIKE '%road%' for the case-insensitive search.",
      "Add AND name NOT LIKE '%Helmet%', then ORDER BY id.",
    ],
    solutionSql: {
      postgres: "SELECT name, category FROM products WHERE name ILIKE '%road%' AND name NOT LIKE '%Helmet%' ORDER BY id;",
      duckdb: "SELECT name, category FROM products WHERE name ILIKE '%road%' AND name NOT LIKE '%Helmet%' ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT name, category FROM products WHERE name ILIKE '%road%' AND name NOT LIKE '%Helmet%' ORDER BY id;",
        duckdb: "SELECT name, category FROM products WHERE name ILIKE '%road%' AND name NOT LIKE '%Helmet%' ORDER BY id;",
      },
      requiredColumns: ["name", "category"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Road catalog search complete",
      body: "Correct. You used a case-insensitive contains pattern and excluded the helmet match to keep the two Road Bike products.",
      nextConcept: "NULL-aware filtering",
    },
  },
  {
    id: "cycle-depot-find-us-customers",
    version: 1,
    title: "Find US customers",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "The marketing team needs a list of all customers located in the USA to send a targeted promotion.",
    requirements: [
      "Use the customers table.",
      "Return all columns for customers whose country is 'USA'.",
      "Sort the results by name from A to Z."
    ],
    requiredTables: ["customers"],
    hints: [
      "Use the WHERE clause to filter for country = 'USA'.",
      "Use ORDER BY name ASC to sort the results alphabetically."
    ],
    solutionSql: {
      postgres: "SELECT * FROM customers WHERE country = 'USA' ORDER BY name ASC;",
      duckdb: "SELECT * FROM customers WHERE country = 'USA' ORDER BY name ASC;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT * FROM customers WHERE country = 'USA' ORDER BY name ASC;",
        duckdb: "SELECT * FROM customers WHERE country = 'USA' ORDER BY name ASC;",
      },
      requiredColumns: ["id", "name", "email", "country", "city", "segment", "signup_date"],
      columnOrder: "any",
      rowOrder: "exact",
    },
    success: {
      title: "Challenge complete",
      body: "You successfully filtered the customers table and ordered the results.",
      nextConcept: "Customers without a city"
    }
  },
  {
    id: "cycle-depot-customers-without-city",
    version: 1,
    title: "Customers without a city",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Data hygiene check! We need to find all customers who are missing a city in their profile.",
    requirements: [
      "Use the customers table.",
      "Return the id, name, and email columns.",
      "Include only customers where the city is missing (NULL)."
    ],
    requiredTables: ["customers"],
    hints: [
      "Missing values in SQL are represented by NULL.",
      "You cannot use '= NULL' to check for missing values. Use 'IS NULL' instead."
    ],
    solutionSql: {
      postgres: "SELECT id, name, email FROM customers WHERE city IS NULL;",
      duckdb: "SELECT id, name, email FROM customers WHERE city IS NULL;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT id, name, email FROM customers WHERE city IS NULL;",
        duckdb: "SELECT id, name, email FROM customers WHERE city IS NULL;",
      },
      requiredColumns: ["id", "name", "email"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You correctly used IS NULL to find missing data.",
      nextConcept: "Recent delivered orders"
    }
  },
  {
    id: "cycle-depot-first-three-countries",
    version: 1,
    title: "Build a short country list",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "The Cycle Depot onboarding form needs the first three country choices in alphabetical order.",
    requirements: [
      "Use the customers table.",
      "Return the country column only.",
      "Remove repeated country values.",
      "Sort alphabetically and keep the first 3 rows.",
    ],
    requiredTables: ["customers"],
    hints: [
      "Put DISTINCT immediately after SELECT to remove repeated country values.",
      "Use ORDER BY country ASC before LIMIT 3.",
    ],
    solutionSql: {
      postgres: "SELECT DISTINCT country FROM customers ORDER BY country ASC LIMIT 3;",
      duckdb: "SELECT DISTINCT country FROM customers ORDER BY country ASC LIMIT 3;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT DISTINCT country FROM customers ORDER BY country ASC LIMIT 3;",
        duckdb: "SELECT DISTINCT country FROM customers ORDER BY country ASC LIMIT 3;",
      },
      requiredColumns: ["country"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Country list complete",
      body: "Correct. You removed repeated countries, sorted the result alphabetically, and kept the first three rows.",
      nextConcept: "Logical query order",
    },
  },
  {
    id: "cycle-depot-road-bike-shortlist",
    version: 1,
    title: "Build a Road Bike shortlist",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "The sales team needs the three most expensive Road Bikes to feature in a campaign.",
    requirements: [
      "Use the products table.",
      "Return the name and price columns only.",
      "Keep products where category is 'Road Bikes'.",
      "Sort from the highest price to the lowest and keep the first 3 rows.",
    ],
    requiredTables: ["products"],
    hints: [
      "Use WHERE category = 'Road Bikes' before sorting.",
      "Use ORDER BY price DESC, followed by LIMIT 3.",
    ],
    solutionSql: {
      postgres: "SELECT name, price FROM products WHERE category = 'Road Bikes' ORDER BY price DESC LIMIT 3;",
      duckdb: "SELECT name, price FROM products WHERE category = 'Road Bikes' ORDER BY price DESC LIMIT 3;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT name, price FROM products WHERE category = 'Road Bikes' ORDER BY price DESC LIMIT 3;",
        duckdb: "SELECT name, price FROM products WHERE category = 'Road Bikes' ORDER BY price DESC LIMIT 3;",
      },
      requiredColumns: ["name", "price"],
      columnOrder: "exact",
      rowOrder: "exact",
      numericTolerance: 0.001,
    },
    success: {
      title: "Road Bike shortlist complete",
      body: "Correct. You used the logical flow from source rows through filtering, sorting, and limiting to build the shortlist.",
      nextConcept: "The final querying fundamentals quiz",
    },
  },
  {
    id: "cycle-depot-recent-delivered-orders",
    version: 1,
    title: "Recent delivered orders",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Show the latest 10 orders that have been successfully delivered.",
    requirements: [
      "Use the orders table.",
      "Return all columns.",
      "Filter for orders with the status 'delivered'.",
      "Order them by order_date from newest to oldest, and return only the first 10."
    ],
    requiredTables: ["orders"],
    hints: [
      "Filter by status = 'delivered'.",
      "Sort by order_date DESC.",
      "Use LIMIT 10 to restrict the output to just 10 rows."
    ],
    solutionSql: {
      postgres: "SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC LIMIT 10;",
      duckdb: "SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC LIMIT 10;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC LIMIT 10;",
        duckdb: "SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC LIMIT 10;",
      },
      requiredColumns: ["id", "customer_id", "order_date", "shipped_date", "status", "channel"],
      columnOrder: "any",
      rowOrder: "exact",
    },
    success: {
      title: "Challenge complete",
      body: "You combined filtering, ordering, and limiting to find the most recent matching rows.",
      nextConcept: "Show each order with its customer"
    }
  },
  {
    id: "cycle-depot-each-order-with-customer",
    version: 1,
    title: "Show each order with its customer",
    group: "joins",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "We want to see the details of who placed each order.",
    requirements: [
      "Use both the orders and customers tables.",
      "Return the order id, order_date, customer name, and customer country.",
      "Only include orders that have a matching customer."
    ],
    requiredTables: ["orders", "customers"],
    hints: [
      "Use an INNER JOIN to combine orders and customers.",
      "The relationship is defined by orders.customer_id = customers.id."
    ],
    solutionSql: {
      postgres: "SELECT o.id, o.order_date, c.name, c.country FROM orders o JOIN customers c ON o.customer_id = c.id;",
      duckdb: "SELECT o.id, o.order_date, c.name, c.country FROM orders o JOIN customers c ON o.customer_id = c.id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT o.id, o.order_date, c.name, c.country FROM orders o JOIN customers c ON o.customer_id = c.id;",
        duckdb: "SELECT o.id, o.order_date, c.name, c.country FROM orders o JOIN customers c ON o.customer_id = c.id;",
      },
      requiredColumns: ["id", "order_date", "name", "country"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You successfully joined two tables to enrich order data with customer details.",
      nextConcept: "Customers who never ordered"
    }
  },
  {
    id: "cycle-depot-customers-no-orders",
    version: 1,
    title: "Customers who never ordered",
    group: "joins",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "The retention team wants a list of customers who signed up but have not yet placed an order. Return id, name, country, and signup_date, ordered by signup_date from oldest to newest.",
    requirements: [
      "Use customers and orders.",
      "Return exactly the four named columns.",
      "Include every customer with no matching order.",
      "Do not include customers who have ordered.",
      "Order by signup_date from oldest to newest."
    ],
    requiredTables: ["customers", "orders"],
    hints: [
      "You can use a LEFT JOIN from customers to orders.",
      "If a customer has no orders, the joined order columns will be NULL. Filter for where order id IS NULL.",
      "Alternatively, use WHERE NOT EXISTS."
    ],
    solutionSql: {
      postgres: "SELECT c.id, c.name, c.country, c.signup_date FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.signup_date ASC;",
      duckdb: "SELECT c.id, c.name, c.country, c.signup_date FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.signup_date ASC;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT c.id, c.name, c.country, c.signup_date FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.signup_date ASC;",
        duckdb: "SELECT c.id, c.name, c.country, c.signup_date FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.signup_date ASC;",
      },
      requiredColumns: ["id", "name", "country", "signup_date"],
      columnOrder: "any",
      rowOrder: "exact",
    },
    success: {
      title: "Challenge complete",
      body: "You found all customers who have not placed an order. Your query preserves customers even when no matching order exists.",
      nextConcept: "Calculate each order's total"
    }
  },
  {
    id: "cycle-depot-order-totals",
    version: 1,
    title: "Calculate each order's total",
    group: "joins",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Calculate the total value of each order by summing the prices of its items.",
    requirements: [
      "Use orders and order_items.",
      "Return order id, order_date, and the total value of the order as total_value.",
      "Include only orders that have items."
    ],
    requiredTables: ["orders", "order_items"],
    hints: [
      "Join orders to order_items.",
      "Group the results by order id and order_date.",
      "Use SUM(unit_price * quantity) to calculate the total value."
    ],
    solutionSql: {
      postgres: "SELECT o.id, o.order_date, SUM(oi.unit_price * oi.quantity) as total_value FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.order_date;",
      duckdb: "SELECT o.id, o.order_date, SUM(oi.unit_price * oi.quantity) as total_value FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.order_date;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT o.id, o.order_date, SUM(oi.unit_price * oi.quantity) as total_value FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.order_date;",
        duckdb: "SELECT o.id, o.order_date, SUM(oi.unit_price * oi.quantity) as total_value FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.order_date;",
      },
      requiredColumns: ["id", "order_date", "total_value"],
      columnOrder: "any",
      rowOrder: "any",
      numericTolerance: 0.01,
    },
    success: {
      title: "Challenge complete",
      body: "You combined a join with an aggregate function to roll up line items into order totals.",
      nextConcept: "Revenue by product category"
    }
  },
  {
    id: "cycle-depot-revenue-by-category",
    version: 1,
    title: "Revenue by product category",
    group: "aggregation",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Find the total revenue generated by each product category.",
    requirements: [
      "Use products and order_items.",
      "Return the category name and the total revenue for that category.",
      "Revenue is unit_price * quantity."
    ],
    requiredTables: ["products", "order_items"],
    hints: [
      "Join the two tables on product_id.",
      "Group by the category column.",
      "Sum the unit_price multiplied by quantity."
    ],
    solutionSql: {
      postgres: "SELECT p.category, SUM(oi.unit_price * oi.quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.category;",
      duckdb: "SELECT p.category, SUM(oi.unit_price * oi.quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.category;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT p.category, SUM(oi.unit_price * oi.quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.category;",
        duckdb: "SELECT p.category, SUM(oi.unit_price * oi.quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.category;",
      },
      requiredColumns: ["category", "revenue"],
      columnOrder: "any",
      rowOrder: "any",
      numericTolerance: 0.01,
    },
    success: {
      title: "Challenge complete",
      body: "You used GROUP BY to aggregate data across a category.",
      nextConcept: "Countries with more than 20 orders"
    }
  },
  {
    id: "cycle-depot-countries-high-orders",
    version: 1,
    title: "Countries with more than 20 orders",
    group: "aggregation",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Identify countries where customers have placed more than 20 orders in total.",
    requirements: [
      "Use customers and orders.",
      "Return the country name and the order count.",
      "Only include countries with an order count strictly greater than 20."
    ],
    requiredTables: ["customers", "orders"],
    hints: [
      "Join the tables and group by country.",
      "Count the number of orders.",
      "Use HAVING to filter on the aggregated count, since WHERE cannot filter on aggregates."
    ],
    solutionSql: {
      postgres: "SELECT c.country, COUNT(o.id) as order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.country HAVING COUNT(o.id) > 20;",
      duckdb: "SELECT c.country, COUNT(o.id) as order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.country HAVING COUNT(o.id) > 20;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT c.country, COUNT(o.id) as order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.country HAVING COUNT(o.id) > 20;",
        duckdb: "SELECT c.country, COUNT(o.id) as order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.country HAVING COUNT(o.id) > 20;",
      },
      requiredColumns: ["country", "order_count"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You used HAVING to filter groups after they were aggregated.",
      nextConcept: "Count missing cities"
    }
  },
  {
    id: "cycle-depot-count-missing-cities",
    version: 1,
    title: "Count missing cities",
    group: "aggregation",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Return a single row with the number of customers who do not have a city listed.",
    requirements: [
      "Use the customers table.",
      "Return one column containing the count.",
    ],
    requiredTables: ["customers"],
    hints: [
      "Use COUNT(*) or COUNT(id) to count rows.",
      "Filter for city IS NULL."
    ],
    solutionSql: {
      postgres: "SELECT COUNT(*) as missing_count FROM customers WHERE city IS NULL;",
      duckdb: "SELECT COUNT(*) as missing_count FROM customers WHERE city IS NULL;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT COUNT(*) as missing_count FROM customers WHERE city IS NULL;",
        duckdb: "SELECT COUNT(*) as missing_count FROM customers WHERE city IS NULL;",
      },
      requiredColumns: ["missing_count"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You counted rows based on a specific condition.",
      nextConcept: "Find highest-value customers"
    }
  },
  {
    id: "cycle-depot-highest-value-customers",
    version: 1,
    title: "Find highest-value customers",
    group: "ctes",
    difficulty: "advanced",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Find the names and total lifetime spend of the top 5 customers by revenue.",
    requirements: [
      "Use customers, orders, and order_items.",
      "Return customer name and their total spend.",
      "Sort by total spend descending and limit to 5."
    ],
    requiredTables: ["customers", "orders", "order_items"],
    hints: [
      "You need to join all three tables to connect a customer to the items they bought.",
      "Group by the customer's name.",
      "Sum (unit_price * quantity) for the spend."
    ],
    solutionSql: {
      postgres: "SELECT c.name, SUM(oi.unit_price * oi.quantity) as total_spend FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5;",
      duckdb: "SELECT c.name, SUM(oi.unit_price * oi.quantity) as total_spend FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT c.name, SUM(oi.unit_price * oi.quantity) as total_spend FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5;",
        duckdb: "SELECT c.name, SUM(oi.unit_price * oi.quantity) as total_spend FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5;",
      },
      requiredColumns: ["name", "total_spend"],
      columnOrder: "any",
      rowOrder: "exact",
      numericTolerance: 0.01,
    },
    success: {
      title: "Challenge complete",
      body: "You executed a multi-table join and aggregation to find top customers.",
      nextConcept: "Rank each customer's orders"
    }
  },
  {
    id: "cycle-depot-rank-customer-orders",
    version: 1,
    title: "Rank each customer's orders",
    group: "windows",
    difficulty: "advanced",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Assign a sequential rank to each order placed by a customer, based on the order date. The first order is 1, the second is 2, etc.",
    requirements: [
      "Use the orders table.",
      "Return customer_id, order id, order_date, and the rank column.",
    ],
    requiredTables: ["orders"],
    hints: [
      "Use the ROW_NUMBER() window function.",
      "Use PARTITION BY customer_id to restart the numbering for each customer.",
      "Use ORDER BY order_date within the window function to sort correctly."
    ],
    solutionSql: {
      postgres: "SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank FROM orders;",
      duckdb: "SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank FROM orders;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank FROM orders;",
        duckdb: "SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank FROM orders;",
      },
      requiredColumns: ["customer_id", "id", "order_date", "order_rank"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You used a window function to compute a value across related rows without collapsing them into groups.",
      nextConcept: "Month-over-month order change"
    }
  },
  {
    id: "cycle-depot-mom-order-change",
    version: 1,
    title: "Month-over-month order change",
    group: "windows",
    difficulty: "advanced",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Compare the total number of orders placed in each month to the previous month.",
    requirements: [
      "Use the orders table.",
      "You will need a CTE or subquery.",
      "First, get the count of orders per month (use DATE_TRUNC('month', order_date)).",
      "Then, use LAG to find the previous month's count.",
      "Return month, order_count, and prev_month_count.",
      "Order by month."
    ],
    requiredTables: ["orders"],
    hints: [
      "Step 1: Write a query to get month and COUNT(id). Save it as a CTE.",
      "Step 2: Query from the CTE, selecting month, order_count, and LAG(order_count) OVER (ORDER BY month).",
      "DATE_TRUNC is supported in both Postgres and DuckDB."
    ],
    solutionSql: {
      postgres: "WITH monthly AS (SELECT DATE_TRUNC('month', order_date) as month, COUNT(id) as order_count FROM orders GROUP BY 1) SELECT month, order_count, LAG(order_count) OVER (ORDER BY month) as prev_month_count FROM monthly ORDER BY month;",
      duckdb: "WITH monthly AS (SELECT DATE_TRUNC('month', order_date) as month, COUNT(id) as order_count FROM orders GROUP BY 1) SELECT month, order_count, LAG(order_count) OVER (ORDER BY month) as prev_month_count FROM monthly ORDER BY month;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "WITH monthly AS (SELECT DATE_TRUNC('month', order_date) as month, COUNT(id) as order_count FROM orders GROUP BY 1) SELECT month, order_count, LAG(order_count) OVER (ORDER BY month) as prev_month_count FROM monthly ORDER BY month;",
        duckdb: "WITH monthly AS (SELECT DATE_TRUNC('month', order_date) as month, COUNT(id) as order_count FROM orders GROUP BY 1) SELECT month, order_count, LAG(order_count) OVER (ORDER BY month) as prev_month_count FROM monthly ORDER BY month;",
      },
      requiredColumns: ["month", "order_count", "prev_month_count"],
      columnOrder: "any",
      rowOrder: "exact",
    },
    success: {
      title: "Challenge complete",
      body: "You successfully used a CTE and the LAG window function to perform a time-series comparison."
    }
  }
];

export function getChallenges(dataset: ChallengeDataset, engine: ChallengeEngine): ChallengeDefinition[] {
  return CHALLENGES.filter(c => c.dataset === dataset && c.engines.includes(engine));
}

export function getChallenge(id: string): ChallengeDefinition | undefined {
  return CHALLENGES.find(c => c.id === id);
}
