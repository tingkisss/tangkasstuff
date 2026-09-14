import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HankoStamp from "@/components/HankoStamp";
import BackLink from "@/components/BackLink";
import YenCalculator from "@/components/YenCalculator";
import TaxInfoCard from "@/components/TaxInfoCard";

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/6285174070806";
const RECAP_SHEET_URL = process.env.NEXT_PUBLIC_RECAP_SHEET_URL ?? "https://docs.google.com/spreadsheets/d/1xwaBbyjz7xY2aV7cMNPdPdWGNoatWz9DAxWkNTsiRRI/edit?usp=sharing";

const steps = [
  {
    n: "01",
    title: "Kirim detail barang",
    desc: "Chat kami di WhatsApp: link produk (Mercari, Suruga-ya, official store, dll), varian, dan jumlah yang mau dititip."
  },
  {
    n: "02",
    title: "Cek estimasi & konfirmasi",
    desc: "Kami hitung harga barang + ongkos titip + estimasi ongkir ke Indonesia, lalu kirim rincian sebelum kamu bayar."
  },
  {
    n: "03",
    title: "Pembelian di Jepang",
    desc: "Setelah pembayaran masuk, barang langsung kami beli. Update stok dicatat di rekapan jastip."
  },
  {
    n: "04",
    title: "Pengiriman ke Indonesia",
    desc: "Barang dikirim ke gudang kami dulu, lalu diteruskan ke alamatmu. Nomor resi dikirim lewat WhatsApp."
  }
];

export default function JastipPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <BackLink />
        <div className="mb-10 flex items-center gap-4">
          <HankoStamp label="代" sub="Jastip" size={56} />
          <div>
            <h1 className="font-display text-3xl text-washi sm:text-4xl">Jasa Titip Jepang</h1>
            <p className="mt-1 text-sm text-washiDim">
              Barang belum ada di katalog? Kami belikan langsung dari Jepang.
            </p>
          </div>
        </div>

        <div className="hairline mb-10 h-px w-full" />

        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {steps.map((s) => (
            <li key={s.n} className="rounded-sm border border-vermilion/15 bg-shoji p-6">
              <span className="font-mono text-xs text-gold">{s.n}</span>
              <h3 className="mt-2 font-display text-lg text-washi">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-washiDim">{s.desc}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <YenCalculator />
          <TaxInfoCard />
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring flex-1 rounded-sm bg-vermilion px-6 py-4 text-center font-body font-medium text-washi transition-colors hover:bg-vermilionDark"
          >
            Chat WhatsApp untuk Jastip
          </a>
          <a
            href={RECAP_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring flex-1 rounded-sm border border-gold/50 px-6 py-4 text-center font-body text-gold transition-colors hover:bg-gold/10"
          >
            Lihat Rekapan Jastip &amp; Harga
          </a>
        </div>

        <p className="mt-4 text-xs text-washiDim">
          Rekapan berisi status pesanan tiap orang dan harga terakhir yang disepakati — diperbarui manual oleh admin.
        </p>
      </main>
      <Footer />
    </>
  );
}
