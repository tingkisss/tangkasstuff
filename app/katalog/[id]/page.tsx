"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackLink from "@/components/BackLink";

interface Product {
  id: number;
  name: string;
  anime: string;
  description: string;
  image_url: string;
  tags: string[];
  price: number | null;
  shopee_url?: string;
  stock_status: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/products/${params.id}`, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error("Produk tidak ditemukan");
          return res.json();
        })
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [params.id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-washiDim font-mono">Memuat detail produk...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-24 text-center">
          <BackLink href="/katalog" label="Kembali ke Katalog" />
          <h1 className="font-display text-2xl text-washi mt-4">Produk Tidak Ditemukan</h1>
          <p className="mt-2 text-sm text-washiDim">{error || "Produk ini mungkin telah dihapus."}</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <BackLink href="/katalog" label="Kembali ke Katalog" />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Bingkai Foto Produk - Anti Crop & Full Frame */}
          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-shoji p-4">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-full max-w-full object-contain rounded-sm"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-washiDim font-mono text-xs">
                No Image Available
              </div>
            )}
          </div>

          {/* Rincian Produk */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Badge Anime & Stok */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
                  {product.anime}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                    product.stock_status === "ready"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : product.stock_status === "preorder"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {product.stock_status}
                </span>
              </div>

              {/* Judul Produk */}
              <h1 className="mt-2 font-display text-3xl text-washi">{product.name}</h1>

              {/* Harga */}
              <p className="mt-4 font-mono text-2xl font-bold text-washi">
                {product.price
                  ? `Rp ${Number(product.price).toLocaleString("id-ID")}`
                  : "Hubungi Admin"}
              </p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-sm border border-white/10 bg-shoji px-2 py-1 text-xs text-washiDim"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Deskripsi */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <h2 className="font-mono text-xs uppercase tracking-widest text-washiDim mb-2">
                  Deskripsi Produk
                </h2>
                <p className="text-sm leading-relaxed text-washiDim whitespace-pre-line">
                  {product.description || "Tidak ada deskripsi untuk produk ini."}
                </p>
              </div>
            </div>

            {/* Tombol Beli / Order */}
            <div className="mt-8 flex flex-col gap-3">
              {product.shopee_url && (
                <a
                  href={product.shopee_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring flex w-full items-center justify-center rounded-sm bg-orange-600 px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-500"
                >
                  Beli via Shopee
                </a>
              )}
              <a
                href={`https://wa.me/6285174070806?text=${encodeURIComponent(
                  `Halo Admin, saya tertarik dengan produk ${product.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex w-full items-center justify-center rounded-sm bg-vermilion px-6 py-3.5 text-center text-sm font-semibold text-washi transition-colors hover:opacity-90"
              >
                Tanya / Beli via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}