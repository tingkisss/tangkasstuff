# TangkasStuff — Jastip & Katalog

Website Next.js buat TangkasStuff: satu halaman depan dengan dua pilihan,
**Jastip** (jasa titip Jepang, diarahkan ke WhatsApp) dan **Katalog**
(barang ready stok, bisa dicari lewat teks atau foto, diarahkan ke Shopee).

## Struktur halaman

- `/` — halaman depan, pilih Jastip atau Katalog
- `/jastip` — penjelasan alur jastip + tombol WhatsApp + link rekapan Google Sheets
- `/katalog` — grid produk dari database + pencarian teks
- `/katalog/scan` — upload foto → Claude vision menebak anime/karakter → dicocokkan ke katalog
- `/admin` — form sederhana buat nambah produk baru (dilindungi token, lihat di bawah)

## 1. Install dependency

```bash
npm install
```

## 2. Setup Database — pakai Neon (gratis, direkomendasikan buat skripsi)

Website ini cuma butuh satu **koneksi Postgres biasa** (`DATABASE_URL`), jadi bisa pakai
provider mana saja: Neon, Postgres bawaan Supabase, Railway, dll. Yang direkomendasikan
di sini adalah **Neon**, alasannya:

| | Neon (dipakai di sini) | Supabase |
|---|---|---|
| Free tier | 0,5 GB storage + 100 jam compute/bulan, gratis selamanya | 500 MB storage, gratis selamanya |
| Kalau lama gak dipakai | Cuma "tidur" (auto-suspend), bangun otomatis pas diakses lagi | Di-pause setelah 7 hari; **setelah 90 hari gak dipakai sama sekali, gak bisa direstore otomatis lagi** — harus migrasi manual dari backup |
| Cocok buat | Project yang mungkin nganggur lama (misal pas libur semester) | Project yang aktif rutin diakses |

Karena skripsi biasanya ada jeda panjang (revisi, libur, sidang), Neon lebih aman dari
risiko "keburu ke-reset" pas kamu balik lagi ke projectnya.

**Langkah setup:**

