const taxRanges = [
  { category: "PC / Postcard / Shikishi", range: "Rp8.000 – Rp13.000" },
  { category: "Mochi / Chibi / Small Fig", range: "Rp10.000 – Rp23.000" },
  { category: "Doll M / Big", range: "Rp53.000 – Rp153.000" },
  { category: "Figure (Lookup / Qpos / Lumi)", range: "Rp58.000 – Rp158.000" }
];

export default function TaxInfoCard() {
  return (
    <div className="rounded-sm border border-vermilion/30 bg-shoji p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-vermilion">💸 Estimasi Tax</p>
      <p className="mt-2 text-sm text-washiDim">
        Perkiraan biaya pajak/bea cukai per jenis barang, di luar hitungan kalkulator di atas.
        Dibayar saat barang tiba di Admin.
      </p>
      <ul className="mt-4 divide-y divide-vermilion/10">
        {taxRanges.map((t) => (
          <li key={t.category} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <span className="text-washi">{t.category}</span>
            <span className="font-mono text-washiDim">{t.range}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-washiDim">
        Angka ini perkiraan, bukan hitungan pasti — nominal aktual tergantung kebijakan bea cukai
        saat barang tiba.
      </p>
    </div>
  );
}
