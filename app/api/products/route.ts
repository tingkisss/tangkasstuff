import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { computeImageEmbeddingDINO } from "@/lib/dino";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!token || token !== process.env.ADMIN_API_TOKEN) {
    return NextResponse.json({ error: "Token admin salah atau belum diset." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.anime || !body?.image_url) {
    return NextResponse.json({ error: "Nama, judul anime, dan URL foto wajib diisi." }, { status: 400 });
  }

  try {
    const rows = await query<Product>(
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
    const product = rows[0];

    // Hitung embedding DINOv2-nya buat fitur "cari pakai foto" gratis.
    // Kalau ini gagal (foto gak bisa diunduh, dll), produk tetap tersimpan —
    // tinggal jalankan `npm run embed:catalog` nanti buat susulan.
    try {
      const embedding = await computeImageEmbeddingDINO(body.image_url);
      await query("update products set embedding = $1::jsonb where id = $2", [
        JSON.stringify(embedding),
        product.id
      ]);
    } catch (embedErr) {
      console.warn("Gagal menghitung embedding buat produk baru:", embedErr);
    }

    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan produk." },
      { status: 500 }
    );
  }
}
