import type { Engine } from "../db/db-client";
import type { DatasetId } from "../db/datasets";

export interface PlaygroundPractice {
  id: string;
  title: string;
  prompt: string;
  dataset: DatasetId;
  engine: Engine;
  /** When present, loading this lesson exercise enables checked Challenge Mode. */
  challengeId?: string;
  starterSql: string;
}

/**
 * Short, trusted exercises launched from SQL lessons. IDs, rather than raw SQL
 * in the URL, keep links compact and make every launchable exercise reviewable.
 */
const PRACTICES: Record<string, PlaygroundPractice> = {
  "cycledepot-customer-projection": {
    id: "cycledepot-customer-projection",
    title: "Build a customer directory",
    prompt:
      "Return every customer's id, name, and country. Rename name to customer_name. The result should have 60 rows and the columns id, customer_name, and country.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-customer-directory",
    starterSql: `-- Cycle Depot practice: build a customer directory.
-- Return id, name as customer_name, and country from customers.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-product-price-with-tax": {
    id: "cycledepot-product-price-with-tax",
    title: "Preview product prices with tax",
    prompt:
      "Return every product's name and price. Calculate price * 1.08 and name the result price_with_tax. The result should have 30 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-product-price-with-tax",
    starterSql: `-- Cycle Depot price preview.
-- Return name, price, and price * 1.08 AS price_with_tax from products.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-ready-to-sell-premium-products": {
    id: "cycledepot-ready-to-sell-premium-products",
    title: "Find ready-to-sell premium products",
    prompt:
      "Return name, price, and in_stock for products priced at least 2000 with at least 50 units in stock. The result should have 4 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-ready-to-sell-premium-products",
    starterSql: `-- Cycle Depot inventory check.
-- Return name, price, and in_stock for products that meet both requirements.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-customers-without-city": {
    id: "cycledepot-customers-without-city",
    title: "Find customers without a city",
    prompt:
      "Return id, name, and email for customers whose city is missing. Use IS NULL, not = NULL. The result should have 5 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-customers-without-city",
    starterSql: `-- Cycle Depot data-quality check.
-- Return id, name, and email for customers whose city is missing.
-- Write your SELECT query below, then choose Run and check.`,
  },
};

export function getPractice(id: string | null): PlaygroundPractice | null {
  return id ? (PRACTICES[id] ?? null) : null;
}
