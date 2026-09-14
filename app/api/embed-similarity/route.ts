import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { computeImageEmbeddingDINO, cosineSimilarity } from "@/lib/dino";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";
// Model DINOv2-nya lumayan berat dihitung, kasih waktu lebih buat cold start.
export const maxDuration = 60;

// Di bawah skor ini, kita anggap "kayaknya bukan barang yang sama" dan gak ditampilkan.
const SIMILARITY_THRESHOLD = 0.85;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const imageBase64: string | undefined = body?.imageBase64;
  const mediaType: string | undefined = body?.mediaType;

  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Foto tidak ditemukan di request." }, { status: 400 });
  }

  let queryEmbedding: number[];
  try {
    const buffer = Buffer.from(imageBase64, "base64");
    const blob = new Blob([buffer], { type: mediaType });
    queryEmbedding = await computeImageEmbeddingDINO(blob);
  } catch (err) {
    console.error("DINOv2 embedding error:", err);
    return NextResponse.json(
      { error: "Gagal memproses foto. Coba lagi dengan foto lain, atau format JPG/PNG." },
      { status: 500 }
    );
  }

  let products: Product[];
  try {
    products = await query<Product>("select * from products where embedding is not null");
  } catch (err) {
    console.error("Gagal mengambil produk dari database:", err);
    return NextResponse.json({ error: "Gagal mengambil data katalog." }, { status: 500 });
  }

  const scored = products
    .filter((p) => Array.isArray(p.embedding) && p.embedding.length > 0)
    .map((p) => ({
      product: p,
      score: cosineSimilarity(queryEmbedding, p.embedding as number[])
    }))
    .filter((r) => r.score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return NextResponse.json({
    matches: scored.map((r) => ({ ...r.product, similarity: Math.round(r.score * 100) }))
  });
}
