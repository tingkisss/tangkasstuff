"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackLink from "@/components/BackLink";

interface Product {
  id: number;
  name: string;
  anime: string;
  price: number | null;
  stock_status: string;
  image_url: string;
}

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminUser, setAdminUser] = useState<{ id: number; username: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // State List Produk & Form
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // State Pengaturan Kalkulator Jastip
  const [jpyRate, setJpyRate] = useState<number | string>(125);
  const [jastipFee, setJastipFee] = useState<number | string>(22000);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);

  // Fetch data produk & settings saat admin berhasil login
  const fetchProducts = () => {
    setLoadingProducts(true);
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .finally(() => setLoadingProducts(false));
  };

  useEffect(() => {
    if (adminUser) {
      fetchProducts();
      fetch('/api/settings', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.jpy_rate) setJpyRate(data.jpy_rate);
          if (data.jastip_fee) setJastipFee(data.jastip_fee);
        });
    }
  }, [adminUser]);

  // Handler Update Status Stok Langsung
  async function handleStockChange(productId: number, newStatus: string) {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stock_status: newStatus })
      });

      if (res.ok) {
        setProducts(prev =>
          prev.map(p => (p.id === productId ? { ...p, stock_status: newStatus } : p))
        );
      } else {
        alert('Gagal memperbarui stok.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    }
  }

  // Handler Hapus Produk
  async function handleDeleteProduct(productId: number, name: string) {
    if (!confirm(`Yakin ingin menghapus produk "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        alert('Gagal menghapus produk.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan.');
    }
  }

  // Handler Login Admin
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsVerifying(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUser(data.admin);
      } else {
        setLoginError(data.error || "Username atau password salah!");
      }
    } catch (err) {
      setLoginError("Gagal terhubung ke server.");
    } finally {
      setIsVerifying(false);
    }
  }

  // Handler Submit Produk Baru
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
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
        fetchProducts();
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handler Submit Pengaturan Kalkulator
  async function handleUpdateSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!adminUser) return;
    setIsSavingSettings(true);
    setSettingsStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          jpy_rate: Number(jpyRate), 
          jastip_fee: Number(jastipFee),
          admin_id: adminUser.id 
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSettingsStatus(`Gagal: ${json.error || 'Terjadi kesalahan'}`);
      } else {
        setSettingsStatus("Pengaturan berhasil diperbarui!");
      }
    } catch (err) {
      setSettingsStatus(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  if (!adminUser) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-sm px-6 py-24">
          <BackLink href="/katalog" label="Kembali ke Katalog" />
          <h1 className="font-display text-2xl text-washi">Masuk Admin</h1>
          <p className="mt-2 text-sm text-washiDim">Masukkan akun admin terdaftar.</p>

          <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-4">
            <Field label="Username">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 pr-11 text-sm text-washi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-washiDim hover:text-washi"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </Field>

            {loginError && <p className="text-xs text-red-400">{loginError}</p>}

            <button
              type="submit"
              disabled={!username || !password || isVerifying}
              className="focus-ring w-full rounded-sm bg-vermilion px-4 py-3 text-sm text-washi disabled:opacity-40"
            >
              {isVerifying ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <BackLink href="/katalog" label="Kembali ke Katalog" />
        
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl text-washi">Dashboard Admin</h1>
          <span className="text-xs font-mono text-washiDim bg-shoji px-3 py-1.5 rounded-sm border border-white/10">
            Login: <strong className="text-washi">{adminUser.username}</strong>
          </span>
        </div>

        {/* SECTION 1: DAFTAR PRODUK & UPDATE STOK INSTAN */}
        <section className="mt-10">
          <h2 className="font-display text-xl text-washi mb-4">Daftar Produk & Update Stok</h2>
          {loadingProducts ? (
            <p className="text-sm text-washiDim font-mono">Memuat produk...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-washiDim">Belum ada produk di database.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-sm border border-white/10 bg-shoji gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-sm border border-white/10"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-washi line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-washiDim font-mono">
                        {item.anime} — {item.price ? `Rp ${Number(item.price).toLocaleString('id-ID')}` : 'No Price'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Select Dropdown Update Stok */}
                    <select
                      value={item.stock_status}
                      onChange={(e) => handleStockChange(item.id, e.target.value)}
                      className="focus-ring rounded-sm border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-washi"
                    >
                      <option value="ready">Ready</option>
                      <option value="preorder">Pre-order</option>
                      <option value="habis">Habis</option>
                    </select>

                    {/* Tombol Hapus */}
                    <button
                      onClick={() => handleDeleteProduct(item.id, item.name)}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-500/20 rounded-sm bg-red-500/10"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <hr className="my-10 border-white/10" />

        {/* SECTION 2: TAMBAH PRODUK BARU */}
        <h2 className="font-display text-xl text-washi">Tambah Produk Baru</h2>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="Nama produk">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <Field label="Judul anime/game">
            <input
              required
              value={form.anime}
              onChange={(e) => setForm({ ...form, anime: e.target.value })}
              className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <Field label="Deskripsi">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <Field label="URL foto (Direct link berawalan i.ibb.co.com)">
            <input
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <Field label="Tag (pisahkan dengan koma)">
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Harga (Rp)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
              />
            </Field>
            <Field label="Status stok awal">
              <select
                value={form.stock_status}
                onChange={(e) => setForm({ ...form, stock_status: e.target.value })}
                className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
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
              className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full rounded-sm bg-vermilion px-6 py-3 text-sm text-washi disabled:opacity-40 mt-2"
          >
            {submitting ? "Menyimpan..." : "Simpan Produk"}
          </button>
          {status && <p className="text-sm text-washiDim">{status}</p>}
        </form>

        <hr className="my-10 border-white/10" />

        {/* SECTION 3: PENGATURAN KALKULATOR */}
        <h2 className="font-display text-xl text-washi">Pengaturan Kalkulator Jastip</h2>
        <form onSubmit={handleUpdateSettings} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Kurs Yen ke IDR">
              <input
                type="number"
                step="0.01"
                required
                value={jpyRate}
                onChange={(e) => setJpyRate(e.target.value)}
                className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
              />
            </Field>
            <Field label="Tarif Fee Jastip (IDR)">
              <input
                type="number"
                required
                value={jastipFee}
                onChange={(e) => setJastipFee(e.target.value)}
                className="focus-ring w-full rounded-sm border border-white/10 bg-shoji px-4 py-3 text-sm text-washi"
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={isSavingSettings}
            className="focus-ring w-full rounded-sm bg-vermilion px-6 py-3 text-sm text-washi disabled:opacity-40"
          >
            {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
          {settingsStatus && <p className="text-sm text-washiDim">{settingsStatus}</p>}
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