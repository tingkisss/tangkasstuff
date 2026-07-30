// Jalankan dengan: npm run embed:catalog
//
// Menghitung ulang embedding CLIP (lihat lib/clip.ts dan
// docs/METODOLOGI-PENCARIAN-FOTO.md untuk penjelasan lengkap algoritmanya)
// buat produk lama yang belum punya, misalnya produk yang ditambah manual
// lewat SQL, atau sebelum fitur ini ada.
import { Pool } from "pg";
import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from "@xenova/transformers";

const MODEL_ID = "Xenova/clip-vit-base-patch32";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL belum diset di .env.local");
    process.exit(1);
  }

  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  let products;
  try {
    const result = await client.query(
      "select id, image_url, name from products where embedding is null"
    );
    products = result.rows;
  } catch (err) {
    console.error("Gagal mengambil produk:", err.message);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log("Semua produk sudah punya embedding. Gak ada yang perlu diproses.");
    client.release();
    await pool.end();
    return;
  }

  console.log(`Memproses ${products.length} produk yang belum punya embedding...`);
  console.log("(Pertama kali jalan, model CLIP ~150MB akan diunduh dulu — mohon tunggu.)");

  const processor = await AutoProcessor.from_pretrained(MODEL_ID);
  const model = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, { quantized: true });

  for (const product of products) {
    try {
      const image = await RawImage.read(product.image_url);
      const inputs = await processor(image);
      const { image_embeds } = await model(inputs);
      const embedding = Array.from(image_embeds.data);

      await client.query("update products set embedding = $1::jsonb where id = $2", [
        JSON.stringify(embedding),
        product.id
      ]);
      console.log(`✓ ${product.name}`);
    } catch (err) {
      console.error(`Gagal memproses "${product.name}" (${product.image_url}):`, err.message ?? err);
    }
  }

  console.log("Selesai.");
  client.release();
  await pool.end();
}

main();
