"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/jastip", label: "Jastip" },
    { href: "/katalog", label: "Katalog" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="focus-ring flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="hanko flex h-8 w-8 shrink-0 items-center justify-center rounded font-display text-sm">
            棚
          </span>
          <span className="font-display text-lg tracking-wide text-washi">
            Tangkas<span className="text-vermilion">Stuff</span>
          </span>
        </Link>

        {/* Nav links — tampil sejajar mulai layar sm ke atas */}
        <nav className="hidden items-center gap-6 font-body text-sm text-washiDim sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="focus-ring hover:text-washi transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Tombol hamburger — cuma tampil di layar kecil */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-sm text-washi sm:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Dropdown menu mobile */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/5 px-6 py-4 font-body text-sm text-washiDim sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="focus-ring rounded-sm px-2 py-2.5 hover:bg-shoji hover:text-washi transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
