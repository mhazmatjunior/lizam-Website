"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Edit2, Package, X, CheckCircle, Plus, AlertCircle, Trash2 } from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { type Product } from "@/data/products";

/** Every editable field, flattened so the form can bind to plain strings. */
type FormState = {
  id: string;
  name: string;
  price: string;
  stock: string;
  category: string;
  image: string;
  description: string;
  longDescription: string;
  noteTop: string;
  noteHeart: string;
  noteBase: string;
  intensity: string;
  profile: string;
  longevity: string;
};

const BLANK: FormState = {
  id: "", name: "", price: "", stock: "",
  category: "Signature Collection", image: "",
  description: "", longDescription: "",
  noteTop: "", noteHeart: "", noteBase: "",
  intensity: "", profile: "", longevity: "",
};

function toForm(p: Product): FormState {
  return {
    id: String(p.id),
    name: p.name,
    price: String(p.price),
    stock: String(p.stock),
    category: p.category ?? "",
    image: p.image ?? "",
    description: p.description ?? "",
    longDescription: p.longDescription ?? "",
    noteTop: p.notes?.top ?? "",
    noteHeart: p.notes?.heart ?? "",
    noteBase: p.notes?.base ?? "",
    intensity: p.characteristics?.intensity ?? "",
    profile: p.characteristics?.profile ?? "",
    longevity: p.characteristics?.longevity ?? "",
  };
}

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-2">{label}</label>
    {children}
    {hint && <p className="text-[9px] text-white/20 mt-1.5 leading-relaxed">{hint}</p>}
  </div>
);

const inputCls =
  "w-full bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-xl px-4 py-3 text-xs text-white outline-none font-medium tracking-wide";

