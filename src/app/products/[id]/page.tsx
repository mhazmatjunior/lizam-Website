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
  ArrowRight,
  Info,
  Star,
  ChevronDown
} from "lucide-react";
import { type Product } from "@/data/products";
import {
  BRAND_USPS,
  CHARACTERISTICS_HEADING, DEFAULT_CHARACTERISTICS,
  PRODUCT_GALLERY,
} from "@/data/brand";
import ProductGallery from "@/app/components/ProductGallery";
import ReviewSection from "@/app/components/ReviewSection";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { products, isLoading } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeNote, setActiveNote] = useState<"top" | "heart" | "base">("top");
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");

  useEffect(() => {
    // Wait for the catalogue to arrive; redirecting while it is still empty
    // would bounce every direct visit straight back to the listing page.
    if (isLoading) return;

    const id = Number(params.id);
    const foundProduct = products.find((p) => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      router.push("/products");
    }
  }, [params.id, products, router, isLoading]);

  if (!product) return null;

  // Fall back to the brand defaults so the section renders for every product.
  // A product with its own characteristics overrides them.
  const chars = product.characteristics ?? DEFAULT_CHARACTERISTICS;

  // Client-supplied product page images. Falls back to the product's own image
  // so a product without gallery shots still shows something.
  const gallery = PRODUCT_GALLERY.length ? PRODUCT_GALLERY : [product.image];

  /**
   * Switch the panel below, then bring it into view. Offset by the sticky
   * header so the heading is not hidden underneath it on arrival.
   */
  const selectTab = (tab: "details" | "reviews") => {
    setActiveTab(tab);
    // Wait a frame so the new panel is in the DOM before measuring it.
    requestAnimationFrame(() => {
      const el = document.getElementById("product-panel");
      if (!el) return;
      const HEADER_OFFSET = 90;
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

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
        <div className="text-xl font-bold tracking-tighter">RAANAE</div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2"
        >
          <ShoppingBag className="w-5 h-5 text-white/80" />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 md:px-24 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[calc(100vh-160px)]">
          
          {/* Left: Product Visuals — swipeable slider with a zoom viewer. */}
          <ProductGallery images={gallery} alt={product.name} />

          {/* Right: Product Story & Sales */}
          <div className="space-y-10 lg:space-y-12 py-4">
            {/* Title & Category */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                {product.name}
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="text-white/40 text-[14px] leading-relaxed font-medium">
                {(() => {
                  const phrase = "No Harmful Effects and No Side Effects.";
                  if (product.longDescription.includes(phrase)) {
                    return (
                      <>
                        {/* Bordered on all four sides with a gold glow, rather
                            than the single left rule it used to carry, so the
                            three claims read as one block. Each line is led by a
                            white dot. */}
                        <span className="block mt-4 p-5 rounded-2xl bg-gradient-to-br from-[#e2bb61]/[0.12] via-[#e2bb61]/[0.05] to-transparent border border-[#e2bb61]/50 text-[#e2bb61] font-black text-xs uppercase tracking-widest text-left shadow-[0_0_25px_rgba(226,187,97,0.15),inset_0_0_20px_rgba(226,187,97,0.03)]">
                          <span className="flex items-start gap-2.5">
                            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                            <span>12 Upto 15 hours lasting</span>
                          </span>
                          <span className="mt-3 flex items-start gap-2.5">
                            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                            <span>Unisex Perfume (both male and female can use)</span>
                          </span>
                          <span className="mt-3 flex items-start gap-2.5">
                            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                            <span>{phrase}</span>
                          </span>
                        </span>
                      </>
                    );
                  }
                  return <p>{product.longDescription}</p>;
                })()}
              </div>

              {/* Price sits under the highlight block, not beside the title. */}
              <p className="text-2xl font-black text-white/90">Rs {product.price.toLocaleString()}</p>
            </motion.div>

            {/* Olfactory Pyramid (Notes) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Fragrance Profile &amp; Notes</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "top", label: "Top Notes", icon: Sparkles, color: "text-blue-400" },
                  { id: "heart", label: "Heart Notes (Middle)", icon: Droplets, color: "text-red-400" },
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
                    <note.icon className={`w-4 h-4 transition-transform duration-500 group-hover/note:scale-110 ${activeNote === note.id ? 'text-gold' : 'text-white/60'}`} />
                    <span className="text-[7px] font-black uppercase tracking-widest text-center text-white/80">{note.label}</span>
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
              className="flex-grow btn-premium-gold h-16 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] group shadow-[0_20px_40px_rgba(200, 164, 77,0.2)]"
            >
              Add to Bag
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Tabs for the content below. Details is shown by default; picking a
              tab swaps the panel rather than scrolling past both. */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => selectTab("details")}
              aria-pressed={activeTab === "details"}
              className={`h-14 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                activeTab === "details"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              Show Details
            </button>
            <button
              onClick={() => selectTab("reviews")}
              aria-pressed={activeTab === "reviews"}
              className={`h-14 rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                activeTab === "reviews"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Reviews
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
              Premium Shipping
            </div>
          </div>
        </motion.div>

        {/* Panel controlled by the tabs above. Only one of Details / Reviews
            renders at a time. */}
        <div id="product-panel" className="scroll-mt-24" />

        {activeTab === "details" && (
        <>
        <div id="product-details" className="border-t border-white/10 py-16 md:py-24 mt-20 space-y-20 scroll-mt-24">
            {/* Characteristics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative space-y-10 rounded-[32px] border border-white/10 bg-white/[0.015] px-4 py-8 font-sans md:px-8 md:py-12"
            >
              <div className="text-center space-y-3">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.28em] md:tracking-[0.45em] text-gold/70">The Signature</span>
                <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] md:tracking-[0.35em] text-white/80">{CHARACTERISTICS_HEADING}</h3>
                <div className="mx-auto h-px w-12 bg-gold/60" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
                <div className="min-h-[230px] rounded-2xl border border-gold/20 border-t-gold/70 bg-black/40 px-5 py-8 flex flex-col items-center justify-center gap-4 shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">Intensity</span>
                  <p className="max-w-[260px] text-[15px] md:text-lg font-black text-white uppercase tracking-tight leading-tight break-words">{chars.intensity}</p>
                </div>
                <div className="min-h-[230px] rounded-2xl border border-gold/20 border-t-gold/70 bg-black/40 px-5 py-8 flex flex-col items-center justify-center gap-4 shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">Scent Profile</span>
                  <p className="max-w-[280px] text-[15px] md:text-lg font-black text-white uppercase tracking-tight leading-tight break-words">{chars.profile}</p>
                </div>
                <div className="min-h-[230px] rounded-2xl border border-gold/20 border-t-gold/70 bg-black/40 px-5 py-8 flex flex-col items-center justify-center gap-4 shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">Longevity</span>
                  <p className="max-w-[260px] text-[15px] md:text-lg font-black text-white uppercase tracking-tight leading-tight break-words">{chars.longevity}</p>
                </div>
              </div>
            </motion.div>
          </div>

        {/* Brand USPs — shown for every product. A product may override
            them by setting its own `usps`. Deliberately outside the
            characteristics guard so it appears even without them.

            The "What Makes Us Different?" heading and its intro line are
            hidden for now at the client's request — they repeated the claims
            in the highlight block higher up the page. The three cards stay.
            The copy is still exported from src/data/brand.ts as USP_HEADING
            and USP_INTRO, so putting the heading back is a small edit. */}
        <div className="border-t border-white/5 py-16 space-y-20">
          <div className="space-y-12 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(product.usps ?? BRAND_USPS).map((usp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/[0.02] border border-white/5 p-8 rounded-[30px] hover:border-gold/20 hover:bg-white/[0.04] transition-all space-y-4"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center text-gold text-sm font-black">
                    {idx + 1}
                  </div>
                  <h4 className="text-md font-black text-white uppercase tracking-tight">{usp.title}</h4>
                  <p className="text-white/40 text-[11px] leading-relaxed font-medium">{usp.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        </>
        )}

        {/* Customer reviews: ratings, photos, and the submission form. */}
        {activeTab === "reviews" && (
          <div id="product-reviews" className="scroll-mt-24">
            <ReviewSection productId={product.id} />
          </div>
        )}
      </div>

      {/* Recommended Section - High Fidelity */}
      {product.id !== 71099 && (
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
                          className="bg-gold text-black p-4 rounded-full shadow-[0_10px_20px_rgba(200, 164, 77,0.3)] hover:scale-110 active:scale-95 transition-all"
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
      )}
    </main>
  );
}
