import React, { useState, useMemo, useRef } from "react";
import { QueryResult } from "../db/db-client";
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Download,
  ChevronDown,
  Check,
  Clipboard,
} from "lucide-react";

type ChartType = "bar" | "line" | "area";

function toCsv(fields: { name: string }[], rows: any[]): string {
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    fields.map((f) => escape(f.name)).join(","),
    ...rows.map((r) => fields.map((f) => escape(r[f.name])).join(",")),
  ].join("\n");
}

export function ChartVisualizer({
  result,
  engine,
}: {
  result: QueryResult | null;
  engine: string;
}) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!exportOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!exportRef.current?.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [exportOpen]);

  // Heuristic to pick axes
  const chartConfig = useMemo(() => {
    if (!result || !result.rows.length || !result.fields.length) return null;

    let xAxisKey = "";
    const yAxisKeys: string[] = [];

    // Separate fields into numeric and categorical based on duckdb/postgres types
    const numericTypes = [
      "int",
      "float",
      "double",
      "numeric",
      "integer",
      "bigint",
      "smallint",
      "tinyint",
      "decimal",
    ];

    const isNumeric = (type: string) => numericTypes.some((t) => type.toLowerCase().includes(t));

    const fields = result.fields;

    // Attempt 1: Find a date/string column for X, and numeric columns for Y
    const xCandidates = fields.filter(
      (f) =>
        !isNumeric(f.type) ||
        f.name.toLowerCase().includes("id") ||
        f.name.toLowerCase().includes("date") ||
        f.name.toLowerCase().includes("time") ||
        f.name.toLowerCase().includes("year"),
    );
    const yCandidates = fields.filter(
      (f) =>
        isNumeric(f.type) &&
        !f.name.toLowerCase().includes("id") &&
        !f.name.toLowerCase().includes("date"),
    );

    if (xCandidates.length > 0) {
      xAxisKey = xCandidates[0].name;
    } else {
      xAxisKey = fields[0].name;
    }

    if (yCandidates.length > 0) {
      yAxisKeys.push(...yCandidates.map((f) => f.name));
    }
    // We intentionally removed the fallback here. If there are no true numeric columns (excluding IDs),
    // we shouldn't try to force a chart because it will be meaningless.

    const finalYKeys = yAxisKeys.slice(0, 3);
    return { xAxisKey, yAxisKeys: finalYKeys };
  }, [result]);

  if (!result) {
    return (
      <div className="sqlx-empty">
        <strong>Press Run.</strong>
        <span>
          Pick a guided query on the left, or write your own, then press <b>Run</b> to see a chart.
        </span>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="sqlx-error">
        <div className="sqlx-error-head">
          <span>Query failed</span>
        </div>
        <pre className="sqlx-error-body">Fix the query error to see a chart.</pre>
      </div>
    );
  }

  if (result.fields.length === 0 || result.rows.length === 0) {
    return (
      <div className="sqlx-note">
        Query returned no data. Charts require at least one row of data.
      </div>
    );
  }

  if (!chartConfig || chartConfig.yAxisKeys.length === 0) {
    return (
      <div className="sqlx-empty">
        <strong>No chartable numbers found.</strong>
        <span>
          This query returned tabular data, but we couldn't find a meaningful numeric column to
          plot.
          <br />
          <br />
          Try running an aggregation query with a number, for example:
          <br />
          <code
            style={{
              background: "var(--sqlx-bg-alt)",
              padding: "4px",
              borderRadius: "4px",
              marginTop: "8px",
              display: "inline-block",
            }}
          >
            SELECT status, COUNT(*) FROM orders GROUP BY status;
          </code>
        </span>
      </div>
    );
  }

  // Choose colors based on engine theme
  const colors =
    engine === "postgres"
      ? ["#2F5D8A", "#7A4A9E", "#1D7A6B"] // Postgres Blue, Purple, Teal
      : ["#C99206", "#E25E3E", "#2A7B88"]; // DuckDB Yellow, Orange, Cyan

  const downloadCsv = () => {
    if (!result) return;
    const text = toCsv(result.fields, result.rows);
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chart-data.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const downloadPng = () => {
    const svg = document.querySelector(".sqlx-result-scroll .recharts-surface") as SVGElement;
    if (!svg) return;

    // Inline CSS variables so canvas rendering doesn't drop lines/text
    const style = getComputedStyle(document.body);
    let svgData = new XMLSerializer().serializeToString(svg);
    svgData = svgData.replace(
      /var\(--sqlx-line\)/g,
      style.getPropertyValue("--sqlx-line").trim() || "#dbe1e0",
    );
    svgData = svgData.replace(
      /var\(--sqlx-ink-3\)/g,
      style.getPropertyValue("--sqlx-ink-3").trim() || "#7d8a92",
    );
    svgData = svgData.replace(
      /var\(--sqlx-ink\)/g,
      style.getPropertyValue("--sqlx-ink").trim() || "#16232b",
    );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = style.getPropertyValue("--sqlx-panel").trim() || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "chart.png";
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    setExportOpen(false);
  };

  return (
    <div className="sqlx-result">
      {/* Chart Toolbar */}
      <div className="sqlx-result-bar">
        <span className="stat" style={{ marginRight: "16px" }}>
          Chart Type
        </span>
        <button
          className={`sqlx-btn ${chartType === "bar" ? "primary" : ""}`}
          onClick={() => setChartType("bar")}
          title="Bar Chart"
        >
          <BarChart3 size={13} /> Bar
        </button>
        <button
          className={`sqlx-btn ${chartType === "line" ? "primary" : ""}`}
          onClick={() => setChartType("line")}
          title="Line Chart"
        >
          <LineChartIcon size={13} /> Line
        </button>
        <button
          className={`sqlx-btn ${chartType === "area" ? "primary" : ""}`}
          onClick={() => setChartType("area")}
          title="Area Chart"
        >
          <AreaChartIcon size={13} /> Area
        </button>

        <div className="sqlx-result-actions" style={{ marginLeft: "auto" }}>
          <span className="stat">
            x-axis <b>{chartConfig.xAxisKey}</b>
          </span>
          <span className="stat">
            y-axis <b>{chartConfig.yAxisKeys.join(", ")}</b>
          </span>
          <div className="sqlx-export" ref={exportRef}>
            <button
              className="sqlx-icon-btn wide"
              onClick={() => setExportOpen((o) => !o)}
              aria-expanded={exportOpen}
              aria-haspopup="menu"
              title="Download Chart or Data"
            >
              {copied ? <Check size={13} /> : <Download size={13} />}
              <span className="label">Export</span>
              <ChevronDown size={11} className="caret" />
            </button>
            {exportOpen && (
              <div className="sqlx-export-menu" style={{ right: 0, left: "auto" }}>
                <p className="head">Download</p>
                <button onClick={downloadPng}>
                  <Download size={12} /> Chart as PNG
                </button>
                <div className="sep" />
                <button onClick={downloadCsv}>
                  <Download size={12} /> Data as CSV
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(toCsv(result.fields, result.rows));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                    setExportOpen(false);
                  }}
                >
                  <Clipboard size={12} /> Copy CSV to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="sqlx-result-scroll" style={{ padding: "24px 24px 24px 8px" }}>
        <ResponsiveContainer width="100%" height={360}>
          {chartType === "bar" ? (
            <BarChart
              data={result.rows}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              onMouseMove={(state: any) => {
                if (state?.isTooltipActive && state?.activeTooltipIndex !== undefined) {
                  setActiveIndex(state.activeTooltipIndex);
                } else {
                  setActiveIndex(null);
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--sqlx-line)"
                opacity={0.5}
              />
              <XAxis
                dataKey={chartConfig.xAxisKey}
                tick={{ fontSize: 12, fill: "var(--sqlx-ink)", fontWeight: 600 }}
                axisLine={{ stroke: "var(--sqlx-line)" }}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--sqlx-ink)", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--sqlx-line)",
                  backgroundColor: "var(--sqlx-panel)",
                  color: "var(--sqlx-ink)",
                  fontSize: "13px",
                  padding: "8px 12px",
                  boxShadow: "var(--sqlx-shadow)",
                }}
                cursor={{ fill: "transparent" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "12px", paddingBottom: "20px" }}
              />
              {chartConfig.yAxisKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]}>
                  {result.rows.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                      style={{ transition: "fill-opacity 0.2s ease-in-out" }}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={result.rows} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--sqlx-line)"
                opacity={0.5}
              />
              <XAxis
                dataKey={chartConfig.xAxisKey}
                tick={{ fontSize: 12, fill: "var(--sqlx-ink)", fontWeight: 600 }}
                axisLine={{ stroke: "var(--sqlx-line)" }}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--sqlx-ink)", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--sqlx-line)",
                  backgroundColor: "var(--sqlx-panel)",
                  color: "var(--sqlx-ink)",
                  fontSize: "13px",
                  padding: "8px 12px",
                  boxShadow: "var(--sqlx-shadow)",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "12px", paddingBottom: "20px" }}
              />
              {chartConfig.yAxisKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  strokeWidth={3}
                  dot={{ r: 4, fill: colors[i % colors.length], strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={result.rows} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--sqlx-line)"
                opacity={0.5}
              />
              <XAxis
                dataKey={chartConfig.xAxisKey}
                tick={{ fontSize: 12, fill: "var(--sqlx-ink)", fontWeight: 600 }}
                axisLine={{ stroke: "var(--sqlx-line)" }}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--sqlx-ink)", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--sqlx-line)",
                  backgroundColor: "var(--sqlx-panel)",
                  color: "var(--sqlx-ink)",
                  fontSize: "13px",
                  padding: "8px 12px",
                  boxShadow: "var(--sqlx-shadow)",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "12px", paddingBottom: "20px" }}
              />
              {chartConfig.yAxisKeys.map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  fill={colors[i % colors.length]}
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
