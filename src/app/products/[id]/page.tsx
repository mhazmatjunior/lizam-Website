"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Truck,
  CreditCard,
  Banknote,
  RotateCcw,
  ArrowRight,
  Info,
  Star,
  ChevronDown,
  Mail
} from "lucide-react";
import { type Product } from "@/data/products";
import {
  BRAND_USPS,
  CHARACTERISTICS_HEADING, DEFAULT_CHARACTERISTICS,
  PRODUCT_GALLERY,
} from "@/data/brand";
import { BUSINESS } from "@/data/legal";
import { TRUST_POINTS, type TrustIcon } from "@/data/trust";
import { factsFor } from "@/data/product-facts";
import { COD_ADVANCE, COD_DELIVERY_FEE, ONLINE_DISCOUNT_PERCENT } from "@/data/pricing";
import ProductGallery from "@/app/components/ProductGallery";
import ReviewSection from "@/app/components/ReviewSection";
import SiteFooter from "@/app/components/SiteFooter";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { trackViewItem } from "@/lib/analytics";
import { useStickyBuyBar } from "@/lib/use-sticky-buy-bar";

const TRUST_ICONS: Record<TrustIcon, typeof Truck> = {
  truck: Truck,
  card: CreditCard,
  cash: Banknote,
  return: RotateCcw,
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const viewedId = useRef<number | null>(null);
  const { addToCart, setIsCartOpen, isCartOpen } = useCart();
  const stickyBar = useStickyBuyBar(isCartOpen);
  const { products, isLoading } = useProducts();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  // Admin-editable COD charge, fetched the way checkout fetches it.
  const [codFee, setCodFee] = useState<number>(COD_DELIVERY_FEE);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.deliveryFee !== undefined) setCodFee(data.settings.deliveryFee);
      })
      .catch(() => {
        /* Keep the default. */
      });
  }, []);

  useEffect(() => {
    // Wait for the catalogue to arrive; redirecting while it is still empty
    // would bounce every direct visit straight back to the listing page.
    if (isLoading) return;

    const id = Number(params.id);
    const foundProduct = products.find((p) => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      // Once per product: the catalogue can reload and re-run this effect.
      if (viewedId.current !== foundProduct.id) {
        viewedId.current = foundProduct.id;
        trackViewItem({ id: foundProduct.id, name: foundProduct.name, price: foundProduct.price });
      }
    } else {
      router.push("/products");
    }
  }, [params.id, products, router, isLoading]);

  if (!product) return null;

  // Fall back to the brand defaults so the section renders for every product.
  // A product with its own characteristics overrides them.
  const facts = factsFor(product.id);
  // Intensity and longevity come from the shared facts when there are any, so
  // this block can no longer contradict the summary above.
  const chars = {
    ...(product.characteristics ?? DEFAULT_CHARACTERISTICS),
    ...(facts && { intensity: facts.intensity, longevity: facts.longevity }),
  };

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
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  return (
    // Bottom padding below lg keeps the footer clear of the sticky buy bar.
    <main className="min-h-screen bg-black text-white font-sans selection:bg-gold/30 pb-24 lg:pb-0">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left: Product Visuals — swipeable slider with a zoom viewer.
              Sticky on desktop so the bottle stays in view beside the
              decision stack, which is taller than the image. */}
          <div className="lg:sticky lg:top-28">
            <ProductGallery images={gallery} alt={product.name} />
          </div>

          {/* Right: Product Story & Sales */}
          <div className="space-y-8 py-4">
            {/* Decision stack: everything needed to choose -- price, what it
                smells like, how it wears, who it suits -- then Add to Bag and
                the delivery / returns strip, with no tapping to reveal. Facts
                come from src/data/product-facts.ts. */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                {product.name}
              </h1>
              <p className="text-white/65 text-[15px] leading-relaxed">{facts?.promise ?? product.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Online and COD prices differ, so both are spelled out. */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">Pay Online</p>
                  <p className="text-2xl font-black text-white/90">Rs {product.price.toLocaleString()}</p>
                  <p className="text-[11px] text-emerald-500 font-bold">
                    {ONLINE_DISCOUNT_PERCENT}% off + free delivery
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">Cash On Delivery</p>
                  <p className="text-2xl font-black text-white/70">Rs {(product.price + codFee).toLocaleString()}</p>
                  <p className="text-[11px] text-white/50">
                    Rs {COD_ADVANCE.toLocaleString()} advance to book
                  </p>
                </div>
              </div>

              {/* Scent summary */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-6 space-y-5">
                <dl className="space-y-3">
                  {([
                    ["Top", product.notes.top],
                    ["Heart", product.notes.heart],
                    ["Base", product.notes.base],
                  ] as const).map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[64px_1fr] gap-3 items-baseline">
                      <dt className="text-[9px] font-black uppercase tracking-[0.2em] text-gold">{label}</dt>
                      <dd className="text-[13px] text-white/85 leading-snug">{value}</dd>
                    </div>
                  ))}
                </dl>
                {facts && (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-5">
                    {([
                      ["Family", facts.family],
                      ["Made for", facts.audience],
                      ["Wear", facts.longevity],
                      ["Intensity", facts.intensity],
                      ...(facts.concentration ? [["Concentration", facts.concentration] as const] : []),
                      ...(facts.sizeMl ? [["Size", `${facts.sizeMl} ml`] as const] : []),
                    ] as const).map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{label}</dt>
                        <dd className="text-[12px] text-white/80 leading-snug mt-1">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {facts && facts.useCases.length > 0 && (
                  <div className="border-t border-white/10 pt-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Wear it for</p>
                    <ul className="flex flex-wrap gap-2">
                      {facts.useCases.map((u) => (
                        <li key={u} className="text-[11px] text-white/75 border border-white/10 rounded-full px-3 py-1.5">{u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Purchase: quantity, Add to Bag, and the trust strip beside it. */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
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
                  ref={stickyBar.ctaRef}
                  onClick={handleAddToCart}
                  className="flex-grow btn-premium-gold h-16 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] group shadow-[0_20px_40px_rgba(200, 164, 77,0.2)]"
                >
                  Add to Bag
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Trust strip: delivery, payment and returns, right at the purchase
                  decision. Copy comes from src/data/trust.ts. */}
              <ul className="grid grid-cols-2 gap-3" aria-label="Delivery, payment and returns">
                {TRUST_POINTS.map((point) => {
                  const Icon = TRUST_ICONS[point.icon];
                  const body = (
                    <>
                      <Icon className="w-4 h-4 text-gold shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-[0.15em] text-white/85">{point.title}</span>
                        <span className="block text-[11px] text-white/50 leading-snug mt-0.5">{point.detail}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={point.title}>
                      {point.href ? (
                        <Link href={point.href} className="flex items-start gap-3 h-full rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 hover:border-gold/30 transition-colors">
                          {body}
                        </Link>
                      ) : (
                        <div className="flex items-start gap-3 h-full rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Tabs, centred below the decision stack. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 md:mt-16 max-w-xl mx-auto space-y-8"
        >
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

        </motion.div>

        {/* Panel controlled by the tabs above. Only one of Details / Reviews
            renders at a time. */}
        <div id="product-panel" className="scroll-mt-24" />

        {activeTab === "details" && (
        <>
        <div id="product-details" className="border-t border-white/10 py-16 md:py-24 mt-20 space-y-20 scroll-mt-24">
            {product.longDescription && (
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.28em] md:tracking-[0.45em] text-gold/70">The Story</span>
                <p className="text-white/55 text-[14px] leading-relaxed">{product.longDescription}</p>
              </div>
            )}

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

      {/* Product-page support note. The footer already carries the support
          address, but a customer deciding on a bottle is the one most likely
          to want it, so it is repeated here in full rather than as a link. */}
      <section className="px-8 md:px-24 pb-16 border-t border-white/5 pt-16">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/70">
            Need Help?
          </p>
          <p className="text-[13px] leading-relaxed text-white/50">
            If you face any issue with this product or your order, please contact us at:
          </p>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="inline-flex items-center gap-2.5 text-[14px] font-bold text-white hover:text-gold transition-colors break-all"
          >
            <Mail className="w-4 h-4 shrink-0 text-gold" />
            {BUSINESS.email}
          </a>
          <p className="text-[11px] text-white/30">{BUSINESS.hours}</p>
        </div>
      </section>

      <SiteFooter />

      {/* Sticky Add to Bag, phones and tablets only. Shows once the main button
          above is off-screen (see useStickyBuyBar); uses the same quantity. */}
      <div
        data-sticky-buy
        aria-hidden={!stickyBar.shown}
        inert={!stickyBar.shown}
        className={`lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-xl px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-300 ${
          stickyBar.shown ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white truncate">
              {product.name}{quantity > 1 ? ` × ${quantity}` : ""}
            </p>
            <p className="text-sm font-black text-gold">
              Rs {(product.price * quantity).toLocaleString()}
              <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-emerald-500">Free delivery online</span>
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            className="shrink-0 btn-premium-gold h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </main>
  );
}
