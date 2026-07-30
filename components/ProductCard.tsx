import Image from "next/image";
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
      <div className="relative aspect-square w-full overflow-hidden bg-shoji2">
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
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gold">{product.anime}</p>
        <h3 className="font-display text-base leading-snug text-washi">{product.name}</h3>
        {product.price !== null && (
          <p className="mt-1 font-mono text-sm text-washiDim">
            Rp{product.price.toLocaleString("id-ID")}
          </p>
        )}
        <a
          href={outOfStock ? undefined : product.shopee_url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={outOfStock || !product.shopee_url}
          className={`focus-ring mt-3 inline-flex items-center justify-center rounded-sm px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
            outOfStock || !product.shopee_url
              ? "cursor-not-allowed border border-white/10 text-washiDim/50"
              : "bg-vermilion text-washi hover:bg-vermilionDark"
          }`}
        >
          {outOfStock ? "Stok habis" : "Beli di Shopee"}
        </a>
      </div>
    </div>
  );
}
