-- Jalankan ini di SQL Editor Neon (atau psql/SQL editor Postgres manapun kamu pakai)

create extension if not exists "uuid-ossp";

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  anime text not null,
  description text,
  image_url text not null,
  tags text[] not null default '{}',
  price numeric,
  shopee_url text,
  stock_status text not null default 'ready' check (stock_status in ('ready', 'preorder', 'habis')),
  created_at timestamptz not null default now(),
  -- Vektor ciri visual (CLIP) buat fitur "cari pakai foto" versi gratis.
  -- Diisi otomatis saat produk ditambah lewat /admin, atau lewat `npm run embed:catalog`.
  -- Lihat docs/METODOLOGI-PENCARIAN-FOTO.md untuk penjelasan algoritmanya.
  embedding jsonb
);

-- Kalau tabel `products` sudah pernah dibuat sebelum kolom `embedding` ada,
-- jalankan baris ini sendiri (aman dijalankan berkali-kali):
-- alter table products add column if not exists embedding jsonb;

-- Index buat pencarian teks cepat berdasarkan tag
create index if not exists products_tags_idx on products using gin (tags);

-- Catatan keamanan: proyek ini mengakses database lewat satu connection
-- string (DATABASE_URL) yang cuma dipakai di kode server (Server Components
-- dan Route Handlers Next.js) — tidak pernah dikirim ke browser. Karena itu
-- tidak perlu Row Level Security / anon-key seperti di Supabase; kontrol
-- akses cukup dilakukan di level API (lihat pengecekan ADMIN_API_TOKEN di
-- app/api/products/route.ts untuk operasi tulis).

-- Contoh data awal, opsional, hapus/ganti sesuai barang kamu
insert into products (name, anime, description, image_url, tags, price, shopee_url, stock_status)
values
  (
    'Acrylic Stand Gojo Satoru',
    'Jujutsu Kaisen',
    'Acrylic stand official ukuran 12cm, import langsung dari Jepang.',
    'https://via.placeholder.com/600x600.png?text=Gojo+Acrylic+Stand',
    array['acrylic stand', 'jujutsu kaisen', 'gojo satoru'],
    185000,
    'https://shopee.co.id/tangkasstuff',
    'ready'
  );
