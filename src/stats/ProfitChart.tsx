import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatsChartPoint as ChartPoint } from "../api/types";
import "./stats.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const currency = (n: number) =>
  n < 0 ? `-$${Math.abs(n).toLocaleString()}` : `$${n.toLocaleString()}`;

function Tip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">
        {dateFormatter.format(new Date(p.dateMs))}
      </div>
      {p.label && <div className="chart-tooltip-label">{p.label}</div>}
      <div className="chart-tooltip-value">{currency(p.cumulative)}</div>
    </div>
  );
}

export function ProfitChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return <div className="chart-empty">No data to display</div>;
  }

  const last = data[data.length - 1].cumulative;
  const lineColor = last >= 0 ? "#2e7d32" : "#d32f2f";

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data} margin={{ top: 12, right: 24, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.28} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f2" />
          <XAxis
            dataKey="dateMs"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => dateFormatter.format(new Date(v))}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => currency(v)}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <ReferenceLine y={0} stroke="#9ca3af" />
          <Tooltip content={<Tip />} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={lineColor}
            strokeWidth={2.5}
            fill="url(#profitFill)"
            dot={data.length <= 30 ? { r: 3, fill: lineColor, strokeWidth: 0 } : false}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
