// Rich lesson content for SQL "Querying Data" — StackBlueprint curriculum.
// Each lesson follows the 5-section protocol:
//   1. The 'Why' (Conceptual Anchor)
//   2. Visual Logic (Animation Blueprint)
//   3. Technical Implementation (Syntax & Execution)
//   4. The Progression Path (LeetCode evaluation matrix)
//   5. Engineering 'Gotchas' & Compliance

import type { LessonContent, FoundationTopicMeta } from "./foundations-content";
import booleanLogicImg from "@/images/sql/querying/boolean-logic-cycle-depot.png";
import nullThreeValuedLogicImg from "@/images/sql/querying/null-three-valued-logic-cycle-depot.png";
import patternMatchingImg from "@/images/sql/querying/pattern-matching-cycle-depot.png";
import rangeSetFiltersImg from "@/images/sql/querying/range-set-filters-cycle-depot.png";
import sargabilityImg from "@/images/sql/querying/sargability-cycle-depot.png";
import aggregateFunctionsImg from "@/images/sql/querying/aggregate-functions-cycle-depot.png";
import groupByImg from "@/images/sql/querying/group-by-cycle-depot.png";
import havingImg from "@/images/sql/querying/having-cycle-depot.png";
import shopflowInnerJoinExampleRowsImg from "@/images/sql/joins/inner-join-example-rows-shopflow.png";
import shopflowInnerJoinVennImg from "@/images/sql/joins/inner-join-venn-ids-shopflow.png";
import shopflowOuterJoinImg from "@/images/sql/joins/outer-join-null-shopflow.png";
import shopflowFullJoinDiffImg from "@/images/sql/joins/full-join-table-diff-shopflow.png";
import shopflowOuterJoinVennImg from "@/images/sql/joins/outer-joins-venn-comparison-shopflow.png";
import shopflowCrossJoinImg from "@/images/sql/joins/cross-join-cartesian-shopflow.png";
import shopflowSelfJoinImg from "@/images/sql/joins/self-join-pairs-shopflow.png";
import shopflowCrossSelfVennComparisonImg from "@/images/sql/joins/cross-self-venn-comparison-shopflow.png";
import shopflowSemiJoinExistsImg from "@/images/sql/joins/semi-join-exists-shopflow.png";
import shopflowAntiJoinNullTrapImg from "@/images/sql/joins/anti-join-null-trap-shopflow.png";

// =============================================================
// MODULE 1: FILTERING & PREDICATES
// =============================================================

