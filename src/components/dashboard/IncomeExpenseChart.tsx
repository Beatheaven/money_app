"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface IncomeExpenseChartProps {
  data: Array<{ month: string; income: number; expense: number }>;
  loading: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>
      {payload.map((p: any) => (
        <div
          key={p.name}
          style={{ fontSize: 13, color: p.color, fontWeight: 600, marginBottom: 4 }}
        >
          {p.name === "income" ? "Pemasukan" : "Pengeluaran"}:{" "}
          {formatCurrency(p.value, "IDR")}
        </div>
      ))}
    </div>
  );
}

export function IncomeExpenseChart({ data, loading }: IncomeExpenseChartProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "20px",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Pemasukan vs Pengeluaran
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>6 bulan terakhir</p>
      </div>

      {loading ? (
        <div style={{ height: 240 }} className="skeleton" />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(0)}jt` : `${(v / 1000).toFixed(0)}rb`
              }
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="income" />
            <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="expense" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
