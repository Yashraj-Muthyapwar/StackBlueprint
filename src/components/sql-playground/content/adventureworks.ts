import type { ExampleGroup } from "./types";

/**
 * AdventureWorks: 67 tables across person, humanresources, production,
 * purchasing and sales.
 *
 * Column and table names are lower-cased during the data build, which is what
 * unquoted identifiers fold to in PostgreSQL anyway.
 */
export const ADVENTUREWORKS_EXAMPLES: ExampleGroup[] = [
  {
    group: "Find your way around",
    blurb: "67 tables is a lot. Start by asking the catalogue.",
    items: [
      {
        title: "List every table",
        note: "The catalogue is queryable too",
        sql: `SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('person','humanresources','production','purchasing','sales')
ORDER BY table_schema, table_name;`,
      },
      {
        title: "The product catalogue",
        note: "Three-level category hierarchy",
        sql: `SELECT pc.name AS category,
       ps.name AS subcategory,
       p.name  AS product,
       p.productnumber,
       p.color,
       p.listprice
FROM production.product p
JOIN production.productsubcategory ps ON ps.productsubcategoryid = p.productsubcategoryid
JOIN production.productcategory pc    ON pc.productcategoryid = ps.productcategoryid
WHERE p.listprice > 0
ORDER BY p.listprice DESC
LIMIT 30;`,
      },
      {
        title: "Products with no subcategory",
        note: "NULL foreign keys are real data",
        sql: `-- Components and assemblies are not sold directly, so they sit
-- outside the sales hierarchy entirely.
SELECT productid, name, productnumber, listprice, standardcost
FROM production.product
WHERE productsubcategoryid IS NULL
ORDER BY standardcost DESC
LIMIT 25;`,
      },
    ],
  },
  {
    group: "Sales",
    blurb: "31,000 orders averaging four lines each.",
    items: [
      {
        title: "Revenue by year and territory",
        note: "Grouping over 121k line items",
        sql: `SELECT st.name AS territory,
       st.countryregioncode,
       EXTRACT(year FROM soh.orderdate) AS yr,
       COUNT(DISTINCT soh.salesorderid) AS orders,
       ROUND(SUM(sod.linetotal), 2)     AS revenue
FROM sales.salesorderheader soh
JOIN sales.salesorderdetail sod ON sod.salesorderid = soh.salesorderid
JOIN sales.salesterritory st    ON st.territoryid = soh.territoryid
GROUP BY st.name, st.countryregioncode, EXTRACT(year FROM soh.orderdate)
ORDER BY yr, revenue DESC;`,
      },
      {
        title: "Best selling products",
        note: "Join up through the hierarchy",
        sql: `SELECT p.name AS product,
       pc.name AS category,
       SUM(sod.orderqty)            AS units,
       ROUND(SUM(sod.linetotal), 2) AS revenue
FROM sales.salesorderdetail sod
JOIN production.product p             ON p.productid = sod.productid
LEFT JOIN production.productsubcategory ps ON ps.productsubcategoryid = p.productsubcategoryid
LEFT JOIN production.productcategory pc    ON pc.productcategoryid = ps.productcategoryid
GROUP BY p.name, pc.name
ORDER BY revenue DESC
LIMIT 25;`,
      },
      {
        title: "Online versus reseller",
        note: "One boolean splits the whole business",
        sql: `SELECT CASE WHEN onlineorderflag THEN 'online' ELSE 'reseller' END AS channel,
       COUNT(*)                     AS orders,
       ROUND(AVG(totaldue), 2)      AS avg_order_value,
       ROUND(SUM(totaldue), 2)      AS total,
       ROUND(SUM(freight), 2)       AS freight
FROM sales.salesorderheader
GROUP BY onlineorderflag
ORDER BY total DESC;`,
      },
      {
        title: "Salesperson performance against quota",
        note: "Aggregate, then compare to a stored target",
        sql: `SELECT p.firstname || ' ' || p.lastname AS salesperson,
       st.name                             AS territory,
       sp.salesquota,
       ROUND(sp.salesytd, 2)               AS sales_ytd,
       ROUND(sp.salesytd - COALESCE(sp.salesquota, 0), 2) AS over_quota
FROM sales.salesperson sp
JOIN person.person p          ON p.businessentityid = sp.businessentityid
LEFT JOIN sales.salesterritory st ON st.territoryid = sp.territoryid
ORDER BY sp.salesytd DESC;`,
      },
      {
        title: "Discounts that actually applied",
        note: "Special offers joined onto the line",
        sql: `SELECT so.description,
       so.type,
       so.discountpct,
       COUNT(*)                     AS lines_used,
       ROUND(SUM(sod.linetotal), 2) AS revenue
FROM sales.salesorderdetail sod
JOIN sales.specialoffer so ON so.specialofferid = sod.specialofferid
WHERE so.discountpct > 0
GROUP BY so.description, so.type, so.discountpct
ORDER BY revenue DESC;`,
      },
    ],
  },
  {
    group: "People and HR",
    blurb: "A 290-person company with a real reporting tree.",
    items: [
      {
        title: "Headcount by department",
        note: "Only the current assignment counts",
        sql: `SELECT d.name AS department,
       d.groupname,
       COUNT(*) AS employees
FROM humanresources.employeedepartmenthistory edh
JOIN humanresources.department d ON d.departmentid = edh.departmentid
WHERE edh.enddate IS NULL
GROUP BY d.name, d.groupname
ORDER BY employees DESC;`,
      },
      {
        title: "Pay by job title",
        note: "Latest pay row per employee",
        sql: `WITH current_pay AS (
  SELECT businessentityid,
         rate,
         ROW_NUMBER() OVER (PARTITION BY businessentityid ORDER BY ratechangedate DESC) AS rn
  FROM humanresources.employeepayhistory
)
SELECT e.jobtitle,
       COUNT(*)                 AS people,
       ROUND(MIN(cp.rate), 2)   AS min_rate,
       ROUND(AVG(cp.rate), 2)   AS avg_rate,
       ROUND(MAX(cp.rate), 2)   AS max_rate
FROM humanresources.employee e
JOIN current_pay cp ON cp.businessentityid = e.businessentityid AND cp.rn = 1
GROUP BY e.jobtitle
HAVING COUNT(*) > 1
ORDER BY avg_rate DESC;`,
      },
      {
        title: "Where the customers are",
        note: "Person to address to state to country",
        sql: `SELECT cr.name AS country,
       sp.name AS state_province,
       COUNT(DISTINCT p.businessentityid) AS people
FROM person.person p
JOIN person.businessentityaddress bea ON bea.businessentityid = p.businessentityid
JOIN person.address a                 ON a.addressid = bea.addressid
JOIN person.stateprovince sp          ON sp.stateprovinceid = a.stateprovinceid
JOIN person.countryregion cr          ON cr.countryregioncode = sp.countryregioncode
GROUP BY cr.name, sp.name
ORDER BY people DESC
LIMIT 30;`,
      },
      {
        title: "Vacation and sick leave",
        note: "Simple distribution over 290 rows",
        sql: `SELECT jobtitle,
       gender,
       COUNT(*)                        AS people,
       ROUND(AVG(vacationhours), 1)    AS avg_vacation_hours,
       ROUND(AVG(sickleavehours), 1)   AS avg_sick_hours
FROM humanresources.employee
GROUP BY jobtitle, gender
ORDER BY people DESC, jobtitle
LIMIT 30;`,
      },
    ],
  },
  {
    group: "Purchasing and inventory",
    blurb: "The supply side, which most sample databases skip.",
    items: [
      {
        title: "Spend by vendor",
        note: "Purchase orders roll up like sales orders",
        sql: `SELECT v.name AS vendor,
       v.creditrating,
       COUNT(DISTINCT poh.purchaseorderid) AS purchase_orders,
       ROUND(SUM(pod.lineTotal), 2)        AS spend
FROM purchasing.purchaseorderheader poh
JOIN purchasing.purchaseorderdetail pod ON pod.purchaseorderid = poh.purchaseorderid
JOIN purchasing.vendor v                ON v.businessentityid = poh.vendorid
GROUP BY v.name, v.creditrating
ORDER BY spend DESC
LIMIT 25;`,
      },
      {
        title: "Rejected receipts",
        note: "Quality problems hide in a ratio",
        sql: `SELECT v.name AS vendor,
       SUM(pod.receivedqty)  AS received,
       SUM(pod.rejectedqty)  AS rejected,
       ROUND(100.0 * SUM(pod.rejectedqty) / NULLIF(SUM(pod.receivedqty), 0), 2) AS reject_pct
FROM purchasing.purchaseorderdetail pod
JOIN purchasing.purchaseorderheader poh ON poh.purchaseorderid = pod.purchaseorderid
JOIN purchasing.vendor v                ON v.businessentityid = poh.vendorid
GROUP BY v.name
HAVING SUM(pod.receivedqty) > 0
ORDER BY reject_pct DESC
LIMIT 25;`,
      },
      {
        title: "Stock on hand versus reorder point",
        note: "Inventory split across many locations",
        sql: `SELECT p.name AS product,
       p.reorderpoint,
       SUM(pi.quantity) AS on_hand,
       COUNT(DISTINCT pi.locationid) AS locations
FROM production.productinventory pi
JOIN production.product p ON p.productid = pi.productid
GROUP BY p.name, p.reorderpoint
HAVING SUM(pi.quantity) < p.reorderpoint
ORDER BY on_hand;`,
      },
    ],
  },
  {
    group: "Plan-watching",
    blurb: "Queries worth opening the Plan tab for.",
    items: [
      {
        title: "The expensive join order",
        note: "Four tables, 121k lines. Check the Plan tab.",
        sql: `-- Run this, then open the Plan tab and turn on "Run and measure".
-- Watch which table the engine chooses to scan first.
SELECT cr.name AS country,
       pc.name AS category,
       COUNT(*)                     AS lines,
       ROUND(SUM(sod.linetotal), 2) AS revenue
FROM sales.salesorderdetail sod
JOIN sales.salesorderheader soh ON soh.salesorderid = sod.salesorderid
JOIN sales.salesterritory st    ON st.territoryid = soh.territoryid
JOIN person.countryregion cr    ON cr.countryregioncode = st.countryregioncode
JOIN production.product p       ON p.productid = sod.productid
JOIN production.productsubcategory ps ON ps.productsubcategoryid = p.productsubcategoryid
JOIN production.productcategory pc    ON pc.productcategoryid = ps.productcategoryid
GROUP BY cr.name, pc.name
ORDER BY revenue DESC;`,
      },
      {
        title: "Correlated subquery, the slow way",
        note: "Compare its plan to the window version below",
        sql: `SELECT p.productid,
       p.name,
       p.listprice,
       (SELECT ROUND(AVG(p2.listprice), 2)
        FROM production.product p2
        WHERE p2.productsubcategoryid = p.productsubcategoryid) AS subcategory_avg
FROM production.product p
WHERE p.productsubcategoryid IS NOT NULL
ORDER BY p.listprice DESC
LIMIT 40;`,
      },
      {
        title: "The same answer with a window",
        note: "One pass instead of one pass per row",
        sql: `SELECT productid,
       name,
       listprice,
       ROUND(AVG(listprice) OVER (PARTITION BY productsubcategoryid), 2) AS subcategory_avg
FROM production.product
WHERE productsubcategoryid IS NOT NULL
ORDER BY listprice DESC
LIMIT 40;`,
      },
    ],
  },
  {
    group: "PostgreSQL dialect",
    blurb: "What the row store does that DuckDB will not.",
    items: [
      {
        title: "Recursive CTE: explode a bill of materials",
        note: "Walk an assembly tree down to its parts",
        only: "postgres",
        sql: `-- Start from one finished bike and follow every sub-assembly down.
WITH RECURSIVE parts AS (
  -- The cast matters: a recursive CTE demands that each column has exactly
  -- the same type in both terms, and numeric(8,2) is not numeric.
  SELECT bom.productassemblyid,
         bom.componentid,
         CAST(bom.perassemblyqty AS numeric) AS qty,
         1 AS depth
  FROM production.billofmaterials bom
  WHERE bom.productassemblyid = 776
    AND bom.enddate IS NULL

  UNION ALL

  SELECT child.productassemblyid,
         child.componentid,
         CAST(child.perassemblyqty * parts.qty AS numeric),
         parts.depth + 1
  FROM production.billofmaterials child
  JOIN parts ON parts.componentid = child.productassemblyid
  WHERE child.enddate IS NULL
    AND parts.depth < 8
)
SELECT parts.depth,
       p.name AS component,
       parts.qty
FROM parts
JOIN production.product p ON p.productid = parts.componentid
ORDER BY parts.depth, component;`,
      },
      {
        title: "DISTINCT ON: each customer's first order",
        note: "PostgreSQL's one-row-per-group shortcut",
        only: "postgres",
        sql: `SELECT DISTINCT ON (customerid)
       customerid, salesorderid, orderdate, ROUND(totaldue, 2) AS totaldue
FROM sales.salesorderheader
ORDER BY customerid, orderdate
LIMIT 40;`,
      },
      {
        title: "FILTER beats CASE inside aggregates",
        note: "SQL standard, and PostgreSQL implements it",
        only: "postgres",
        sql: `SELECT EXTRACT(year FROM orderdate) AS yr,
       COUNT(*)                                        AS orders,
       COUNT(*) FILTER (WHERE onlineorderflag)         AS online,
       COUNT(*) FILTER (WHERE NOT onlineorderflag)     AS reseller,
       ROUND(SUM(totaldue) FILTER (WHERE onlineorderflag), 2) AS online_revenue
FROM sales.salesorderheader
GROUP BY 1
ORDER BY 1;`,
      },
      {
        title: "Full-text search on product names",
        note: "to_tsvector and the @@ match operator",
        only: "postgres",
        sql: `SELECT productid, name, listprice
FROM production.product
WHERE to_tsvector('english', name) @@ to_tsquery('english', 'mountain | road')
ORDER BY listprice DESC
LIMIT 25;`,
      },
      {
        title: "percentile_cont: a real median",
        note: "Ordered-set aggregates",
        only: "postgres",
        sql: `SELECT pc.name AS category,
       COUNT(*) AS products,
       ROUND(AVG(p.listprice), 2) AS mean,
       ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY p.listprice)::numeric, 2) AS median,
       ROUND(percentile_cont(0.9) WITHIN GROUP (ORDER BY p.listprice)::numeric, 2) AS p90
FROM production.product p
JOIN production.productsubcategory ps ON ps.productsubcategoryid = p.productsubcategoryid
JOIN production.productcategory pc    ON pc.productcategoryid = ps.productcategoryid
WHERE p.listprice > 0
GROUP BY pc.name
ORDER BY median DESC;`,
      },
    ],
  },
  {
    group: "DuckDB dialect",
    blurb: "Analytics syntax, and it will happily scan the whole fact table.",
    items: [
      {
        title: "QUALIFY: each customer's biggest order",
        note: "No subquery needed",
        only: "duckdb",
        sql: `SELECT customerid, salesorderid, orderdate, ROUND(totaldue, 2) AS totaldue
FROM sales.salesorderheader
QUALIFY ROW_NUMBER() OVER (PARTITION BY customerid ORDER BY totaldue DESC) = 1
ORDER BY totaldue DESC
LIMIT 40;`,
      },
      {
        title: "SUMMARIZE the fact table",
        note: "121k rows profiled column by column",
        only: "duckdb",
        sql: `SUMMARIZE sales.salesorderdetail;`,
      },
      {
        title: "PIVOT sales by year",
        note: "Categories down, years across",
        only: "duckdb",
        sql: `PIVOT (
  SELECT pc.name AS category,
         EXTRACT(year FROM soh.orderdate) AS yr,
         sod.linetotal
  FROM sales.salesorderdetail sod
  JOIN sales.salesorderheader soh       ON soh.salesorderid = sod.salesorderid
  JOIN production.product p             ON p.productid = sod.productid
  JOIN production.productsubcategory ps ON ps.productsubcategoryid = p.productsubcategoryid
  JOIN production.productcategory pc    ON pc.productcategoryid = ps.productcategoryid
)
ON yr
USING ROUND(SUM(linetotal), 0)
GROUP BY category
ORDER BY category;`,
      },
      {
        title: "EXCLUDE and REPLACE on SELECT *",
        note: "Star expressions you can actually edit",
        only: "duckdb",
        sql: `-- Take every column except the audit ones, and round one in place.
SELECT * EXCLUDE (modifieddate, salesorderdetailid)
         REPLACE (ROUND(linetotal, 2) AS linetotal)
FROM sales.salesorderdetail
LIMIT 20;`,
      },
      {
        title: "Approximate distinct counts",
        note: "HyperLogLog, for when exact is not worth it",
        only: "duckdb",
        sql: `SELECT COUNT(*)                                  AS lines,
       COUNT(DISTINCT productid)                 AS exact_products,
       approx_count_distinct(productid)          AS approx_products,
       COUNT(DISTINCT salesorderid)              AS exact_orders,
       approx_count_distinct(salesorderid)       AS approx_orders
FROM sales.salesorderdetail;`,
      },
      {
        title: "Reusable aliases in one SELECT",
        note: "Refer to a column you just defined",
        only: "duckdb",
        sql: `-- DuckDB lets a later expression use an earlier alias.
-- PostgreSQL would need a subquery or a repeat of the expression.
SELECT productid,
       name,
       listprice,
       standardcost,
       listprice - standardcost AS margin,
       ROUND(100.0 * margin / NULLIF(listprice, 0), 1) AS margin_pct
FROM production.product
WHERE listprice > 0
ORDER BY margin_pct DESC
LIMIT 30;`,
      },
    ],
  },
];
