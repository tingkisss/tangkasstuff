import { Package, ShieldCheck, Camera } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Langsung dari Jepang",
    desc: "Setiap barang dibeli langsung di toko aslinya, bukan reseller — jastip maupun katalog ready stok."
  },
  {
    icon: ShieldCheck,
    title: "Transparan & Tercatat",
    desc: "Harga, status pesanan, dan rekapan jastip semuanya tercatat rapi, bisa kamu cek kapan saja."
  },
  {
    icon: Camera,
    title: "Cari Pakai Foto",
    desc: "Gak tau nama barangnya? Foto aja, sistem bantu cariin yang paling mirip di katalog kami."
  }
];

export default function FeatureRow() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-sm border border-vermilion/15 bg-shoji p-6">
            <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-lg text-washi">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-washiDim">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}