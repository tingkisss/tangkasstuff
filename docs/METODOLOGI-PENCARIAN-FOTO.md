# Metodologi: Pencarian Produk Berdasarkan Foto (Content-Based Image Retrieval)

Dokumen ini menjelaskan metode teknis di balik fitur "Cari Pakai Foto" pada
website TangkasStuff, ditulis supaya bisa dijadikan rujukan langsung di bagian
metode penelitian/implementasi skripsi.

## 1. Definisi Masalah

Diberikan satu citra masukan (foto yang diunggah pelanggan), sistem perlu
menemukan produk-produk pada katalog yang secara visual paling mirip dengan
citra tersebut, tanpa memerlukan metadata teks dari pelanggan. Ini adalah
permasalahan klasik **Content-Based Image Retrieval (CBIR)**.

## 2. Algoritma yang Digunakan

### 2.1 Ekstraksi Fitur — CLIP (Contrastive Language–Image Pre-training)

- **Model**: CLIP ViT-B/32 (Vision Transformer, ukuran patch 32×32 piksel)
- **Checkpoint**: `Xenova/clip-vit-base-patch32` — hasil konversi format ONNX
  dari model resmi `openai/clip-vit-base-patch32`, agar dapat dijalankan
  tanpa Python, langsung di lingkungan Node.js/JavaScript.
- **Pustaka runtime**: [transformers.js](https://github.com/xenova/transformers.js)
  (menjalankan inferensi model lewat ONNX Runtime)
- **Rujukan akademik**: Radford, A., Kim, J. W., Hallacy, C., et al. (2021).
  *Learning Transferable Visual Models From Natural Language Supervision.*
  Proceedings of the 38th International Conference on Machine Learning (ICML).

CLIP terdiri atas dua encoder (teks dan gambar) yang dilatih bersama pada
jutaan pasangan gambar-teks dari internet, sehingga representasi (embedding)
yang dihasilkannya menangkap makna visual tingkat tinggi — bukan sekadar pola
piksel. Implementasi ini **hanya memakai Vision Encoder-nya** (kelas
`CLIPVisionModelWithProjection`), karena pencarian dilakukan gambar-ke-gambar,
bukan teks-ke-gambar.

Setiap citra (baik foto produk di katalog maupun foto masukan pelanggan)
diproses oleh Vision Encoder menjadi **vektor embedding berdimensi 512**.

### 2.2 Pengukuran Kemiripan — Cosine Similarity

Kemiripan antara embedding foto pelanggan (`A`) dan embedding tiap produk di
katalog (`B`) dihitung dengan **cosine similarity**:

```
             A · B
cos(A, B) = -------
            ‖A‖ ‖B‖
```

di mana `A · B` adalah dot product kedua vektor, dan `‖A‖`, `‖B‖` adalah
norma Euclidean masing-masing vektor. Nilai keluarannya berada pada rentang
**[-1, 1]**; semakin mendekati 1 berarti kedua gambar semakin mirip secara
visual.

Implementasi fungsi ini ada di `lib/clip.ts`, fungsi `cosineSimilarity()`.

### 2.3 Perankingan dan Ambang Batas (Thresholding)

1. Skor cosine similarity dihitung antara foto masukan dan **setiap** produk
   pada katalog yang sudah memiliki embedding tersimpan.
2. Seluruh produk diurutkan menurun berdasarkan skor tersebut.
3. Produk dengan skor di bawah ambang batas (`SIMILARITY_THRESHOLD = 0.75`,
   dapat diatur di `app/api/embed-similarity/route.ts`) dibuang dari hasil,
   supaya barang yang jelas tidak berkaitan tidak ikut ditampilkan.
4. Maksimal 12 hasil teratas dikembalikan ke pengguna, masing-masing disertai
   skor kemiripan dalam bentuk persentase (`round(score × 100)`).

## 3. Alur Sistem (Pipeline)

```
[Foto pelanggan]                         [Foto tiap produk di katalog]
       |                                            |
       v                                            v
  CLIP Vision Encoder                        CLIP Vision Encoder
  (computeImageEmbeddingCLIP)                (dihitung sekali saat
       |                                      produk ditambahkan,
       v                                      disimpan di kolom
  Embedding 512-dim                           `products.embedding`)
       |                                            |
       +---------------> Cosine Similarity <--------+
                                |
                                v
                    Ranking + Thresholding (>= 0.75)
                                |
                                v
                  Daftar produk paling mirip (maks. 12)
```

Perhatikan bahwa embedding produk katalog **dihitung sekali saat produk
ditambahkan** (lihat `app/api/products/route.ts`) dan disimpan permanen di
database (kolom `embedding`, tipe `jsonb`, tabel `products`), bukan dihitung
ulang setiap kali ada pencarian. Ini membuat pencarian berjalan cepat karena
hanya foto pelanggan yang perlu diproses secara real-time; embedding katalog
tinggal dibaca dari database.

## 4. Mengapa CLIP, Bukan Metode Lain?

| Metode | Menangkap kemiripan makna? | Perlu label/teks? | Biaya |
|---|---|---|---|
| Perceptual Hashing (pHash/dHash) | Tidak — hanya kemiripan piksel/pola | Tidak | Gratis |
| **CLIP + Cosine Similarity (dipakai di sini)** | **Ya — bentuk, warna, komposisi visual** | **Tidak** | **Gratis** |
| Model vision-language berbayar (mis. Claude/GPT-4V) | Ya, plus pengetahuan dunia (nama karakter, judul anime) | Tidak | Berbayar per panggilan |

CLIP dipilih karena memberi keseimbangan: hasil pencocokan jauh lebih relevan
dibanding pHash (yang cuma akurat untuk gambar identik/nyaris identik), tanpa
biaya operasional seperti model vision-language berbayar. Keterbatasannya:
CLIP tidak "mengenal" nama entitas spesifik (misalnya nama karakter anime)
seperti model bahasa besar — ia murni membandingkan kemiripan visual. Karena
itu, sistem ini menyediakan jalur tambahan opsional yang memanggil Claude
(Anthropic API) untuk identifikasi berbasis pengetahuan umum, dipakai hanya
saat pengguna secara eksplisit meminta (lihat `app/api/vision-search/route.ts`),
supaya biaya berbayar tidak muncul secara default.

## 5. Lokasi Implementasi (Kode Sumber)

| Komponen | File |
|---|---|
| Ekstraksi fitur CLIP & cosine similarity | `lib/clip.ts` |
| Endpoint pencarian (jalur gratis) | `app/api/embed-similarity/route.ts` |
| Penghitungan embedding saat produk baru ditambah | `app/api/products/route.ts` |
| Backfill embedding untuk produk lama | `scripts/embed-catalog.mjs` |
| Antarmuka pengguna (upload foto, tampilkan hasil) | `app/katalog/scan/page.tsx` |
| Skema kolom `embedding` di database | `database/schema.sql` |
