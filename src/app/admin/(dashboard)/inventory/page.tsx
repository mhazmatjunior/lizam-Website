"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Search,
  Edit2,
  Package
} from "lucide-react";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Focus on the single bottle strategy as requested
  const products = [
    {
      id: 1,
      name: "7th Oct",
      category: "Signature Collection",
      price: 15500,
      description: "Our flagship limited edition fragrance.",
      stock: 35,
      image: "/product_2.png"
    }
  ];
  
  const filteredProducts = products.filter(p => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Inventory Hub</h1>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 border border-gold/20 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Flagship Product Only
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
            className="bg-transparent border-none outline-none text-[11px] font-medium placeholder:text-white/10 w-full"
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
                        <p className="text-[10px] text-white/20 font-medium tracking-tight">ID: #RA-00001</p>
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
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                      <span className="text-[12px] font-black tracking-tight text-emerald-400">
                        {p.stock} Units
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-gold hover:border-gold/30 transition-all flex items-center gap-2 ml-auto">
                      <Edit2 className="w-3 h-3" /> Edit Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Highlight Feature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-10 rounded-[40px] bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Digital Presence</h4>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold text-white/60">Live on Storefront</span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
               </div>
               <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold text-white/60">Checkout Enabled</span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
