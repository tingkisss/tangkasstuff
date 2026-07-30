import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HankoStamp from "@/components/HankoStamp";
import BackLink from "@/components/BackLink";
import KatalogBrowser from "@/components/KatalogBrowser";
import { query } from "@/lib/db";
import type { Product } from "@/lib/types";

export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  try {
    return await query<Product>("select * from products order by created_at desc");
  } catch (err) {
    console.error("Gagal mengambil produk dari database:", err);
    return [];
  }
}

export default async function KatalogPage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <BackLink />
        <div className="mb-10 flex items-center gap-4">
          <HankoStamp label="棚" sub="Katalog" size={56} />
          <div>
            <h1 className="font-display text-3xl text-washi sm:text-4xl">Katalog Ready Stok</h1>
            <p className="mt-1 text-sm text-washiDim">
              Barang yang sudah ada di tangan kami, siap kirim tanpa nunggu jastip.
            </p>
          </div>
        </div>

        <div className="hairline mb-10 h-px w-full" />

        <KatalogBrowser products={products} />
      </main>
      <Footer />
    </>
  );
}
