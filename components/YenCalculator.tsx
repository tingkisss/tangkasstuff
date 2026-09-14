"use client";

import { useMemo, useState } from "react";

// Rate toko: 1 Yen dikonversi jadi Rupiah dikali angka ini, lalu ditambah biaya jasa tetap.
// Bisa diubah lewat env NEXT_PUBLIC_JASTIP_RATE_PER_YEN / NEXT_PUBLIC_JASTIP_FLAT_FEE
// tanpa perlu edit kode.
const RATE_PER_YEN = Number(process.env.NEXT_PUBLIC_JASTIP_RATE_PER_YEN ?? 125);
const FLAT_FEE_IDR = Number(process.env.NEXT_PUBLIC_JASTIP_FLAT_FEE ?? 22000);

function formatIDR(value: number) {
  return `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

export default function YenCalculator() {
  const [yenInput, setYenInput] = useState("");

  const yen = Number(yenInput.replace(/[^0-9.]/g, ""));
  const result = useMemo(() => {
    if (!yenInput || Number.isNaN(yen) || yen <= 0) return null;
    const converted = yen * RATE_PER_YEN;
    const total = converted + FLAT_FEE_IDR;
    return { converted, total };
  }, [yen, yenInput]);

  return (
    <div className="rounded-sm border border-vermilion/15 bg-shoji p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Kalkulator Estimasi Harga</p>
      <p className="mt-2 text-sm text-washiDim">
        Masukkan harga barang dalam Yen (¥), kami hitungkan estimasi harga dalam Rupiah pakai rate
        toko kami: ¥1 = Rp{RATE_PER_YEN} + biaya jasa Rp{FLAT_FEE_IDR.toLocaleString("id-ID")}.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="font-mono text-lg text-washi">¥</span>
        <input
          type="text"
          inputMode="decimal"
          value={yenInput}
          onChange={(e) => setYenInput(e.target.value)}
          placeholder="contoh: 3000"
          className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji2 px-4 py-3 text-sm text-washi placeholder:text-washiDim/50"
        />
      </div>

      {result && (
        <div className="mt-4 rounded-sm border border-gold/30 bg-shoji2 p-4 font-mono text-sm text-washi">
          <p className="text-washiDim">
            ¥{yen.toLocaleString("ja-JP")} × Rp{RATE_PER_YEN} = {formatIDR(result.converted)}
          </p>
          <p className="text-washiDim">+ Biaya jasa titip = {formatIDR(FLAT_FEE_IDR)}</p>
          <div className="hairline my-2 h-px w-full" />
          <p className="text-base text-gold">Estimasi total = {formatIDR(result.total)}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-washiDim">
        Estimasi ini belum termasuk ongkos kirim domestik &amp; tax bea cukai (lihat info di bawah).
        Rate bisa berubah sewaktu-waktu mengikuti kurs asli — konfirmasi harga final tetap lewat WhatsApp.
      </p>
    </div>
  );
}
