import { Pool, type QueryResultRow } from "pg";

// Cuma butuh satu connection string biasa (DATABASE_URL) — bisa dari Neon,
// dari koneksi Postgres bawaan Supabase, Railway, atau server Postgres
// mana pun. Gak ada library khusus vendor tertentu, jadi gampang pindah
// provider kapan saja tanpa ubah kode.
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL belum diset di .env.local. Lihat README bagian 'Setup Database' untuk cara mendapatkannya."
      );
    }
    pool = new Pool({
      connectionString,
      // Kebanyakan Postgres terkelola (Neon, Supabase, dll) mewajibkan SSL,
      // tapi sertifikatnya self-signed dari sisi driver ini, jadi longgarkan
      // verifikasinya. Koneksinya sendiri tetap terenkripsi.
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

/** Jalankan satu query SQL dengan parameter, kembalikan baris hasilnya. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}
