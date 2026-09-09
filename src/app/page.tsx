"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CheckoutModal from "./components/CheckoutModal";
import { LEGAL_PAGES } from "@/data/legal";

export default function Home() {
  const { setIsCartOpen, itemsCount } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Slideshow image references (web-ready webp formats in public/SlideShow)
  const SLIDESHOW_IMAGES = [
    "/SlideShow/Slide%20Image%201.webp",
    "/SlideShow/Slide%20Image%202.webp",
    "/SlideShow/Slide%20Image%203.webp",
    "/SlideShow/Slide%20Image%204.webp",
    "/SlideShow/Slide%20Image%205.webp"
  ];

  // Order Product Info
  const ORDER_PRODUCT = {
    id: 71099,
    name: "7TH OCT",
    price: 150,
    category: "Signature Collection",
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/SlideShow/Slide%20Image%205.webp"
  };

  // Auto-play slideshow for Section 3
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <main className="bg-black text-white selection:bg-[#e2bb61] selection:text-black relative min-h-screen w-full overflow-x-hidden scroll-smooth font-montserrat-regular">
        
        {/* Global Navigation Header */}
        <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 md:px-16 py-4 md:py-6">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Image
              src="/raanae-logo.webp"
              alt="RAANAE Logo"
              width={1538}
              height={2176}
              /* Sized by height: the mark is portrait (artwork ratio 0.63) and the
                 file carries only ~4% transparent padding top/bottom, so no negative
                 margin is needed to compensate.
                 SIZE: change h-20 / md:h-28 to resize the logo. */
              className="h-20 md:h-28 w-auto object-contain cursor-pointer"
              priority
            />
          </div>
          
          {/* Action buttons (Center Shopping Bag + Right Shop Raanae button) */}
          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3.5 bg-black/40 border border-white/25 rounded-full hover:border-[#e2bb61]/50 hover:bg-black/60 transition-all group cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 text-white/70 group-hover:text-[#e2bb61] transition-colors" />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#e2bb61] text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(226,187,97,0.5)]">
                  {itemsCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => {
                const shopSection = document.getElementById("launch-slideshow");
                if (shopSection) {
                  shopSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-gold-sweep hover:bg-none hover:bg-white text-black ds-hero-shop   px-5 md:px-8 py-3 rounded-[30px] transition-all shadow-[0_4px_15px_rgba(212,180,116,0.35)] cursor-pointer"
            >
              Shop Raanae
            </button>
          </div>
        </header>

        {/* Section 1: Hero Section */}
        <section id="hero" className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-12 overflow-hidden bg-black">
          {/* Satin fabric background with perfume bottle on right */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            {/* Desktop Background */}
            <Image
              src="https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-hero.webp"
              alt="Raanae Hero Background Desktop"
              fill
              priority
              sizes="100vw"
              className="hidden md:block object-cover object-center"
            />
            {/* Mobile Background (cropped up/down) */}
            <Image
              src="/section-img/Section%201%20image%20-%20Mobile.webp"
              alt="Raanae Hero Background Mobile"
              fill
              priority
              sizes="100vw"
              className="block md:hidden object-cover object-[center_35%] scale-105"
            />
            {/* Ambient vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/70 md:via-black/30 md:to-transparent" />
          </div>

          {/* Hero Main Content */}
          <div className="flex-grow flex flex-col justify-start md:justify-center items-start text-left max-w-7xl mx-auto w-full px-6 md:px-16 relative z-10 mt-0">
            <div className="flex flex-col items-start max-w-xl md:max-w-2xl">
              {/* RAANAE Alta Font Tag.
                  leading-none removes the ~19px of empty line-box under the
                  letters; GAP: change mb-2 to adjust the space below RAANAE. */}
              <span className="ds-hero-eyebrow text-[#e2bb61] uppercase block leading-none">
                RAANAE
              </span>

              {/* Main Branding. GAP: change mb-5 for space below the headline. */}
              <h1 className="text-white ds-hero-title  tracking-tight leading-[1.0] select-none mb-2">
                Proud Muslim<br />
                <span className="text-white">Perfume Brand</span>
              </h1>

              {/* Mission Statement tagline */}
              <p className="text-white/90 ds-hero-mission tracking-wide max-w-md leading-relaxed">
                That <span className="ds-hero-mission-em bg-gold-sweep bg-clip-text text-transparent box-decoration-clone">aims to help the oppressed</span> around the globe without asking anyone for donations
              </p>
            </div>
          </div>

          {/* Boycott Steps footer text.
              mt-auto pins this to the bottom of the hero, so an mt-* here would
              replace it and yank the block upward. translate-y nudges it without
              touching layout. NUDGE: translate-y-1 = 4px, translate-y-2 = 8px. */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 mt-auto translate-y-2 md:translate-y-8">
            <div className="text-white ds-hero-boycott sm:text-xs space-y-0">
              <p>Boycott Is Just First Step</p>
              <p>Boycott Is Not The Destination</p>
            </div>
          </div>
        </section>

        {/* Section 2: Cave Section */}
        <section id="cave" className="relative w-full overflow-hidden bg-black lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:py-24">

          {/* ---- MOBILE ------------------------------------------------------
              A single flattened artwork: the frame and both lines of narrative
              are part of the image, so there is no text overlay here. The box
              matches the file's 1080x1512 aspect exactly, which means nothing
              is cropped at any phone width.
              The wording is repeated in alt below — baked-in text is invisible
              to screen readers and to search engines, and alt is the only thing
              carrying it. Keep the two in sync if the artwork is replaced. */}
          <div className="relative block w-full aspect-[1080/1512] lg:hidden">
            <Image
              src="/section-img/section-2-mobile.webp"
              alt="Raanae is not another perfume brand but... an initiative inspired by the cause of Palestine. The Dome of the Rock seen through a cave opening."
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* ---- DESKTOP (unchanged) ---------------------------------------- */}
          {/* Cave Background Image with Jerusalem View */}
          <div className="pointer-events-none absolute inset-0 z-0 hidden select-none lg:block">
            <div className="absolute inset-0 h-full w-full">
              <Image
                src="https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image4.png"
                alt="Jerusalem Cave View Laptop"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
            {/* Contrast Vignetting */}
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
          </div>

          {/* Inset Gold Frame. Desktop only: on mobile the artwork supplies its
              own frame, and a second one at a different inset read as a bug. */}
          <div className="pointer-events-none absolute inset-10 z-10 hidden rounded-[24px] border border-[#e2bb61]/20 lg:block" />

          {/* Left/Right Narrative overlay */}
          <div className="relative z-20 mx-auto my-auto hidden h-[70vh] w-full max-w-7xl flex-row items-center justify-between gap-12 px-20 lg:flex">
            {/* Left Narrative Text. self-start overrides the row's
                items-center so this block sits at the top, as it did before. */}
            <div className="max-w-[280px] self-start text-left">
              <h2 className="text-[#e2bb61] ds-cave-left leading-tight tracking-wide">
                Raanae is<br />
                not another<br />
                perfume brand<br />
                <span className="text-white">but...</span>
              </h2>
            </div>

            {/* Right Narrative Text */}
            <div className="max-w-[280px] self-end text-right">
              <h2 className="text-white ds-cave-right leading-tight tracking-wide">
                ...an Initiative<br />
                Inspired<br />
                by the cause of<br />
                Palestine
              </h2>
            </div>
          </div>
        </section>

        {/* Section 3: Our First Launch & Slideshow */}
        <section id="launch-slideshow" className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden bg-black">
          
          {/* MOBILE LAYOUT: Sequential vertical stacking matching Mobile PDF 1 (block lg:hidden) */}
          <div className="block lg:hidden relative z-10 w-full py-20 px-6 bg-[#4e251b]">
            <div className="flex flex-col space-y-8 items-center text-center max-w-md mx-auto">
              {/* Text Group 1 */}
              <div className="space-y-4">
                {/* SIZE: change text-base / md:text-2xl to resize this line */}
                <span className="text-[#d8c0a8] ds-launch-eyebrow text-base md:text-2xl block text-center">
                  Our First Launch
                </span>

                <div className="flex items-center justify-center">
                  {/* "Oct 7": the O and the 7 are set large, the "ct" smaller on
                      the same baseline. */}
                  <span className="text-white ds-oct tracking-wider uppercase">
                    O<span className="ds-oct-ct">ct</span> 7
                  </span>
                </div>

                <p className="text-white/90 ds-launch-body leading-relaxed">
                  Not merely a name. But a story, <span className="text-white ds-launch-body-em">a story of resistance</span>
                </p>
              </div>

              {/* Slideshow Image Component */}
              <div className="relative w-full aspect-[4/5] max-w-[320px] rounded-xl overflow-hidden shadow-2xl">
                <AnimatePresence>
                  <motion.div
                    key={currentSlide}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.6}
                    onDragEnd={(event, info) => {
                      const swipeThreshold = 50;
                      if (info.offset.x < -swipeThreshold) {
                        setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
                      } else if (info.offset.x > swipeThreshold) {
                        setCurrentSlide((prev) => (prev - 1 + SLIDESHOW_IMAGES.length) % SLIDESHOW_IMAGES.length);
                      }
                    }}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
                  >
                    <Image
                      src={currentSlide === 0 ? "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/Section-3-new-pic-mobile.jpeg" : SLIDESHOW_IMAGES[currentSlide]}
                      alt={`Product Slide ${currentSlide + 1}`}
                      fill
                      priority
                      className="object-cover pointer-events-none"
                      sizes="(max-width: 768px) 320px, 400px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Text Group 2 & Actions */}
              <div className="space-y-6 w-full">
                {/* ORDER NOW button */}
                <div>
                  <Link
                    href="/products/71099"
                    className="inline-block bg-[#240e09] text-white hover:text-[#e2bb61] border border-white/20 hover:border-[#e2bb61] ds-cta uppercase tracking-[0.2em] px-10 py-4 rounded-[30px] w-full max-w-[260px] text-center transition-all shadow-2xl cursor-pointer"
                  >
                    ORDER NOW
                  </Link>
                </div>

                {/* Pagination Dots */}
                <div className="flex gap-2 justify-center pt-2">
                  {SLIDESHOW_IMAGES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentSlide 
                          ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* LAPTOP LAYOUT: Split side-by-side matching Laptop PDF 2 (hidden lg:grid) */}
          <div className="hidden lg:grid grid-cols-12 min-h-screen w-full relative z-10">
            {/* Left Half: Warm Ochre Tan Solid Block (#b08a50) */}
            <div className="col-span-5 bg-[#b08a50] text-[#1c120a] flex flex-col justify-center px-12 lg:px-16 py-20 relative">
              {/* mx-auto centres the block itself in the panel; text-center
                  centres every line inside it. */}
              <div className="space-y-6 max-w-md mx-auto text-center">
                {/* SIZE: change text-base / md:text-2xl to resize this line */}
                <span className="text-[#3d2714] ds-launch-eyebrow text-base md:text-2xl block">
                  Our First Launch
                </span>

                <div className="flex items-center justify-center">
                  {/* "Oct 7": the O and the 7 are set large, the "ct" smaller on
                      the same baseline. */}
                  <span className="text-white ds-oct tracking-wider uppercase drop-shadow-md">
                    O<span className="ds-oct-ct">ct</span> 7
                  </span>
                </div>

                <p className="text-[#2b1b0d] ds-launch-body leading-relaxed">
                  Not merely a name.<br />
                  But a story, <span className="ds-launch-body-em text-black">a story of resistance...</span>
                </p>

                <div className="pt-6">
                  <Link
                    href="/products/71099"
                    className="inline-block bg-[#24130b] hover:bg-black text-white hover:text-[#e2bb61] ds-cta uppercase tracking-[0.2em] px-10 py-4 rounded-[30px] text-center transition-all shadow-xl cursor-pointer"
                  >
                    ORDER NOW
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Half: Sienna Fabric & Box + Bottle Slideshow Frame */}
            <div className="col-span-7 bg-[radial-gradient(circle_at_center,_#361911_0%,_#150906_75%,_#000000_100%)] flex flex-col justify-center items-center px-12 py-20 relative">
              <div className="relative w-full aspect-[4/5] max-w-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 my-auto">
                <AnimatePresence>
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={SLIDESHOW_IMAGES[currentSlide]}
                      alt={`Product Slide Laptop ${currentSlide + 1}`}
                      fill
                      className="object-cover"
                      sizes="420px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Laptop Slideshow Pagination Dots at Bottom */}
              <div className="flex gap-3 justify-center pt-8">
                {SLIDESHOW_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide 
                        ? "bg-[#e2bb61] scale-125 shadow-[0_0_10px_#e2bb61]" 
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* Section 4: The House of Raanae & Stats */}
        <section id="house-of-raanae" className="relative min-h-screen w-full flex flex-col justify-between pt-24 bg-black border-t border-white/5">
          
          <div className="w-full max-w-6xl mx-auto px-6 md:px-16 flex-grow flex flex-col justify-center items-center text-center">

            {/* Title */}
            <h2 className="ds-house-title text-[#e2bb61] tracking-wide mb-6 uppercase">
              THE HOUSE OF RAANAE
            </h2>

            {/* Description Subtitle */}
            <div className="text-white/80 ds-house-body tracking-wide max-w-5xl leading-relaxed mb-12 sm:mb-16 space-y-4">
              <p>
                Raanae is a luxury perfume brand. We don&apos;t claim to be perfect, but we guarantee you the best-quality products so that you can rely on them.
              </p>
              <p>
                As a Muslim brand, our purpose is not limited to generating money from this business but to provide quality. That&apos;s why we avoid false claims and harmful chemicals.
              </p>
            </div>

            {/* Three Stats Cards matching Laptop PDF 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mb-12 sm:mb-20">
              
              {/* Card 1: 40% oil concentration */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-black/30 border border-[#e2bb61]/20 hover:border-[#e2bb61]/50 px-5 py-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-2xl backdrop-blur-sm transition-all duration-300 min-h-44 md:min-h-52 group"
              >
                {/* SIZE: change text-4xl / md:text-5xl to resize the number */}
                <span className="text-white ds-stat-25 text-4xl md:text-5xl tracking-tight leading-none mb-2 min-h-16 flex items-center justify-center group-hover:text-[#e2bb61] transition-colors">
                  40<span className="ds-stat-unit text-2xl md:text-3xl">%</span>
                </span>
                {/* SIZE: change text-xs / md:text-sm to resize this label */}
                <span className="text-white/60 group-hover:text-white/80 transition-colors ds-stat-label text-xs md:text-sm tracking-[0.15em] leading-snug">
                  High Oil Concentration
                </span>
              </motion.div>

              {/* Card 2: NO HARMFUL CHEMICALS ADDED (from Laptop PDF 2) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-black/30 border border-[#e2bb61]/20 hover:border-[#e2bb61]/50 px-5 py-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-2xl backdrop-blur-sm transition-all duration-300 min-h-44 md:min-h-52 group"
              >
                {/* SIZE: change text-xl / md:text-2xl to resize this headline */}
                <span className="text-white ds-stat-headline text-xl md:text-2xl uppercase tracking-wider mb-2 leading-tight min-h-16 flex flex-col items-center justify-center group-hover:text-[#e2bb61] transition-colors">
                  <span>NO HARMFUL</span>
                  <span>CHEMICALS ADDED</span>
                </span>
                {/* SIZE: change text-xs / md:text-sm to resize this label */}
                <span className="text-white/60 group-hover:text-white/80 transition-colors ds-stat-label text-xs md:text-sm tracking-[0.15em] leading-snug">
                  Harmless Alternatives Are Used
                </span>
              </motion.div>

              {/* Card 3: 12 HRS+ */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-black/30 border border-[#e2bb61]/20 hover:border-[#e2bb61]/50 px-5 py-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-2xl backdrop-blur-sm transition-all duration-300 min-h-44 md:min-h-52 group"
              >
                {/* SIZE: change text-4xl / md:text-5xl to resize the number */}
                <span className="text-white tracking-tight leading-none mb-2 min-h-16 flex items-center justify-center group-hover:text-[#e2bb61] transition-colors">
                  <span className="ds-stat-12 text-4xl md:text-5xl">12</span>&nbsp;<span className="ds-stat-unit text-2xl md:text-3xl">HRS+</span>
                </span>
                {/* SIZE: change text-xs / md:text-sm to resize this label */}
                <span className="text-white/60 group-hover:text-white/80 transition-colors ds-stat-label text-xs md:text-sm tracking-[0.15em] leading-snug">
                  Long Lasting Fragrance
                </span>
              </motion.div>

            </div>

            {/* Social Icons Links */}
            <div className="flex gap-8 items-center justify-center mb-10">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-[#e2bb61] hover:scale-110 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-[#e2bb61] hover:scale-110 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>

          </div>

          {/* Ochre disclaimer footer */}
          <footer className="w-full bg-gold-sweep text-[#5a4522] py-5 px-6 md:px-16 border-t border-[#b8892f]/20">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="ds-footer-body max-w-2xl text-center md:text-left leading-relaxed">
                  <span className="ds-disclaimer-label text-[#3d2e13]">Disclaimer:</span> Raanae is not just a perfume brand but a purpose, a vision, a platform, community for one united muslim ummah.
                </p>
                <p className="ds-footer-body whitespace-nowrap text-[#3d2e13]">
                  Our Touch Point: <a href="mailto:raanae980@gmail.com" className="underline hover:text-black transition-colors">raanae980@gmail.com</a>
                </p>
              </div>

              {/* Policy links. These have to be reachable from the landing page,
                  not just from a URL, so they sit in the footer every visitor
                  scrolls past. Sourced from LEGAL_PAGES so a new policy page
                  shows up here automatically. */}
              <nav className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 pt-3 border-t border-[#b8892f]/25">
                {LEGAL_PAGES.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="text-[10px] md:text-[11px] font-semibold tracking-wide text-[#4a3813] underline-offset-4 hover:text-black hover:underline transition-colors"
                  >
                    {page.label}
                  </Link>
                ))}
              </nav>
            </div>
          </footer>

        </section>

      </main>

      {/* Hidden preloader for slideshow images to prevent latency flashes */}
      <div className="hidden pointer-events-none opacity-0 select-none w-0 h-0 overflow-hidden">
        {SLIDESHOW_IMAGES.map((src) => (
          <Image key={src} src={src} alt="Preload" width={10} height={10} priority />
        ))}
        <Image src="https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/Section-3-new-pic-mobile.jpeg" alt="Preload" width={10} height={10} priority />
      </div>

      {/* Product Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={ORDER_PRODUCT}
      />
    </>
  );
}
