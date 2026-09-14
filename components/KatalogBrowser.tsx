"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function KatalogBrowser({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const haystack = [p.name, p.anime, ...(p.tags ?? [])].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama produk, judul anime, atau tag..."
          className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi placeholder:text-washiDim/60"
        />
        <Link
          href="/katalog/scan"
          className="focus-ring flex shrink-0 items-center justify-center gap-2 rounded-sm border border-gold/50 px-5 py-3 font-mono text-xs uppercase tracking-widest text-gold transition-colors hover:bg-gold/10"
        >
          Cari pakai foto
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-sm border border-vermilion/15 bg-shoji p-8 text-center text-sm text-washiDim">
          Belum ada barang yang cocok dengan &ldquo;{query}&rdquo;. Coba kata kunci lain, atau titip lewat Jastip.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
