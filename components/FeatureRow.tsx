import Link from "next/link";
import Image from "next/image";

export default function FeatureRow() {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* CARD 1: JASA TITIP */}
      <div className="group relative flex min-h-[280px] overflow-hidden rounded-sm border border-white/10 bg-shoji">
        <Image
          src="/jastip-card-bg.jpg" // Sesuaikan dengan path/URL gambar Megumin kamu
          alt="Jasa Titip"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Lapisan Pelindung Teks (Dark Overlay) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/40" />

        {/* Konten Teks */}
        <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 w-full">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-amber-300 font-semibold drop-shadow-sm">
              JASA TITIP
            </span>
            <p className="mt-3 font-display text-base sm:text-lg leading-relaxed text-white drop-shadow-md">
              Mau barang spesifik dari Jepang yang belum tentu ada di katalog? Ceritain ke kami lewat WhatsApp.
            </p>
          </div>
          <Link
            href="/jastip"
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors font-bold drop-shadow-sm"
          >
            MULAI JASTIP →
          </Link>
        </div>
      </div>

      {/* CARD 2: KATALOG */}
      <div className="group relative flex min-h-[280px] overflow-hidden rounded-sm border border-white/10 bg-shoji">
        <Image
          src="/katalog-card-bg.jpg" // Sesuaikan dengan path/URL gambar Elf kamu
          alt="Katalog Ready Stok"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Lapisan Pelindung Teks (Dark Overlay) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/40" />

        {/* Konten Teks */}
        <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 w-full">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-amber-300 font-semibold drop-shadow-sm">
              KATALOG
            </span>
            <p className="mt-3 font-display text-base sm:text-lg leading-relaxed text-white drop-shadow-md">
              Barang yang sudah ready di tangan kami. Cari lewat kata kunci atau foto barangnya langsung.
            </p>
          </div>
          <Link
            href="/katalog"
            className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors font-bold drop-shadow-sm"
          >
            LIHAT KATALOG →
          </Link>
        </div>
      </div>
    </section>
  );
}