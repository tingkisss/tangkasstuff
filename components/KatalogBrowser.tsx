"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

interface KatalogBrowserProps {
  products: Product[];
}

export default function KatalogBrowser({ products }: KatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnime, setSelectedAnime] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest"); // latest | price-asc | price-desc | name-asc | name-desc

  // Ambil daftar unik judul anime dari data produk secara otomatis
  const animeList = useMemo(() => {
    const set = new Set(products.map((p) => p.anime).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  // Filter & Sorting Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Filter Pencarian Teks (Nama, Anime, Tag)
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          product.name.toLowerCase().includes(q) ||
          product.anime.toLowerCase().includes(q) ||
          (product.tags && product.tags.some((tag) => tag.toLowerCase().includes(q)));

        // Filter Kategori Anime
        const matchesAnime = selectedAnime === "all" || product.anime === selectedAnime;

        // Filter Status Stok
        const matchesStatus = selectedStatus === "all" || product.stock_status === selectedStatus;

        return matchesQuery && matchesAnime && matchesStatus;
      })
      .sort((a, b) => {
        // Urutan Sorting
        if (sortBy === "price-asc") {
          return (a.price ?? 0) - (b.price ?? 0);
        }
        if (sortBy === "price-desc") {
          return (b.price ?? 0) - (a.price ?? 0);
        }
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "name-desc") {
          return b.name.localeCompare(a.name);
        }
        return 0; // 'latest' (sesuai urutan default DB)
      });
  }, [products, searchQuery, selectedAnime, selectedStatus, sortBy]);

  return (
    <div>
      {/* BARIS UTAMA: SEARCH BAR & TOMBOL SCAN */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama produk, judul anime, atau tag..."
          className="focus-ring w-full flex-1 rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi placeholder:text-washiDim/50"
        />
        <Link
          href="/katalog/scan"
          className="focus-ring inline-flex items-center justify-center whitespace-nowrap rounded-sm border border-gold/40 bg-gold/10 px-5 py-3 font-mono text-xs uppercase tracking-widest text-gold transition-colors hover:bg-gold/20"
        >
          Cari Pakai Foto
        </Link>
      </div>

      {/* BARIS FILTER & SORTING */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* 1. Filter Kategori Anime */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-widest text-washiDim">
            Kategori Anime
          </label>
          <select
            value={selectedAnime}
            onChange={(e) => setSelectedAnime(e.target.value)}
            className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-3 py-2 text-xs text-washi"
          >
            <option value="all">Semua Anime</option>
            {animeList.map((anime) => (
              <option key={anime} value={anime}>
                {anime}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Filter Status Stok */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-widest text-washiDim">
            Status Stok
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-3 py-2 text-xs text-washi"
          >
            <option value="all">Semua Status</option>
            <option value="ready">Ready Stok</option>
            <option value="preorder">Pre-order</option>
            <option value="habis">Stok Habis</option>
          </select>
        </div>

        {/* 3. Urutkan (Sorting) */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] uppercase tracking-widest text-washiDim">
            Urutkan Berdasarkan
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-3 py-2 text-xs text-washi"
          >
            <option value="latest">Terbaru</option>
            <option value="price-asc">Harga: Terendah ke Tertinggi</option>
            <option value="price-desc">Harga: Tertinggi ke Terendah</option>
            <option value="name-asc">Nama: A - Z</option>
            <option value="name-desc">Nama: Z - A</option>
          </select>
        </div>
      </div>

      {/* COUNTER PRODuk & PESAN TENTANG HASIL */}
      <div className="mt-6 flex items-center justify-between border-b border-white/10 pb-3">
        <p className="font-mono text-xs text-washiDim">
          Menampilkan <strong className="text-washi">{filteredProducts.length}</strong> produk
        </p>
        {(searchQuery || selectedAnime !== "all" || selectedStatus !== "all" || sortBy !== "latest") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedAnime("all");
              setSelectedStatus("all");
              setSortBy("latest");
            }}
            className="font-mono text-xs text-vermilion hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* GRID PRODuk */}
      <div className="mt-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-white/10 bg-shoji p-12 text-center">
            <p className="font-mono text-sm text-washiDim">
              Tidak ada produk yang sesuai dengan filter atau pencarian kamu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}