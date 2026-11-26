"use client";
import { useEffect, useState } from "react";
import RankingChart, { type RankingRow, type Mode } from "@/components/RankingChart";

export default function AdminStats() {
  const [data, setData] = useState<RankingRow[] | null>(null);
  const [simulasi, setSimulasi] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("aktual");

  useEffect(() => {
    fetch("/api/admin/search-stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (j.error) setError(j.error);
        else {
          setData(j.data);
          setSimulasi(Boolean(j.simulasi));
        }
      })
      .catch(() => setError("Gagal memuat statistik."));
  }, []);

  const hasRows = data?.some((r) => r[mode] > 0);
  const tabClass = (active: boolean) =>
    `rounded-sm border px-3 py-1.5 text-xs ${
      active ? "border-vermilion bg-vermilion text-washi" : "border-white/10 bg-shoji text-washiDim"
    }`;

  return (
    <section>
      <h2 className="font-display text-xl text-washi mb-1">Ranking Pencarian Produk</h2>
      <p className="mb-4 text-sm text-washiDim">
        Ranking berdasarkan hasil teratas (rank 1) pencarian gambar. Prediksi memakai
        rata-rata bergerak 3 bulan terakhir.
      </p>

      <div className="mb-3 flex gap-2">
        <button type="button" onClick={() => setMode("aktual")} className={tabClass(mode === "aktual")}>
          Ranking bulan ini
        </button>
        <button type="button" onClick={() => setMode("prediksi")} className={tabClass(mode === "prediksi")}>
          Prediksi bulan depan
        </button>
      </div>

      {simulasi && (
        <p className="mb-3 rounded-sm border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
          Riwayat mengandung data simulasi untuk pengujian, bukan data pelanggan.
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {!data && !error && <p className="text-sm text-washiDim font-mono">Memuat statistik...</p>}
      {data && !hasRows && (
        <p className="text-sm text-washiDim">
          {mode === "aktual"
            ? "Belum ada pencarian bulan ini."
            : "Belum cukup riwayat 3 bulan terakhir untuk prediksi."}
        </p>
      )}
      {data && hasRows && (
        <div className="rounded-sm border border-white/10 bg-shoji p-4">
          <RankingChart data={data} mode={mode} />
        </div>
      )}
    </section>
  );
}