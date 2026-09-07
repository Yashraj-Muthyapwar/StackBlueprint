# ShopFlow SQL Lab

ShopFlow is a synthetic, deterministic online-store operations database for SQL engineering. It is intentionally separate from the real-world analysis datasets: it teaches how a database behaves rather than how to analyze an external business dataset.

## Design

- Fixed seed: `42`; rerunning `scripts/datasets/sql-lab.mjs` produces the same engine-neutral CSVs.
- Size: 10 tables and about 88,000 rows, compact enough for browser-local PGlite and DuckDB-WASM.
- Core tables: customers, addresses, categories, products, orders, order_items, payments, shipments, employees, and inventory.
- Deliberate scenarios: unsold products, zero/low inventory, customers with no orders, high-frequency customers, multiple order/payment/shipment states, a category tree, and an employee reporting hierarchy.

## Engine behavior

The CSVs are the common source. The browser loader creates the typed tables, applies primary/foreign/unique/check constraints and defaults, then creates three starter indexes and two views:

- `idx_orders_customer`, `idx_orders_date`, and `idx_order_items_product`
- `customer_order_summary` and `low_stock_products`

Both engines support the shared lab exercises, including joins, constraints, views, recursive CTEs, indexes, `EXPLAIN ANALYZE`, and `BEGIN`/`COMMIT`/`ROLLBACK`. Plans and optimizer choices are engine-specific: learners should inspect and measure them rather than expect an index scan.

## Rebuild

The generator has no external data dependency:

```bash
node --input-type=module -e "import('./scripts/datasets/sql-lab.mjs').then(({ buildSqlLab }) => buildSqlLab())"
```

`scripts/datasets/build.mjs` regenerates the full shared manifest when all external dataset sources are available. Commit the generated `public/datasets/sql_lab/*.csv.gz` files and `manifest.generated.ts` together with the generator.

## Validation expectations

The generator creates child rows from their parent records and uses fixed identifiers, so every declared foreign key resolves. It also produces non-negative prices, costs, payments, and inventory, unique emails, unique composite keys, and no employee who reports to themself. Shipment rows follow a strict state machine: pending has no timestamps, shipped has only `shipped_at`, and delivered has both timestamps with `delivered_at >= shipped_at`. Runtime loading enforces the declared database constraints in both engines.
