import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const CUSTOMERS: Row[] = [
  r(1, "797", "Priya", "DE"),
  r(2, "1600", "Miles", "GB"),
  r(3, "1619", "Hana", "DE"),
];
const CHANNELS: Row[] = [r(1, "email"), r(2, "sms")];
const COMBINATIONS: Row[] = [
  r(1, "Priya", "email"),
  r(2, "Priya", "sms"),
  r(3, "Miles", "email"),
  r(4, "Miles", "sms"),
  r(5, "Hana", "email"),
  r(6, "Hana", "sms"),
];
const PAIRS: Row[] = [r(1, "Priya", "Hana", "DE")];
const STAFF: Row[] = [
  r(1, "1", null, "Evelyn Stone"),
  r(2, "2", "1", "Logan Reed"),
  r(3, "4", "2", "Amir Shah"),
  r(4, "5", "2", "Riley Park"),
];
const MANAGER_RESULT: Row[] = [
  r(1, "Logan Reed", "Evelyn Stone"),
  r(2, "Amir Shah", "Logan Reed"),
  r(3, "Riley Park", "Logan Reed"),
];

export const shopflowCrossSelfJoinStages: Stage[] = [
  {
    name: "CROSS JOIN makes every combination",
    canvasMinHeight: 500,
    sql: [
      "WITH channels(channel) AS (VALUES ('email'), ('sms'))",
      "SELECT c.first_name, ch.channel",
      "FROM customers AS c",
      "CROSS JOIN channels AS ch",
      "WHERE c.customer_id IN (797, 1600, 1619)",
      "ORDER BY c.customer_id, ch.channel",
    ],
    leftTable: {
      name: "customers",
      cols: ["customer_id", "first_name", "country"],
      rows: CUSTOMERS,
      accent: "mint",
    },
    rightTable: { name: "channels", cols: ["channel"], rows: CHANNELS, accent: "violet" },
    steps: [
      st(
        [0, 1, 2, 4, 5],
        "pending",
        "The selected inputs contain 3 customers and 2 channels. CROSS JOIN has no matching condition, so it creates every possible pairing.",
        { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] },
      ),
      st(
        [3],
        "kept",
        "Each customer combines with email and sms: 3 × 2 = 6 rows. This intentionally generates a complete matrix rather than finding related keys.",
        {
          leftStates: ["kept", "kept", "kept"],
          rightStates: ["kept", "kept"],
          resultRows: COMBINATIONS,
          resultCols: ["first_name", "channel"],
          resultTitle: "Cartesian product: 6 rows",
        },
      ),
    ],
  },
  {
    name: "Count the multiplication before running it",
    canvasMinHeight: 500,
    sql: [
      "SELECT COUNT(*) AS combination_count",
      "FROM customers AS c",
      "CROSS JOIN (VALUES ('email'), ('sms')) AS ch(channel)",
      "WHERE c.customer_id IN (797, 1600, 1619)",
    ],
    leftTable: {
      name: "customers",
      cols: ["customer_id", "first_name", "country"],
      rows: CUSTOMERS,
      accent: "mint",
    },
    rightTable: { name: "channels", cols: ["channel"], rows: CHANNELS, accent: "violet" },
    steps: [
      st(
        [0, 1, 3],
        "pending",
        "A Cartesian product grows multiplicatively. Always estimate the size first: left rows times right rows.",
        { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] },
      ),
      st(
        [2],
        "kept",
        "Here the answer is 6. A 2,000-customer table crossed with 30 categories would be 60,000 rows before any later filter.",
        {
          leftStates: ["kept", "kept", "kept"],
          rightStates: ["kept", "kept"],
          resultRows: [r(1, "6")],
          resultCols: ["combination_count"],
          resultTitle: "3 × 2",
        },
      ),
    ],
  },
  {
    name: "A self-join gives one table two roles",
    canvasMinHeight: 500,
    sql: [
      "SELECT a.first_name AS customer_a, b.first_name AS customer_b, a.country",
      "FROM customers AS a",
      "JOIN customers AS b",
      "  ON a.country = b.country",
      " AND a.customer_id < b.customer_id",
      "WHERE a.customer_id IN (797, 1600, 1619)",
      "  AND b.customer_id IN (797, 1600, 1619)",
    ],
    leftTable: {
      name: "customers AS a",
      cols: ["customer_id", "first_name", "country"],
      rows: CUSTOMERS,
      accent: "mint",
    },
    rightTable: {
      name: "customers AS b",
      cols: ["customer_id", "first_name", "country"],
      rows: CUSTOMERS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 2, 5, 6],
        "pending",
        "Aliases let customers play two separate roles. We are comparing one customer row with another customer row.",
        {
          leftStates: ["pending", "pending", "pending"],
          rightStates: ["pending", "pending", "pending"],
        },
      ),
      st(
        [3, 4],
        "kept",
        "Priya and Hana share DE. The less-than condition removes self-pairs and the reverse duplicate, leaving one unique unordered pair.",
        {
          leftStates: ["kept", "dropped", "kept"],
          rightStates: ["kept", "dropped", "kept"],
          resultRows: PAIRS,
          resultCols: ["customer_a", "customer_b", "country"],
          resultTitle: "unique same-country pair",
        },
      ),
    ],
  },
  {
    name: "Self-join employees to their managers",
    canvasMinHeight: 500,
    sql: [
      "SELECT e.employee_name, m.employee_name AS manager_name",
      "FROM employees AS e",
      "JOIN employees AS m",
      "  ON e.manager_id = m.employee_id",
      "WHERE e.employee_id IN (2, 4, 5)",
      "ORDER BY e.employee_id",
    ],
    leftTable: {
      name: "employees AS e",
      cols: ["employee_id", "manager_id", "employee_name"],
      rows: STAFF,
      accent: "mint",
    },
    rightTable: {
      name: "employees AS m",
      cols: ["employee_id", "manager_id", "employee_name"],
      rows: STAFF,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 2, 4, 5],
        "pending",
        "The employee alias is the worker role and the manager alias is the manager role. Both roles are read from the same ShopFlow table.",
        {
          leftStates: ["pending", "pending", "pending", "pending"],
          rightStates: ["pending", "pending", "pending", "pending"],
        },
      ),
      st(
        [3],
        "kept",
        "manager_id points back to employee_id. The self-join turns those IDs into readable manager names without duplicating the employee table.",
        {
          leftStates: ["dropped", "kept", "kept", "kept"],
          rightStates: ["kept", "kept", "kept", "kept"],
          resultRows: MANAGER_RESULT,
          resultCols: ["employee_name", "manager_name"],
          resultTitle: "employee → manager",
        },
      ),
    ],
  },
];
