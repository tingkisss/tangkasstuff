export type Product = {
  id: string;
  name: string;
  anime: string;
  description: string | null;
  image_url: string;
  tags: string[];
  price: number | null;
  shopee_url: string | null;
  stock_status: "ready" | "preorder" | "habis";
  created_at: string;
  /** Vektor ciri visual (CLIP), dipakai buat pencarian foto gratis. Internal saja. */
  embedding?: number[] | null;
};

export type VisionSearchResult = {
  anime_guess: string;
  character_guess: string | null;
  item_type_guess: string | null;
  keywords: string[];
  confidence: "tinggi" | "sedang" | "rendah";
  note: string;
};
