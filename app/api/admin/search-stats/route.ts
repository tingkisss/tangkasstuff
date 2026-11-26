import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = { id: string; name: string; total: number };

export async function GET() {
  try {
    // Ranking aktual: produk di rank 1, bulan berjalan
    const aktual = await query<Row>(`
      SELECT p.id, p.name, COUNT(*)::int AS total
      FROM search_results r
      JOIN search_logs l ON l.id = r.log_id
      JOIN products p ON p.id = r.product_id
      WHERE r.rank = 1
        AND l.created_at >= date_trunc('month', now())
        AND l.created_at <  date_trunc('month', now()) + interval '1 month'
      GROUP BY p.id, p.name
      ORDER BY total DESC
      LIMIT 10
    `);

    // Riwayat 3 bulan penuh sebelumnya, dasar rata-rata bergerak
    const riwayat = await query<Row>(`
      SELECT p.id, p.name, COUNT(*)::int AS total
      FROM search_results r
      JOIN search_logs l ON l.id = r.log_id
      JOIN products p ON p.id = r.product_id
      WHERE r.rank = 1
        AND l.created_at >= date_trunc('month', now()) - interval '3 months'
        AND l.created_at <  date_trunc('month', now())
      GROUP BY p.id, p.name
    `);

    // BARU: cek apakah riwayat mengandung data simulasi (untuk banner di halaman admin)
    const sim = await query<{ ada: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM search_logs WHERE is_simulation) AS ada`
    );

    const topRiwayat = [...riwayat].sort((a, b) => b.total - a.total).slice(0, 10);
    const names = new Map<string, string>();
    [...aktual, ...topRiwayat].forEach((r) => names.set(r.id, r.name));
    const aktualMap = new Map(aktual.map((r) => [r.id, r.total]));
    const riwayatMap = new Map(riwayat.map((r) => [r.id, r.total]));

    const data = [...names].map(([id, name]) => ({
      name,
      aktual: aktualMap.get(id) ?? 0,
      // prediksi = rata-rata 3 bulan terakhir
      prediksi: Math.round(((riwayatMap.get(id) ?? 0) / 3) * 10) / 10,
    }));
    data.sort((a, b) => b.aktual - a.aktual || b.prediksi - a.prediksi);

    // BARU: kirim juga penanda simulasi
    return NextResponse.json({ data, simulasi: sim[0]?.ada ?? false });
  } catch (err) {
    console.error("Gagal mengambil statistik pencarian:", err);
    return NextResponse.json({ error: "Gagal mengambil statistik." }, { status: 500 });
  }
}