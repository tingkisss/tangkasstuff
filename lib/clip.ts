/**
 * ============================================================================
 * METODE PENCARIAN BARANG BERDASARKAN FOTO — Content-Based Image Retrieval (CBIR)
 * ============================================================================
 *
 * Algoritma yang dipakai: CLIP (Contrastive Language–Image Pre-training)
 * Arsitektur   : ViT-B/32 (Vision Transformer, patch size 32)
 * Checkpoint   : Xenova/clip-vit-base-patch32 (konversi ONNX dari openai/clip-vit-base-patch32)
 * Referensi    : Radford et al., "Learning Transferable Visual Models From
 *                Natural Language Supervision", ICML 2021.
 * Runtime      : transformers.js (menjalankan inferensi ONNX Runtime di Node.js,
 *                tanpa API eksternal / tanpa biaya per pemanggilan)
 *
 * TAHAPAN ALGORITMA:
 * 1. Feature extraction — setiap gambar (foto produk katalog maupun foto yang
 *    diunggah pelanggan) dilewatkan ke CLIP Vision Encoder, menghasilkan
 *    vektor embedding berdimensi 512 yang merepresentasikan ciri visual
 *    gambar tersebut (bentuk, warna, komposisi).
 * 2. Similarity measurement — vektor embedding foto pelanggan dibandingkan
 *    dengan vektor embedding tiap produk memakai Cosine Similarity:
 *
 *        cos(A, B) = (A · B) / (‖A‖ × ‖B‖)
 *
 *    Nilainya berkisar -1 s.d. 1; makin mendekati 1 berarti makin mirip.
 * 3. Ranking & thresholding — seluruh produk diurutkan berdasarkan skor
 *    similarity tertinggi, lalu difilter dengan ambang batas (threshold)
 *    minimum supaya hasil yang jauh berbeda tidak ikut ditampilkan.
 *
 * Kenapa CLIP (bukan perceptual hashing / pHash biasa)? CLIP dilatih dengan
 * jutaan pasangan gambar-teks sehingga embedding-nya menangkap kemiripan
 * semantik/visual tingkat tinggi (jenis barang, pose karakter, palet warna),
 * bukan sekadar kecocokan piksel seperti pHash yang hanya andal untuk
 * duplikat/near-duplikat persis.
 * ============================================================================
 */
import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from "@xenova/transformers";

const CLIP_MODEL_ID = "Xenova/clip-vit-base-patch32";

let processorInstance: ReturnType<typeof AutoProcessor.from_pretrained> | null = null;
let visionModelInstance: ReturnType<typeof CLIPVisionModelWithProjection.from_pretrained> | null = null;

/** Singleton loader — model & processor cuma dimuat sekali per proses server (lazy-loaded). */
function loadClipProcessor() {
  if (!processorInstance) processorInstance = AutoProcessor.from_pretrained(CLIP_MODEL_ID);
  return processorInstance;
}

function loadClipVisionModel() {
  if (!visionModelInstance) {
    visionModelInstance = CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL_ID, { quantized: true });
  }
  return visionModelInstance;
}

/**
 * Langkah 1 dari algoritma CBIR: ekstraksi fitur visual (feature extraction).
 * Mengubah satu gambar menjadi vektor embedding 512 dimensi memakai CLIP
 * Vision Encoder. `input` boleh berupa URL gambar (string) atau Blob (upload).
 *
 * Sepenuhnya gratis & berjalan lokal di server — tidak memanggil API pihak
 * ketiga mana pun.
 */
export async function computeImageEmbeddingCLIP(input: string | Blob): Promise<number[]> {
  const processor = await loadClipProcessor();
  const visionModel = await loadClipVisionModel();

  const image = typeof input === "string" ? await RawImage.read(input) : await RawImage.fromBlob(input);
  const processedInputs = await processor(image);
  const { image_embeds: imageEmbeds } = await visionModel(processedInputs);

  return Array.from(imageEmbeds.data as Float32Array);
}

/**
 * Langkah 2 dari algoritma CBIR: pengukuran kemiripan (similarity measurement)
 * antara dua vektor embedding memakai Cosine Similarity.
 * Hasil: -1 (berlawanan) s.d. 1 (identik). 0 berarti tidak berkorelasi.
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
