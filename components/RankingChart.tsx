"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export type RankingRow = { name: string; aktual: number; prediksi: number };
export type Mode = "aktual" | "prediksi";

export default function RankingChart({ data, mode }: { data: RankingRow[]; mode: Mode }) {
  const rows = [...data]
    .filter((r) => r[mode] > 0)
    .sort((a, b) => b[mode] - a[mode])
    .slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, rows.length * 52)}>
      <BarChart data={rows} layout="vertical" margin={{ left: 16, right: 24 }}>
        <XAxis type="number" allowDecimals={mode === "prediksi"} stroke="#9ca3af" />
        <YAxis
          type="category"
          dataKey="name"
          width={190}
          stroke="#9ca3af"
          tickFormatter={(v: string) => (v.length > 26 ? v.slice(0, 25) + "…" : v)}
        />
        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151" }} />
        <Bar
          dataKey={mode}
          name={mode === "aktual" ? "Pencarian bulan ini (rank 1)" : "Prediksi pencarian bulan depan"}
          fill={mode === "aktual" ? "#f97316" : "#38bdf8"}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}