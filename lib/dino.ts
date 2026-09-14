/**
 * ============================================================================
 * METODE PENCARIAN BARANG BERDASARKAN FOTO — Content-Based Image Retrieval (CBIR)
 * ============================================================================
 *
 * Algoritma yang dipakai: DINOv2 (self-Distillation with NO labels, v2)
 * Arsitektur   : ViT-B/14 (Vision Transformer, patch size 14)
 * Checkpoint   : Xenova/dinov2-base (konversi ONNX dari facebook/dinov2-base)
 * Referensi    : Oquab et al., "DINOv2: Learning Robust Visual Features
 *                without Supervision", 2023.
 * Runtime      : transformers.js (menjalankan inferensi ONNX Runtime di Node.js,
 *                tanpa API eksternal / tanpa biaya per pemanggilan)
 *
 * TAHAPAN ALGORITMA:
 * 1. Feature extraction — setiap gambar (foto produk katalog maupun foto yang
 *    diunggah pelanggan) dilewatkan ke DINOv2 Vision Transformer. Model ini
 *    dilatih murni self-supervised (tanpa label maupun caption teks) memakai
 *    skema self-distillation, sehingga fitur yang dipelajari fokus murni ke
 *    ciri visual gambar (bentuk, tekstur, komposisi objek) tanpa bias dari
 *    teks pendamping. Dari token [CLS] pada hidden state terakhir, diambil
 *    satu vektor embedding berdimensi 768 yang merepresentasikan ciri visual
 *    gambar tersebut.
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
 * Kenapa DINOv2 (bukan CLIP atau perceptual hashing / pHash biasa)? DINOv2
 * dilatih self-supervised murni dari jutaan gambar tanpa caption teks, jadi
 * embedding-nya sangat kuat buat mengenali kemiripan visual tingkat rendah
 * sampai menengah (bentuk, pose, tekstur, palet warna) tanpa "terpengaruh"
 * asosiasi bahasa seperti model kontrastif gambar-teks. Ini cocok buat kasus
 * "cari barang yang bentuknya mirip di katalog", bukan sekadar kecocokan
 * piksel seperti pHash yang hanya andal untuk duplikat/near-duplikat persis.
 * ============================================================================
 */
import { AutoProcessor, AutoModel, RawImage, type Tensor } from "@xenova/transformers";

const DINO_MODEL_ID = "Xenova/dinov2-base";

let processorInstance: ReturnType<typeof AutoProcessor.from_pretrained> | null = null;
let visionModelInstance: ReturnType<typeof AutoModel.from_pretrained> | null = null;

/** Singleton loader — model & processor cuma dimuat sekali per proses server (lazy-loaded). */
function loadDinoProcessor() {
  if (!processorInstance) processorInstance = AutoProcessor.from_pretrained(DINO_MODEL_ID);
  return processorInstance;
}

function loadDinoVisionModel() {
  if (!visionModelInstance) {
    visionModelInstance = AutoModel.from_pretrained(DINO_MODEL_ID, { quantized: true });
  }
  return visionModelInstance;
}

/** Ambil token [CLS] (elemen pertama di dimensi sequence) sebagai representasi gambar. */
function extractClsEmbedding(lastHiddenState: Tensor): number[] {
  const hiddenSize = lastHiddenState.dims[lastHiddenState.dims.length - 1];
  return Array.from((lastHiddenState.data as Float32Array).slice(0, hiddenSize));
}

/**
 * Langkah 1 dari algoritma CBIR: ekstraksi fitur visual (feature extraction).
 * Mengubah satu gambar menjadi vektor embedding 768 dimensi memakai DINOv2
 * Vision Transformer (token [CLS]). `input` boleh berupa URL gambar (string)
 * atau Blob (upload).
 *
 * Sepenuhnya gratis & berjalan lokal di server — tidak memanggil API pihak
 * ketiga mana pun.
 */
export async function computeImageEmbeddingDINO(input: string | Blob): Promise<number[]> {
  const processor = await loadDinoProcessor();
  const visionModel = await loadDinoVisionModel();

  const image = typeof input === "string" ? await RawImage.read(input) : await RawImage.fromBlob(input);
  const processedInputs = await processor(image);
  const { last_hidden_state: lastHiddenState } = await visionModel(processedInputs);

  return extractClsEmbedding(lastHiddenState);
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