1. Buat akun gratis di [neon.tech](https://neon.tech) (bisa langsung pakai akun GitHub/Google),
   lalu klik **Create a project**. Kasih nama bebas, misal `tangkasstuff`.
2. Begitu project dibuat, akan langsung muncul halaman **SQL Editor**. Buka file
   `database/schema.sql` di folder project ini, **select all → copy** semua isinya.
3. Paste ke kotak SQL Editor Neon, lalu klik tombol **Run**. Ini bikin tabel `products`
   beserta 1 contoh data.
4. Buka menu **Dashboard** atau **Connect** di project Neon kamu, cari **Connection string**
   (biasanya diawali `postgres://...`). Kalau ada pilihan "Pooled connection" dan
   "Direct connection", **pakai yang Pooled** — ini lebih cocok buat aplikasi serverless
   kayak Next.js. Salin seluruh string itu ke `DATABASE_URL` di `.env.local`.
5. Buat menyimpan foto produk, gampangnya upload ke layanan yang kasih link langsung ke
   gambar (misalnya Imgur atau ImgBB, gratis, gak perlu setup tambahan), lalu paste
   link-nya di form admin. (Neon sendiri gak nyediain file storage, cuma database.)

> **Kalau kamu masih mau pakai Supabase** (misal sudah kadung setup), tinggal ambil
> "Connection string" dari **Settings > Database** di dashboard Supabase (bukan dari
> Settings > API), lalu pakai itu sebagai `DATABASE_URL` — kodenya tetap jalan sama
> persis, karena keduanya sama-sama Postgres biasa.


## 3. Fitur "cari pakai foto" — gratis by default, ada opsi berbayar

Fitur ini sekarang dua lapis:

**Lapis gratis (default, selalu aktif, gak butuh API key apa pun)**
Pakai [transformers.js](https://github.com/xenova/transformers.js) yang menjalankan model
open-source **DINOv2** (dari Meta AI, self-supervised — dilatih tanpa label maupun caption
teks) langsung di server kamu sendiri. Cara kerjanya: tiap produk di katalog dihitung "ciri
visual"-nya (embedding) sekali, lalu foto yang diupload pelanggan dibandingkan kemiripannya
ke semua produk itu. Gak ada biaya per pemanggilan — cuma sekali download model (~91MB,
versi quantized) yang otomatis di-cache saat pertama kali dipakai.

Supaya ini jalan, setiap produk di katalog perlu punya kolom `embedding` terisi:
- Produk yang ditambah lewat `/admin` otomatis dihitung embedding-nya.
- Produk lama yang ditambah manual (misal langsung lewat SQL) bisa disusulkan dengan:
  ```bash
  npm run embed:catalog
  ```

Catatan: karena ini "cari yang mirip di katalog kamu", bukan "tau nama anime dari
pengetahuan umum" — jadi cuma bisa cocokkan ke barang yang fotonya sudah ada di
katalogmu, gak bisa nebak nama anime kalau belum ada barang sejenis.

**Lapis berbayar (opsional, tombol "Coba identifikasi lebih akurat")**
Kalau hasil gratis kurang jelas, pelanggan bisa klik tombol tambahan yang manggil Claude
(Anthropic API) buat menebak nama anime/karakternya pakai pengetahuan umum, bukan cuma
kemiripan visual. Ini yang kena biaya kecil per pemanggilan (lihat estimasi biaya di bagian
bawah). Kalau kamu gak mau pakai fitur ini sama sekali, biarkan `ANTHROPIC_API_KEY` kosong
di `.env.local` — tombolnya akan kasih pesan error yang jelas ke pelanggan, tapi fitur
gratis di atasnya tetap jalan normal.

1. Buat akun & API key di [console.claude.com](https://console.claude.com) kalau mau pakai lapis ini.
2. Isi `ANTHROPIC_API_KEY` di `.env.local`.
3. Akun baru dapat kredit trial gratis $5 (tanpa kartu kredit, verifikasi nomor HP).
   Setelahnya sistemnya isi-saldo (pay-as-you-go), bukan langganan bulanan — kamu isi
   saldo di console, lalu kepotong sesuai token yang benar-benar dipakai. Model yang
   dipakai di sini (Sonnet 5) estimasinya sekitar Rp80–150 per satu kali scan foto.

> Catatan deploy: model DINOv2 butuh waktu proses lumayan (terutama pertama kali). Kalau
> deploy ke platform serverless dengan batas waktu eksekusi pendek (misalnya Vercel Hobby),
> pertimbangkan naik ke plan yang izinkan durasi fungsi lebih panjang, atau deploy ke
> server yang nyala terus (VPS, Railway, Render) supaya model-nya gak perlu dimuat ulang
> tiap request.

## 4. Setup environment lain

Salin `.env.example` jadi `.env.local`, lalu isi semua nilainya:

```bash
cp .env.example .env.local
```

- `ADMIN_API_TOKEN` — kata sandi bebas yang kamu tentukan sendiri, dipakai buat masuk ke
  halaman `/admin`. Halaman ini proteksinya sederhana (cocokkan token di form dengan
  environment variable), cukup buat kebutuhan sendiri tapi bukan keamanan tingkat
  enterprise — jangan sebar link `/admin` ke publik.
- `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_TIKTOK_URL`, `NEXT_PUBLIC_SHOPEE_URL` — link
  toko kamu.
- `NEXT_PUBLIC_RECAP_SHEET_URL` — link Google Sheets rekapan jastip. Di Google Sheets,
  klik **Share > Anyone with the link** biar pelanggan bisa buka (mode read-only kalau
  gak mau ada yang ubah-ubah).
- `NEXT_PUBLIC_JASTIP_RATE_PER_YEN` dan `NEXT_PUBLIC_JASTIP_FLAT_FEE` — dipakai di
  kalkulator estimasi harga pada halaman `/jastip`. Rumusnya:
  `total_rupiah = harga_yen × RATE_PER_YEN + FLAT_FEE`. Ganti nilainya kapan saja
  kalau rate toko kamu berubah, tanpa perlu edit kode.

## 5. Jalankan lokal

```bash
npm run dev
```

Buka `http://localhost:3000`.

## 6. Tambah produk lewat /admin

Buka `/admin`, masukkan `ADMIN_API_TOKEN` yang kamu set tadi, isi form. Produk baru
langsung muncul di `/katalog`.

## 7. Deploy

Paling gampang pakai [Vercel](https://vercel.com): import repo ini, isi semua
environment variable yang sama seperti di `.env.local` pada bagian **Environment
Variables** di dashboard Vercel, lalu deploy.

## Cara kerja fitur "cari pakai foto"

> Penjelasan teknis lengkap (algoritma, rumus, alur sistem — cocok buat rujukan
> bab metode penelitian skripsi) ada di
> [`docs/METODOLOGI-PENCARIAN-FOTO.md`](docs/METODOLOGI-PENCARIAN-FOTO.md).

**Langkah 1 — gratis, otomatis jalan duluan:**
1. Pelanggan upload foto di `/katalog/scan`.
2. Foto dikirim ke `/api/embed-similarity`, dihitung embedding DINOv2-nya (gratis, lokal).
3. Dibandingkan ke embedding semua produk di katalog, diurutkan dari yang paling mirip,
   cuma yang skor kemiripannya di atas ambang batas yang ditampilkan.
4. Kalau gak ada yang mirip, pelanggan diarahkan ke halaman Jastip.

**Langkah 2 — opsional, berbayar, kalau pelanggan klik tombolnya:**
1. Foto yang sama dikirim ke `/api/vision-search`, diteruskan ke Claude (Anthropic API)
   dengan instruksi menebak: judul anime, nama karakter, jenis barang, dan kata kunci.
2. Kata kunci itu dicocokkan sederhana (cari kecocokan kata) ke kolom `name`, `anime`,
   dan `tags` di tabel `products` — jadi **rajin isi kolom tag saat nambah produk**
   supaya hasil langkah ini makin akurat.

## Kustomisasi desain

Warna, font, dan komponen "hanko stamp" (stempel bertema sakura pink khas Jepang yang
jadi ciri khas visual web ini) ada di:
- `tailwind.config.ts` — semua token warna (`ink`, `vermilion`, `gold`, dst.)
- `app/layout.tsx` — pemilihan font (Zen Old Mincho buat judul, Zen Kaku Gothic New
  buat isi)
- `components/HankoStamp.tsx` — komponen stempel yang dipakai di beberapa halaman
