import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

const stockLabel: Record<Product["stock_status"], string> = {
  ready: "Ready stok",
  preorder: "Pre-order",
  habis: "Habis"
};

export default function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stock_status === "habis";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-sm border border-white/10 bg-shoji">
      {/* Gambar diklik -> Masuk Detail Produk */}
      <Link href={`/katalog/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-shoji2 block">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-2 top-2 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
            outOfStock ? "bg-black/60 text-washiDim" : "bg-vermilion/90 text-washi"
          }`}
        >
          {stockLabel[product.stock_status]}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gold">{product.anime}</p>
        
        {/* Judul diklik -> Masuk Detail Produk */}
        <Link href={`/katalog/${product.id}`}>
          <h3 className="font-display text-base leading-snug text-washi hover:text-vermilion transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.price !== null && (
          <p className="mt-1 font-mono text-sm text-washiDim">
            Rp{product.price.toLocaleString("id-ID")}
          </p>
        )}

        <div className="mt-auto pt-3">
          {/* Tombol Detail Tunggal */}
          <Link
            href={`/katalog/${product.id}`}
            className="focus-ring flex w-full items-center justify-center rounded-sm bg-vermilion px-4 py-2 font-mono text-xs uppercase tracking-widest text-washi transition-colors hover:bg-vermilionDark text-center"
          >
            Detail Produk
          </Link>
        </div>
      </div>
    </div>
  );
}