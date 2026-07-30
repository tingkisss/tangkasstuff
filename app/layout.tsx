import type { Metadata } from "next";
import { Zen_Old_Mincho, Zen_Kaku_Gothic_New, Space_Mono } from "next/font/google";
import "./globals.css";

const display = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-display"
});

const body = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body"
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "TangkasStuff — Jastip & Katalog Jepang",
  description:
    "Jasa titip Jepang terpercaya dan katalog merchandise anime dari TangkasStuff. Cari barang lewat foto, pesan lewat WhatsApp atau Shopee."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body washi-grain min-h-screen antialiased">{children}</body>
    </html>
  );
}
