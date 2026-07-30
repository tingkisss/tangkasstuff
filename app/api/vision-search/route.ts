import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Product, VisionSearchResult } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Kamu membantu toko merchandise anime mengenali barang dari foto pelanggan.
Lihat gambar yang diberikan lalu balas HANYA dengan JSON valid, tanpa teks lain, tanpa markdown, dengan bentuk persis:
{
  "anime_guess": string,        // judul anime/game yang paling mungkin, atau "tidak diketahui"
  "character_guess": string|null, // nama karakter jika terlihat, atau null
  "item_type_guess": string|null, // contoh: "figure", "keychain", "acrylic stand", "poster", "gantungan"
  "keywords": string[],         // 3-8 kata kunci pencarian singkat (judul anime, nama karakter, jenis barang, warna, seri)
  "confidence": "tinggi" | "sedang" | "rendah",
  "note": string                // catatan singkat 1 kalimat, bahasa Indonesia, untuk pelanggan
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Fitur identifikasi berbayar ini butuh ANTHROPIC_API_KEY yang belum diset di server. Ini opsional — pencarian gratis di atas tetap jalan tanpanya. Lihat README untuk cara setup."
      },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const imageBase64: string | undefined = body?.imageBase64;
  const mediaType: string | undefined = body?.mediaType;

  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Foto tidak ditemukan di request." }, { status: 400 });
  }

  let visionResult: VisionSearchResult;
  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
              { type: "text", text: "Ini foto barang dari pelanggan. Identifikasi sesuai format JSON." }
            ]
          }
        ]
      })
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("Claude API error:", errText);
      return NextResponse.json({ error: "Gagal menghubungi layanan pengenal gambar." }, { status: 502 });
    }

    const data = await claudeRes.json();
    const textBlock = data.content?.find((c: { type: string }) => c.type === "text")?.text ?? "";
    const cleaned = textBlock.replace(/```json|```/g, "").trim();
    visionResult = JSON.parse(cleaned);
  } catch (err) {
    console.error("Vision search parsing error:", err);
    return NextResponse.json(
      { error: "Gagal membaca hasil identifikasi foto. Coba foto lain yang lebih jelas." },
      { status: 500 }
    );
  }

  // Match against the catalog using the guessed anime title, character, and keywords.
  const searchTerms = [
    visionResult.anime_guess,
    visionResult.character_guess ?? "",
    ...(visionResult.keywords ?? [])
  ]
    .filter(Boolean)
    .map((t) => t.toLowerCase());

  let matchedProducts: Product[] = [];
  if (searchTerms.length > 0) {
    try {
      const allProducts = await query<Product>("select * from products");
      matchedProducts = allProducts
        .map((p) => {
          const haystack = [p.name, p.anime, ...(p.tags ?? [])].join(" ").toLowerCase();
          const score = searchTerms.reduce((acc, term) => (haystack.includes(term) ? acc + 1 : acc), 0);
          return { product: p, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.product);
    } catch (err) {
      console.error("Gagal mengambil produk dari database:", err);
    }
  }

  return NextResponse.json({ vision: visionResult, matches: matchedProducts });
}
