'use client';
import { useState, useEffect } from 'react';

export default function YenCalculator() {
  const [yenInput, setYenInput] = useState<number | ''>('');
  const [rate, setRate] = useState(125);
  const [fee, setFee] = useState(22000);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    // Tambahan { cache: 'no-store' } agar Next.js tidak menyimpan data lama
    fetch('/api/settings', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        // Mencegah error 'undefined' jika koneksi DB bermasalah
        if (data && data.jpy_rate !== undefined) setRate(Number(data.jpy_rate));
        if (data && data.jastip_fee !== undefined) setFee(Number(data.jastip_fee));
      })
      .catch(err => console.error('Gagal mengambil pengaturan kalkulator:', err));
  }, []);

  const calculateTotal = () => {
    if (yenInput) {
      setTotal((Number(yenInput) * rate) + fee);
    }
  };

  return (
    <div className="p-4 border border-pink-200 rounded-lg bg-pink-50">
      <h3 className="font-bold text-pink-700 mb-2">Kalkulator Jastip</h3>
      <div className="flex gap-2">
        <input 
          type="number" 
          placeholder="Harga barang (¥)"
          value={yenInput}
          onChange={(e) => setYenInput(e.target.value ? Number(e.target.value) : '')}
          className="border p-2 rounded w-full"
        />
        <button 
          onClick={calculateTotal}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          Hitung
        </button>
      </div>
      
      {total !== null && (
        <div className="mt-3 text-lg font-semibold text-gray-800">
          Estimasi: Rp {total.toLocaleString('id-ID')}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        *Berdasarkan kurs (¥1 = Rp {rate}) dan fee jastip Rp {Number(fee || 0).toLocaleString('id-ID')}
      </p>
    </div>
  );
}