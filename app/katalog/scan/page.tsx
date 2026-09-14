"use client";

import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HankoStamp from "@/components/HankoStamp";
import BackLink from "@/components/BackLink";
import ProductCard from "@/components/ProductCard";
import type { Product, VisionSearchResult } from "@/lib/types";

type SimilarProduct = Product & { similarity: number };
type FreeResult = { matches: SimilarProduct[] } | { error: string };
// Dipakai lagi kalau fitur identifikasi berbayar diaktifkan.
type PaidResult = { vision: VisionSearchResult; matches: Product[] } | { error: string };

function fileToBase64(file: File): Promise<{ imageBase64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [, base64] = result.split(",");
      resolve({ imageBase64: base64, mediaType: file.type });
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

export default function ScanPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ imageBase64: string; mediaType: string } | null>(null);
  const [loadingFree, setLoadingFree] = useState(false);
  const [freeResult, setFreeResult] = useState<FreeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Fitur identifikasi berbayar (Anthropic API) — non-aktif dulu ---
  // const [loadingPaid, setLoadingPaid] = useState(false);
  // const [paidResult, setPaidResult] = useState<PaidResult | null>(null);

  async function handleFile(file: File) {
    setLoadingFree(true);
    setFreeResult(null);
    // setPaidResult(null);
    setPreview(URL.createObjectURL(file));

    try {
      const data = await fileToBase64(file);
      setImageData(data);
      const res = await fetch("/api/embed-similarity", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      });
      const json: FreeResult = await res.json();
      setFreeResult(json);
    } catch (err) {
      setFreeResult({ error: err instanceof Error ? err.message : "Terjadi kesalahan tak terduga." });
    } finally {
      setLoadingFree(false);
    }
  }

  // --- Fitur identifikasi berbayar (Anthropic API) — non-aktif dulu ---
  // async function handlePaidIdentify() {
  //   if (!imageData) return;
  //   setLoadingPaid(true);
  //   setPaidResult(null);
  //   try {
  //     const res = await fetch("/api/vision-search", {
  //       method: "POST",
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify(imageData)
  //     });
  //     const json: PaidResult = await res.json();
  //     setPaidResult(json);
  //   } catch (err) {
  //     setPaidResult({ error: err instanceof Error ? err.message : "Terjadi kesalahan tak terduga." });
  //   } finally {
  //     setLoadingPaid(false);
  //   }
  // }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <BackLink href="/katalog" label="Kembali ke Katalog" />
        <div className="mb-10 flex items-center gap-4">
          <HankoStamp label="見" sub="Scan" size={56} />
          <div>
            <h1 className="font-display text-3xl text-washi sm:text-4xl">Cari Pakai Foto</h1>
            <p className="mt-1 text-sm text-washiDim">
              Upload foto barang, sistem akan cari barang yang paling mirip di katalog kami secara gratis.
            </p>
          </div>
        </div>

        <div className="hairline mb-10 h-px w-full" />

        <div
          className="focus-ring flex min-h-[16rem] cursor-pointer flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed border-vermilion/20 bg-shoji p-8 text-center transition-colors hover:border-gold/50"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview foto yang diunggah" className="max-h-64 rounded-sm object-contain" />
          ) : (
            <p className="text-sm text-washiDim">Klik untuk pilih foto, atau seret foto ke sini.</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {loadingFree && (
          <p className="mt-6 text-center text-sm text-washiDim">
            Membandingkan foto dengan katalog... (proses pertama kali agak lambat karena model lagi dimuat)
          </p>
        )}

        {freeResult && "error" in freeResult && (
          <p className="mt-6 rounded-sm border border-vermilion/40 bg-vermilion/10 p-4 text-sm text-washi">
            {freeResult.error}
          </p>
        )}

        {freeResult && "matches" in freeResult && (
          <div className="mt-8">
            <h2 className="mb-4 font-display text-xl text-washi">
              {freeResult.matches.length > 0 ? "Barang paling mirip di katalog" : "Belum ada yang mirip di katalog"}
            </h2>

            {freeResult.matches.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {freeResult.matches.map((p) => (
                  <div key={p.id} className="relative">
                    <span className="absolute right-2 top-2 z-10 rounded-sm bg-ink/80 px-2 py-0.5 font-mono text-[10px] text-gold">
                      {p.similarity}% mirip
                    </span>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-sm border border-vermilion/15 bg-shoji p-6 text-sm text-washiDim">
                Barang ini kelihatannya belum ada stoknya. Mau kami titip beliin langsung dari Jepang?{" "}
                <a href="/jastip" className="text-vermilion underline underline-offset-2">
                  Coba Jastip
                </a>
                .
              </p>
            )}

            <p className="mt-8 text-xs text-washiDim">
              Pencarian di atas cuma membandingkan bentuk &amp; warna foto, belum tentu tau nama animenya kalau
              belum ada barang mirip di katalog kami.
            </p>

            {/* --- Fitur identifikasi berbayar (Anthropic API) — non-aktif dulu ---
            <div className="mt-8 rounded-sm border border-gold/30 bg-shoji p-6">
              <p className="text-sm text-washi">
                Pencarian di atas cuma membandingkan bentuk &amp; warna foto, belum tentu tau nama animenya kalau
                belum ada barang mirip di katalog kami.
              </p>
              <button
                onClick={handlePaidIdentify}
                disabled={loadingPaid}
                className="focus-ring mt-4 rounded-sm border border-gold/50 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-gold transition-colors hover:bg-gold/10 disabled:opacity-40"
              >
                {loadingPaid ? "Mengidentifikasi..." : "Coba identifikasi lebih akurat (berbayar tipis)"}
              </button>
            </div>
            --- */}
          </div>
        )}

        {/* --- Fitur identifikasi berbayar (Anthropic API) — non-aktif dulu ---
        {paidResult && "error" in paidResult && (
          <p className="mt-4 rounded-sm border border-vermilion/40 bg-vermilion/10 p-4 text-sm text-washi">
            {paidResult.error}
          </p>
        )}

        {paidResult && "vision" in paidResult && (
          <div className="mt-6">
            <div className="rounded-sm border border-gold/40 bg-shoji p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-gold">
                Kemungkinan: {paidResult.vision.anime_guess}
                {paidResult.vision.character_guess ? ` - ${paidResult.vision.character_guess}` : ""}
              </p>
              <p className="mt-2 text-sm text-washiDim">{paidResult.vision.note}</p>
            </div>

            {paidResult.matches.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {paidResult.matches.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}
        --- */}
      </main>
      <Footer />
    </>
  );
}
