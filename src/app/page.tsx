"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, ShoppingBag, Volume2, VolumeX, Star, ArrowDown, Sparkles, Droplets, Globe, Palette, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CheckoutModal from "./components/CheckoutModal";

// Wave Divider component to match the elegant curved dividers in the design
const WaveDivider = ({ 
  fillColor = "fill-black-pure", 
  lineColor = "stroke-[#e2bb61]", 
  isFlipped = false 
}) => {
  return (
    <div className={`relative w-full overflow-hidden leading-[0] select-none pointer-events-none z-30 ${isFlipped ? 'rotate-180' : ''}`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="relative block w-full h-[25px] sm:h-[40px] md:h-[60px]"
      >
        {/* Curved Gold Line */}
        <path
          d="M0,60 C360,105 720,15 1080,85 1260,115 1380,95 1440,80"
          fill="none"
          className={lineColor}
          strokeWidth="3.5"
        />
        {/* Filled Area Below the Line */}
        <path
          d="M0,60 C360,105 720,15 1080,85 1260,115 1380,95 1440,80 L1440,120 L0,120 Z"
          className={fillColor}
        />
      </svg>
    </div>
  );
};

export default function Home() {
  const { addToCart, setIsCartOpen, itemsCount } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1); // Default to index 1 (Slideshow- (2).png crystal bottle)

  // Slideshow image references
  const SLIDESHOW_IMAGES = [
    "/Slideshow- (1).png",
    "/Slideshow- (2).png",
    "/Slideshow- (3).png",
    "/Slideshow- (4).png",
    "/Slideshow- (5).png"
  ];

  // Feature icons & texts
  const FEATURES = [
    { icon: Sparkles, title: "Rare Infusions", desc: "Obsidian series depth using molecular infusion." },
    { icon: Palette, title: "Artisanal Craft", desc: "Hand-poured precision from our distillery." },
    { icon: Droplets, title: "Pure Integrity", desc: "Zero synthetic fillers—just pure nature." },
    { icon: Shield, title: "Modern Design", desc: "Aesthetics meet advanced distillation tech." },
    { icon: Globe, title: "Global Heritage", desc: "Sourcing world's most elusive botanicals." }
  ];

  // Pre-Order Product Info
  const PRE_ORDER_PRODUCT = {
    id: 71099,
    name: "7TH OCT (Pre-Order Booking)",
    price: 150,
    category: "Signature Collection",
    image: "/theme-image5.png"
  };

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <main 
        ref={containerRef} 
        className="bg-black text-white selection:bg-gold selection:text-black relative h-[100dvh] overflow-y-auto overflow-x-hidden md:snap-y md:snap-mandatory scroll-smooth custom-scrollbar"
      >
        {/* Section 1: Hero Section */}
        <section id="home" className="section relative h-[100dvh] max-h-[100dvh] md:snap-start flex flex-col justify-between overflow-hidden bg-black-pure">
          {/* Full Cover Satin Background with Perfume bottle on right */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <Image
              src="/theme-hero.webp"
              alt="Raanae Quietly Distinct Hero"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center md:object-right-center"
            />
            {/* Ambient Dark Overlay to make text on left pop */}
            <div className="absolute inset-0 bg-gradient-to-r from-black-pure/70 via-black-pure/45 to-transparent md:from-black-pure/60 md:via-black-pure/25 md:to-transparent" />
          </div>

          {/* Top Navbar */}
          <header className="relative z-50 flex justify-between items-center w-full px-6 md:px-16 pt-4 md:pt-6">
            {/* Logo */}
            <div className="flex items-center shrink-0 relative h-[80px] w-[140px] md:h-[90px] md:w-[160px]">
              <Image
                src="/logo-transparent.png"
                alt="RAANAE Logo"
                fill
                className="object-contain object-left mix-blend-screen"
                priority
              />
            </div>
            
            {/* Center action button (Cart) */}
            <div className="flex-grow flex justify-center">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3.5 bg-black/40 border border-white/10 rounded-[8px] hover:border-gold/50 hover:bg-black/60 transition-all group"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5 h-5 text-white/70 group-hover:text-gold transition-colors" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-gold text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(226,187,97,0.5)]">
                    {itemsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right action button */}
            <div className="flex items-center shrink-0">
              <button 
                className="bg-[#d4b474] text-black text-[11px] uppercase tracking-[0.2em] font-extrabold px-6 md:px-8 py-3.5 rounded-[30px] whitespace-nowrap inline-block transition-all shadow-[0_4px_15px_rgba(212,180,116,0.35)] cursor-default"
              >
                Coming Soon
              </button>
            </div>
          </header>

          {/* Hero Content (Left-Aligned, Vertically Centered) */}
          <div className="flex-grow flex flex-col justify-center items-start text-left max-w-7xl mx-auto w-full px-6 md:px-16 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex flex-col items-start space-y-2 max-w-xl md:max-w-2xl"
            >
              {/* RAANAE Label */}
              <span className="text-[#e2bb61] text-xs font-bold uppercase tracking-[0.4em] mb-2 block">RAANAE</span>

              {/* Proud Muslim Perfume Brand */}
              <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight leading-[0.95] max-w-xl select-none drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                Proud Muslim<br />
                <span className="text-white">Perfume Brand</span>
              </h1>

              {/* Tagline / Subtitle */}
              <div className="mt-4 flex flex-col items-start">
                <p className="text-white/85 text-xs sm:text-sm md:text-base font-normal tracking-wide max-w-md leading-relaxed drop-shadow-md">
                  That <span className="text-[#e2bb61] font-semibold">aims to help the oppressed</span> around the globe without asking anyone for donations
                </p>
              </div>
            </motion.div>
          </div>

          {/* Boycott Steps at bottom-left */}
          <div className="absolute bottom-12 left-6 md:left-16 z-30 text-white/55 text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold flex flex-col space-y-1">
            <p>Boycott Is Just First Step</p>
            <p>Boycott Is Not The Destination</p>
          </div>

          {/* Wave Divider to Section 2 (Cave) */}
          <WaveDivider fillColor="fill-black-pure" />
        </section>

        {/* Section 2: Cave Section */}
        <section id="cave-jerusalem" className="section relative h-[100dvh] max-h-[100dvh] md:snap-start flex flex-col justify-between overflow-hidden bg-black-pure">
          {/* Cave Jerusalem Background Image */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <Image
              src="/theme-image4.png"
              alt="Dome of the Rock Jerusalem Cave"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Dark Vignettes */}
            <div className="absolute inset-0 bg-black/25 z-0" />
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black-pure to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black-pure to-transparent z-10" />
          </div>

          {/* Thin Gold Frame inside the section */}
          <div className="absolute inset-6 md:inset-12 border border-[#e2bb61]/25 rounded-[20px] z-10 pointer-events-none" />

          {/* Centered Cave Content */}
          <div className="flex-grow flex items-center justify-between w-full max-w-7xl mx-auto px-10 md:px-24 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 w-full items-center text-white">
              {/* Left Column Text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="flex flex-col space-y-2 text-left"
              >
                <h2 className="font-kalieb text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white/95 leading-tight tracking-wide">
                  Raanae is<br />
                  not another<br />
                  perfume brand<br />
                  but...
                </h2>
              </motion.div>

              {/* Right Column Text */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="flex flex-col space-y-2 text-left md:text-right"
              >
                <h2 className="font-kalieb text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#e2bb61] leading-tight tracking-wide">
                  ...an Initiative<br />
                  Inspired<br />
                  by the cause of<br />
                  Palestine
                </h2>
              </motion.div>
            </div>
          </div>

          {/* Wave Divider to Section 3 (Gallery & Features) */}
          <WaveDivider fillColor="fill-black-pure" />
        </section>

        {/* Section 3: Feature Gallery Section (reused from old code as shown in screenshot) */}
        <section id="gallery-features" className="section relative min-h-[100dvh] h-auto md:h-[100dvh] md:snap-start flex flex-col justify-center py-12 md:py-0 overflow-y-auto md:overflow-hidden bg-black-pure">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-16 relative z-10 my-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
              
              {/* Left/Top: Gallery Slideshow */}
              <div className="lg:col-span-6 flex flex-col md:flex-row items-center gap-6 w-full justify-center">
                {/* Vertical thumbnails on desktop, horizontal on mobile */}
                <div className="flex lg:flex-col gap-3 md:gap-4 order-2 lg:order-1 justify-center">
                  {[-1, 0, 1].map((offset) => {
                    const index = (currentSlide + offset + SLIDESHOW_IMAGES.length) % SLIDESHOW_IMAGES.length;
                    const isActive = offset === 0;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-14 h-18 md:w-16 md:h-20 relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          isActive 
                            ? "border-[#e2bb61] scale-105 shadow-[0_0_15px_rgba(226,187,97,0.3)]" 
                            : "border-transparent opacity-30 grayscale hover:opacity-50"
                        }`}
                      >
                        <Image
                          src={SLIDESHOW_IMAGES[index]}
                          alt={`Thumbnail ${index}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Main Large Image */}
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] aspect-[4/5] order-1 lg:order-2 rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl">
                  {SLIDESHOW_IMAGES.map((src, i) => (
                    <motion.div
                      key={src}
                      initial={false}
                      animate={{
                        opacity: i === currentSlide ? 1 : 0,
                        scale: i === currentSlide ? 1 : 1.05,
                        zIndex: i === currentSlide ? 10 : 0
                      }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Image
                        src={src}
                        alt={`Raanae Perfume ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right/Bottom: Title & Features */}
              <div className="lg:col-span-6 flex flex-col space-y-6 md:space-y-8 text-left">
                <div className="space-y-3">
                  <h2 className="text-[#e2bb61] text-xs font-bold uppercase tracking-[0.3em] font-sans">
                    THE HOUSE OF RAANAE
                  </h2>
                  <p className="text-white text-xs sm:text-sm uppercase tracking-[0.1em] font-bold leading-relaxed max-w-xl">
                    RAANAE IS A LUXURY FRAGRANCE HOUSE RENOWNED FOR DELIVERING UNMATCHED SCENT QUALITY THROUGH INNOVATIVE INFUSIONS. WE BLEND ADVANCED DISTILLATION WITH ARCHITECTURAL DESIGN.
                  </p>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {FEATURES.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 group text-left"
                    >
                      <div className="w-8 h-8 rounded-full border border-[#e2bb61]/20 flex items-center justify-center shrink-0 group-hover:bg-[#e2bb61]/10 transition-colors">
                        <item.icon className="w-3.5 h-3.5 text-[#e2bb61]" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-white font-black text-[10px] uppercase tracking-widest">{item.title}</h3>
                        <p className="text-white/50 text-[9px] leading-tight max-w-[200px]">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pre-Order Action */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="bg-[#d4b474] text-black hover:bg-white text-[11px] uppercase tracking-[0.2em] font-extrabold px-8 py-3.5 rounded-[30px] inline-flex items-center gap-2 transition-all shadow-[0_10px_30px_rgba(212,180,116,0.2)] hover:shadow-[0_15px_35px_rgba(212,180,116,0.4)]"
                  >
                    Pre Order Now
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 4: The House of Raanae (Stats & Footer) */}
        <section id="stats-footer" className="section relative min-h-[100dvh] h-auto md:h-[100dvh] md:snap-start flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-black-pure border-t border-white/5 pt-16 md:pt-24">
          <div className="w-full max-w-5xl mx-auto px-6 md:px-16 relative z-10 flex flex-col items-center text-center flex-grow justify-center">
            {/* Title */}
            <h2 className="font-kalieb text-[#e2bb61] text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide mb-6">
              THE HOUSE OF RAANAE
            </h2>
            
            {/* Subtitle */}
            <p className="text-white/80 text-xs sm:text-sm md:text-base font-normal tracking-wide max-w-3xl leading-relaxed mb-10 md:mb-12">
              Raanae is a luxury fragrance house renowned for delivering unmatched scent quality through innovative infusions. We blend advanced distillation with architectural design, keeping <span className="text-white font-bold underline decoration-[#e2bb61]">human wellbeing our top priority.</span>
            </p>

            {/* 3 Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-4xl">
              {/* Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-black/40 border border-[#e2bb61]/25 hover:border-[#e2bb61]/60 p-6 md:p-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-xl backdrop-blur-sm transition-all duration-300 h-40 md:h-48"
              >
                <span className="text-[#e2bb61] text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                  25-35%
                </span>
                <span className="text-white/90 text-[10px] sm:text-xs uppercase tracking-widest font-semibold leading-snug">
                  High Oil<br />Concentration
                </span>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-black/40 border border-[#e2bb61]/25 hover:border-[#e2bb61]/60 p-6 md:p-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-xl backdrop-blur-sm transition-all duration-300 h-40 md:h-48"
              >
                <span className="text-[#e2bb61] text-base sm:text-lg font-black uppercase tracking-wider mb-2 leading-normal max-w-[200px]">
                  Harmless<br />Alternative Used
                </span>
                <span className="text-white/60 text-[8px] sm:text-[10px] uppercase tracking-widest font-semibold">
                  No Harmful Chemical Added
                </span>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-black/40 border border-[#e2bb61]/25 hover:border-[#e2bb61]/60 p-6 md:p-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-xl backdrop-blur-sm transition-all duration-300 h-40 md:h-48"
              >
                <span className="text-[#e2bb61] text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                  12 HRS+
                </span>
                <span className="text-white/90 text-[10px] sm:text-xs uppercase tracking-widest font-semibold leading-snug">
                  Long Lasting<br />Fragrance
                </span>
              </motion.div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-6 items-center justify-center mt-10 mb-8">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#e2bb61] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#e2bb61] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Bar with Disclaimer & Contact info */}
          <footer className="w-full bg-[#d4b474] text-[#5a4522] py-4 px-6 md:px-16 mt-auto border-t border-[#b8892f]/20 z-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] sm:text-xs font-semibold">
              <p className="max-w-2xl text-center md:text-left leading-relaxed">
                <span className="font-bold">Disclaimer:</span> Raanae is not just a perfume brand but a purpose, a vision, a platform, community for one united muslim ummah.
              </p>
              <p className="whitespace-nowrap">
                Our Touch Point: <a href="mailto:contact@raanae.com" className="underline hover:text-black transition-colors font-bold">contact@raanae.com</a>
              </p>
            </div>
          </footer>
        </section>
      </main>

      {/* Premium Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={PRE_ORDER_PRODUCT}
      />
    </>
  );
}
