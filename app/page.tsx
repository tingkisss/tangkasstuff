import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HankoStamp from "@/components/HankoStamp";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        {/* drifting petals, purely decorative */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {[12, 28, 47, 63, 81, 91].map((left, i) => (
            <span
              key={left}
              className="absolute top-0 block h-2 w-2 rounded-full bg-vermilion/40 animate-driftPetal"
              style={{ left: `${left}%`, animationDelay: `${i * 2.1}s` }}
            />
          ))}
        </div>

        <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
          {/* glow dekoratif, di belakang konten */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-16 h-72 w-72 rounded-full glow-vermilion"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full glow-gold"
          />

          <div className="relative flex flex-col items-start gap-6">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-gold">
              Jastip &amp; Katalog Anime dari Jepang
            </p>
            <HankoStamp label="棚" sub="Sejak 2024" size={64} className="animate-stamp" />
            <h1 className="font-display text-4xl leading-tight text-washi sm:text-6xl">
              Dari Jepang, langsung
              <br />
              ke tanganmu.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-washiDim sm:text-base">
              Tangkasstuff bantu kamu dua hal: titip beliin barang langsung dari Jepang
              (jastip), atau belanja merchandise anime yang sudah ready stok dari katalog kami.
              Pilih salah satu di bawah.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6">
          <div className="hairline h-px w-full" />
        </div>

        {/* Sliding-door choice panels */}
        <section className="relative mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-24 pt-10 sm:grid-cols-2">
          <DoorPanel
            href="/jastip"
            kanji="代"
            title="Jasa Titip"
            desc="Mau barang spesifik dari Jepang yang belum tentu ada di sini? Ceritain ke kami lewat WhatsApp."
            cta="Mulai Jastip"
            imgSrc="/images/foto.jpg"
          />
          <DoorPanel
            href="/katalog"
            kanji="棚"
            title="Katalog"
            desc="Barang yang sudah ready di tangan kami. Cari lewat kata kunci, atau foto barangnya langsung."
            cta="Lihat Katalog"
            imgSrc="/images/logo.jpeg"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}

function DoorPanel({
  href,
  kanji,
  title,
  desc,
  cta,
  imgSrc
}: {
  href: string;
  kanji: string;
  title: string;
  desc: string;
  cta: string;
  imgSrc: string;
}) {
  return (
    <Link
      href={href}
      className="focus-ring group relative flex h-80 flex-col justify-end overflow-hidden rounded-sm border border-vermilion/15 p-8 transition-all duration-500 hover:border-vermilion/60 sm:h-[26rem]"
    >
      {/* Background Image dengan efek hover zoom */}
      <Image
        src={imgSrc}
        alt={title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Gradient Overlay, dikasih tint hangat biar nyambung sama tema */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-vermilionDark/15 to-transparent transition-opacity duration-500 group-hover:opacity-80"
        aria-hidden="true"
      />

      {/* Kanji dekoratif di belakang teks */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 z-10 select-none font-display text-[10rem] leading-none text-white/[0.08] transition-transform duration-700 ease-out group-hover:scale-110 group-hover:text-vermilion/20"
      >
        {kanji}
      </span>

      {/* Konten teks */}
      <div className="relative z-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">{title}</p>
        <h2 className="mt-2 font-display text-2xl text-white">{desc}</h2>
        <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/70 transition-colors group-hover:text-vermilion">
          {cta} →
        </span>
      </div>
    </Link>
  );
}