// ---------- 1.1 Boolean Logic (AND / OR / NOT) ----------
const booleanLogic: LessonContent = {
  slug: "boolean-logic",
  title: "Boolean Logic (AND / OR / NOT)",
  subtitle: "Combine product rules with AND, OR, and NOT, then make mixed conditions easy to read.",
  sections: [
    {
      kind: "prose",
      heading: "Combine Product Rules Clearly",
      body: [
        "A `WHERE` clause checks a condition for each row in the table named by `FROM`. It keeps the row only when the full condition is true.",
        "Use `AND` when a product must meet every rule. Use `OR` when either rule is enough. Use `NOT` when you want to exclude matches. These three operators let you turn a business request into a precise filter.",
      ],
    },
    {
      kind: "image",
      src: booleanLogicImg,
      alt: "Cycle Depot products flowing through AND, OR, and NOT filters into the rows each condition keeps.",
      caption:
        "AND requires both checks, OR accepts either check, and NOT excludes the rows that match its condition.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "AND: Road Bikes that are ready to promote",
      code: `SELECT name, price, in_stock
FROM products
WHERE category = 'Road Bikes'
  AND in_stock >= 90
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "Both conditions are true for these two Cycle Depot products",
      headers: ["name", "price", "in_stock"],
      rows: [
        ["Aero Sprint Pro", "5400.00", "99"],
        ["Gravel Runner GX", "1980.00", "122"],
      ],
    },
    {
      kind: "animation",
      variant: "q-bool",
      caption:
        "See the same Cycle Depot rows pass through AND, OR, NOT, and a parenthesized combined condition.",
    },
    {
      kind: "prose",
      heading: "Broaden, Exclude, Then Combine",
      body: [
        "`OR` broadens a result. For example, a promotion can include every Road Bike **or** any product priced at least 4000. A row needs only one side of the OR to be true.",
        "`NOT` reverses a condition. `NOT category = 'Road Bikes'` keeps products outside that category. In the query below, parentheses divide the rule into two readable groups before OR combines them.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A featured-products rule using AND, OR, and NOT",
      code: `SELECT name, category, price, in_stock
FROM products
WHERE (category = 'Road Bikes' AND in_stock >= 90)
   OR (NOT category = 'Road Bikes' AND price >= 4000)
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "The three products that satisfy either parenthesized group",
      headers: ["name", "category", "price", "in_stock"],
      rows: [
        ["Switchback Enduro", "Mountain Bikes", "4150.00", "10"],
        ["Aero Sprint Pro", "Road Bikes", "5400.00", "99"],
        ["Gravel Runner GX", "Road Bikes", "1980.00", "122"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Make mixed rules explicit",
      body: "SQL evaluates `NOT` before `AND`, and `AND` before `OR`. Parentheses make the intended groups obvious to you and anyone reviewing the query. Use them whenever a condition mixes AND and OR.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "A note about NULL",
      body: "If a comparison involves a NULL, it can evaluate to UNKNOWN. `NOT UNKNOWN` is still UNKNOWN, and WHERE keeps only TRUE rows. Cycle Depot product categories are required, so this example has no missing categories; the NULL lesson covers this behavior in depth.",
    },
    {
      kind: "playground-practice",
      title: "Build a featured product list",
      prompt:
        "Return name, category, price, and in_stock for Road Bikes with at least 90 units in stock, or products that are not Road Bikes and cost at least 4000. Use AND, OR, NOT, and parentheses in the checked Cycle Depot exercise.",
      tables: ["products"],
      successCheck: "3 rows with the columns name, category, price, and in_stock.",
      href: "/sql-playground?practice=cycle-depot-featured-products-logic",
    },
    {
      kind: "takeaways",
      items: [
        "WHERE keeps a row only when its complete condition is TRUE.",
        "AND requires every condition to be true. OR requires at least one. NOT excludes matches.",
        "SQL evaluates NOT, then AND, then OR. Parentheses make a mixed rule clear and safe to change.",
        "NULL can produce UNKNOWN, and WHERE excludes UNKNOWN rows just like FALSE rows.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "boolean-logic-and",
          question:
            "Which operator should you use when a product must be a Road Bike and have at least 90 units in stock?",
          options: ["OR", "AND", "NOT", "DISTINCT"],
          correctIndex: 1,
          explanation: "AND requires both conditions to be true for the same row.",
        },
        {
          id: "boolean-logic-or",
          question: "What does OR do in a WHERE condition?",
          options: [
            "It keeps a row only when every condition is true.",
            "It keeps a row when at least one condition is true.",
            "It removes all matching rows.",
            "It sorts the result.",
          ],
          correctIndex: 1,
          explanation: "OR accepts a row when either side of the condition is true.",
        },
        {
          id: "boolean-logic-precedence",
          question: "Why are parentheses useful when a condition mixes AND and OR?",
          options: [
            "They rename result columns.",
            "They show exactly which conditions belong together.",
            "They make WHERE run after SELECT.",
            "They remove duplicate rows.",
          ],
          correctIndex: 1,
          explanation:
            "Parentheses make the intended logical groups explicit, rather than relying on precedence alone.",
        },
      ],
    },
  ],
};

// ---------- 1.2 Set, Range & Array Filtering ----------
const inBetween: LessonContent = {
  slug: "in-between",
  title: "Set, Range & Array Filtering",
  subtitle:
    "Match a list with IN, an inclusive range with BETWEEN, exclude values with NOT IN, and read PostgreSQL arrays with @>.",
  sections: [
    {
      kind: "prose",
      heading: "Filter by a List or a Range",
      body: [
        "Use `IN` when a value can match one item in a known list. It is clearer than writing several conditions joined with `OR`.",
        "Use `BETWEEN` when a value must sit inside a range. Both endpoints are included, so `price BETWEEN 2000 AND 4000` keeps a price of exactly 2000 or exactly 4000.",
      ],
    },
    {
      kind: "image",
      src: rangeSetFiltersImg,
      alt: "Cycle Depot products flowing through IN, BETWEEN, NOT IN, and PostgreSQL array containment filters.",
      caption:
        "IN checks a list, BETWEEN checks an inclusive range, NOT IN excludes a list, and PostgreSQL @> checks that an array contains requested values.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find mid-priced Road and Mountain Bikes",
      code: `SELECT name, category, price
FROM products
WHERE category IN ('Road Bikes', 'Mountain Bikes')
  AND price BETWEEN 2000 AND 4000
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "Three Cycle Depot products match both filters",
      headers: ["name", "category", "price"],
      rows: [
        ["Trailhead 29 Carbon", "Mountain Bikes", "2450.00"],
        ["Boulder Full Suspension", "Mountain Bikes", "3199.00"],
        ["Meridian Road Carbon", "Road Bikes", "2890.00"],
      ],
    },
    {
      kind: "animation",
      variant: "q-range",
      caption:
        "Watch real Cycle Depot products pass through IN, BETWEEN, NOT IN, and a separate PostgreSQL @> array-containment example.",
    },
    {
      kind: "prose",
      heading: "Exclude Categories with NOT IN",
      body: [
        "`NOT IN` is the opposite of `IN`: it keeps rows whose value does not appear in the list. A literal list is easy to read when you know exactly which values to leave out.",
        "Here, Cycle Depot wants higher-priced products outside the Road Bikes and Mountain Bikes categories.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "NOT IN: leave out two product categories",
      code: `SELECT name, category, price
FROM products
WHERE category NOT IN ('Road Bikes', 'Mountain Bikes')
  AND price >= 2000
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "The two remaining products",
      headers: ["name", "category", "price"],
      rows: [
        ["Volt E-Commuter", "City Bikes", "2260.00"],
        ["Volt E-Cargo", "City Bikes", "3890.00"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Keep NULL out of a NOT IN list",
      body: "`value NOT IN ('Road Bikes', NULL)` is not safe. Comparing a value with NULL produces UNKNOWN, and WHERE drops UNKNOWN rows. A literal list without NULL is fine. When values come from another query and may contain NULL, use a NULL-safe approach such as NOT EXISTS later in the course.",
    },
    {
      kind: "prose",
      heading: "PostgreSQL Arrays: Contains with @>",
      body: [
        "PostgreSQL also has array operators. `@>` means the array on the left contains every value in the array on the right. Array order does not matter for this check.",
        "Cycle Depot's current `products` table has no array column, so this is a self-contained PostgreSQL example using `VALUES`. It teaches the operator without pretending the production dataset stores product tags this way.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "PostgreSQL only: find products tagged road",
      code: `WITH product_tags(name, tags) AS (
  VALUES
    ('Aero Sprint Pro', ARRAY['road', 'race', 'carbon']),
    ('Gravel Runner GX', ARRAY['road', 'gravel', 'tubeless']),
    ('City Commuter 7', ARRAY['city', 'rack'])
)
SELECT name, tags
FROM product_tags
WHERE tags @> ARRAY['road'];`,
    },
    {
      kind: "table",
      caption: "@> keeps arrays that contain the requested road tag",
      headers: ["name", "tags"],
      rows: [
        ["Aero Sprint Pro", "{road,race,carbon}"],
        ["Gravel Runner GX", "{road,gravel,tubeless}"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Database-specific syntax",
      body: "`@>` is PostgreSQL array syntax. It is not the same as IN, and it is not portable SQL. Use it only when the active database supports arrays and the column is genuinely an array.",
    },
    {
      kind: "playground-practice",
      title: "Build a premium bike range",
      prompt:
        "Return name, category, and price for Road, Mountain, or City Bikes priced from 2000 to 4000, but exclude City Bikes. Use IN, NOT IN, and BETWEEN in the checked Cycle Depot exercise.",
      tables: ["products"],
      successCheck: "3 rows with the columns name, category, and price.",
      href: "/sql-playground?practice=cycledepot-premium-bike-range",
    },
    {
      kind: "takeaways",
      items: [
        "IN keeps a row when its value matches one item in a list.",
        "BETWEEN includes both endpoints. Use explicit comparisons when you need an exclusive end.",
        "NOT IN excludes listed values, but a NULL in that list can make every comparison UNKNOWN.",
        "PostgreSQL @> means an array contains every requested value. It is database-specific syntax, not a replacement for IN.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "range-set-in",
          question:
            "Which condition keeps products in either the Road Bikes or Mountain Bikes category?",
          options: [
            "category BETWEEN 'Road Bikes' AND 'Mountain Bikes'",
            "category IN ('Road Bikes', 'Mountain Bikes')",
            "category @> ARRAY['Road Bikes', 'Mountain Bikes']",
            "category NOT IN ('Road Bikes', 'Mountain Bikes')",
          ],
          correctIndex: 1,
          explanation: "IN tests whether one value matches any value in the list.",
        },
        {
          id: "range-set-between",
          question: "Does price BETWEEN 2000 AND 4000 include a product priced exactly 4000?",
          options: ["Yes", "No", "Only in PostgreSQL", "Only when price is an integer"],
          correctIndex: 0,
          explanation: "BETWEEN includes both its lower and upper bounds.",
        },
        {
          id: "range-set-array",
          question: "In PostgreSQL, what does tags @> ARRAY['road'] test?",
          options: [
            "Whether tags equals exactly ['road']",
            "Whether tags contains the value road",
            "Whether tags excludes the value road",
            "Whether tags is sorted by road",
          ],
          correctIndex: 1,
          explanation:
            "@> is the PostgreSQL array-contains operator: the left array must contain every value requested on the right.",
        },
      ],
    },
  ],
};

// ---------- 1.3 Pattern Matching (LIKE / ILIKE) ----------
const likeIlike: LessonContent = {
  slug: "like-ilike",
  title: "Pattern Matching (LIKE / ILIKE)",
  subtitle:
    "Search Cycle Depot product names with %, _, ILIKE, NOT LIKE, and safe literal matching.",
  sections: [
    {
      kind: "prose",
      heading: "Search Text with a Pattern",
      body: [
        "`LIKE` checks whether text fits a pattern. It is useful when you know part of a product name, email, city, or code, but not the entire value.",
        "A pattern has ordinary characters plus optional wildcards. `%` stands for zero or more characters. `_` stands for exactly one character. Everything else is matched literally unless you escape it.",
      ],
    },
    {
      kind: "image",
      src: patternMatchingImg,
      alt: "Cycle Depot product-name searches showing LIKE Volt percent matching two Volt products, LIKE percent Road percent matching three products containing Road, and ILIKE volt e hyphen percent matching the two Volt products regardless of case.",
      caption:
        "Prefix, contains, and case-insensitive patterns can return different product sets. The contains search includes Shellcap Road Helmet because the word Road occurs in its name.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find every Cycle Depot product whose name starts with Volt",
      code: `SELECT name, category, price
FROM products
WHERE name LIKE 'Volt%'
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "The trailing % accepts the remaining characters in each Volt product name",
      headers: ["name", "category", "price"],
      rows: [
        ["Volt E-Commuter", "City Bikes", "2260.00"],
        ["Volt E-Cargo", "City Bikes", "3890.00"],
      ],
    },
    {
      kind: "animation",
      variant: "q-like",
      caption:
        "Follow the same Cycle Depot names through prefix, contains, single-character, case-insensitive, and exclusion patterns.",
    },
    {
      kind: "table",
      caption: "The core LIKE pattern language",
      headers: ["Pattern", "Meaning", "Cycle Depot match"],
      rows: [
        ["'Volt%'", "Starts with Volt", "Volt E-Commuter and Volt E-Cargo"],
        ["'%Road%'", "Contains Road anywhere", "Both Meridian Road bikes and Shellcap Road Helmet"],
        ["'%Helmet'", "Ends with Helmet", "Shellcap Road Helmet"],
        [
          "'Volt _-%'",
          "One character after Volt, then a hyphen and any ending",
          "Both Volt E- products",
        ],
        [
          "'Road\\_Bikes' ESCAPE '\\'",
          "A literal underscore, not a wildcard",
          "The text Road_Bikes",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "Visual Logic: Prefix Search and Contains Search",
      body: [
        "On a large product catalog, picture an ordinary B-tree name index as an ordered list of product names and the table as the rows that hold the full product details. A prefix pattern such as `Volt%` gives the database a known starting point, so an appropriate index can seek near Volt and read the nearby matching range.",
        "A contains pattern such as `%Road%` does not reveal the first character. An ordinary B-tree cannot use its ordered prefixes to jump directly to Road, so the database may need to inspect many names instead. The actual query plan still depends on the database, collation, statistics, and available indexes.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A prefix search gives the optimizer more to work with than a contains search",
      code: `-- The name starts with Volt.
SELECT id, name
FROM products
WHERE name LIKE 'Volt%';

-- Road may occur anywhere in the name.
SELECT id, name
FROM products
WHERE name LIKE '%Road%';

-- PostgreSQL only: a case-insensitive prefix search can use a matching
-- functional index when the catalog needs this search often.
CREATE INDEX products_lower_name_prefix_idx
ON products (LOWER(name) text_pattern_ops);

SELECT id, name
FROM products
WHERE LOWER(name) LIKE 'volt%';`,
    },
    {
      kind: "table",
      caption: "How wildcard position changes the usual B-tree opportunity",
      headers: ["Pattern", "Can an ordinary name B-tree seek by prefix?", "What to remember"],
      rows: [
        [
          "name LIKE 'Volt%'",
          "Usually, with a compatible index and collation",
          "The first letters are known.",
        ],
        [
          "name LIKE '%Road%'",
          "No",
          "The first letters are unknown, so a prefix seek is unavailable.",
        ],
        [
          "name ILIKE 'volt%'",
          "Not with a normal case-sensitive name index",
          "Use a case-insensitive or functional index when this search is important.",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Use the plan, not a promise",
      body: "A prefix pattern does not guarantee an index scan, and a contains pattern does not guarantee one exact scan type. Use EXPLAIN on a realistic database when performance matters. PostgreSQL trigram indexes or full-text search can support broader search workloads, but they solve a different problem from basic LIKE syntax.",
    },
    {
      kind: "prose",
      heading: "Choose LIKE, ILIKE, or NOT LIKE",
      body: [
        "Use `LIKE` when the pattern's letter case should follow your database's normal matching rules. In PostgreSQL, `LIKE` is case-sensitive. `ILIKE` is the PostgreSQL-style case-insensitive form, so `name ILIKE 'volt e-%'` finds `Volt E-Commuter` even though the pattern is lowercase.",
        "Use `NOT LIKE` to remove a text pattern. You can combine it with another condition to make a precise catalog search, such as products containing road but not helmet.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Case-insensitive road search, excluding helmets",
      code: `SELECT name, category
FROM products
WHERE name ILIKE '%road%'
  AND name NOT LIKE '%Helmet%'
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "The two Road Bike product names that remain after the helmet exclusion",
      headers: ["name", "category"],
      rows: [
        ["Meridian Road Alloy", "Road Bikes"],
        ["Meridian Road Carbon", "Road Bikes"],
      ],
    },
    {
      kind: "prose",
      heading: "Match Literal % and _ Characters Safely",
      body: [
        "A percent sign and underscore are wildcards inside a LIKE pattern. If your data literally contains either character, declare an escape character with `ESCAPE`, then put that character before the wildcard you want to treat as ordinary text.",
        "This matters for codes, imported filenames, and labels. The example uses a small inline list because Cycle Depot product names do not contain literal underscores or percent signs.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Escape an underscore so it means an underscore, not any one character",
      code: `WITH search_terms(label) AS (
  VALUES ('Road_Bikes'), ('Road%Bikes'), ('Road Bikes')
)
SELECT label
FROM search_terms
WHERE label LIKE 'Road\\_Bikes' ESCAPE '\\';`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "% can match nothing",
      body: "`LIKE 'a%z'` matches both `abz` and `az` because `%` may match zero characters. Use `_` or explicit text when the number of characters matters.",
    },
    {
      kind: "playground-practice",
      title: "Search the Road product catalog",
      prompt:
        "Return name and category for product names that contain road without letter-case sensitivity, but exclude any name containing Helmet. Use ILIKE and NOT LIKE in the checked Cycle Depot exercise.",
      tables: ["products"],
      successCheck: "2 rows with the columns name and category.",
      href: "/sql-playground?practice=cycledepot-road-product-search",
    },
    {
      kind: "takeaways",
      items: [
        "LIKE compares text with a pattern. % means zero or more characters, and _ means exactly one character.",
        "Use ILIKE when case should not matter in PostgreSQL-style SQL. Use NOT LIKE to remove a pattern from the result.",
        "Escape literal % and _ characters with ESCAPE when your search text contains them.",
        "A leading % is useful for contains searches but can be more expensive on a large table. Regex and full-text search solve different problems.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "pattern-matching-percent",
          question: "What does the % wildcard represent in a LIKE pattern?",
          options: [
            "Exactly one character",
            "Zero or more characters",
            "A numeric value",
            "Any SQL keyword",
          ],
          correctIndex: 1,
          explanation: "% can match any sequence of characters, including an empty sequence.",
        },
        {
          id: "pattern-matching-underscore",
          question:
            "Which pattern matches Volt E-Commuter and Volt E-Cargo by requiring exactly one character before the hyphen?",
          options: ["'Volt %'", "'Volt _-%'", "'Volt __-%'", "'%Volt E-'"],
          correctIndex: 1,
          explanation:
            "_ matches the one E character, the hyphen is literal, and % accepts the remaining text.",
        },
        {
          id: "pattern-matching-ilike",
          question: "Why would you use ILIKE 'volt e-%' rather than LIKE 'volt e-%' in PostgreSQL?",
          options: [
            "ILIKE removes duplicate rows.",
            "ILIKE ignores letter case.",
            "ILIKE matches only one character.",
            "ILIKE sorts the result alphabetically.",
          ],
          correctIndex: 1,
          explanation: "ILIKE is PostgreSQL's case-insensitive pattern-match operator.",
        },
        {
          id: "pattern-matching-escape",
          question: "How do you make _ mean a literal underscore inside a LIKE pattern?",
          options: [
            "Write LIKE 'Road_Bikes' without any change.",
            "Use LIKE 'Road\\_Bikes' ESCAPE '\\'.",
            "Use ILIKE '_Road_Bikes'.",
            "Use NOT LIKE 'Road_Bikes'.",
          ],
          correctIndex: 1,
          explanation:
            "The escape character tells LIKE to treat the following underscore as ordinary text.",
        },
      ],
    },
  ],
};

// ---------- 1.4 The NULL Pitfalls (Three-Valued Logic) ----------
const nullPitfalls: LessonContent = {
  slug: "null-pitfalls",
  title: "The NULL Pitfalls (Three-Valued Logic)",
  subtitle: "Find missing values safely and understand why UNKNOWN rows disappear from WHERE.",
  sections: [
    {
      kind: "prose",
      heading: "NULL Means Missing or Unknown",
      body: [
        "`NULL` does not mean an empty string, zero, or a value you can compare normally. It means the value is missing or unknown. Five Cycle Depot customer profiles have no city recorded.",
        "That creates a third logical result: TRUE, FALSE, or UNKNOWN. A WHERE clause keeps only TRUE rows. It drops both FALSE and UNKNOWN rows.",
      ],
    },
    {
      kind: "image",
      src: nullThreeValuedLogicImg,
      alt: "Cycle Depot customer records flowing through city equals NULL, city IS NULL, and city not equal to Austin conditions. The equals NULL condition produces UNKNOWN and keeps no rows, while IS NULL keeps the missing-city rows.",
      caption:
        "WHERE keeps only TRUE. A comparison with NULL produces UNKNOWN, so use IS NULL or IS NOT NULL when you mean to test whether data is missing.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Use IS NULL to find customers whose city is missing",
      code: `-- This comparison is never TRUE, even for a NULL city.
SELECT id, name, city
FROM customers
WHERE city = NULL;

-- This is the correct missing-value test.
SELECT id, name, email
FROM customers
WHERE city IS NULL
ORDER BY id;`,
    },
    {
      kind: "table",
      caption: "The five Cycle Depot customers returned by city IS NULL, ordered by id",
      headers: ["id", "name", "email", "country"],
      rows: [
        ["5", "Omar Doyle", "omar.doyle5@example.com", "Germany"],
        ["14", "Hana Yilmaz", "hana.yilmaz14@example.com", "France"],
        ["45", "Chloe Farouk", "chloe.farouk45@example.com", "France"],
        ["46", "Farid Sharma", "farid.sharma46@example.com", "Canada"],
        ["47", "Elena Silva", "elena.silva47@example.com", "USA"],
      ],
    },
    {
      kind: "animation",
      variant: "q-null3vl",
      caption:
        "Watch the same Cycle Depot customers fall through = NULL, pass IS NULL, disappear from a normal comparison, and receive a display label with COALESCE.",
    },
    {
      kind: "prose",
      heading: "TRUE, FALSE, and UNKNOWN",
      body: [
        "Normal comparisons such as `=`, `<>`, `<`, and `>` cannot determine whether an unknown value matches. Their result is UNKNOWN when either side is NULL. `IS NULL` and `IS NOT NULL` are special tests that always return TRUE or FALSE.",
        "This is why `WHERE city <> 'Austin'` does not include customers whose city is missing. The missing-city rows are not known to be different from Austin, so they are UNKNOWN and WHERE removes them.",
      ],
    },
    {
      kind: "table",
      caption: "Three-valued logic in a WHERE clause",
      headers: ["Expression", "Result when city is NULL", "Does WHERE keep it?"],
      rows: [
        ["city = NULL", "UNKNOWN", "No"],
        ["city <> 'Austin'", "UNKNOWN", "No"],
        ["city IS NULL", "TRUE", "Yes"],
        ["city IS NOT NULL", "FALSE", "No"],
        ["city IS DISTINCT FROM 'Austin'", "TRUE", "Yes"],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Include missing cities explicitly, then label them for a report",
      code: `SELECT id, name, city
FROM customers
WHERE city <> 'Austin'
   OR city IS NULL
ORDER BY id;

SELECT id, name,
       COALESCE(city, 'Missing city') AS city_status
FROM customers
ORDER BY id;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Do not put NULL in a NOT IN list",
      body: "`city NOT IN ('Austin', NULL)` does not keep the non-Austin cities you expect. Every non-Austin comparison becomes UNKNOWN because the list contains NULL, and WHERE drops UNKNOWN. A literal list without NULL is safe. When the list comes from another query, filter its NULLs or use NOT EXISTS when joins are introduced later.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "NULL-safe comparison is database-specific",
      body: "PostgreSQL and DuckDB support `IS DISTINCT FROM`, which treats NULL as a comparable missing value. For example, `city IS DISTINCT FROM 'Austin'` keeps every non-Austin city and every missing city. It is often clearer than combining `<>` with `OR city IS NULL`.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Planner and aggregate impact",
      body: "In PostgreSQL, B-tree indexes include NULL entries, so an `IS NULL` filter can use an appropriate index when the planner estimates that it will help. Aggregates have their own NULL rules: `SUM` and `AVG` skip NULL values, `COUNT(*)` counts every row, and `COUNT(column)` counts only non-NULL values. That difference is a common source of unexpected report totals.",
    },
    {
      kind: "playground-practice",
      title: "Find customers without a city",
      prompt:
        "Return id, name, and email for Cycle Depot customers whose city is missing. Use IS NULL, not = NULL, in the checked data-quality exercise.",
      tables: ["customers"],
      successCheck: "5 rows with the columns id, name, and email.",
      href: "/sql-playground?practice=cycledepot-customers-without-city",
    },
    {
      kind: "takeaways",
      items: [
        "NULL means missing or unknown. It is not equal to anything, including another NULL.",
        "WHERE keeps only TRUE. FALSE and UNKNOWN rows are both excluded.",
        "Use IS NULL and IS NOT NULL to test missing data. Use COALESCE when a report needs a display value.",
        "A NULL inside NOT IN can turn expected matches into UNKNOWN. Use a NULL-safe approach when the list may contain missing values.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "null-logic-equals",
          question: "Why does WHERE city = NULL return no rows?",
          options: [
            "NULL is an empty string.",
            "The comparison evaluates to UNKNOWN, and WHERE keeps only TRUE.",
            "The customers table has no city column.",
            "SQL changes NULL to Austin first.",
          ],
          correctIndex: 1,
          explanation: "A normal comparison with NULL is UNKNOWN, not TRUE. Use IS NULL instead.",
        },
        {
          id: "null-logic-where",
          question: "Which values can a WHERE clause keep?",
          options: ["TRUE only", "TRUE and UNKNOWN", "FALSE and UNKNOWN", "Any non-NULL value"],
          correctIndex: 0,
          explanation: "WHERE keeps rows only when its condition is TRUE.",
        },
        {
          id: "null-logic-coalesce",
          question: "What does COALESCE(city, 'Missing city') do?",
          options: [
            "Permanently updates the customer city.",
            "Returns city when it is known, otherwise the display text Missing city.",
            "Filters out every NULL city.",
            "Sorts cities alphabetically.",
          ],
          correctIndex: 1,
          explanation:
            "COALESCE returns the first non-NULL argument without changing the stored value.",
        },
        {
          id: "null-logic-not-in",
          question: "What is risky about city NOT IN ('Austin', NULL)?",
          options: [
            "It returns only Austin customers.",
            "The NULL can make non-Austin comparisons UNKNOWN.",
            "NOT IN cannot be used with text.",
            "It automatically converts NULL to an empty string.",
          ],
          correctIndex: 1,
          explanation:
            "A NULL in the list makes comparisons that do not otherwise match evaluate to UNKNOWN.",
        },
      ],
    },
  ],
};

// ---------- 1.5 Writing Efficient WHERE Predicates ----------
const sargability: LessonContent = {
  slug: "writing-efficient-where-predicates",
  title: "Writing Efficient WHERE Predicates",
  subtitle:
    "Write index-friendly filters and use safe date ranges without changing the result you mean.",
  sections: [
    {
      kind: "prose",
      heading: "Give the Database a Searchable Condition",
      body: [
        "A `WHERE` clause describes which rows you want. On a large table, the shape of that condition can also determine whether the database can use an index to find those rows quickly.",
        "A predicate is **sargable**, short for search-argument-able, when the database can use the condition as a direct search argument. The practical habit is simple: keep an indexed column bare on one side of a comparison and put constants, parameters, or calculations on the other side.",
      ],
    },
    {
      kind: "image",
      src: sargabilityImg,
      alt: "A conceptual comparison of an index-friendly date range that seeks a small section of an orders-date index and a function-on-column predicate that sweeps many order rows.",
      caption:
        "A range on an indexed date can give the planner a narrow place to start. Transforming the column first can hide that range from a normal index.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find the five Cycle Depot orders placed in March 2024",
      code: `SELECT id, customer_id, order_date, status
FROM orders
WHERE order_date >= DATE '2024-03-01'
  AND order_date <  DATE '2024-04-01'
ORDER BY order_date, id;`,
    },
    {
      kind: "table",
      caption: "The five March 2024 orders, ordered by date and id",
      headers: ["id", "customer_id", "order_date", "status"],
      rows: [
        ["139", "47", "2024-03-05", "delivered"],
        ["58", "20", "2024-03-07", "delivered"],
        ["39", "14", "2024-03-17", "returned"],
        ["128", "44", "2024-03-21", "pending"],
        ["83", "28", "2024-03-24", "cancelled"],
      ],
    },
    {
      kind: "animation",
      variant: "q-sargability",
      caption:
        "Compare a March range, the same condition with DATE_TRUNC wrapped around the column, and a direct single-day lookup using real Cycle Depot orders.",
    },
    {
      kind: "prose",
      heading: "Keep the Column Plain",
      body: [
        "The range above lets the database compare `order_date` directly with two known boundaries. If an appropriate index exists and the planner estimates that it will save work, it can seek to March 1 and read forward until April 1.",
        "The following query can produce the same March rows, but it applies `DATE_TRUNC` to the column before comparing it. A normal index on `order_date` stores dates, not each row's truncated month. Move the transformation to the constant side or express the request as a range instead.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Same meaning, different predicate shape",
      code: `-- Usually less index-friendly with a normal index on order_date.
SELECT id, customer_id, order_date, status
FROM orders
WHERE DATE_TRUNC('month', order_date) = DATE '2024-03-01';

-- Preferred: the bare column is compared with two boundaries.
SELECT id, customer_id, order_date, status
FROM orders
WHERE order_date >= DATE '2024-03-01'
  AND order_date <  DATE '2024-04-01';`,
    },
    {
      kind: "table",
      caption: "Common WHERE predicate rewrites",
      headers: ["Prefer", "Avoid when a normal index must help", "Why"],
      rows: [
        [
          "order_date >= start AND order_date < finish",
          "DATE_TRUNC('month', order_date) = start",
          "The range compares the stored value directly.",
        ],
        ["price >= 2000", "price / 100 >= 20", "Calculate the boundary, not every stored price."],
        [
          "name LIKE 'Volt%'",
          "name LIKE '%Volt%'",
          "A known prefix can support an ordered index range.",
        ],
        ["id = 39", "CAST(id AS TEXT) = '39'", "Avoid converting an indexed value for comparison."],
      ],
    },
    {
      kind: "prose",
      heading: "Date Filtering Patterns",
      body: [
        "Cycle Depot's `orders.order_date` is a `DATE`, so one date can use equality: `order_date = DATE '2024-03-17'`. A month or reporting period is best written as a half-open range: include the start and exclude the next boundary.",
        "For a `TIMESTAMP` column, half-open ranges are especially important. `placed_at >= TIMESTAMP '2024-03-01 00:00:00' AND placed_at < TIMESTAMP '2024-04-01 00:00:00'` keeps every instant in March. A final boundary of `2024-03-31 00:00:00` would miss almost the entire final day.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Use one inclusive start and one exclusive finish",
      code: `-- One DATE value in Cycle Depot.
SELECT id, order_date, status
FROM orders
WHERE order_date = DATE '2024-03-17';

-- Template for a TIMESTAMP column such as placed_at.
SELECT id, placed_at
FROM orders
WHERE placed_at >= TIMESTAMP '2024-03-01 00:00:00'
  AND placed_at <  TIMESTAMP '2024-04-01 00:00:00';`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "An index is an option, not a promise",
      body: "Sargable SQL gives the planner a usable search condition. It does not guarantee an index scan. The database still considers whether an index exists, how many rows it expects to return, table statistics, and the cost of fetching those rows. Use EXPLAIN on a realistic workload when performance matters.",
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Do not add an index only for a lesson query",
      body: "Indexes speed some reads but cost space and make inserts, updates, and deletes more expensive. Add one because a frequent, measured workload needs it. An expression index can support a deliberate expression such as DATE_TRUNC, but rewriting a simple date filter as a range is often clearer and more broadly useful.",
    },
    {
      kind: "playground-practice",
      title: "Find March orders with a date range",
      prompt:
        "Return id, customer_id, and order_date for Cycle Depot orders placed in March 2024. Use a start boundary of March 1 and an exclusive finish boundary of April 1, then order by order_date and id.",
      tables: ["orders"],
      successCheck: "5 rows with the columns id, customer_id, and order_date in date order.",
      href: "/sql-playground?practice=cycledepot-march-order-range",
    },
    {
      kind: "takeaways",
      items: [
        "Sargable predicates let the database use a condition as a direct search argument.",
        "Keep an indexed column plain in a comparison when possible. Calculate constants or parameters instead of transforming each row's value.",
        "For date and timestamp periods, use a half-open range: >= start and < next boundary.",
        "An index-friendly predicate creates an opportunity, not a guarantee. The planner chooses a plan from data, indexes, and cost estimates.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sargability-bare-column",
          question: "Which predicate is usually more useful to a normal index on order_date?",
          options: [
            "DATE_TRUNC('month', order_date) = DATE '2024-03-01'",
            "order_date >= DATE '2024-03-01' AND order_date < DATE '2024-04-01'",
            "CAST(order_date AS TEXT) LIKE '2024-03%'",
            "LOWER(order_date) = '2024-03-01'",
          ],
          correctIndex: 1,
          explanation: "The date column remains bare and the range boundaries are known constants.",
        },
        {
          id: "sargability-timestamp-boundary",
          question: "Why use < '2024-04-01 00:00:00' as a March timestamp range's end?",
          options: [
            "It includes every timestamp in March without guessing the final instant.",
            "It converts timestamps to text.",
            "It makes the database sort the table.",
            "It excludes every order on March 31.",
          ],
          correctIndex: 0,
          explanation:
            "The next boundary is exclusive, so every instant before April 1 is included.",
        },
        {
          id: "sargability-index-promise",
          question: "Does a sargable predicate guarantee that the database will use an index?",
          options: [
            "Yes, always",
            "No, the planner still chooses based on cost and estimates",
            "Only for text columns",
            "Only when the result has one row",
          ],
          correctIndex: 1,
          explanation:
            "A sargable predicate gives the planner an option. Index availability, selectivity, statistics, and cost still matter.",
        },
      ],
    },
  ],
};

// ---------- Filtering & Predicates: Final Quiz ----------
const filteringFinalQuiz: LessonContent = {
  slug: "filtering-predicates-quiz",
  title: "Filtering & Predicates: Final Quiz",
  subtitle:
    "Test your command of boolean logic, filter operators, NULL behavior, patterns, and efficient date predicates.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "filtering-final-boolean-parentheses",
          question:
            "Why are parentheses useful in WHERE (category = 'Road Bikes' AND in_stock >= 90) OR price >= 4000?",
          options: [
            "They rename category.",
            "They make the first business rule a clear unit before OR combines it with the price rule.",
            "They remove duplicate rows.",
            "They make SELECT run before FROM.",
          ],
          correctIndex: 1,
          explanation:
            "Parentheses show exactly which conditions belong together, making a mixed boolean rule safer to read and change.",
        },
        {
          id: "filtering-final-between",
          question:
            "Which condition keeps a product priced from 2000 through 4000, including both endpoints?",
          options: [
            "price IN (2000, 4000)",
            "price BETWEEN 2000 AND 4000",
            "price > 2000 AND price < 4000",
            "price @> ARRAY[2000, 4000]",
          ],
          correctIndex: 1,
          explanation: "BETWEEN includes both its lower and upper boundary.",
        },
        {
          id: "filtering-final-array",
          question: "In PostgreSQL, what does tags @> ARRAY['road', 'carbon'] require?",
          options: [
            "The tags array must be exactly road and carbon in that order.",
            "The tags array must contain road and carbon, in any order, and may contain more values.",
            "The tags array must exclude road and carbon.",
            "The tags column must be text, not an array.",
          ],
          correctIndex: 1,
          explanation:
            "@> is PostgreSQL array containment: the left array contains every requested value on the right.",
        },
        {
          id: "filtering-final-not-in-null",
          question: "Why is category NOT IN ('Road Bikes', NULL) unsafe?",
          options: [
            "NOT IN cannot compare text.",
            "The NULL can make non-matching comparisons UNKNOWN, which WHERE drops.",
            "It always returns Road Bikes only.",
            "It automatically turns NULL into an empty string.",
          ],
          correctIndex: 1,
          explanation:
            "A NULL in a NOT IN list can turn a comparison into UNKNOWN instead of TRUE.",
        },
        {
          id: "filtering-final-like-percent",
          question: "What does name LIKE 'Volt%' match?",
          options: [
            "Names that contain Volt anywhere.",
            "Names that start with Volt.",
            "Names with exactly one character after Volt.",
            "Only the exact name Volt.",
          ],
          correctIndex: 1,
          explanation: "The trailing % means zero or more characters may follow Volt.",
        },
        {
          id: "filtering-final-ilike-escape",
          question: "Which statement about pattern matching is correct in PostgreSQL?",
          options: [
            "ILIKE is case-insensitive, and ESCAPE can make _ a literal underscore.",
            "ILIKE removes duplicates, and _ means zero or more characters.",
            "LIKE ignores case, and % matches exactly one character.",
            "NOT LIKE is required before every ILIKE search.",
          ],
          correctIndex: 0,
          explanation:
            "ILIKE ignores letter case. In a LIKE pattern, _ is a one-character wildcard unless an escape character makes it literal.",
        },
        {
          id: "filtering-final-null-test",
          question: "Which condition correctly finds Cycle Depot customers whose city is missing?",
          options: ["city = NULL", "city <> NULL", "city IS NULL", "city IN (NULL)"],
          correctIndex: 2,
          explanation:
            "Normal comparisons with NULL are UNKNOWN. IS NULL is the missing-value test.",
        },
        {
          id: "filtering-final-not",
          question:
            "For a product with a known category, what does WHERE NOT category = 'Road Bikes' keep?",
          options: [
            "Only Road Bikes",
            "Every product that is not a Road Bike",
            "Only products with a NULL category",
            "Every product, regardless of category",
          ],
          correctIndex: 1,
          explanation:
            "NOT reverses the category comparison. The question specifies a known category because NOT UNKNOWN is still UNKNOWN for a NULL value.",
        },
        {
          id: "filtering-final-date-range",
          question: "Which predicate safely selects every timestamp in March 2024?",
          options: [
            "placed_at BETWEEN TIMESTAMP '2024-03-01 00:00:00' AND TIMESTAMP '2024-03-31 00:00:00'",
            "DATE_TRUNC('month', placed_at) = DATE '2024-03-01'",
            "placed_at >= TIMESTAMP '2024-03-01 00:00:00' AND placed_at < TIMESTAMP '2024-04-01 00:00:00'",
            "placed_at = DATE '2024-03-01'",
          ],
          correctIndex: 2,
          explanation:
            "The half-open range includes every instant after March begins and before April begins.",
        },
        {
          id: "filtering-final-sargability",
          question:
            "Why is order_date >= DATE '2024-03-01' AND order_date < DATE '2024-04-01' usually more index-friendly than DATE_TRUNC('month', order_date) = DATE '2024-03-01'?",
          options: [
            "It changes the result to include fewer rows.",
            "It compares the stored date directly with boundaries instead of applying a function to each date value.",
            "It removes the need for WHERE.",
            "It guarantees an index scan.",
          ],
          correctIndex: 1,
          explanation:
            "The bare-column range provides a direct search argument. The planner may then choose a suitable index, but it is not guaranteed.",
        },
      ],
    },
  ],
};

// =============================================================
// MODULE 2: AGGREGATIONS & GROUP BY
// =============================================================

// ---------- 2.1 Aggregate Functions ----------
const aggregateFns: LessonContent = {
  slug: "aggregate-functions",
  title: "Aggregate Functions (COUNT / COUNT DISTINCT / SUM / AVG / MIN / MAX)",
  subtitle: "Turn many Cycle Depot rows into one useful number, including distinct-value counts.",
  sections: [
    {
      kind: "prose",
      heading: "Turn rows into an answer",
      body: [
        "A normal SELECT can return one row per customer or product. An aggregate function reads many rows and returns a summary instead.",
        "Use COUNT when you need how many, SUM for a total, AVG for a typical value, and MIN or MAX for the smallest or largest value.",
      ],
    },
    {
      kind: "image",
      src: aggregateFunctionsImg,
      alt: "A conceptual illustration of order, customer, and product records flowing into a single aggregation step, then producing count, distinct count, total, average, minimum, and maximum metrics.",
      caption:
        "Conceptual view: aggregation collapses many records into summary metrics. The code and result tables below use the exact Cycle Depot schema and values.",
    },
    {
      kind: "animation",
      variant: "q-aggr",
      caption:
        "Cycle Depot rows collapse into one answer. The previews use real rows from the generated dataset; the result cards show the full-table totals.",
    },
    {
      kind: "prose",
      heading: "The smallest useful summary",
      body: [
        "Start with a question that needs one answer: how many orders has Cycle Depot received? COUNT(*) counts rows, so it is the safest default when you truly mean every row.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "One row, one answer: total orders",
      code: `SELECT COUNT(*) AS order_count
FROM orders;`,
    },
    {
      kind: "table",
      caption: "Result in the current Cycle Depot dataset",
      headers: ["order_count"],
      rows: [["142"]],
    },
    {
      kind: "prose",
      heading: "Count rows, values, or unique values",
      body: [
        "COUNT(*) counts every row. COUNT(column) counts only rows where that column is not NULL. COUNT(DISTINCT column) first removes repeated non-NULL values, then counts what remains.",
        "For example, the customer table has 60 rows, 55 filled-in cities, and customers from 6 different countries.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Three different counts from the same customer table",
      code: `SELECT
  COUNT(*)                AS customer_count,
  COUNT(city)             AS customers_with_city,
  COUNT(DISTINCT country) AS country_count
FROM customers;`,
    },
    {
      kind: "table",
      caption: "COUNT(DISTINCT country) counts USA once, UK once, and so on, not once per customer",
      headers: ["customer_count", "customers_with_city", "country_count"],
      rows: [["60", "55", "6"]],
    },
    {
      kind: "prose",
      heading: "Summarise a numeric column",
      body: [
        "SUM adds values together. AVG calculates their arithmetic mean. MIN and MAX find the endpoints. Like COUNT(column), these functions ignore NULL inputs.",
        "The products table has a price for every product, so it is a clean place to compare all four functions.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A catalogue-price summary",
      code: `SELECT
  SUM(price)            AS total_catalogue_price,
  ROUND(AVG(price), 2)  AS average_price,
  MIN(price)            AS lowest_price,
  MAX(price)            AS highest_price
FROM products;`,
    },
    {
      kind: "table",
      caption: "Result in the current Cycle Depot dataset",
      headers: ["total_catalogue_price", "average_price", "lowest_price", "highest_price"],
      rows: [["32515.00", "1083.83", "28.00", "5400.00"]],
    },
    {
      kind: "table",
      caption: "Choose the aggregate that matches the question",
      headers: ["Function", "Use it when you need", "Cycle Depot example"],
      rows: [
        ["COUNT(*)", "Every row", "How many orders exist?"],
        ["COUNT(city)", "Non-NULL values", "How many customers supplied a city?"],
        [
          "COUNT(DISTINCT country)",
          "Unique non-NULL values",
          "How many customer countries are represented?",
        ],
        ["SUM(price)", "A total", "What is the combined catalogue price?"],
        ["AVG(price)", "An average", "What is the typical product price?"],
        [
          "MIN / MAX(price)",
          "The lowest or highest value",
          "What are the cheapest and most expensive products?",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "COUNT(*) and COUNT(column) are not interchangeable",
      body: "Use COUNT(*) when the question is about rows. Use COUNT(column) only when you intentionally want to ignore missing values. COUNT(DISTINCT column) also ignores NULL and does not count repeated values more than once.",
    },
    {
      kind: "playground-practice",
      title: "Build a customer coverage summary",
      prompt:
        "Return one Cycle Depot summary row with the number of customers, the number with a city, and the number of distinct countries. Use COUNT(*), COUNT(city), and COUNT(DISTINCT country).",
      tables: ["customers"],
      successCheck:
        "One row with customer_count = 60, customers_with_city = 55, and country_count = 6.",
      href: "/sql-playground?practice=cycledepot-customer-coverage-summary",
    },
    {
      kind: "takeaways",
      items: [
        "Aggregates turn many rows into one summary value.",
        "COUNT(*) counts rows, while COUNT(column) skips NULL values.",
        "COUNT(DISTINCT column) counts each non-NULL value once.",
        "SUM, AVG, MIN, and MAX summarise numeric values and skip NULL inputs.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "aggregate-functions-count-all-rows",
          question: "Which expression counts every row in the orders table?",
          options: ["COUNT(*)", "COUNT(order_date)", "COUNT(DISTINCT id)", "SUM(id)"],
          correctIndex: 0,
          explanation:
            "COUNT(*) counts rows without looking at one particular column, so a NULL in another column does not remove the row from the count.",
        },
        {
          id: "aggregate-functions-count-non-null",
          question: "What does COUNT(city) count for Cycle Depot customers?",
          options: [
            "Only customers whose city is not NULL",
            "Every customer row, including missing cities",
            "Each distinct city once",
            "The number of characters in each city",
          ],
          correctIndex: 0,
          explanation:
            "COUNT(column) skips NULL values in that column. Use COUNT(*) when the question is about all customer rows.",
        },
        {
          id: "aggregate-functions-distinct",
          question: "Which expression returns the number of different non-NULL customer countries?",
          options: [
            "COUNT(DISTINCT country)",
            "COUNT(country)",
            "DISTINCT COUNT(country)",
            "SUM(DISTINCT country)",
          ],
          correctIndex: 0,
          explanation:
            "COUNT(DISTINCT country) removes repeated non-NULL country values before counting them.",
        },
        {
          id: "aggregate-functions-summary-choice",
          question: "Which aggregate answers: What is the highest Cycle Depot product price?",
          options: ["MAX(price)", "SUM(price)", "AVG(price)", "COUNT(price)"],
          correctIndex: 0,
          explanation:
            "MAX returns the largest non-NULL value. MIN returns the smallest, while SUM and AVG answer different questions.",
        },
      ],
    },
  ],
};

// ---------- 2.2 GROUP BY ----------
const groupByLesson: LessonContent = {
  slug: "group-by",
  title: "GROUP BY: One Summary per Group",
  subtitle:
    "Organise Cycle Depot orders into groups, then return one useful summary row for each group.",
  sections: [
    {
      kind: "prose",
      heading: "Turn one total into a breakdown",
      body: [
        "Without GROUP BY, an aggregate such as COUNT(*) returns one answer for the whole table. GROUP BY first separates the rows into groups that share the same value, then calculates one answer inside each group.",
        "For example, Cycle Depot has 142 orders in total. Grouping by status turns that one total into five status summaries, so the team can see how many orders are delivered, shipped, pending, returned, or cancelled.",
      ],
    },
    {
      kind: "image",
      src: groupByImg,
      alt: "A conceptual Cycle Depot diagram showing raw order rows flowing through GROUP BY status into Delivered, Shipped, Pending, Returned, and Cancelled buckets, then becoming one result row per status.",
      caption:
        "GROUP BY puts rows with the same status into the same bucket. An aggregate such as COUNT(*) then produces one summary row for each bucket.",
    },
    {
      kind: "prose",
      heading: "Plan the summary before writing SQL",
      body: [
        "A grouped query answers three questions: which column defines the groups, which rows or values are being summarised, and which aggregate should describe them. Writing down those choices prevents a query that is valid SQL but answers the wrong business question.",
      ],
    },
    {
      kind: "table",
      caption: "Designing a Cycle Depot order-status summary",
      headers: ["Question", "Choice"],
      rows: [
        ["What defines each group?", "order status"],
        ["What is counted?", "order rows"],
        ["Which operation?", "COUNT(*) AS order_count"],
        ["How should the result be inspected?", "ORDER BY order_count DESC"],
      ],
    },
    {
      kind: "animation",
      variant: "q-grpby",
      caption:
        "GROUP BY splits alike rows, applies an aggregate to each bucket, and combines the results.",
    },
    {
      kind: "prose",
      heading: "Add a second grouping column when you need a deeper split",
      body: [
        "A single grouping column gives one row per distinct value. Adding a second column gives one row per distinct pair of values. This is useful when a manager wants to compare order status across sales channels.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "One group for every status and channel pair",
      code: `SELECT
  status,
  channel,
  COUNT(*) AS order_count
FROM orders
GROUP BY status, channel
ORDER BY status, channel;`,
    },
    {
      kind: "table",
      caption: "Deterministic preview: the first five of the twelve status-and-channel groups",
      headers: ["status", "channel", "order_count"],
      rows: [
        ["cancelled", "store", "1"],
        ["cancelled", "web", "8"],
        ["delivered", "partner", "8"],
        ["delivered", "store", "25"],
        ["delivered", "web", "51"],
      ],
    },
    {
      kind: "table",
      caption: "The grouping key controls the number and meaning of result rows",
      headers: ["Query shape", "Result grain", "Current result size"],
      rows: [
        ["COUNT(*) with no GROUP BY", "The entire orders table", "1 row"],
        ["GROUP BY status", "One row per status", "5 rows"],
        ["GROUP BY status, channel", "One row per status-and-channel pair", "12 rows"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "The GROUP BY rule to keep visible",
      body: "Every expression in SELECT must either identify the group by appearing in GROUP BY, or reduce the group through an aggregate such as COUNT, SUM, or AVG. `SELECT status, channel, COUNT(*) FROM orders GROUP BY status` is not valid because one status can contain several channels. Add channel to GROUP BY, aggregate it, or remove it from SELECT.",
    },
    {
      kind: "prose",
      heading: "NULL values are a group. Missing groups are not.",
      body: [
        "Rows whose grouping column is NULL are placed together in one NULL group. In the current Cycle Depot customers table, five customers have no city, so GROUP BY city returns one NULL city row with a count of 5.",
        "A category with zero matching rows is different: it does not appear in a GROUP BY result at all. To show zero-activity categories, start with a complete reference list and later combine it with activity data using a LEFT JOIN.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A NULL city becomes one explicit group",
      code: `SELECT
  city,
  COUNT(*) AS customer_count
FROM customers
GROUP BY city
ORDER BY city;`,
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Include the group size with summary metrics",
      body: "A small group can make a metric look more meaningful than it is. Include COUNT(*) beside SUM or AVG so readers can judge reliability. For example, the returned status has 4 Cycle Depot orders, while delivered has 84.",
    },
    {
      kind: "prose",
      heading: "Group by a useful expression, not only a stored column",
      body: [
        "Real reports often group a transformed value. DATE_TRUNC creates calendar buckets, EXTRACT pulls out a date part, and CASE turns many raw values into business-friendly ranges. Repeat the expression in GROUP BY so SQL knows how the buckets are defined.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Monthly order volume with DATE_TRUNC",
      code: `SELECT
  DATE_TRUNC('month', order_date) AS order_month,
  COUNT(*) AS order_count
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY order_month;`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Yearly order volume with EXTRACT",
      code: `SELECT
  EXTRACT(YEAR FROM order_date) AS order_year,
  COUNT(*) AS order_count
FROM orders
GROUP BY EXTRACT(YEAR FROM order_date)
ORDER BY order_year;`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Turn product prices into reporting bands with CASE",
      code: `SELECT
  CASE
    WHEN price < 100 THEN 'under_100'
    WHEN price < 1000 THEN '100_to_999'
    ELSE '1000_plus'
  END AS price_band,
  COUNT(*) AS product_count,
  AVG(price) AS average_price
FROM products
GROUP BY CASE
  WHEN price < 100 THEN 'under_100'
  WHEN price < 1000 THEN '100_to_999'
  ELSE '1000_plus'
END
ORDER BY price_band;`,
    },
    {
      kind: "prose",
      heading: "Ordinal grouping is a shortcut, not a production habit",
      body: [
        "GROUP BY 1, 2 means group by the first and second expressions in SELECT. It is convenient while exploring at the keyboard, especially with long expressions. In production queries and data pipelines, prefer the explicit expressions because changing the SELECT order can silently change what the ordinal positions mean.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption:
        "Convenient ad hoc shortcut. Prefer explicit GROUP BY expressions in maintained SQL.",
      code: `SELECT
  EXTRACT(YEAR FROM order_date) AS order_year,
  status,
  COUNT(*) AS order_count
FROM orders
GROUP BY 1, 2
ORDER BY 1, 2;`,
    },
    {
      kind: "playground-practice",
      title: "Count orders by status",
      prompt:
        "Return one row for each Cycle Depot order status and the number of orders with that status. Select status and COUNT(*) AS order_count, group by status, and sort alphabetically by status.",
      tables: ["orders"],
      successCheck: "Five rows: cancelled 9, delivered 84, pending 13, returned 4, and shipped 32.",
      href: "/sql-playground?practice=cycledepot-order-counts-by-status",
    },
    {
      kind: "takeaways",
      items: [
        "GROUP BY produces one row per distinct key combination.",
        "Use DISTINCT to inspect the categories that can become groups before you aggregate them.",
        "Use an aggregate such as COUNT(*) to describe the rows in each group.",
        "Every selected expression must either identify the group in GROUP BY or reduce it with an aggregate.",
        "Adding another GROUP BY column makes the result more detailed because it creates groups for each distinct value pair.",
        "GROUP BY can use date and CASE expressions; ordinal positions are best kept to quick ad hoc exploration.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "group-by-result-grain",
          question:
            "What is the result grain of SELECT status, COUNT(*) FROM orders GROUP BY status?",
          options: [
            "One row per distinct status",
            "One row per order",
            "One row for the entire orders table",
            "One row per customer",
          ],
          correctIndex: 0,
          explanation:
            "The GROUP BY key defines the result grain. Grouping by status creates one summary row for each status value.",
        },
        {
          id: "group-by-select-rule",
          question: "Why is SELECT status, channel, COUNT(*) FROM orders GROUP BY status invalid?",
          options: [
            "channel is neither aggregated nor included in GROUP BY",
            "COUNT(*) cannot be used with GROUP BY",
            "status must be in HAVING instead",
            "GROUP BY requires an ORDER BY clause",
          ],
          correctIndex: 0,
          explanation:
            "Each selected expression must either identify the group by appearing in GROUP BY or reduce the group through an aggregate.",
        },
        {
          id: "group-by-two-columns",
          question: "What does GROUP BY status, channel create?",
          options: [
            "One group for every distinct status-and-channel pair",
            "One group for each status, ignoring channel",
            "One group for each channel, ignoring status",
            "A sorted copy of every order row",
          ],
          correctIndex: 0,
          explanation:
            "A second grouping column makes the result more detailed because the group key is now the unique pair of values.",
        },
        {
          id: "group-by-null-bucket",
          question: "How does GROUP BY city treat customer rows where city is NULL?",
          options: [
            "It puts them together in one NULL group",
            "It deletes them before grouping",
            "It gives every NULL row its own group",
            "It changes NULL into an empty string",
          ],
          correctIndex: 0,
          explanation:
            "NULL values in a grouping column form one visible NULL group. A group with no rows is different and does not appear at all.",
        },
      ],
    },
  ],
};

// ---------- 2.3 Evaluation Filtering (HAVING) ----------
const havingLesson: LessonContent = {
  slug: "having",
  title: "Evaluation Filtering (HAVING)",
  subtitle: "Use HAVING to keep or remove whole groups after an aggregate has calculated them.",
  sections: [
    {
      kind: "prose",
      heading: "Filter groups after you count them",
      body: [
        "WHERE and HAVING both remove data, but they work on different things. WHERE checks individual source rows. HAVING checks the groups created by GROUP BY after an aggregate such as COUNT(*) or SUM(...) has produced a value for each group.",
        "Use HAVING when the question sounds like: which groups have at least this many rows, enough revenue, or an average above a target?",
      ],
    },
    {
      kind: "image",
      src: havingImg,
      alt: "Cycle Depot orders flowing from a WHERE channel equals web row filter, through GROUP BY status summaries, to a HAVING count threshold that keeps delivered, shipped, and pending groups.",
      caption:
        "WHERE removes individual non-web orders first. GROUP BY counts the surviving web orders by status. HAVING then keeps only status groups with ten or more orders.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep order-status groups with at least ten orders",
      code: `SELECT
  status,
  COUNT(*) AS order_count
FROM orders
GROUP BY status
HAVING COUNT(*) >= 10
ORDER BY order_count DESC, status ASC;`,
    },
    {
      kind: "table",
      caption: "Result in the current Cycle Depot dataset",
      headers: ["status", "order_count"],
      rows: [
        ["delivered", "84"],
        ["shipped", "32"],
        ["pending", "13"],
      ],
    },
    {
      kind: "animation",
      variant: "q-having",
      caption: "WHERE filters rows first. HAVING filters the finished summaries.",
    },
    {
      kind: "prose",
      heading: "Put each condition in the right clause",
      body: [
        "Ask what your condition describes. If it describes one order, place it in WHERE. If it describes a count, sum, average, minimum, or maximum for an entire group, place it in HAVING.",
      ],
    },
    {
      kind: "table",
      caption: "A quick decision guide",
      headers: ["Condition asks about", "Use", "Cycle Depot example"],
      rows: [
        ["One order row", "WHERE", "channel = 'web'"],
        ["A completed group", "HAVING", "COUNT(*) >= 10"],
        ["A group column value", "WHERE, usually", "status <> 'cancelled'"],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "First keep web orders, then keep web-status groups with ten or more orders",
      code: `SELECT
  status,
  COUNT(*) AS order_count
FROM orders
WHERE channel = 'web'
GROUP BY status
HAVING COUNT(*) >= 10
ORDER BY order_count DESC, status ASC;`,
    },
    {
      kind: "table",
      caption: "The web channel has three qualifying status groups",
      headers: ["status", "order_count"],
      rows: [
        ["delivered", "51"],
        ["shipped", "13"],
        ["pending", "10"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "COUNT(*) cannot go in WHERE",
      body: "`WHERE COUNT(*) >= 10` is invalid because COUNT(*) does not exist until after GROUP BY has formed the groups. Put aggregate conditions in HAVING. Repeat the aggregate expression instead of relying on its SELECT alias for portable SQL.",
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Filter rows as early as possible",
      body: "Keep row-level conditions in WHERE even when a database also accepts them in HAVING. Filtering web orders before grouping means the database has fewer rows to aggregate and can more easily use an index when one is available.",
    },
    {
      kind: "playground-practice",
      title: "Find active order-status groups",
      prompt:
        "Return each Cycle Depot order status with at least ten orders. Select status and COUNT(*) AS order_count, group by status, filter the groups with HAVING COUNT(*) >= 10, and sort from largest count to smallest.",
      tables: ["orders"],
      successCheck: "Three rows: delivered 84, shipped 32, and pending 13.",
      href: "/sql-playground?practice=cycledepot-order-statuses-with-at-least-ten-orders",
    },
    {
      kind: "takeaways",
      items: [
        "WHERE filters individual rows before GROUP BY creates groups.",
        "HAVING filters completed groups after an aggregate has calculated each group value.",
        "Use HAVING for aggregate conditions such as COUNT(*) >= 10 and SUM(...) > a target.",
        "Keep row-level conditions in WHERE to reduce the rows that must be grouped.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "having-clause-purpose",
          question: "Which clause keeps only status groups with at least ten orders?",
          options: [
            "HAVING COUNT(*) >= 10",
            "WHERE COUNT(*) >= 10",
            "GROUP BY COUNT(*) >= 10",
            "ORDER BY COUNT(*) >= 10",
          ],
          correctIndex: 0,
          explanation:
            "HAVING filters completed groups, after GROUP BY and COUNT(*) have produced a count for each group.",
        },
        {
          id: "having-row-filter",
          question:
            "Where should channel = 'web' go when the query first keeps web orders, then groups them by status?",
          options: ["WHERE", "HAVING", "SELECT", "ORDER BY"],
          correctIndex: 0,
          explanation:
            "channel describes each source order row, so WHERE removes non-web rows before the grouping work begins.",
        },
        {
          id: "having-aggregate-timing",
          question: "Why is WHERE COUNT(*) >= 10 invalid in this grouped query?",
          options: [
            "COUNT(*) is calculated only after groups have been formed",
            "WHERE can be used only with text columns",
            "COUNT(*) always returns NULL in WHERE",
            "GROUP BY must contain at least two columns",
          ],
          correctIndex: 0,
          explanation:
            "WHERE runs on individual input rows. The aggregate value exists later, after GROUP BY, so the aggregate condition belongs in HAVING.",
        },
        {
          id: "having-filter-order",
          question:
            "What is the useful order for a query that filters web orders and then keeps only large status groups?",
          options: [
            "WHERE, GROUP BY, HAVING",
            "HAVING, WHERE, GROUP BY",
            "GROUP BY, WHERE, HAVING",
            "ORDER BY, WHERE, GROUP BY",
          ],
          correctIndex: 0,
          explanation:
            "First WHERE reduces source rows, GROUP BY builds summaries from the survivors, and HAVING filters those finished summaries.",
        },
      ],
    },
  ],
};

// ---------- Aggregations & GROUP BY: Final Quiz ----------
const aggregationsFinalQuiz: LessonContent = {
  slug: "aggregations-quiz",
  title: "Aggregations & GROUP BY: Final Quiz",
  subtitle:
    "Check your understanding of aggregate functions, grouping grain, expressions, and HAVING.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "aggregations-final-count-rows",
          question: "What does COUNT(*) return for a group of orders?",
          options: [
            "The number of rows in the group, including rows with NULL values in individual columns",
            "Only the number of orders whose status is not NULL",
            "The total of every numeric column in the group",
            "One result row for every source row",
          ],
          correctIndex: 0,
          explanation:
            "COUNT(*) counts rows. It does not inspect a particular column, so NULL values in individual columns do not remove a row from the count.",
        },
        {
          id: "aggregations-final-count-column",
          question: "Which expression counts only customers that supplied a city?",
          options: ["COUNT(*)", "COUNT(city)", "COUNT(DISTINCT *)", "SUM(city)"],
          correctIndex: 1,
          explanation:
            "COUNT(column) ignores NULL values in that column, so COUNT(city) counts only rows with a city value.",
        },
        {
          id: "aggregations-final-count-distinct",
          question: "What does COUNT(DISTINCT country) count?",
          options: [
            "Every country value, including repeats and NULL",
            "Each unique non-NULL country once",
            "Only the most frequent country",
            "The number of columns named country",
          ],
          correctIndex: 1,
          explanation:
            "COUNT(DISTINCT column) removes duplicate non-NULL values before counting and ignores NULL.",
        },
        {
          id: "aggregations-final-aggregate-choice",
          question:
            "Which aggregate answers: What is the total catalogue price of all Cycle Depot products?",
          options: ["AVG(price)", "COUNT(price)", "SUM(price)", "MAX(price)"],
          correctIndex: 2,
          explanation: "SUM adds the numeric values together to produce a total.",
        },
        {
          id: "aggregations-final-grain",
          question:
            "What is the result grain of SELECT status, COUNT(*) FROM orders GROUP BY status?",
          options: [
            "One row for the whole orders table",
            "One row per order",
            "One row per distinct status",
            "One row per customer",
          ],
          correctIndex: 2,
          explanation:
            "The GROUP BY key defines the result grain. Grouping by status creates one summary row for each distinct status.",
        },
        {
          id: "aggregations-final-group-rule",
          question:
            "Why is this query invalid? SELECT status, channel, COUNT(*) FROM orders GROUP BY status;",
          options: [
            "COUNT(*) cannot be used with GROUP BY",
            "channel is neither aggregated nor included in GROUP BY",
            "status can only be used in ORDER BY",
            "GROUP BY must always contain two columns",
          ],
          correctIndex: 1,
          explanation:
            "Every selected expression must either identify a group by appearing in GROUP BY or reduce that group with an aggregate.",
        },
        {
          id: "aggregations-final-multiple-columns",
          question: "What does GROUP BY status, channel create?",
          options: [
            "One group for every distinct status-and-channel pair",
            "One group for every status, ignoring channel",
            "One group for every channel, ignoring status",
            "A sorted copy of the orders table",
          ],
          correctIndex: 0,
          explanation:
            "Adding a grouping column makes the result more detailed: each unique pair becomes its own group.",
        },
        {
          id: "aggregations-final-expression",
          question:
            "When SELECT includes DATE_TRUNC('month', order_date) AS order_month, what should a portable grouped query use to define the same groups?",
          options: [
            "GROUP BY order_date",
            "GROUP BY DATE_TRUNC('month', order_date)",
            "GROUP BY COUNT(*)",
            "HAVING DATE_TRUNC('month', order_date)",
          ],
          correctIndex: 1,
          explanation:
            "Repeat the grouping expression so SQL knows that all dates in the same truncated month belong in one group.",
        },
        {
          id: "aggregations-final-ordinal",
          question: "Why are GROUP BY 1, 2 positions best limited to quick ad hoc exploration?",
          options: [
            "They do not support aggregate functions",
            "Changing the SELECT order can silently change what the positions mean",
            "They always create only one group",
            "They cannot be used with ORDER BY",
          ],
          correctIndex: 1,
          explanation:
            "Ordinal positions refer to SELECT-list order. Explicit column names or expressions are clearer and safer in maintained SQL.",
        },
        {
          id: "aggregations-final-having",
          question: "Which clause keeps only order-status groups containing at least ten orders?",
          options: [
            "WHERE COUNT(*) >= 10",
            "GROUP BY COUNT(*) >= 10",
            "HAVING COUNT(*) >= 10",
            "ORDER BY COUNT(*) >= 10",
          ],
          correctIndex: 2,
          explanation:
            "HAVING filters finished groups after GROUP BY and COUNT(*) have produced a value for each group.",
        },
      ],
    },
  ],
};

// ---------- Advanced SQL: Multi-Dimensional Aggregations (GROUPING SETS) ----------
const groupingSets: LessonContent = {
  slug: "grouping-sets",
  title: "Multi-Dimensional Aggregations (GROUPING SETS / ROLLUP / CUBE)",
  subtitle:
    "Build related detail rows and subtotals in one grouped query, without separate UNION ALL queries.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "BI dashboards need totals at multiple grains — region, region+quarter, grand total. UNION ALL of separate GROUP BYs scans the table once per query.",
        "GROUPING SETS streams each row into multiple accumulator arrays simultaneously — one scan, all marginal totals.",
      ],
    },
    {
      kind: "animation",
      variant: "q-cube",
      caption: "Each row fans into multiple bucket lanes — one per grouping set.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Source rows sit left; three bucket arrays (region, quarter, region×quarter) and a grand-total pill sit right.",
        "Each row fans into all three arrays and the grand-total pill simultaneously. The source scan bar shows it runs exactly once.",
        "Viewport contains region totals, quarter totals, detail rows, and the grand total. The GROUPING() column marks which dimension was rolled up.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "One scan, every margin",
      code: `-- /* Phase 1: single pass over the fact table */
SELECT region,
       quarter,
       SUM(amount) AS revenue,
       GROUPING(region)  AS region_is_total,   -- /* 1 = aggregated out */
       GROUPING(quarter) AS quarter_is_total
FROM   sales_fact
GROUP  BY GROUPING SETS (                      -- /* Phase 2: each row fans into 4 buckets */
  (region, quarter),                           -- /* detail grain */
  (region),                                    -- /* region subtotal */
  (quarter),                                   -- /* quarter subtotal */
  ()                                           -- /* grand total */
)
ORDER  BY region NULLS LAST, quarter NULLS LAST;

-- /* ROLLUP is shorthand for hierarchical subtotals */
SELECT region, quarter, SUM(amount)
FROM   sales_fact
GROUP  BY ROLLUP (region, quarter);            -- /* = GROUPING SETS ((region,quarter),(region),()) */

-- /* CUBE is shorthand for the full lattice */
SELECT region, quarter, SUM(amount)
FROM   sales_fact
GROUP  BY CUBE (region, quarter);              -- /* every subset of the two dimensions */`,
    },
    {
      kind: "table",
      caption: "Shorthand expansions",
      headers: ["Construct", "Expands to"],
      rows: [
        ["ROLLUP(a, b)", "(a,b), (a), ()"],
        ["ROLLUP(a, b, c)", "(a,b,c), (a,b), (a), ()"],
        ["CUBE(a, b)", "(a,b), (a), (b), ()"],
        ["GROUPING SETS(...)", "Explicit list — no expansion"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        [
          "Warm-up [1303]",
          "Find the Team Size",
          "Basic GROUP BY producing per-key totals (warmup for marginal sums).",
        ],
        ["Drill [1393]", "Capital Gain/Loss", "Multi-dimensional aggregation across two pivots."],
        [
          "Challenge [1212]",
          "Team Scores in Football Tournament",
          "Multi-grain totals fused with self-join / UNION ALL alternatives.",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Logic Trap — rollup NULLs vs data NULLs",
      body: "A NULL region can mean the source row had no region OR that region was rolled up. Read GROUPING(region) = 1 to distinguish — without it you double-count real NULLs as subtotals.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "One scan vs N scans",
      body: "PostgreSQL implements GROUPING SETS as a single heap scan plus one sort — vs N scans for equivalent UNION ALL queries. Memory peaks at the largest grouping set; spills write partial aggregates to disk in batches.",
    },
    {
      kind: "takeaways",
      items: [
        "GROUPING SETS produces all marginal totals in one table pass.",
        "ROLLUP = hierarchical subtotals; CUBE = full lattice.",
        "Use GROUPING(col) to distinguish real NULLs from roll-up NULLs.",
        "Always faster than the equivalent UNION ALL of separate GROUP BYs.",
      ],
    },
  ],
};

// =============================================================
// MODULE 3: JOINS
// =============================================================

// ---------- 3.1 Inner Joins & Join Conditions ----------
const innerJoinsConditions: LessonContent = {
  slug: "inner-joins-conditions",
  title: "Inner Joins & Join Conditions",
  subtitle:
    "JOIN … ON / equi-join / USING / multi-column keys / IS NOT DISTINCT FROM (null-safe) / NATURAL JOIN (and why to avoid it)",
  sections: [
    {
      kind: "prose",
      heading: "An inner join keeps matching pairs",
      body: [
        "ShopFlow stores each order separately from the customer who placed it. An `INNER JOIN` combines an order with its customer only when the `ON` join condition is true. The resulting row grain is one row per matching order.",
        "ShopFlow enforces `orders.customer_id` as a `FOREIGN KEY` to `customers.customer_id`, making this a clear `equi-join`.",
      ],
    },
    {
      kind: "image-carousel",
      images: [
        {
          src: shopflowInnerJoinExampleRowsImg,
          alt: "ShopFlow example rows show three matching customer IDs flowing from orders and customers into an INNER JOIN result, while two unmatched rows are excluded.",
          caption:
            "The three mint customer_id values match and become joined rows. Order 4 and customer 2000 have no partner, so an INNER JOIN excludes them.",
        },
        {
          src: shopflowInnerJoinVennImg,
          alt: "A Venn diagram that places matching ShopFlow customer IDs 1785, 797, and 1600 in the INNER JOIN overlap, while unmatched IDs 9999 and 2000 remain outside it.",
          caption:
            "The overlap keeps 1785, 797, and 1600 because each ID exists in both tables. 9999 and 2000 have no counterpart, so INNER JOIN excludes them.",
        },
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Match each ShopFlow order to its customer",
      code: [
        "SELECT o.order_id, o.customer_id, o.order_date, c.first_name, c.last_name, o.total_amount",
        "FROM orders AS o",
        "JOIN customers AS c",
        "  ON o.customer_id = c.customer_id",
        "ORDER BY o.order_id",
        "LIMIT 5;",
      ].join("\n"),
    },
    {
      kind: "animation",
      variant: "q-shopflow-inner-joins",
      caption:
        "Follow complete examples for ON, USING, composite keys, null-safe equality, and why an explicit ON is safer than NATURAL JOIN.",
    },
    {
      kind: "prose",
      heading: "ON states the relationship",
      body: [
        "The ON clause is a boolean condition. o.customer_id = c.customer_id is an equi-join because it compares related keys with equals. Qualify columns with aliases so the source of each value remains obvious.",
        "USING (customer_id) is concise when both tables intentionally use exactly the same key name. Prefer ON when names differ, when a condition has more than one comparison, or when you want the relationship unmistakable.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Use USING for intentionally same-named keys",
      code: [
        "SELECT o.order_id, customer_id, c.first_name, c.last_name",
        "FROM orders AS o",
        "JOIN customers AS c USING (customer_id)",
        "ORDER BY o.order_id",
        "LIMIT 5;",
      ].join("\n"),
    },
    {
      kind: "prose",
      heading: "Match every part of a key",
      body: [
        "ShopFlow order_items has the composite primary key (order_id, product_id). A multi-column relationship must compare every key column; joining only part of a composite key changes the row grain and can multiply rows.",
        "Ordinary equality does not match NULL to NULL. When two absent optional values should match, use IS NOT DISTINCT FROM. Avoid NATURAL JOIN: it automatically joins every shared column name, so a schema change can silently change the result.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A complete multi-column join condition",
      code: [
        "SELECT a.product_id, a.warehouse_id, a.quantity",
        "FROM inventory AS a",
        "JOIN inventory AS b",
        "  ON a.product_id = b.product_id",
        " AND a.warehouse_id = b.warehouse_id",
        "WHERE a.product_id = 1",
        "ORDER BY a.warehouse_id;",
        "",
        "-- Null-safe equality: a.optional_code IS NOT DISTINCT FROM b.optional_code",
      ].join("\n"),
    },
    {
      kind: "prose",
      heading: "Use null-safe equality only when missing means the same thing",
      body: [
        "`=` does not consider NULL equal to NULL. If a join key is optional and two missing values are supposed to represent the same bucket, use `IS NOT DISTINCT FROM` in the ON condition. It matches equal non-NULL values and matches NULL with NULL.",
        "ShopFlow does not store a nullable shared join key, so the runnable example uses small query-local code lists. In production, apply this deliberately to an optional key with documented missing-value semantics.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Null-safe equality matches the two NULL code values",
      code: [
        "WITH order_codes(order_id, referral_code) AS (",
        "  VALUES (1, 'WELCOME'), (2, NULL)",
        "), customer_codes(customer_id, referral_code) AS (",
        "  VALUES (1785, 'WELCOME'), (797, NULL)",
        ")",
        "SELECT o.order_id, c.customer_id, o.referral_code",
        "FROM order_codes AS o",
        "JOIN customer_codes AS c",
        "  ON o.referral_code IS NOT DISTINCT FROM c.referral_code",
        "ORDER BY o.order_id;",
      ].join("\n"),
    },
    {
      kind: "callout",
      tone: "info",
      title: "Null-safe equality is deliberate",
      body: "`a.code = b.code` becomes unknown when either value is NULL, including when both are NULL. `a.code IS NOT DISTINCT FROM b.code` treats two NULL values as equal. Use it only when missing values mean the same thing for this relationship.",
    },
    {
      kind: "prose",
      heading: "NATURAL JOIN hides the most important line",
      body: [
        "`NATURAL JOIN` finds every shared column name and makes them join conditions. Today, ShopFlow orders and customers share `customer_id`, so it can appear to work. It is fragile because adding another shared name later changes the query without changing its text.",
        "The safe form says the one relationship you intend. This is the query to write in application code and reviews.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A fragile NATURAL JOIN and its explicit, reviewable replacement",
      code: [
        "-- Avoid: the condition is inferred from every same-named column.",
        "-- SELECT o.order_id, customer_id, c.first_name",
        "-- FROM orders AS o NATURAL JOIN customers AS c;",
        "",
        "SELECT o.order_id, o.customer_id, c.first_name, c.last_name",
        "FROM orders AS o",
        "JOIN customers AS c",
        "  ON o.customer_id = c.customer_id",
        "ORDER BY o.order_id",
        "LIMIT 5;",
      ].join("\n"),
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Avoid NATURAL JOIN",
      body: "NATURAL JOIN chooses every shared column automatically. Adding country, status, or another shared name later can silently tighten the condition. Write ON or USING explicitly.",
    },
    {
      kind: "playground-practice",
      title: "Join ShopFlow orders to customers",
      prompt:
        "Use an explicit `JOIN ... ON` to return each order, its customer_id, date, and amount beside the customer's first and last name. The checked ShopFlow exercise verifies the columns, relationship, and row order.",
      tables: ["orders", "customers"],
      successCheck: "Five ordered ShopFlow rows with the join key and its matched customer.",
      href: "/sql-playground?practice=shopflow-join-orders-customers",
    },
    {
      kind: "takeaways",
      items: [
        "INNER JOIN returns only pairs satisfying ON.",
        "An equi-join compares related keys with equals.",
        "USING is for intentionally same-named keys.",
        "Composite relationships require every key column.",
        "Use IS NOT DISTINCT FROM for null-safe equality; avoid NATURAL JOIN.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "join-inner-grain",
          question: "What does an INNER JOIN keep?",
          options: [
            "Only pairs whose ON condition is true",
            "Every left row",
            "Every possible pair",
            "Only NULL keys",
          ],
          correctIndex: 0,
          explanation: "Inner joins discard unmatched rows from both inputs.",
        },
        {
          id: "join-equi",
          question: "Why is o.customer_id = c.customer_id an equi-join?",
          options: [
            "It compares related keys with equals",
            "It keeps every left row",
            "It matches NULL values",
            "It creates every possible pair",
          ],
          correctIndex: 0,
          explanation: "An equi-join uses equality to relate key values.",
        },
        {
          id: "join-using",
          question: "When is USING (customer_id) appropriate?",
          options: [
            "Both tables intentionally share the same key name",
            "Keys have different names",
            "The join needs no keys",
            "You want every shared column matched",
          ],
          correctIndex: 0,
          explanation: "USING is shorthand for one or more intentionally same-named join columns.",
        },
        {
          id: "join-composite",
          question: "How should a composite inventory key of (product_id, warehouse_id) be joined?",
          options: [
            "Compare both product_id and warehouse_id",
            "Compare product_id only",
            "Use NATURAL JOIN",
            "Compare warehouse_id only",
          ],
          correctIndex: 0,
          explanation:
            "Every column that identifies the relationship belongs in the join condition.",
        },
        {
          id: "join-null-safe",
          question: "Which operator treats NULL and NULL as equal?",
          options: ["IS NOT DISTINCT FROM", "=", "<>", "LIKE"],
          correctIndex: 0,
          explanation: "IS NOT DISTINCT FROM is null-safe equality.",
        },
        {
          id: "join-natural",
          question: "Why avoid NATURAL JOIN?",
          options: [
            "Schema changes can silently change its condition",
            "It cannot join keys",
            "It creates a cross join",
            "It rejects aliases",
          ],
          correctIndex: 0,
          explanation: "It joins every current shared column name automatically.",
        },
      ],
    },
  ],
};

// ---------- 3.2 Outer Joins & NULL Semantics ----------
const outerJoinsNull: LessonContent = {
  slug: "outer-joins-null",
  title: "Outer Joins & NULL Semantics",
  subtitle:
    "LEFT / RIGHT / FULL OUTER JOIN / unmatched rows → NULL / filter in ON vs WHERE / FULL JOIN for table diffs",
  sections: [
    {
      kind: "prose",
      heading: "Outer joins preserve a side of the relationship",
      body: [
        "An `INNER JOIN` returns only matching pairs. An outer join also keeps rows from a chosen input when no partner exists. The missing side is represented with `NULL`, not a made-up order or customer.",
        "In ShopFlow, customer 1619, Hana Morgan, has no order. A `LEFT JOIN` from customers to orders keeps Hana in the output and fills the order columns with NULL. That makes quiet customers visible in a customer report.",
      ],
    },
    {
      kind: "image-carousel",
      images: [
        {
          src: shopflowOuterJoinImg,
          alt: "A ShopFlow LEFT JOIN diagram showing customers Priya, Miles, and Hana next to two matched orders. Hana has no matching order and receives NULL order values.",
          caption:
            "LEFT JOIN preserves every customer. Priya and Miles match orders; Hana remains with NULL order_id and total_amount.",
        },
        {
          src: shopflowFullJoinDiffImg,
          alt: "A FULL OUTER JOIN table-diff diagram showing customer IDs shared by two scoped lists, one ID only in the report list, and one only in the recent-order list.",
          caption:
            "FULL OUTER JOIN makes differences visible: 1619 occurs only in the report list, while 1261 occurs only in the recent-order list.",
        },
        {
          src: shopflowOuterJoinVennImg,
          alt: "Three Venn diagrams comparing ShopFlow customer IDs retained by LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN. Customer IDs 797 and 1600 overlap; 1619 is only in customers and 1261 only in orders.",
          caption:
            "The shaded area is the result: LEFT keeps customers, RIGHT keeps orders, and FULL OUTER keeps both lists. IDs 797 and 1600 match in every version.",
        },
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep every selected customer, even without an order",
      code: [
        "SELECT c.customer_id, c.first_name, o.order_id, o.total_amount",
        "FROM customers AS c",
        "LEFT JOIN orders AS o",
        "  ON c.customer_id = o.customer_id",
        " AND o.order_id IN (2, 3)",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "ORDER BY c.customer_id;",
      ].join("\n"),
    },
    {
      kind: "table",
      caption: "The preserved customer gets NULLs for missing order columns",
      headers: ["customer_id", "first_name", "order_id", "total_amount"],
      rows: [
        ["797", "Priya", "2", "659.70"],
        ["1600", "Miles", "3", "377.61"],
        ["1619", "Hana", "NULL", "NULL"],
      ],
    },
    {
      kind: "animation",
      variant: "q-shopflow-outer-joins",
      caption:
        "Step through preservation, NULL padding, predicate placement, and a FULL JOIN table diff using real ShopFlow values.",
    },
    {
      kind: "prose",
      heading: "LEFT and RIGHT are mirror images",
      body: [
        "`LEFT JOIN` preserves every row from the table on the left of the join. `RIGHT JOIN` preserves every row from the table on the right. They can express the same result by swapping table order, but `LEFT JOIN` is usually easier to read because the preserved entity appears first.",
        "For example, `customers LEFT JOIN orders` and `orders RIGHT JOIN customers` both keep Hana. Choose the spelling that makes the report's primary entity clear.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "The same preserved-customer result written with RIGHT JOIN",
      code: [
        "SELECT c.customer_id, c.first_name, o.order_id, o.total_amount",
        "FROM orders AS o",
        "RIGHT JOIN customers AS c",
        "  ON c.customer_id = o.customer_id",
        " AND o.order_id IN (2, 3)",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "ORDER BY c.customer_id;",
      ].join("\n"),
    },
    {
      kind: "prose",
      heading: "ON decides matching; WHERE filters finished rows",
      body: [
        "With an outer join, the placement of a condition changes the meaning. Put a condition on the optional table in `ON` when you still want every preserved row. If an order is not paid, it simply fails to match and its order columns become NULL.",
        "A right-table condition in `WHERE` runs after the join. NULL does not satisfy `o.status = 'paid'`, so the WHERE clause removes unmatched customers too. That often turns a LEFT JOIN into an inner join by accident.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep all customers while matching paid orders only",
      code: [
        "SELECT c.customer_id, c.first_name, o.order_id, o.status",
        "FROM customers AS c",
        "LEFT JOIN orders AS o",
        "  ON c.customer_id = o.customer_id",
        " AND o.order_id IN (2, 3)",
        " AND o.status = 'paid'",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "ORDER BY c.customer_id;",
        "",
        "-- Do not move o.status = 'paid' into WHERE when Hana must remain.",
      ].join("\n"),
    },
    {
      kind: "callout",
      tone: "warn",
      title: "The ON vs WHERE outer-join trap",
      body: "`ON` controls whether an optional-side row matches. `WHERE` removes rows from the joined result. With a LEFT JOIN, `WHERE o.status = 'paid'` discards every row whose order columns are NULL, including customers with no order.",
    },
    {
      kind: "prose",
      heading: "FULL OUTER JOIN reveals a table difference",
      body: [
        "`FULL OUTER JOIN` preserves both inputs. A matching key produces one combined row; a key found on only one side gets NULL values for the other side. It is a useful reconciliation pattern for two scoped lists, imports, snapshots, or reports.",
        "The query below compares a report's customer list with customers who placed a recent order. The lists are deliberately scoped: customer 1261 is a real ShopFlow customer, but is absent from the report list, while Hana is absent from the recent-order list.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find IDs that occur on only one side",
      code: [
        "WITH report_customers(customer_id) AS (",
        "  VALUES (797), (1600), (1619)",
        "), recent_order_customers(customer_id) AS (",
        "  VALUES (797), (1600), (1261)",
        ")",
        "SELECT COALESCE(r.customer_id, o.customer_id) AS customer_id,",
        "       r.customer_id IS NOT NULL AS in_report,",
        "       o.customer_id IS NOT NULL AS in_recent_orders",
        "FROM report_customers AS r",
        "FULL OUTER JOIN recent_order_customers AS o",
        "  ON r.customer_id = o.customer_id",
        "ORDER BY customer_id;",
      ].join("\n"),
    },
    {
      kind: "playground-practice",
      title: "Preserve ShopFlow customers with LEFT JOIN",
      prompt:
        "Return customers 797, 1600, and 1619 beside orders 2 and 3. Keep Hana's NULL order columns by putting the order filter in `ON`.",
      tables: ["customers", "orders"],
      successCheck: "Three ordered customers, including Hana with NULL order_id and total_amount.",
      href: "/sql-playground?practice=shopflow-preserve-customers-with-left-join",
    },
    {
      kind: "takeaways",
      items: [
        "LEFT JOIN preserves every left row; RIGHT JOIN preserves every right row.",
        "An unmatched preserved row has NULLs on the missing side.",
        "Put optional-side match conditions in ON when preserved rows must remain.",
        "A right-side WHERE condition removes NULL-padded rows.",
        "FULL OUTER JOIN preserves both lists and is useful for reconciliation and table diffs.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "outer-left",
          question: "Which rows does customers LEFT JOIN orders preserve?",
          options: [
            "Every customer",
            "Every order",
            "Only matching pairs",
            "Only customers with NULL IDs",
          ],
          correctIndex: 0,
          explanation: "LEFT JOIN preserves all rows from the left input, customers.",
        },
        {
          id: "outer-null",
          question:
            "What appears in order columns for a preserved customer with no matching order?",
          options: ["NULL", "0", "An empty customer row", "The previous order"],
          correctIndex: 0,
          explanation: "Outer joins NULL-pad values from the missing side.",
        },
        {
          id: "outer-right",
          question: "What does RIGHT JOIN preserve?",
          options: [
            "Every row from the right input",
            "Every row from the left input",
            "Only matching rows",
            "Only NULL rows",
          ],
          correctIndex: 0,
          explanation: "RIGHT JOIN is the mirror of LEFT JOIN: it preserves the right table.",
        },
        {
          id: "outer-on",
          question: "Where should o.status = 'paid' go if every customer must remain?",
          options: ["In the LEFT JOIN ON condition", "In WHERE", "In GROUP BY", "In SELECT only"],
          correctIndex: 0,
          explanation:
            "A condition in ON controls whether an optional order matches without removing a preserved customer.",
        },
        {
          id: "outer-where",
          question: "Why can WHERE o.status = 'paid' break a LEFT JOIN report?",
          options: [
            "It removes NULL-padded customers after the join",
            "It changes all amounts to NULL",
            "It creates duplicate customers",
            "It converts status to text",
          ],
          correctIndex: 0,
          explanation:
            "NULL does not satisfy the WHERE predicate, so unmatched left rows are filtered out.",
        },
        {
          id: "outer-full",
          question: "Which join is best for finding keys present in either of two lists?",
          options: ["FULL OUTER JOIN", "INNER JOIN", "CROSS JOIN", "NATURAL JOIN"],
          correctIndex: 0,
          explanation:
            "FULL OUTER JOIN preserves both inputs, exposing keys that occur on only one side.",
        },
      ],
    },
  ],
};

// ---------- 3.3 Cross Joins & Self Joins ----------
const crossSelfJoins: LessonContent = {
  slug: "cross-self-joins",
  title: "Cross Joins & Self Joins",
  subtitle:
    "CROSS JOIN / Cartesian product / self-join with aliases / pairwise comparison / generating combinations",
  sections: [
    {
      kind: "prose",
      heading: "Cross joins deliberately make every pairing",
      body: [
        "A CROSS JOIN has no ON condition. It returns the Cartesian product: every row on the left paired with every row on the right. If the inputs contain m and n rows, the result contains m × n rows.",
        "That can be exactly what a report needs. For example, start with selected ShopFlow customers and a short list of contact channels to generate a complete customer-channel plan, including combinations that have not happened yet.",
      ],
    },
    {
      kind: "image-carousel",
      images: [
        {
          src: shopflowCrossJoinImg,
          alt: "A ShopFlow CROSS JOIN diagram showing three customers paired with two contact channels to make six rows.",
          caption:
            "CROSS JOIN repeats each customer once per channel. Three customers multiplied by two channels produces six planned combinations.",
        },
        {
          src: shopflowSelfJoinImg,
          alt: "A self-join diagram showing ShopFlow customers aliased as a and b, then producing one unique same-country pair between Priya Singh and Hana Morgan.",
          caption:
            "Aliases let the same customers table play two roles. The less-than test removes self-pairs and reverse duplicates.",
        },
        {
          src: shopflowCrossSelfVennComparisonImg,
          alt: "A side-by-side Venn-style comparison of a ShopFlow CROSS JOIN and a ShopFlow self join with aliases and unique pairs.",
          caption:
            "Compare the shapes: CROSS JOIN pairs two separate inputs in full; a self join gives one table two aliases, then a condition such as a.customer_id < b.customer_id keeps only unique pairs.",
        },
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Generate every selected customer-channel combination",
      code: [
        "WITH channels(channel) AS (",
        "  VALUES ('email'), ('sms')",
        ")",
        "SELECT c.first_name, ch.channel",
        "FROM customers AS c",
        "CROSS JOIN channels AS ch",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "ORDER BY c.customer_id, ch.channel;",
      ].join("\n"),
    },
    {
      kind: "table",
      caption: "Deterministic preview: 3 customers × 2 channels",
      headers: ["first_name", "channel"],
      rows: [
        ["Priya", "email"],
        ["Priya", "sms"],
        ["Miles", "email"],
        ["Miles", "sms"],
        ["Hana", "email"],
        ["Hana", "sms"],
      ],
    },
    {
      kind: "animation",
      variant: "q-shopflow-cross-self-joins",
      caption:
        "Watch the Cartesian product expand, then see aliases turn one table into two roles for pairwise and manager comparisons.",
    },
    {
      kind: "prose",
      heading: "Cartesian products grow quickly",
      body: [
        "A CROSS JOIN is not an accidental substitute for a missing join condition. With 2,000 ShopFlow customers and 30 categories, it would produce 60,000 rows before later clauses run. Estimate the multiplication before you execute it.",
        "Use it intentionally to create calendars, parameter grids, missing-report rows, or every possible pairing. Otherwise, write an explicit join condition that states the relationship you mean.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Measure a CROSS JOIN before selecting its rows",
      code: [
        "SELECT COUNT(*) AS combination_count",
        "FROM customers AS c",
        "CROSS JOIN (VALUES ('email'), ('sms')) AS ch(channel)",
        "WHERE c.customer_id IN (797, 1600, 1619);",
      ].join("\n"),
    },
    {
      kind: "callout",
      tone: "warn",
      title: "No ON condition means multiplication",
      body: "A CROSS JOIN is intentional only when you want every pairing. If you expected matching keys, a missing ON clause can turn a small query into millions of rows.",
    },
    {
      kind: "prose",
      heading: "A self-join compares a table with itself",
      body: [
        "A self-join uses the same table twice, with aliases that give each copy a distinct role. Here a is the first customer and b is the second customer. The join finds customers in the same country.",
        "Pairwise queries need an inequality such as a.customer_id < b.customer_id. It excludes each row matched to itself and prevents the duplicate reverse pair: Priya-Hana is kept, while Hana-Priya is not.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find unique selected customer pairs in the same country",
      code: [
        "SELECT a.first_name AS customer_a,",
        "       b.first_name AS customer_b,",
        "       a.country",
        "FROM customers AS a",
        "JOIN customers AS b",
        "  ON a.country = b.country",
        " AND a.customer_id < b.customer_id",
        "WHERE a.customer_id IN (797, 1600, 1619)",
        "  AND b.customer_id IN (797, 1600, 1619);",
      ].join("\n"),
    },
    {
      kind: "prose",
      heading: "Aliases also expose hierarchies",
      body: [
        "ShopFlow employees stores an employee's manager as another employee ID in the same table. A self-join reads employees AS e as the worker and employees AS m as the manager, then turns an ID relationship into names.",
        "The same pattern supports referral trees, previous-versus-current snapshots, duplicate detection, and pairwise comparisons. The aliases are not cosmetic: they name the two roles in the relationship.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Resolve ShopFlow employees to their managers",
      code: [
        "SELECT e.employee_name,",
        "       m.employee_name AS manager_name",
        "FROM employees AS e",
        "JOIN employees AS m",
        "  ON e.manager_id = m.employee_id",
        "WHERE e.employee_id IN (2, 4, 5)",
        "ORDER BY e.employee_id;",
      ].join("\n"),
    },
    {
      kind: "playground-practice",
      title: "Generate ShopFlow customer-channel combinations",
      prompt:
        "Create the six combinations of customers 797, 1600, and 1619 with the channels email and sms. Use a query-local channel list and CROSS JOIN.",
      tables: ["customers"],
      successCheck: "Six ordered rows: every selected customer paired with both channels.",
      href: "/sql-playground?practice=shopflow-generate-customer-channel-combinations",
    },
    {
      kind: "takeaways",
      items: [
        "CROSS JOIN returns every left-row and right-row pairing.",
        "Cartesian-product size is left rows × right rows.",
        "Use CROSS JOIN deliberately to generate complete combinations.",
        "A self-join uses aliases to assign one table two roles.",
        "Use an inequality such as a.id < b.id for unique unordered pairs.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "cross-product",
          question: "What does a CROSS JOIN return?",
          options: [
            "Every possible left-right row pair",
            "Only equal keys",
            "Only left rows",
            "Only unmatched rows",
          ],
          correctIndex: 0,
          explanation: "CROSS JOIN has no match condition and creates the Cartesian product.",
        },
        {
          id: "cross-count",
          question: "How many rows result from 3 customers CROSS JOIN 2 channels?",
          options: ["6", "5", "3", "2"],
          correctIndex: 0,
          explanation: "The product is 3 × 2 = 6.",
        },
        {
          id: "cross-use",
          question: "When is CROSS JOIN appropriate?",
          options: [
            "Generating a complete intentional matrix",
            "Matching a foreign key",
            "Removing duplicate rows",
            "Keeping unmatched left rows",
          ],
          correctIndex: 0,
          explanation: "It is useful when every combination is genuinely required.",
        },
        {
          id: "self-alias",
          question: "Why use aliases in a self-join?",
          options: [
            "To give the two table roles distinct names",
            "To prevent every join",
            "To create NULL values",
            "To avoid selecting columns",
          ],
          correctIndex: 0,
          explanation: "Aliases distinguish the two logical roles played by one physical table.",
        },
        {
          id: "self-pairs",
          question: "Why use a.customer_id < b.customer_id for pairwise combinations?",
          options: [
            "It removes self-pairs and reverse duplicates",
            "It includes every direction twice",
            "It matches NULL values",
            "It sorts the table",
          ],
          correctIndex: 0,
          explanation: "Only one ordering of each pair can satisfy the less-than condition.",
        },
        {
          id: "self-manager",
          question: "Which self-join condition resolves an employee's manager?",
          options: [
            "e.manager_id = m.employee_id",
            "e.employee_id < m.employee_id",
            "e.department = m.department",
            "e.employee_id = m.manager_id",
          ],
          correctIndex: 0,
          explanation: "The employee's manager_id references another row's employee_id.",
        },
      ],
    },
  ],
};

// ---------- 3.4 Semi-Joins & Anti-Joins ----------
const semiAntiJoins: LessonContent = {
  slug: "semi-anti-joins",
  title: "Semi-Joins & Anti-Joins",
  subtitle:
    "EXISTS / NOT EXISTS / IN / NOT IN (the NULL trap) / LEFT JOIN … IS NULL / EXCEPT as anti-join",
  sections: [
    {
      kind: "prose",
      heading: "Filter by relationship without bringing in right-side columns",
      body: [
        "A semi-join answers: does a related row exist? It keeps rows from the left input only. An anti-join answers the opposite question: which left rows have no related row? Neither pattern needs columns from the matching table.",
        "In ShopFlow, orders 2 and 3 belong to Priya (797) and Miles (1600). When we check those orders against selected customers, `EXISTS` keeps Priya and Miles; `NOT EXISTS` keeps Hana (1619). The resulting row grain stays one row per customer.",
      ],
    },
    {
      kind: "image-carousel",
      images: [
        {
          src: shopflowSemiJoinExistsImg,
          alt: "A ShopFlow semi-join diagram where customers Priya and Miles have matching orders and appear in the result, while Hana does not.",
          caption:
            "EXISTS is a membership test. It keeps matching customer rows but does not attach order columns or multiply a customer by the number of matching orders.",
        },
        {
          src: shopflowAntiJoinNullTrapImg,
          alt: "A ShopFlow anti-join and NULL-trap diagram. NOT EXISTS returns Hana, while NOT IN against a list containing NULL returns no rows.",
          caption:
            "NOT EXISTS, LEFT JOIN followed by IS NULL, and EXCEPT can express an anti-join. NOT IN is different when its subquery can return NULL.",
        },
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "EXISTS: return selected customers with a qualifying order",
      code: [
        "SELECT c.customer_id, c.first_name",
        "FROM customers AS c",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "  AND EXISTS (",
        "    SELECT 1",
        "    FROM orders AS o",
        "    WHERE o.customer_id = c.customer_id",
        "      AND o.order_id IN (2, 3)",
        "  )",
        "ORDER BY c.customer_id;",
      ].join("\n"),
    },
    {
      kind: "table",
      caption: "EXISTS result: one row per matching customer",
      headers: ["customer_id", "first_name"],
      rows: [
        ["797", "Priya"],
        ["1600", "Miles"],
      ],
    },
    {
      kind: "animation",
      variant: "q-shopflow-semi-anti-joins",
      caption:
        "Trace the membership test, reverse it with NOT EXISTS, see why a NULL breaks NOT IN, and finish with EXCEPT set difference.",
    },
    {
      kind: "prose",
      heading: "EXISTS and IN can express the same positive membership test",
      body: [
        "For one non-NULL key, `IN (subquery)` is often a compact way to write the same positive question. The database can optimize either form, so choose the version that makes the relationship clearest to the reader.",
        "Use `EXISTS` when the subquery naturally refers to the outer row, especially when its conditions are more involved. Use `IN` when you are clearly comparing one expression to a readable list of one column.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "IN: the same two ShopFlow customers",
      code: [
        "SELECT c.customer_id, c.first_name",
        "FROM customers AS c",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "  AND c.customer_id IN (",
        "    SELECT o.customer_id",
        "    FROM orders AS o",
        "    WHERE o.order_id IN (2, 3)",
        "  )",
        "ORDER BY c.customer_id;",
      ].join("\n"),
    },
    {
      kind: "callout",
      tone: "info",
      title: "Semi-join versus INNER JOIN",
      body: "An INNER JOIN returns a row for each matching pair. EXISTS returns each qualifying left row once, even if several related rows exist. That makes EXISTS a natural choice when you only need to test membership.",
    },
    {
      kind: "prose",
      heading: "NOT EXISTS is the safest anti-join default",
      body: [
        "Put `NOT` in front of EXISTS to keep the selected customer only when no qualifying order is found. It remains well-defined even when nullable columns appear inside the related-table logic.",
        "For the same fixed order scope, Hana is the only selected customer without a qualifying order.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "NOT EXISTS: find the selected customer without a qualifying order",
      code: [
        "SELECT c.customer_id, c.first_name",
        "FROM customers AS c",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "  AND NOT EXISTS (",
        "    SELECT 1",
        "    FROM orders AS o",
        "    WHERE o.customer_id = c.customer_id",
        "      AND o.order_id IN (2, 3)",
        "  )",
        "ORDER BY c.customer_id;",
      ].join("\n"),
    },
    {
      kind: "table",
      caption: "NOT EXISTS result",
      headers: ["customer_id", "first_name"],
      rows: [["1619", "Hana"]],
    },
    {
      kind: "prose",
      heading: "NOT IN changes meaning when NULL enters the list",
      body: [
        "`x NOT IN (a, b)` means `x <> a AND x <> b`. If the list also contains NULL, one comparison becomes unknown. In SQL's three-valued logic, `true AND unknown` is unknown, and WHERE keeps only true rows.",
        "The CTE below is intentionally synthetic. ShopFlow's `orders.customer_id` is NOT NULL, but imported lists and optional lookup columns often are nullable. Treat `NOT IN` as safe only after proving or filtering away NULL values.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "The NULL trap: this returns no rows",
      code: [
        "WITH blocked_customer_ids(customer_id) AS (",
        "  VALUES (797), (NULL)",
        ")",
        "SELECT c.customer_id, c.first_name",
        "FROM customers AS c",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "  AND c.customer_id NOT IN (",
        "    SELECT customer_id",
        "    FROM blocked_customer_ids",
        "  )",
        "ORDER BY c.customer_id;",
      ].join("\n"),
    },
    {
      kind: "callout",
      tone: "warn",
      title: "The NOT IN NULL trap",
      body: "A NULL from a NOT IN subquery can make every candidate evaluate to unknown, yielding no rows. Prefer NOT EXISTS, or add WHERE key IS NOT NULL inside the subquery when NOT IN is genuinely the clearest choice.",
    },
    {
      kind: "prose",
      heading: "Two other anti-join spellings",
      body: [
        "`LEFT JOIN ... IS NULL` is useful when you want to see the attempted relationship and then keep only left rows whose right-side key is NULL. Check a right-side key that is non-NULL for genuine matches, such as `o.order_id`.",
        "`EXCEPT` is set difference. It is concise when both queries produce the same key shape. Like other set operators, it removes duplicate rows, so use it when a distinct key set is the intended output.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "LEFT JOIN ... IS NULL: the same Hana anti-join",
      code: [
        "SELECT c.customer_id, c.first_name",
        "FROM customers AS c",
        "LEFT JOIN orders AS o",
        "  ON o.customer_id = c.customer_id",
        " AND o.order_id IN (2, 3)",
        "WHERE c.customer_id IN (797, 1600, 1619)",
        "  AND o.order_id IS NULL",
        "ORDER BY c.customer_id;",
      ].join("\n"),
    },
    {
      kind: "code",
      language: "sql",
      caption: "EXCEPT: selected customer IDs minus qualifying order customer IDs",
      code: [
        "SELECT customer_id",
        "FROM customers",
        "WHERE customer_id IN (797, 1600, 1619)",
        "EXCEPT",
        "SELECT customer_id",
        "FROM orders",
        "WHERE order_id IN (2, 3);",
      ].join("\n"),
    },
    {
      kind: "playground-practice",
      title: "Find a ShopFlow customer without a qualifying order",
      prompt:
        "Return the selected customer with no order among order IDs 2 and 3. Use NOT EXISTS so the query remains safe even if a future lookup can contain NULL.",
      tables: ["customers", "orders"],
      successCheck: "One ordered row: customer 1619, Hana.",
      href: "/sql-playground?practice=shopflow-find-customer-without-qualifying-order",
    },
    {
      kind: "takeaways",
      items: [
        "EXISTS is a semi-join: it keeps each qualifying left row without adding right-side columns.",
        "NOT EXISTS is an anti-join: it keeps each left row with no qualifying related row.",
        "IN is concise for a one-column positive membership test.",
        "Avoid NOT IN when the subquery can return NULL, or filter NULL explicitly.",
        "LEFT JOIN ... IS NULL and EXCEPT are useful alternative anti-join shapes with different output and duplicate behavior.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "semi-exists-purpose",
          question: "What does EXISTS test for each customer row?",
          options: [
            "Whether at least one related row satisfies the subquery",
            "Whether every order is paid",
            "Whether the customer ID is NULL",
            "Whether two tables have equal row counts",
          ],
          correctIndex: 0,
          explanation: "EXISTS is true as soon as at least one qualifying related row is found.",
        },
        {
          id: "semi-grain",
          question: "Why can EXISTS be preferable to an INNER JOIN for a membership check?",
          options: [
            "It keeps a qualifying customer once even if several orders match",
            "It automatically selects order columns",
            "It returns unmatched orders",
            "It changes NULL to zero",
          ],
          correctIndex: 0,
          explanation:
            "A semi-join filters the left rows rather than returning one row per matching pair.",
        },
        {
          id: "semi-in",
          question:
            "Which positive membership form can often express the same idea as EXISTS for one key?",
          options: ["IN (subquery)", "NOT IN (subquery)", "FULL OUTER JOIN", "CROSS JOIN"],
          correctIndex: 0,
          explanation: "IN compares a value to the one-column set returned by a subquery.",
        },
        {
          id: "anti-not-exists",
          question: "Which pattern safely finds selected customers with no qualifying order?",
          options: ["NOT EXISTS", "EXISTS", "INNER JOIN", "CROSS JOIN"],
          correctIndex: 0,
          explanation: "NOT EXISTS is the standard anti-join expression.",
        },
        {
          id: "anti-null-trap",
          question: "Why can NOT IN (subquery) unexpectedly return no rows?",
          options: [
            "A NULL in the subquery makes comparisons unknown",
            "It always removes duplicates",
            "It cannot read customer IDs",
            "It converts every ID to text",
          ],
          correctIndex: 0,
          explanation:
            "WHERE retains only true; unknown results from a NULL comparison are filtered out.",
        },
        {
          id: "anti-alternatives",
          question: "Which pair can also express an anti-join depending on the desired output?",
          options: [
            "LEFT JOIN ... IS NULL and EXCEPT",
            "RIGHT JOIN and CROSS JOIN",
            "GROUP BY and HAVING",
            "ORDER BY and LIMIT",
          ],
          correctIndex: 0,
          explanation:
            "A NULL right-side match key after LEFT JOIN and a set difference with EXCEPT can both identify left-only values.",
        },
      ],
    },
  ],
};

// ---------- 3.5 Non-Equi, Range & ASOF Joins ----------
const nonEquiRangeAsof: LessonContent = {
  slug: "non-equi-range-asof",
  title: "Non-Equi, Range & ASOF Joins",
  subtitle:
    "ON a BETWEEN b.lo AND b.hi / inequality joins / interval-overlap joins / ASOF JOIN (nearest-match, DuckDB)",
  sections: [],
};

// ---------- 3.6 Joins + Aggregation (the Fan-Out Trap) ----------
const joinsAggregationFanOut: LessonContent = {
  slug: "joins-aggregation-fan-out",
  title: "Joins + Aggregation",
  subtitle:
    "row multiplication / aggregate before joining / COUNT(DISTINCT) workaround / pre-aggregated subquery / matching GROUP BY grain",
  sections: [],
};

// ---------- 3.7 LATERAL Joins ----------
const lateralJoins: LessonContent = {
  slug: "lateral-joins",
  title: "LATERAL Joins",
  subtitle:
    "LATERAL / CROSS JOIN LATERAL / LEFT JOIN LATERAL / top-N per group / per-row correlated table expression",
  sections: [],
};

// ---------- 3.8 Join Order, Internals & Performance ----------
const joinOrderInternals: LessonContent = {
  slug: "join-order-internals",
  title: "Join Order, Internals & Performance",
  subtitle:
    "driving table / chained joins & readability / nested loop vs hash vs merge / indexes on join keys / EXPLAIN / predicate pushdown",
  sections: [],
};

// ---------- 3.9 Joins: Final Quiz ----------
const joinsFinalQuiz: LessonContent = {
  slug: "joins-final-quiz",
  title: "Joins: Final Quiz",
  subtitle: "Test your knowledge on Joins.",
  sections: [],
};

// =============================================================
// MODULE 4: SUBQUERIES & SET OPS
// =============================================================

// ---------- 4.1 Scalar Subqueries ----------
const scalarSubqueries: LessonContent = {
  slug: "scalar-subqueries",
  title: "Scalar Subqueries",
  subtitle:
    "Nested atomic expressions returning exactly one row, one column — used inside SELECT, WHERE, or expressions.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "A scalar subquery lets you inline a derived constant — like a 'global average' — directly into an outer expression without an explicit JOIN, keeping the query intent crisp.",
        "Conceptually it's identical to `avg = compute_avg(); rows.filter(r => r.x > avg)` — the subquery runs once, the result is hoisted as a constant, then every outer row compares against it.",
      ],
    },
    {
      kind: "animation",
      variant: "q-scalar",
      caption: "Inner query collapses to a single scalar pill — outer rows compare against it.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: outer table (orders) renders on the right; inner aggregate query renders as a sealed box on the left labelled `(SELECT AVG(amount) FROM orders)`; box is empty.",
        "Phase 2 — Action: the inner box fills, computes its aggregate, then collapses into a single glowing scalar pill that floats toward the outer query and locks into the WHERE clause. Outer rows then scan past, comparing `amount > pill_value`; surviving rows arc to the viewport.",
        "Phase 3 — Final State: viewport holds outer rows where the predicate held; an annotation reminds that the inner ran exactly once (not once per outer row — see 4.2 for that case).",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Scalar in WHERE and in SELECT",
      code: `-- /* Phase 2a: scalar in WHERE — inner runs once */
SELECT id, customer_id, amount
FROM   orders
WHERE  amount > (SELECT AVG(amount) FROM orders);   -- /* compares against single constant */

-- /* Phase 2b: scalar in the SELECT projection — adds a derived column */
SELECT id,
       amount,
       amount - (SELECT AVG(amount) FROM orders) AS delta_from_mean   -- /* one constant subtracted */
FROM   orders;

-- /* Scalar must return EXACTLY one row, one column — otherwise runtime error */
SELECT id,
       (SELECT name FROM customers WHERE customers.id = orders.customer_id) AS customer_name
FROM   orders;                                       -- /* single-value lookup */`,
    },
    {
      kind: "table",
      caption: "Where scalar subqueries are legal",
      headers: ["Location", "Legal?", "Common use"],
      rows: [
        ["SELECT projection", "Yes", "Derived constant column"],
        ["WHERE predicate", "Yes", "Comparison against a global aggregate"],
        ["JOIN ON predicate", "Yes (rare)", "Threshold-based join"],
        ["GROUP BY", "Yes (rare)", "Bucketing by a derived constant"],
        ["FROM clause", "No — must be a table subquery (rowset)", "Use derived table instead"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [595]", "Big Countries", "Scalar comparison in WHERE — pure syntax."],
        ["Drill [176]", "Second Highest Salary", "Scalar subquery with LIMIT/OFFSET for ranking."],
        [
          "Challenge [177]",
          "Nth Highest Salary",
          "Scalar subquery wrapped in a function fused with parameter logic.",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Logic Trap — runtime cardinality error",
      body: "If a scalar subquery returns more than one row, PostgreSQL raises `more than one row returned by a subquery used as an expression`. Always guard with `LIMIT 1` and an explicit `ORDER BY`, or change the call site to an `IN` / `EXISTS` semi-join.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Performance — InitPlan vs SubPlan",
      body: "An uncorrelated scalar subquery is evaluated exactly once and cached as an InitPlan node — effectively free at the outer level. The planner can even fold it into a constant. The performance trap is forgetting that a syntactically scalar subquery referencing the outer row turns into a correlated subquery (next lesson) and runs once per row.",
    },
    {
      kind: "takeaways",
      items: [
        "Scalar = exactly one row, one column.",
        "Uncorrelated scalar subqueries run once (InitPlan).",
        "Legal in SELECT / WHERE / JOIN ON; not in FROM (need a rowset).",
        "Wrap with LIMIT 1 + ORDER BY to defend against cardinality errors.",
      ],
    },
  ],
};

// ---------- 4.2 Correlated Subqueries ----------
const correlatedSubqueries: LessonContent = {
  slug: "correlated-subqueries",
  title: "Correlated Subqueries",
  subtitle: "Inner depends on outer row — the row-by-row nested loop and its O(N²) trap.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Correlated subqueries express per-row 'lookup against context' logic — e.g. find each employee's salary relative to their own department's average — and read very naturally to humans.",
        "Mechanically they are a nested loop: for each outer row, re-execute the inner query with that row's column bound — identical to the Python pattern `[f(row, lookup(row)) for row in outer]` where `lookup` re-runs every iteration.",
      ],
    },
    {
      kind: "animation",
      variant: "q-corr",
      caption: "Inner subquery re-fires for every outer row — count the iterations.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: outer table (employees) on the right; inner aggregate `(SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)` renders as a re-entrant gear on the left.",
        "Phase 2 — Action: scanner highlights an outer row, copies its `dept_id` into the inner gear, the gear spins, emits a scalar pill, the comparison is evaluated, and the pill evaporates. The gear spins again for the next outer row — an iteration counter ticks up visibly, exposing the O(N) inner runs.",
        "Phase 3 — Final State: viewport holds rows that passed the per-row test; a runtime panel shows `outer rows × inner cost` total work, and a 'rewrite to window function' suggestion banner appears.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Correlated and its faster window-function rewrite",
      code: `-- /* Phase 2: correlated — inner re-runs per outer row (N inner executions) */
SELECT e.id, e.name, e.salary
FROM   employees e
WHERE  e.salary > (
  SELECT AVG(e2.salary)
  FROM   employees e2
  WHERE  e2.dept_id = e.dept_id     -- /* dependency on outer row */
);

-- /* Same result, single scan via window function (O(N) instead of O(N^2)) */
SELECT id, name, salary
FROM (
  SELECT e.*,
         AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
  FROM   employees e
) s
WHERE salary > dept_avg;             -- /* one pass, no per-row re-execution */`,
    },
    {
      kind: "table",
      caption: "Correlated vs uncorrelated",
      headers: ["Property", "Uncorrelated (4.1)", "Correlated (4.2)"],
      rows: [
        ["Inner refers to outer columns?", "No", "Yes"],
        ["Inner executions", "1", "N (one per outer row)"],
        ["Plan node", "InitPlan", "SubPlan"],
        ["Typical rewrite", "Already optimal", "Window function or JOIN + GROUP BY"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        [
          "Warm-up [181]",
          "Employees Earning More Than Their Managers",
          "Basic correlated reference.",
        ],
        [
          "Drill [184]",
          "Department Highest Salary",
          "Correlated MAX rewritten via window function.",
        ],
        [
          "Challenge [185]",
          "Department Top Three Salaries",
          "Correlated + DENSE_RANK fused with grouping.",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Logic Trap — silently quadratic",
      body: "A correlated subquery against a 1M-row outer table fires the inner 1M times — even when the inner is cheap, the per-row overhead and cache thrashing dominate. Always check EXPLAIN ANALYZE: if the inner plan node shows `loops = 1000000`, rewrite as a window function or a JOIN against a pre-aggregated derived table.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Performance — when decorrelation fails",
      body: "Modern PostgreSQL can sometimes 'decorrelate' simple SubPlans into a single Hash Join — but only for restricted shapes. Any inner aggregate, LIMIT, or DISTINCT defeats decorrelation. Rule of thumb: if the inner depends on the outer AND involves an aggregate, refactor to a window function or a LATERAL join up front.",
    },
    {
      kind: "takeaways",
      items: [
        "Correlated = inner depends on outer ⇒ N inner executions.",
        "Confirm with EXPLAIN ANALYZE — watch the `loops=` count.",
        "Window functions usually convert O(N²) into O(N).",
        "LATERAL joins are the structured alternative when you need rows, not a scalar.",
      ],
    },
  ],
};

// ---------- 4.3 Existence Checks (EXISTS vs IN) ----------
const existsVsIn: LessonContent = {
  slug: "exists-vs-in",
  title: "Existence Checks (EXISTS vs IN)",
  subtitle: "Planner rewrites, short-circuit semantics, and the NOT IN-with-NULL catastrophe.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "EXISTS and IN both answer 'is there a match?' — but they have different NULL semantics and different planner rewrites, so picking the wrong one corrupts results silently.",
        "EXISTS is `any(...)` with break-on-first; IN is `value in set` against a materialised collection — and `value in {1, 2, None}` in Python returns True/False/None depending on the value, exactly like SQL's three-valued IN.",
      ],
    },
    {
      kind: "animation",
      variant: "q-existsin",
      caption: "EXISTS short-circuits; IN materialises the inner set then probes.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: outer rows on the left; inner subquery results on the right; two probes labelled EXISTS and IN hover between them.",
        "Phase 2 — Action: EXISTS probe fires per outer row and stops at the first inner match (visible green flash). IN probe first materialises the entire inner result into a hash set, then each outer row hashes once into that set. A NULL inserted into the IN inner set causes NOT IN to fail every outer row — visible as the entire viewport going dark.",
        "Phase 3 — Final State: side-by-side panes contrast NOT EXISTS (correct anti-join) and NOT IN-with-NULL (empty result) — the catastrophic asymmetry is the headline.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Safe vs catastrophic anti-join",
      code: `-- /* SAFE: NOT EXISTS — row-by-row comparison, NULL-safe */
SELECT c.id, c.name
FROM   customers c
WHERE  NOT EXISTS (
  SELECT 1 FROM blocked b
  WHERE  b.customer_id = c.id
);

-- /* DANGER: NOT IN — if the inner set contains a single NULL, the WHOLE result is empty */
SELECT c.id, c.name
FROM   customers c
WHERE  c.id NOT IN (
  SELECT blocked_id FROM blocked     -- /* if any blocked_id IS NULL — boom */
);

-- /* Defensive rewrite for legacy NOT IN code */
SELECT c.id, c.name
FROM   customers c
WHERE  c.id NOT IN (
  SELECT blocked_id FROM blocked
  WHERE  blocked_id IS NOT NULL      -- /* strip NULLs before they poison */
);`,
    },
    {
      kind: "table",
      caption: "Semantic & performance matrix",
      headers: ["Construct", "NULL-safe?", "Planner rewrite", "When to use"],
      rows: [
        ["EXISTS / NOT EXISTS", "Yes", "Hash Semi/Anti Join", "Default for any anti-join"],
        ["IN (subquery)", "Yes", "Hash Semi Join", "Small inner sets, no NULL risk"],
        [
          "NOT IN (subquery)",
          "No (NULL = disaster)",
          "Anti Join only after NULL strip",
          "Avoid unless NULL-stripped",
        ],
        ["= ANY(subquery)", "Yes", "Same as IN", "Verbose, rarely used"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        [
          "Warm-up [183]",
          "Customers Who Never Order",
          "Pure NOT EXISTS / LEFT JOIN syntactic validation.",
        ],
        ["Drill [1045]", "Customers Who Bought All Products", "EXISTS-style universal quantifier."],
        [
          "Challenge [1565]",
          "Unique Orders and Customers Per Month",
          "EXISTS fused with aggregation and threshold logic.",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Logic Trap — NOT IN with a NULL silently empties the result",
      body: "If any value returned by the inner query of `NOT IN` is NULL, the entire predicate becomes UNKNOWN and every outer row is dropped. This is the single most cited SQL anti-pattern in code review — convert to `NOT EXISTS` reflexively.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Performance — Semi/Anti Join planner rewrites",
      body: "PostgreSQL ≥ 9.0 rewrites both `IN (subquery)` and `EXISTS (subquery)` into Hash Semi Join when the inner is uncorrelated. NOT IN is harder to rewrite because of the NULL semantic — the planner cannot transform it into a clean Anti Join unless it can prove the inner column is NOT NULL (via constraint or explicit filter).",
    },
    {
      kind: "takeaways",
      items: [
        "NOT EXISTS = safe anti-join. NOT IN = NULL landmine.",
        "Both EXISTS and IN compile to Hash Semi Join when uncorrelated.",
        "Add `IS NOT NULL` inside legacy NOT IN to defuse it.",
        "Constraint-backed NOT NULL columns let the planner pick the fast anti-join plan.",
      ],
    },
  ],
};

// ---------- 4.4 Set Operations (UNION / INTERSECT / EXCEPT) ----------
const setOps: LessonContent = {
  slug: "set-ops",
  title: "Set Operations (UNION / INTERSECT / EXCEPT)",
  subtitle:
    "Vertical schema concatenation, dedup overhead, and the UNION vs UNION ALL performance cliff.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Set operators stack result sets vertically — they're how you combine partitioned tables, archive splits, or compute distinct customer overlaps across product lines.",
        "Mathematically they're set algebra; mechanically UNION/INTERSECT/EXCEPT must dedupe via a sort or hash, while UNION ALL is a pure append — like Python's `set(a) | set(b)` vs `a + b`, with the dedupe cost matching the difference.",
      ],
    },
    {
      kind: "animation",
      variant: "q-setops",
      caption: "Two result streams meet — UNION dedupes, UNION ALL just appends.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: two query result sets `A` and `B` render as stacked row cards; an operator badge in the centre cycles UNION / UNION ALL / INTERSECT / EXCEPT.",
        "Phase 2 — Action: for UNION ALL the cards simply chain into the viewport. For UNION the cards arc through a hash/sort dedupe gate — duplicates collapse with a pulse. For INTERSECT, only rows appearing in both A and B survive. For EXCEPT, only rows in A and NOT in B reach the viewport.",
        "Phase 3 — Final State: viewport contains the operator-specific combined result; an overlay highlights the extra sort/hash node present for UNION / INTERSECT / EXCEPT and absent for UNION ALL.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Four operators, identical column shape",
      code: `-- /* Phase 2: dedup version — pays for sort/hash */
SELECT email FROM customers
UNION                                -- /* sort/hash dedupe pass */
SELECT email FROM leads;

-- /* Pure append — fastest when duplicates impossible or irrelevant */
SELECT email FROM customers
UNION ALL                            -- /* no dedupe — concatenation only */
SELECT email FROM leads;

-- /* Rows present in BOTH inputs */
SELECT email FROM customers
INTERSECT
SELECT email FROM newsletter_subs;

-- /* Rows in first input minus matches in second */
SELECT email FROM customers
EXCEPT
SELECT email FROM unsubscribed;

-- /* ORDER BY / LIMIT bind to the COMBINED result */
(SELECT email FROM customers UNION ALL SELECT email FROM leads)
ORDER  BY email
LIMIT  100;`,
    },
    {
      kind: "table",
      caption: "Set-op cheat-sheet",
      headers: ["Operator", "Keeps", "Dedupes?"],
      rows: [
        ["UNION", "Rows in A or B", "Yes"],
        ["UNION ALL", "Rows in A or B (with dups)", "No"],
        ["INTERSECT", "Rows in A and B", "Yes"],
        ["EXCEPT (a.k.a. MINUS)", "Rows in A not in B", "Yes"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        [
          "Warm-up [1795]",
          "Rearrange Products Table",
          "Basic UNION ALL vs UNION syntactic validation.",
        ],
        [
          "Drill [602]",
          "Friend Requests II: Who Has the Most Friends",
          "UNION fused with aggregation and de-duplication.",
        ],
        [
          "Challenge [1412]",
          "Find the Quiet Students in All Exams",
          "Multi-set composition combined with ranking and filtering.",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Logic Trap — column count or type mismatch is a runtime error",
      body: "Both queries must project the exact same number of columns with implicitly-castable types. Output column names always come from the first SELECT. Casting `INT` to `BIGINT` across the boundary is silent, but `INT` vs `TEXT` raises `each UNION query must have the same number of columns` at runtime.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Performance — UNION ALL vs UNION cost cliff",
      body: "UNION executes both children, then runs a HashAggregate or Sort + Unique node to dedupe — typically the dominant cost. UNION ALL is a cheap Append. INTERSECT/EXCEPT also require dedupe via SetOp node and may spill to disk on large inputs. If you know duplicates cannot exist, ALWAYS use UNION ALL — the difference is often 2-10× wall-clock.",
    },
    {
      kind: "takeaways",
      items: [
        "Both sides must have identical column counts and compatible types.",
        "UNION/INTERSECT/EXCEPT dedupe (slow); UNION ALL appends (fast).",
        "ORDER BY / LIMIT apply to the combined result, not each leg.",
        "Output column names come from the first SELECT.",
      ],
    },
  ],
};

// =============================================================
// TOPIC INDEX
// =============================================================

export const QUERYING_TOPICS: Record<string, FoundationTopicMeta> = {
  filtering: {
    slug: "filtering",
    title: "Filtering & Predicates",
    category: "Querying Data",
    iconKey: "terminal",
    blurb:
      "Boolean logic, range/set filters, pattern matching, NULL semantics, and index-friendly WHERE predicates.",
    lessons: [booleanLogic, inBetween, likeIlike, nullPitfalls, sargability, filteringFinalQuiz],
  },
  aggregations: {
    slug: "aggregations",
    title: "Aggregations & GROUP BY",
    category: "Querying Data",
    iconKey: "database",
    blurb:
      "Count, summarise, group, and filter Cycle Depot data with a dependable aggregation workflow.",
    lessons: [aggregateFns, groupByLesson, havingLesson, aggregationsFinalQuiz],
  },
  "window-functions": {
    slug: "window-functions",
    title: "Window Functions",
    category: "Advanced SQL",
    iconKey: "database",
    blurb:
      "Start advanced analytical SQL with multi-dimensional totals, then build toward window-function techniques.",
    lessons: [groupingSets],
  },
  joins: {
    slug: "joins",
    title: "Joins",
    category: "Querying Data",
    iconKey: "table",
    blurb:
      "Core shapes, self joins, semi/anti filtering joins, and the Nested Loop vs Hash vs Sort-Merge planner decisions.",
    lessons: [
      innerJoinsConditions,
      outerJoinsNull,
      crossSelfJoins,
      semiAntiJoins,
      nonEquiRangeAsof,
      joinsAggregationFanOut,
      lateralJoins,
      joinOrderInternals,
      joinsFinalQuiz,
    ],
  },
  subqueries: {
    slug: "subqueries",
    title: "Subqueries & Set Ops",
    category: "Querying Data",
    iconKey: "terminal",
    blurb:
      "Scalar vs correlated subqueries, EXISTS vs IN existence checks, and the UNION / INTERSECT / EXCEPT vertical algebra.",
    lessons: [scalarSubqueries, correlatedSubqueries, existsVsIn, setOps],
  },
};
