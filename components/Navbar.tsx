import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="focus-ring flex items-center gap-3">
          <span className="hanko flex h-8 w-8 items-center justify-center rounded font-display text-sm">
            棚
          </span>
          <span className="font-display text-lg tracking-wide text-washi">
            Tangkas<span className="text-vermilion">stuff</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 font-body text-sm text-washiDim">
          <Link href="/" className="focus-ring hover:text-washi transition-colors">
            Beranda
          </Link>
          <Link href="/jastip" className="focus-ring hover:text-washi transition-colors">
            Jastip
          </Link>
          <Link href="/katalog" className="focus-ring hover:text-washi transition-colors">
            Katalog
          </Link>
        </nav>
      </div>
    </header>
  );
}
