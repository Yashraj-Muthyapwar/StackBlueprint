import React, { useState, useMemo } from 'react';
import { QueryResult } from '../db/db-client';
import { BarChart, Bar, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from 'lucide-react';

type ChartType = 'bar' | 'line' | 'area';

export function ChartVisualizer({ result, engine }: { result: QueryResult | null, engine: string }) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Heuristic to pick axes
  const chartConfig = useMemo(() => {
    if (!result || !result.rows.length || !result.fields.length) return null;

    let xAxisKey = '';
    const yAxisKeys: string[] = [];

    // Separate fields into numeric and categorical based on duckdb/postgres types
    const numericTypes = ['int', 'float', 'double', 'numeric', 'integer', 'bigint', 'smallint', 'tinyint', 'decimal'];
    
    const isNumeric = (type: string) => numericTypes.some(t => type.toLowerCase().includes(t));

    const fields = result.fields;
    
    // Attempt 1: Find a date/string column for X, and numeric columns for Y
    const xCandidates = fields.filter(f => !isNumeric(f.type) || f.name.toLowerCase().includes('id') || f.name.toLowerCase().includes('date') || f.name.toLowerCase().includes('time') || f.name.toLowerCase().includes('year'));
    const yCandidates = fields.filter(f => isNumeric(f.type) && !f.name.toLowerCase().includes('id') && !f.name.toLowerCase().includes('date'));

    if (xCandidates.length > 0) {
      xAxisKey = xCandidates[0].name;
    } else {
      xAxisKey = fields[0].name;
    }

    if (yCandidates.length > 0) {
      yAxisKeys.push(...yCandidates.map(f => f.name));
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
        <span>Pick a guided query on the left, or write your own, then press <b>Run</b> to see a chart.</span>
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
          This query returned tabular data, but we couldn't find a meaningful numeric column to plot. 
          <br/><br/>
          Try running an aggregation query with a number, for example:
          <br/>
          <code style={{ background: 'var(--sqlx-bg-alt)', padding: '4px', borderRadius: '4px', marginTop: '8px', display: 'inline-block' }}>
            SELECT status, COUNT(*) FROM orders GROUP BY status;
          </code>
        </span>
      </div>
    );
  }

  // Choose colors based on engine theme
  const colors = engine === 'postgres' 
    ? ['#2F5D8A', '#7A4A9E', '#1D7A6B'] // Postgres Blue, Purple, Teal
    : ['#C99206', '#E25E3E', '#2A7B88']; // DuckDB Yellow, Orange, Cyan

  return (
    <div className="sqlx-result">
      {/* Chart Toolbar */}
      <div className="sqlx-result-bar">
        <span className="stat" style={{ marginRight: '16px' }}>Chart Type</span>
        <button 
          className={`sqlx-btn ${chartType === 'bar' ? 'primary' : ''}`}
          onClick={() => setChartType('bar')}
          title="Bar Chart"
        >
          <BarChart3 size={13} /> Bar
        </button>
        <button 
          className={`sqlx-btn ${chartType === 'line' ? 'primary' : ''}`}
          onClick={() => setChartType('line')}
          title="Line Chart"
        >
          <LineChartIcon size={13} /> Line
        </button>
        <button 
          className={`sqlx-btn ${chartType === 'area' ? 'primary' : ''}`}
          onClick={() => setChartType('area')}
          title="Area Chart"
        >
          <AreaChartIcon size={13} /> Area
        </button>

        <div className="sqlx-result-actions">
          <span className="stat">
            x-axis <b>{chartConfig.xAxisKey}</b>
          </span>
          <span className="stat">
            y-axis <b>{chartConfig.yAxisKeys.join(', ')}</b>
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="sqlx-result-scroll" style={{ padding: '24px 24px 24px 8px' }}>
        <ResponsiveContainer width="100%" height={360}>
          {chartType === 'bar' ? (
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sqlx-border)" opacity={0.5} />
              <XAxis dataKey={chartConfig.xAxisKey} tick={{ fontSize: 12, fill: 'var(--sqlx-text-dim)' }} axisLine={{ stroke: 'var(--sqlx-border)' }} tickLine={false} tickMargin={12} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--sqlx-text-dim)' }} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--sqlx-border)', backgroundColor: 'var(--sqlx-panel)', color: 'var(--sqlx-ink)', fontSize: '13px', padding: '8px 12px', boxShadow: 'var(--sqlx-shadow)' }}
                cursor={{ fill: 'transparent' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} />
              {chartConfig.yAxisKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]}>
                  {result.rows.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3} 
                      style={{ transition: 'fill-opacity 0.2s ease-in-out' }} 
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={result.rows} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sqlx-border)" opacity={0.5} />
              <XAxis dataKey={chartConfig.xAxisKey} tick={{ fontSize: 12, fill: 'var(--sqlx-text-dim)' }} axisLine={{ stroke: 'var(--sqlx-border)' }} tickLine={false} tickMargin={12} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--sqlx-text-dim)' }} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--sqlx-border)', backgroundColor: 'var(--sqlx-panel)', color: 'var(--sqlx-ink)', fontSize: '13px', padding: '8px 12px', boxShadow: 'var(--sqlx-shadow)' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} />
              {chartConfig.yAxisKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={3} dot={{ r: 4, fill: colors[i % colors.length], strokeWidth: 0 }} activeDot={{ r: 6 }} />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={result.rows} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sqlx-border)" opacity={0.5} />
              <XAxis dataKey={chartConfig.xAxisKey} tick={{ fontSize: 12, fill: 'var(--sqlx-text-dim)' }} axisLine={{ stroke: 'var(--sqlx-border)' }} tickLine={false} tickMargin={12} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--sqlx-text-dim)' }} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--sqlx-border)', backgroundColor: 'var(--sqlx-panel)', color: 'var(--sqlx-ink)', fontSize: '13px', padding: '8px 12px', boxShadow: 'var(--sqlx-shadow)' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} />
              {chartConfig.yAxisKeys.map((key, i) => (
                <Area key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} strokeWidth={3} />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
