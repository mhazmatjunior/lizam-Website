"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search,
  Edit2,
  Package,
  X,
  CheckCircle
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { type Product } from "@/data/products";

export default function InventoryPage() {
  const { products, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editPrice, setEditPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editDesc, setEditDesc] = useState("");

  const filteredProducts = products.filter(p => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditPrice(p.price);
    setEditStock(p.stock);
    setEditDesc(p.description);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      await updateProduct(editingProduct.id, {
        price: editPrice,
        stock: editStock,
        description: editDesc
      });
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to update product details:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Inventory Hub</h1>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 border border-gold/20 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Live Database Sync
          </div>
        </div>
      </div>

      {/* Utilities Container */}
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
      </div>

      {/* Inventory Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Product</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Category</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Price</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Stock Status</th>
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
                        <Image src={p.image} alt={p.name} fill className="object-contain p-2 filter drop-shadow-2xl" />
                      </div>
                      <div>
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-white/90 group-hover:text-gold transition-colors">{p.name}</h3>
                        <p className="text-[10px] text-white/20 font-medium tracking-tight">ID: #RA-0000{p.id}</p>
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
                      <span className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'}`} />
                      <span className={`text-[12px] font-black tracking-tight ${p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.stock} Units
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => openEditModal(p)}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-gold hover:border-gold/30 transition-all flex items-center gap-2 ml-auto"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Details
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-[11px] font-bold uppercase tracking-widest text-white/20">
                    No products found in database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Details Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-2xl" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-[#080808] border border-gold/10 rounded-[32px] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.8),0_0_80px_rgba(200,164,77,0.05)] overflow-hidden"
            >
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-px bg-gold/40" />
                    <h2 className="text-xl font-black uppercase tracking-tighter text-white">Adjust Product</h2>
                  </div>
                  <button 
                    onClick={() => setEditingProduct(null)} 
                    className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-gold/40 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Product Name Display */}
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-1">Editing Scent</span>
                    <span className="text-sm font-bold text-gold uppercase">{editingProduct.name}</span>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-2">Price (PKR)</label>
                    <input 
                      type="number" 
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-xl px-4 py-3.5 text-xs text-white outline-none font-bold tracking-wide"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-2">Inventory Stock Level</label>
                    <input 
                      type="number" 
                      value={editStock}
                      onChange={(e) => setEditStock(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-xl px-4 py-3.5 text-xs text-white outline-none font-bold tracking-wide"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-2">Short Description</label>
                    <textarea 
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-xl px-4 py-3.5 text-xs text-white outline-none font-medium leading-relaxed resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full btn-premium-gold h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-6 shadow-[0_20px_50px_rgba(200,164,77,0.1)] disabled:opacity-50"
                  >
                    {isSaving ? "Saving Updates..." : "Save Product Details"} <CheckCircle className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
