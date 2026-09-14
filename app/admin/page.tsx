"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackLink from "@/components/BackLink";

const emptyForm = {
  name: "",
  anime: "",
  description: "",
  image_url: "",
  tags: "",
  price: "",
  shopee_url: "",
  stock_status: "ready"
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          price: form.price || null
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus(`Gagal: ${json.error}`);
      } else {
        setStatus("Produk berhasil ditambahkan.");
        setForm(emptyForm);
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!unlocked) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-sm px-6 py-24">
          <BackLink />
          <h1 className="font-display text-2xl text-washi">Masuk Admin</h1>
          <p className="mt-2 text-sm text-washiDim">
            Masukkan token admin
          </p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Token admin"
            className="focus-ring mt-4 w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
          />
          <button
            onClick={() => setUnlocked(true)}
            disabled={!token}
            className="focus-ring mt-4 w-full rounded-sm bg-vermilion px-4 py-3 text-sm text-washi disabled:opacity-40"
          >
            Masuk
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <BackLink />
        <h1 className="font-display text-3xl text-washi">Tambah Produk Baru</h1>
        <p className="mt-1 text-sm text-washiDim">Produk akan langsung muncul di halaman Katalog.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label="Nama produk">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <Field label="Judul anime/game">
            <input
              required
              value={form.anime}
              onChange={(e) => setForm({ ...form, anime: e.target.value })}
              className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <Field label="Deskripsi">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <Field label="URL foto (upload dulu ke Imgur/ImgBB atau hosting gambar lain)">
            <input
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <Field label="Tag (pisahkan dengan koma, contoh: gantungan kunci, jujutsu kaisen, gojo)">
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Harga (Rp)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
              />
            </Field>
            <Field label="Status stok">
              <select
                value={form.stock_status}
                onChange={(e) => setForm({ ...form, stock_status: e.target.value })}
                className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
              >
                <option value="ready">Ready</option>
                <option value="preorder">Pre-order</option>
                <option value="habis">Habis</option>
              </select>
            </Field>
          </div>
          <Field label="Link Shopee">
            <input
              value={form.shopee_url}
              onChange={(e) => setForm({ ...form, shopee_url: e.target.value })}
              className="focus-ring w-full rounded-sm border border-vermilion/15 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring flex-1 rounded-sm bg-vermilion px-6 py-3 text-sm text-washi disabled:opacity-40"
            >
              {submitting ? "Menyimpan..." : "Simpan Produk"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setStatus(null);
              }}
              className="focus-ring rounded-sm border border-vermilion/20 px-6 py-3 text-sm text-washiDim transition-colors hover:text-washi"
            >
              Batal
            </button>
          </div>

          {status && <p className="text-sm text-washiDim">{status}</p>}
        </form>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-washiDim">{label}</span>
      {children}
    </label>
  );
}
