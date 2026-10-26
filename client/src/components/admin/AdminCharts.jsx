import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { capitalize } from '../../utils/format';

// Validated categorical pair (CVD ΔE ≥ 22): sale = blue, rent = terracotta accent.
export const SERIES = { sale: '#2f63b8', rent: '#c0612f' };
const SINGLE = '#2f63b8';
const AXIS = { fontSize: 12, fill: '#6c7b99' };
const GRID = '#ece7df';

function ChartTooltip({ active, payload, label, formatLabel = (l) => l }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-semibold text-ink-900">{formatLabel(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-ink-600">
          <span className="size-2.5 rounded-sm" style={{ background: p.color || p.fill }} aria-hidden />
          {capitalize(String(p.name))}: <span className="font-semibold text-ink-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, description, children, table }) {
  return (
    <figure className="card p-5">
      <figcaption className="mb-4">
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="text-xs text-ink-400">{description}</p>}
      </figcaption>
      {children}
      {table && (
        <details className="mt-3 text-xs text-ink-500">
          <summary className="cursor-pointer font-medium hover:text-ink-800">View as table</summary>
          <table className="mt-2 w-full text-left">
            <thead><tr>{table.headers.map((h) => <th key={h} className="py-1 font-medium">{h}</th>)}</tr></thead>
            <tbody>{table.rows.map((r) => <tr key={r[0]} className="border-t border-sand-200">{r.map((c, i) => <td key={i} className="py-1">{c}</td>)}</tr>)}</tbody>
          </table>
        </details>
      )}
    </figure>
  );
}

/** New listings per month, sale vs rent (grouped bars, one axis). */
export function MonthlyListingsChart({ data }) {
  return (
    <ChartCard
      title="New listings"
      description="Last 6 months, by listing type"
      table={{ headers: ['Month', 'Sale', 'Rent'], rows: data.map((d) => [d.month, d.sale, d.rent]) }}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(21,35,63,0.04)' }} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, color: '#4a5875' }} formatter={(v) => capitalize(v)} />
            <Bar dataKey="sale" name="sale" fill={SERIES.sale} radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="rent" name="rent" fill={SERIES.rent} radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/** Ranked horizontal bars for a single measure (property types, cities, inquiry status). */
export function RankedBarChart({ title, description, data, valueLabel = 'Count' }) {
  const rows = data.map((d) => ({ ...d, name: capitalize(d.name ?? 'Unknown') }));
  const height = Math.max(160, rows.length * 34 + 24);
  return (
    <ChartCard title={title} description={description} table={{ headers: ['Name', valueLabel], rows: rows.map((r) => [r.name, r.value]) }}>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-400">No data yet</p>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 28, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke={GRID} />
              <XAxis type="number" allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={96} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(21,35,63,0.04)' }} />
              <Bar dataKey="value" name={valueLabel} fill={SINGLE} radius={[0, 4, 4, 0]} maxBarSize={18} label={{ position: 'right', fontSize: 11, fill: '#4a5875' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
