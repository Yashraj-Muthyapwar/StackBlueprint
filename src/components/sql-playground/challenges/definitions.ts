import type { ChallengeDefinition, ChallengeDataset, ChallengeEngine } from "./types";

export const CHALLENGES: ChallengeDefinition[] = [
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
