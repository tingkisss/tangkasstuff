const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/6285174070806";
const TIKTOK_URL = process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@tangkasshoppu";
const SHOPEE_URL = process.env.NEXT_PUBLIC_SHOPEE_URL ?? "https://shopee.co.id/tangkasstuff";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-vermilion/10">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="hairline mb-8 h-px w-full" />
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-washi">@tangkasstuff</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-washiDim">
              Jastip &amp; katalog merchandise anime langsung dari Jepang. Live tiap hari di TikTok, order lewat WhatsApp atau Shopee.
            </p>
          </div>
          <div className="flex gap-5 font-mono text-xs uppercase tracking-widest text-washiDim">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="focus-ring hover:text-gold">
              WhatsApp
            </a>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="focus-ring hover:text-gold">
              TikTok
            </a>
            <a href={SHOPEE_URL} target="_blank" rel="noopener noreferrer" className="focus-ring hover:text-gold">
              Shopee
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