export default function InventoryPage() {
  const { products, updateProduct, addProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<"edit" | "add" | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Two-step delete: the first click only arms it, so a stray click on a live
  // store cannot remove a product.
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const openEdit = (p: Product) => {
    setForm(toForm(p));
    setError(null);
    setConfirmDelete(false);
    setMode("edit");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteProduct(Number(form.id));
      close();
    } catch (err: any) {
      setError(err?.message || "Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openAdd = () => {
    const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setForm({ ...BLANK, id: String(nextId) });
    setError(null);
    setMode("add");
  };

  const close = () => { setMode(null); setError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Name is required.");
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError("Enter a valid price.");
    const stockNum = Number(form.stock || 0);
    if (!Number.isFinite(stockNum) || stockNum < 0) return setError("Enter a valid stock number.");

    const anyCharacteristic = form.intensity.trim() || form.profile.trim() || form.longevity.trim();

    const payload: any = {
      name: form.name.trim(),
      price: priceNum,
      stock: stockNum,
      category: form.category.trim() || "Signature Collection",
      image: form.image.trim() || "/placeholder.png",
      description: form.description.trim(),
      longDescription: form.longDescription.trim(),
      notes: { top: form.noteTop.trim(), heart: form.noteHeart.trim(), base: form.noteBase.trim() },
      characteristics: anyCharacteristic
        ? { intensity: form.intensity.trim(), profile: form.profile.trim(), longevity: form.longevity.trim() }
        : undefined,
    };

    setIsSaving(true);
    try {
      if (mode === "add") {
        await addProduct({ ...payload, id: Number(form.id) || undefined });
      } else {
        await updateProduct(Number(form.id), payload);
      }
      close();
    } catch (err: any) {
      setError(err?.message || "Save failed. Check the console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Inventory Hub</h1>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 border border-gold/20 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Live Database Sync
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 w-full md:w-80 group focus-within:border-gold/30 transition-all">
          <Search className="w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-[11px] font-medium placeholder:text-white/10 w-full text-white"
          />
        </div>
        <button
          onClick={openAdd}
          className="w-full lg:w-auto px-7 py-3.5 rounded-2xl btn-premium-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Product</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Category</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Price</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Stock Status</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Content</th>
                <th className="px-8 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredProducts.map((p, index) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-white/[0.01] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center p-3 group-hover:border-gold/20 transition-all relative">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-contain p-2 filter drop-shadow-2xl" />
                        ) : (
                          <Package className="w-6 h-6 text-white/10" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-white/90 group-hover:text-gold transition-colors">{p.name}</h3>
                        <p className="text-[10px] text-white/20 font-medium tracking-tight">ID: #RA-{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{p.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[12px] font-black text-white/90">Rs {p.price.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${p.stock > 0 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"}`} />
                      <span className={`text-[12px] font-black tracking-tight ${p.stock > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {p.stock} Units
                      </span>
                    </div>
                  </td>
                  {/* Shows at a glance which products render the fragrance sections */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${p.characteristics ? "text-emerald-400/70" : "text-white/15"}`}>
                        {p.characteristics ? "Characteristics" : "No characteristics"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-gold hover:border-gold/30 transition-all flex items-center gap-2 ml-auto"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Details
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-[11px] font-bold uppercase tracking-widest text-white/20">
                    No products found in database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {mode && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              className="relative w-full max-w-2xl my-10 bg-[#080808] border border-gold/10 rounded-[32px] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.8),0_0_80px_rgba(200,164,77,0.05)]"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-px bg-gold/40" />
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                      {mode === "add" ? "New Product" : "Adjust Product"}
                    </h2>
                  </div>
                  <button
                    onClick={close}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-gold/40 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60">Basics</p>

                    <Field label="Product Name">
                      <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="7TH OCT" />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Price (PKR)">
                        <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} />
                      </Field>
                      <Field label="Stock">
                        <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} />
                      </Field>
                      <Field label={mode === "add" ? "Product ID" : "Product ID (fixed)"}>
                        <input
                          type="number"
                          value={form.id}
                          onChange={(e) => set("id", e.target.value)}
                          disabled={mode === "edit"}
                          className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                        />
                      </Field>
                    </div>

                    <Field label="Category">
                      <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls} placeholder="Signature Collection" />
                    </Field>

                    <Field label="Image URL" hint="A public Supabase storage link, or a local path like /section-img/photo.webp">
                      <input type="text" value={form.image} onChange={(e) => set("image", e.target.value)} className={inputCls} />
                    </Field>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 pt-5">Description</p>
                    <Field label="Short Description" hint="Shown on the product card in the collection">
                      <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className={`${inputCls} resize-none leading-relaxed`} />
                    </Field>
                    <Field label="Long Description" hint="The main paragraph on the product page">
                      <textarea value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} rows={4} className={`${inputCls} resize-none leading-relaxed`} />
                    </Field>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 pt-5">Fragrance Profile &amp; Notes</p>
                    <Field label="Top Notes">
                      <input type="text" value={form.noteTop} onChange={(e) => set("noteTop", e.target.value)} className={inputCls} placeholder="Crisp Apple, Rich Davana" />
                    </Field>
                    <Field label="Heart Notes (Middle)">
                      <input type="text" value={form.noteHeart} onChange={(e) => set("noteHeart", e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Base Notes">
                      <input type="text" value={form.noteBase} onChange={(e) => set("noteBase", e.target.value)} className={inputCls} />
                    </Field>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 pt-5">Scent Characteristics</p>
                    <p className="text-[9px] text-white/25 leading-relaxed -mt-2">
                      Leave blank to use the brand defaults. Fill these in only for a fragrance that differs.
                    </p>
                    <Field label="Intensity">
                      <input type="text" value={form.intensity} onChange={(e) => set("intensity", e.target.value)} className={inputCls} placeholder="Parfum Intense" />
                    </Field>
                    <Field label="Scent Profile">
                      <input type="text" value={form.profile} onChange={(e) => set("profile", e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Longevity">
                      <input type="text" value={form.longevity} onChange={(e) => set("longevity", e.target.value)} className={inputCls} />
                    </Field>
                  </div>


                  {error && (
                    <div className="flex items-start gap-2 text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full btn-premium-gold h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_20px_50px_rgba(200,164,77,0.1)] disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : mode === "add" ? "Create Product" : "Save Product Details"}
                    <CheckCircle className="w-4 h-4" />
                  </button>

                  {/* Delete lives at the very bottom, behind a confirm step, and
                      only when editing. Past orders keep the product name as
                      plain text, so removing a product does not affect them. */}
                  {mode === "edit" && (
                    <div className="pt-5 border-t border-white/5">
                      {!confirmDelete ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete this product
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-[10px] text-rose-300 leading-relaxed text-center">
                            Remove <span className="font-black">{form.name}</span> from the store
                            permanently? Existing orders are not affected.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="flex-grow h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/25 disabled:opacity-40 transition-all"
                            >
                              {isDeleting ? "Deleting..." : "Yes, delete permanently"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(false)}
                              disabled={isDeleting}
                              className="px-6 h-11 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest hover:text-white disabled:opacity-40 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
