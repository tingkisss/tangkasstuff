import Link from "next/link";

export default function BackLink({ href = "/", label = "Kembali" }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="focus-ring mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-washiDim transition-colors hover:text-gold"
    >
      ← {label}
    </Link>
  );
}
