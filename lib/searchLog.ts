import { query } from "@/lib/db";

type Hit = { id: string; score: number };

export async function logSearch(results: Hit[], latencyMs: number) {
  if (results.length === 0) return;
  try {
    const logs = await query<{ id: string }>(
      "INSERT INTO search_logs (top_k, latency_ms) VALUES ($1, $2) RETURNING id",
      [results.length, Math.round(latencyMs)]
    );
    await query(
      `INSERT INTO search_results (log_id, product_id, rank, score)
       SELECT $1, x.product_id, x.rank, x.score
       FROM unnest($2::uuid[], $3::int[], $4::real[]) AS x(product_id, rank, score)`,
      [
        logs[0].id,
        results.map((r) => r.id),
        results.map((_, i) => i + 1),
        results.map((r) => r.score),
      ]
    );
  } catch (e) {
    console.error("gagal mencatat log pencarian", e);
  }
}