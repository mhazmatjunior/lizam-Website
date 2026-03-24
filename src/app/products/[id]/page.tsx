"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Sparkles, 
  Droplets, 
  Wind,
  ShieldCheck,
  Truck,
  ArrowRight
} from "lucide-react";
import { type Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { products } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeNote, setActiveNote] = useState<"top" | "heart" | "base">("top");

  useEffect(() => {
    const id = Number(params.id);
    const foundProduct = products.find((p) => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      router.push("/products");
    }
  }, [params.id, products, router]);

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setIsCartOpen(true);
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-gold/30">
      {/* Navigation Header */}
      <header className="px-8 md:px-24 py-6 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-xl z-50 border-b border-white/5">
        <Link
          href="/products"
          className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] font-black"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>
        <div className="text-xl font-bold tracking-tighter">RAANAI</div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2"
        >
          <ShoppingBag className="w-5 h-5 text-white/80" />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 md:px-24 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[calc(100vh-160px)]">
          
          {/* Left: Product Visuals */}
          <div className="relative group h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="aspect-square lg:aspect-[4/5] w-full max-h-[60vh] bg-white/[0.02] border border-white/5 rounded-[40px] flex items-center justify-center p-8 md:p-12 relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-radial-gradient from-gold/10 to-transparent opacity-30 blur-3xl" />
              
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={600}
                className="object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-10 transition-transform duration-700 group-hover:scale-105"
                priority
              />

              {/* Decorative Elements */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-gold' : 'bg-white/10'}`} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Product Story & Sales */}
          <div className="space-y-10 lg:space-y-12 py-4">
            {/* Title & Category */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                  {product.category}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  Eau De Parfum / 100ml
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                {product.name}
              </h1>
              <p className="text-2xl font-black text-white/90">Rs {product.price.toLocaleString()}</p>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <p className="text-white/40 text-[14px] leading-relaxed font-medium">
                {product.longDescription}
              </p>
            </motion.div>

            {/* Olfactory Pyramid (Notes) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Scent Pyramid</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "top", label: "Top Notes", icon: Sparkles, color: "text-blue-400" },
                  { id: "heart", label: "Heart Notes", icon: Droplets, color: "text-red-400" },
                  { id: "base", label: "Base Notes", icon: Wind, color: "text-gold" },
                ].map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNote(note.id as any)}
                    className={`flex flex-col items-center gap-3 p-4 md:p-5 rounded-3xl border transition-all duration-300 group/note
                      ${activeNote === note.id 
                        ? 'bg-white/[0.05] border-gold/30 translate-y-[-4px]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                  >
                    <note.icon className={`w-4 h-4 transition-transform duration-500 group-hover/note:scale-110 ${activeNote === note.id ? 'text-gold' : 'text-white/20'}`} />
                    <span className="text-[7px] font-black uppercase tracking-widest text-center">{note.label}</span>
                  </button>
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNote}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center"
                >
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">
                    {product.notes[activeNote]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Actions - Now Centered Below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 md:mt-16 max-w-xl mx-auto space-y-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-2xl p-2 h-16 w-full md:w-auto">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center hover:text-gold transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-black">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center hover:text-gold transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={handleAddToCart}
              className="flex-grow btn-premium-gold h-16 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] group shadow-[0_20px_40px_rgba(212,175,55,0.2)]"
            >
              Add to Bag
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-center gap-3 text-[9px] uppercase tracking-widest font-bold text-white/30">
              <ShieldCheck className="w-4 h-4 text-gold/30" />
              Authenticity Guaranteed
            </div>
            <div className="flex items-center justify-center gap-3 text-[9px] uppercase tracking-widest font-bold text-white/30">
              <Truck className="w-4 h-4 text-gold/30" />
              Global Premium Shipping
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommended Section - High Fidelity */}
      <section className="px-8 md:px-24 py-24 md:py-32 border-t border-white/5 bg-white/[0.01] relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-radial-gradient from-gold/[0.03] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gold/60">The Scent Journey</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight [word-spacing:0.1em] gold-text pb-2">You May Also Seek</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products
              .filter(p => p.id !== product?.id)
              .sort((a, b) => (a.category === product?.category ? -1 : 1)) // Prioritize same category
              .slice(0, 4)
              .map((p, index) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className="aspect-[4/5] bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 transition-all duration-500 hover:border-gold/20 hover:bg-white/[0.04] group/card">
                  
                  {/* Category Tag */}
                  <span className="absolute top-4 left-4 text-[7px] font-black uppercase tracking-widest text-white/20 group-hover/card:text-gold/60 transition-colors">
                    {p.category}
                  </span>

                  <Link href={`/products/${p.id}`} className="flex-grow flex items-center justify-center w-full transform transition-transform duration-700 group-hover/card:scale-110">
                    <Image src={p.image} alt={p.name} width={180} height={220} className="object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                  </Link>

                  <div className="w-full pt-6 space-y-2 text-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 group-hover/card:text-gold transition-colors">{p.name}</h3>
                    <p className="text-[10px] font-black text-white/30">${p.price}</p>
                  </div>

                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none group-hover/card:pointer-events-auto">
                     <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(p);
                          setIsCartOpen(true);
                        }}
                        className="bg-gold text-black p-4 rounded-full shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:scale-110 active:scale-95 transition-all"
                     >
                       <ShoppingBag className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center pt-8"
          >
            <Link href="/products" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-gold transition-colors inline-flex items-center gap-2 group">
              View Entire Collection
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
