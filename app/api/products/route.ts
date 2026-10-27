import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { computeImageEmbeddingCLIP } from "@/lib/clip";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await query<Product>("SELECT * FROM products ORDER BY id DESC");
    const rows = Array.isArray(res) ? res : (res?.rows || []);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Pengecekan token static lama dihapus karena login admin sudah verifikasi via tabel admins

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.anime || !body?.image_url) {
    return NextResponse.json(
      { error: "Nama, judul anime, dan URL foto wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const res = await query<Product>(
      `insert into products (name, anime, description, image_url, tags, price, shopee_url, stock_status)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning *`,
      [
        body.name,
        body.anime,
        body.description ?? null,
        body.image_url,
        Array.isArray(body.tags) ? body.tags : [],
        body.price ? Number(body.price) : null,
        body.shopee_url ?? null,
        body.stock_status ?? "ready"
      ]
    );

    const rows = Array.isArray(res) ? res : (res?.rows || []);
    const product = rows[0];

    if (!product) {
      throw new Error("Gagal mendapatkan data produk setelah disimpan.");
    }

    // Hitung embedding CLIP otomatis untuk fitur "Cari Pakai Foto" (Visual Search Skripsi)
    try {
      const embedding = await computeImageEmbeddingCLIP(body.image_url);
      await query("update products set embedding = $1::jsonb where id = $2", [
        JSON.stringify(embedding),
        product.id
      ]);
    } catch (embedErr) {
      console.warn("Gagal menghitung embedding buat produk baru:", embedErr);
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Error saving product:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan produk." },
      { status: 500 }
    );
  }
}