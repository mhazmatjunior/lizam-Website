"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  X,
  ChevronDown,
  Upload
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";

export default function InventoryPage() {
  const { products, addProduct, deleteProduct, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newScent, setNewScent] = useState({
    name: "",
    category: "Obsidian",
    price: "",
    description: "",
    notes: {
      top: "",
      heart: "",
      base: ""
    },
    image: null as string | null,
    stock: 50
  });
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const staticCategories = ["Obsidian", "Woody", "Floral", "Musk"];
  const dynamicCategories = [...new Set(products.map(p => p.category))];
  const allCategories = [...new Set([...staticCategories, ...dynamicCategories])];
  const filterCategories = ["All", ...allCategories];
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddScent = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryToUse = showNewCategoryInput ? customCategory : newScent.category;
    
    addProduct({
      ...newScent,
      category: categoryToUse,
      price: parseInt(newScent.price),
      longDescription: newScent.description,
      image: newScent.image || "/Pic_1_Transparent.png",
      stock: newScent.stock
    });

    setIsAddModalOpen(false);
    setNewScent({ 
      name: "", 
      category: "Obsidian", 
      price: "", 
      description: "",
      notes: { top: "", heart: "", base: "" },
      image: null,
      stock: 50
    });
    setShowNewCategoryInput(false);
    setCustomCategory("");
  };

  const handleUpdateScent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    updateProduct(editingProduct.id, {
      ...editingProduct,
      price: parseInt(editingProduct.price)
    });
    setEditingProduct(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new (window as any).Image();
        img.src = reader.result;
        img.onload = () => {
          // Create a canvas to resize/compress
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 800;

          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Get compressed base64
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          if (editingProduct) {
            setEditingProduct({ ...editingProduct, image: compressedBase64 });
          } else {
            setNewScent({ ...newScent, image: compressedBase64 });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Inventory Hub</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-premium-gold h-14 px-8 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(212,175,55,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Add New Scent
        </button>
      </div>

      {/* Utilities Container */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
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
          
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
            {filterCategories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300
                  ${selectedCategory === cat 
                    ? 'bg-gold/10 text-gold border border-gold/20' 
                    : 'text-white/30 hover:text-white bg-white/[0.02] border border-transparent'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {/* Filter/Download removed per user request */}
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
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p, index) => (
                  <motion.tr 
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center p-3 group-hover:border-gold/20 transition-all">
                          <Image src={p.image} alt={p.name} width={40} height={50} className="object-contain filter drop-shadow-md" />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-white/90 group-hover:text-gold transition-colors">{p.name}</h3>
                          <p className="text-[9px] text-white/20 font-medium tracking-tight">ID: #RA-{p.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{p.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[11px] font-black text-white/90">Rs {p.price.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.stock >= 10 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 
                          'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                        }`} />
                        <span className={`text-[11px] font-black tracking-tight ${
                          p.stock >= 10 ? 'text-emerald-400' : 
                          'text-rose-500'
                        }`}>
                          {p.stock} Units
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewProduct(p)}
                          className="p-3 text-white/20 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingProduct(p)}
                          className="p-3 text-white/20 hover:text-gold hover:bg-gold/5 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setProductToDelete(p)}
                          className="p-3 text-white/20 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-8 py-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Showing {filteredProducts.length} of {products.length} Scents</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors disabled:opacity-30" disabled>Prev</button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-gold/10 text-gold text-[9px] font-black border border-gold/20">1</button>
            </div>
            <button className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Add Scent Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
            />
            <div className="min-h-full flex items-center justify-center p-6 py-12 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 pb-16 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-x-hidden pointer-events-auto"
              >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Add New Scent</h2>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddScent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload Area */}
                  <div className="md:col-span-2 flex justify-center">
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-40 h-40 rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden
                        ${newScent.image 
                          ? 'border-gold/50 bg-gold/5' 
                          : 'border-white/10 bg-white/[0.02] hover:border-gold/30 hover:bg-gold/5'}`}
                      >
                        {newScent.image ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={newScent.image} 
                              alt="New Scent Preview" 
                              fill
                              className="object-contain p-4 filter drop-shadow-2xl"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gold" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center mb-1">
                              <Upload className="w-5 h-5 text-gold" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Upload Visual</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Scent Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Midnight Onyx"
                      value={newScent.name || ""}
                      onChange={(e) => setNewScent({...newScent, name: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium text-white/60 flex items-center justify-between hover:border-white/10 transition-all"
                    >
                      {newScent.category}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180 text-gold' : 'text-white/20'}`} />
                    </button>

                    <AnimatePresence>
                      {isCategoryOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsCategoryOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-20 top-full left-0 right-0 mt-2 bg-[#0d0d0d] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-3xl overflow-hidden"
                          >
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                              {allCategories.map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => {
                                    setNewScent({...newScent, category: cat});
                                    setIsCategoryOpen(false);
                                    setShowNewCategoryInput(false);
                                  }}
                                  className={`w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all
                                    ${newScent.category === cat && !showNewCategoryInput 
                                      ? 'bg-gold/10 text-gold' 
                                      : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                            <div className="h-px bg-white/5 my-2" />
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewCategoryInput(true);
                                setIsCategoryOpen(false);
                              }}
                              className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-white/40 hover:text-gold hover:bg-gold/5 flex items-center justify-between`}
                            >
                              + Create New Category
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {showNewCategoryInput && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">New Category Name</label>
                        <input 
                          required
                          type="text"
                          placeholder="e.g. Sapphire"
                          value={customCategory || ""}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full bg-gold/5 border border-gold/20 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/50 transition-all text-gold"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Stock Quantity</label>
                    <input 
                      required
                      type="number"
                      placeholder="e.g. 50"
                      value={newScent.stock || 0}
                      onChange={(e) => setNewScent({...newScent, stock: parseInt(e.target.value) || 0})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Price (PKR)</label>
                    <input 
                      required
                      type="number"
                      placeholder="e.g. 18500"
                      value={newScent.price || ""}
                      onChange={(e) => setNewScent({...newScent, price: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all"
                    />
                  </div>

                  {/* Scent Pyramid Section */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-[32px]">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Top Note</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Saffron"
                        value={newScent.notes.top || ""}
                        onChange={(e) => setNewScent({...newScent, notes: {...newScent.notes, top: e.target.value}})}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] outline-none focus:border-gold/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Heart Note</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Leather"
                        value={newScent.notes.heart || ""}
                        onChange={(e) => setNewScent({...newScent, notes: {...newScent.notes, heart: e.target.value}})}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] outline-none focus:border-gold/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Base Note</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Oud"
                        value={newScent.notes.base || ""}
                        onChange={(e) => setNewScent({...newScent, notes: {...newScent.notes, base: e.target.value}})}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] outline-none focus:border-gold/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Brief Scent Story</label>
                    <textarea 
                      required
                      placeholder="Describe the essence of this fragrance..."
                      rows={4}
                      value={newScent.description || ""}
                      onChange={(e) => setNewScent({...newScent, description: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="md:col-span-2 btn-premium-gold h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    Finalize & Archive Scent
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden text-center"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 blur-[60px] -mt-24 pointer-events-none" />
              
              <div className="relative z-10 space-y-8">
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-[0_10px_40px_rgba(244,63,94,0.1)]">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Remove Scent?</h3>
                  <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                    Are you sure you want to remove <span className="text-white font-black">"{productToDelete.name}"</span> from the collection? This action is irreversible.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      deleteProduct(productToDelete.id);
                      setProductToDelete(null);
                    }}
                    className="w-full py-4 bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-600 transition-all shadow-[0_20px_40px_rgba(244,63,94,0.2)]"
                  >
                    Confirm Removal
                  </button>
                  <button
                    onClick={() => setProductToDelete(null)}
                    className="w-full py-4 bg-white/5 text-white/40 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
                  >
                    Keep Scent
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Scent Modal */}
      <AnimatePresence>
        {viewProduct && (
          <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
            />
            <div className="min-h-full flex items-center justify-center p-6 py-12 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 pb-16 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-x-hidden pointer-events-auto"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32" />
                
                <div className="relative z-10 space-y-8 text-center md:text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">{viewProduct.name}</h2>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">ID: #RA-{viewProduct.id.toString().padStart(4, '0')}</p>
                    </div>
                    <button 
                      onClick={() => setViewProduct(null)}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
                      <div className="relative w-48 h-48">
                        <Image 
                          src={viewProduct.image} 
                          alt={viewProduct.name} 
                          fill 
                          className="object-contain filter drop-shadow-2xl" 
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Category</span>
                        <p className="text-sm font-bold text-white uppercase tracking-widest">{viewProduct.category}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Inventory</span>
                        <p className={`text-sm font-black ${viewProduct.stock < 10 ? 'text-rose-500' : 'text-emerald-400'}`}>
                          {viewProduct.stock} Units
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gold/60">Price</span>
                        <p className="text-2xl font-black text-white">Rs {viewProduct.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Scent Pyramid</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gold/40 mb-1">Top</p>
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">{viewProduct.notes.top}</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gold/40 mb-1">Heart</p>
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">{viewProduct.notes.heart}</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gold/40 mb-1">Base</p>
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">{viewProduct.notes.base}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Scent Essence</h3>
                    <p className="text-[12px] text-white/60 font-medium leading-relaxed italic">
                      "{viewProduct.longDescription || viewProduct.description}"
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setEditingProduct(viewProduct);
                      setViewProduct(null);
                    }}
                    className="w-full btn-premium-gold h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modify Scent Details
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Scent Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
            />
            <div className="min-h-full flex items-center justify-center p-6 py-12 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 pb-16 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-x-hidden pointer-events-auto"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32" />
                
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">Edit Fragrance</h2>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">ID: #RA-{editingProduct.id.toString().padStart(4, '0')}</p>
                    </div>
                    <button 
                      onClick={() => setEditingProduct(null)}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateScent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image Edit Area */}
                    <div className="md:col-span-2 flex justify-center">
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-40 h-40 rounded-[32px] border-2 border-dashed border-gold/50 bg-gold/5 transition-all flex flex-col items-center justify-center overflow-hidden">
                          <div className="relative w-full h-full">
                            <Image 
                              src={editingProduct.image} 
                              alt="Scent Preview" 
                              fill
                              className="object-contain p-4 filter drop-shadow-2xl"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gold" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Fragrance Name</label>
                      <input 
                        required
                        type="text"
                        value={editingProduct.name || ""}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all font-sans uppercase tracking-widest"
                      />
                    </div>

                    <div className="space-y-2 relative">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Category</label>
                      <button
                        type="button"
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium text-white/60 flex items-center justify-between hover:border-white/10 transition-all"
                      >
                        {editingProduct.category}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180 text-gold' : 'text-white/20'}`} />
                      </button>

                      <AnimatePresence>
                        {isCategoryOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute z-20 top-full left-0 right-0 mt-2 bg-[#0d0d0d] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-3xl overflow-hidden"
                            >
                              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                {allCategories.filter(c => c !== "All").map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      setEditingProduct({...editingProduct, category: cat});
                                      setIsCategoryOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all
                                      ${editingProduct.category === cat ? 'bg-gold/10 text-gold' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Vault Inventory</label>
                      <input 
                        required
                        type="number"
                        value={editingProduct.stock || 0}
                        onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Pricing (PKR)</label>
                      <input 
                        required
                        type="number"
                        value={editingProduct.price || 0}
                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all text-gold"
                      />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-[32px]">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Top Note</label>
                        <input 
                          required
                          type="text"
                          value={editingProduct.notes.top || ""}
                          onChange={(e) => setEditingProduct({...editingProduct, notes: {...editingProduct.notes, top: e.target.value}})}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] outline-none focus:border-gold/30 uppercase tracking-wider"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Heart Note</label>
                        <input 
                          required
                          type="text"
                          value={editingProduct.notes.heart || ""}
                          onChange={(e) => setEditingProduct({...editingProduct, notes: {...editingProduct.notes, heart: e.target.value}})}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] outline-none focus:border-gold/30 uppercase tracking-wider"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Base Note</label>
                        <input 
                          required
                          type="text"
                          value={editingProduct.notes.base || ""}
                          onChange={(e) => setEditingProduct({...editingProduct, notes: {...editingProduct.notes, base: e.target.value}})}
                          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] outline-none focus:border-gold/30 uppercase tracking-wider"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Olfactory Narrative</label>
                      <textarea 
                        required
                        rows={4}
                        value={editingProduct.longDescription || editingProduct.description || ""}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value, longDescription: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-medium outline-none focus:border-gold/30 transition-all resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="md:col-span-2 btn-premium-gold h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                      Update & Save Changes
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
