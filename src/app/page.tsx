"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CheckoutModal from "./components/CheckoutModal";

export default function Home() {
  const { setIsCartOpen, itemsCount } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Slideshow image references (using optimized web-ready webp formats)
  const SLIDESHOW_IMAGES = [
    "/SlideShow/Slide Image 1.webp",
    "/SlideShow/Slide Image 2.webp",
    "/SlideShow/Slide Image 3.webp",
    "/SlideShow/Slide Image 4.webp",
    "/SlideShow/Slide Image 5.webp"
  ];

  // Pre-Order Product Info
  const PRE_ORDER_PRODUCT = {
    id: 71099,
    name: "7TH OCT (Pre-Order Booking)",
    price: 150,
    category: "Signature Collection",
    image: "/SlideShow/Slide Image 5.webp"
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
          <div className="flex items-center shrink-0 relative h-16 w-32 md:h-20 md:w-40">
            <Image
              src="/logo-transparent.png"
              alt="RAANAE Logo"
              fill
              sizes="(max-width: 768px) 128px, 160px"
              className="object-contain object-left mix-blend-screen"
              priority
            />
          </div>
          
          {/* Shopping Bag Button (Center) */}
          <div className="flex-grow flex justify-center">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3.5 bg-black/40 border border-white/10 rounded-[8px] hover:border-[#e2bb61]/50 hover:bg-black/60 transition-all group cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 text-white/70 group-hover:text-[#e2bb61] transition-colors" />
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#e2bb61] text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(226,187,97,0.5)]">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>

          {/* Coming Soon Button (Right) */}
          <div className="flex items-center shrink-0">
            <button 
              className="bg-[#d4b474] text-black text-[11px] uppercase tracking-[0.2em] font-montserrat-medium px-5 md:px-8 py-3 rounded-[30px] whitespace-nowrap transition-all shadow-[0_4px_15px_rgba(212,180,116,0.35)] cursor-default"
            >
              Coming Soon
            </button>
          </div>
        </header>

        {/* Section 1: Hero Section */}
        <section id="hero" className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-12 overflow-hidden bg-black">
          {/* Satin fabric background with perfume bottle on right */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <Image
              src="/theme-hero.webp"
              alt="Raanae Hero Background"
              fill
              priority
              sizes="100vw"
              className="object-cover object-right md:object-center"
            />
            {/* Ambient vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/70 md:via-black/30 md:to-transparent" />
          </div>

          {/* Hero Main Content */}
          <div className="flex-grow flex flex-col justify-center items-start text-left max-w-7xl mx-auto w-full px-6 md:px-16 relative z-10">
            <div className="flex flex-col items-start space-y-4 max-w-xl md:max-w-2xl">

              {/* Main Branding */}
              <div className="space-y-1">
                <span className="font-kalieb text-[#e2bb61] text-2xl sm:text-3xl md:text-4xl tracking-[0.25em] uppercase block">
                  RAANAE
                </span>
                <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-modelica-bold uppercase tracking-tight leading-[1.0] select-none">
                  Proud Muslim<br />
                  <span className="text-white">Perfume Brand</span>
                </h1>
              </div>

              {/* Mission Statement tagline */}
              <p className="text-white/90 text-sm sm:text-base font-montserrat-medium tracking-wide max-w-md leading-relaxed">
                That <span className="text-[#e2bb61] font-montserrat-bold">aims to help the oppressed</span> around the globe without asking anyone for donations
              </p>
            </div>
          </div>

          {/* Boycott Steps footer text */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 mt-auto">
            <div className="text-white/60 text-[10px] sm:text-xs font-montserrat-medium uppercase tracking-[0.2em] space-y-1">
              <p>Boycott Is Just First Step</p>
              <p>Boycott Is Not The Destination</p>
            </div>
          </div>
        </section>

        {/* Section 2: Cave Section */}
        <section id="cave" className="relative min-h-screen w-full flex flex-col justify-between py-24 overflow-hidden bg-black">
          {/* Cave Background Image with Jerusalem View */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            {/* Laptop Background */}
            <div className="hidden lg:block absolute inset-0 w-full h-full">
              <Image
                src="/theme-image4.png"
                alt="Jerusalem Cave View Laptop"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
            {/* Mobile Background */}
            <div className="block lg:hidden absolute inset-0 w-full h-full">
              <Image
                src="/section-2-mob-new.png"
                alt="Jerusalem Cave View Mobile"
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

          {/* Inset Gold Frame */}
          <div className="absolute inset-4 md:inset-10 border border-[#e2bb61]/20 rounded-[16px] md:rounded-[24px] z-10 pointer-events-none" />

          {/* Left/Right Narrative overlay */}
          <div className="relative z-20 w-full max-w-7xl mx-auto px-8 md:px-20 h-[70vh] flex flex-col lg:flex-row justify-between lg:items-center gap-12 my-auto">
            {/* Left Narrative Text */}
            <div className="max-w-[280px] self-start lg:self-auto text-left mt-8 lg:mt-0">
              <h2 className="text-[#e2bb61] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-modelica-regular leading-tight tracking-wide">
                Raanae is<br />
                not another<br />
                perfume brand<br />
                <span className="text-white">but...</span>
              </h2>
            </div>

            {/* Right Narrative Text */}
            <div className="max-w-[280px] self-end lg:self-auto text-left lg:text-right mb-8 lg:mb-0">
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-modelica-regular leading-tight tracking-wide">
                ...an Initiative<br />
                Inspired<br />
                by the cause of<br />
                Palestine
              </h2>
            </div>
          </div>
        </section>

        {/* Section 3: Our First Launch & Slideshow */}
        <section id="launch-slideshow" className="relative min-h-screen w-full flex flex-col justify-center py-20 overflow-hidden bg-black">
          {/* Sienna Satin Texture Background */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none bg-[radial-gradient(circle_at_center,_#361911_0%,_#150906_75%,_#000000_100%)] opacity-90" />

          {/* Inside Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 my-auto">
            
            {/* MOBILE LAYOUT: Order-exact stacking (block md:hidden) */}
            <div className="flex flex-col space-y-8 items-center text-center md:hidden">
              {/* Text Group 1 */}
              <div className="space-y-4 max-w-md">
                <span className="text-[#e2bb61] text-[10px] tracking-[0.3em] font-montserrat-light uppercase block">
                  Our First Launch
                </span>
                
                <div className="flex items-center justify-center">
                  <span className="text-white text-5xl font-kalieb tracking-wider uppercase">
                    OCT 7
                  </span>
                </div>

                <p className="text-white/80 text-sm font-montserrat-light leading-relaxed">
                  Not merely a name. But a story, <span className="text-[#e2bb61] font-montserrat-medium">a story of resistance</span>
                </p>
              </div>

              {/* Slideshow Image Component */}
              <div className="relative w-full aspect-[4/5] max-w-[280px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={SLIDESHOW_IMAGES[currentSlide]}
                      alt={`Product Slide ${currentSlide + 1}`}
                      fill
                      priority
                      className="object-cover"
                      sizes="280px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Text Group 2 & Actions */}
              <div className="space-y-6 max-w-md w-full">
                <p className="text-white/90 text-xs tracking-wider font-montserrat-medium uppercase">
                  Its not just another perfume but....
                </p>


                {/* Action button */}
                <div>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="bg-[#381c15] text-[#e2bb61] border border-[#e2bb61]/30 hover:border-[#e2bb61] text-xs uppercase tracking-[0.2em] font-montserrat-bold px-10 py-4 rounded-[30px] w-full max-w-[260px] transition-all shadow-[0_5px_20px_rgba(56,28,21,0.5)] cursor-pointer"
                  >
                    PRE-ORDER NOW
                  </button>
                </div>

                {/* Pagination Dots */}
                <div className="flex gap-2 justify-center pt-2">
                  {SLIDESHOW_IMAGES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentSlide 
                          ? "bg-[#e2bb61] scale-125 shadow-[0_0_8px_#e2bb61]" 
                          : "bg-white/20 hover:bg-white/40"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* DESKTOP/LAPTOP LAYOUT: Balanced split layout (hidden md:grid) */}
            <div className="hidden md:grid grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Left Column: Information, Story & CTA */}
              <div className="col-span-6 flex flex-col space-y-8 text-left">
                <div className="space-y-4">
                  <span className="text-[#e2bb61] text-xs tracking-[0.3em] font-montserrat-light uppercase block">
                    Our First Launch
                  </span>
                  
                  <div className="flex items-center">
                    <span className="text-white text-6xl lg:text-7xl font-kalieb tracking-wider uppercase">
                      OCT 7
                    </span>
                  </div>

                  <p className="text-white/85 text-base lg:text-lg font-montserrat-light leading-relaxed max-w-md">
                    Not merely a name. But a story, <span className="text-[#e2bb61] font-montserrat-medium">a story of resistance</span>
                  </p>
                </div>

                <div className="space-y-6 pt-2">
                  <p className="text-white/90 text-sm tracking-wider font-montserrat-medium uppercase">
                    Its not just another perfume but....
                  </p>


                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="bg-[#381c15] text-[#e2bb61] border border-[#e2bb61]/30 hover:border-[#e2bb61] hover:bg-[#e2bb61] hover:text-black text-xs uppercase tracking-[0.2em] font-montserrat-bold px-12 py-4 rounded-[30px] transition-all shadow-[0_5px_25px_rgba(56,28,21,0.5)] cursor-pointer inline-block"
                  >
                    PRE-ORDER NOW
                  </button>
                </div>

                {/* Pagination Dots */}
                <div className="flex gap-2.5 pt-4">
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

              {/* Right Column: Slideshow Frame */}
              <div className="col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full aspect-[4/5] max-w-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <Image
                        src={SLIDESHOW_IMAGES[currentSlide]}
                        alt={`Product Slide Desktop ${currentSlide + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 380px, 480px"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Section 4: The House of Raanae & Stats */}
        <section id="house-of-raanae" className="relative min-h-screen w-full flex flex-col justify-between pt-24 bg-black border-t border-white/5">
          
          <div className="w-full max-w-5xl mx-auto px-6 md:px-16 flex-grow flex flex-col justify-center items-center text-center">
            

            {/* Title */}
            <h2 className="font-kalieb text-[#e2bb61] text-3xl sm:text-4xl md:text-6xl tracking-widest mb-6 uppercase">
              THE HOUSE OF RAANAE
            </h2>
            
            {/* Description Subtitle */}
            <p className="text-white/80 text-sm sm:text-base font-montserrat-light tracking-wide max-w-3xl leading-relaxed mb-12 sm:mb-16">
              Raanae is a luxury fragrance house renowned for delivering unmatched scent quality through innovative infusions. We blend advanced distillation with architectural design, keeping <span className="text-white font-montserrat-bold underline decoration-[#e2bb61] decoration-2 underline-offset-4">human wellbeing our top priority.</span>
            </p>

            {/* Three Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-4xl mb-12 sm:mb-20">
              
              {/* Card 1: 25-35% */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-black/30 border border-[#e2bb61]/20 hover:border-[#e2bb61]/50 p-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-2xl backdrop-blur-sm transition-all duration-300 h-44 md:h-52 group"
              >
                <span className="text-white text-3xl sm:text-4xl font-montserrat-bold tracking-tight mb-2 group-hover:text-[#e2bb61] transition-colors">
                  25-35%
                </span>
                <span className="text-white/60 group-hover:text-white/80 transition-colors text-[10px] sm:text-xs uppercase tracking-[0.15em] font-montserrat-medium leading-snug">
                  High Oil<br />Concentration
                </span>
              </motion.div>

              {/* Card 2: Harmless Alternative Used */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-black/30 border border-[#e2bb61]/20 hover:border-[#e2bb61]/50 p-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-2xl backdrop-blur-sm transition-all duration-300 h-44 md:h-52 group"
              >
                <span className="text-white text-sm sm:text-base font-montserrat-bold uppercase tracking-wider mb-2 leading-tight max-w-[200px] group-hover:text-[#e2bb61] transition-colors">
                  Harmless<br />Alternative Used
                </span>
                <span className="text-white/50 group-hover:text-white/75 transition-colors text-[8px] sm:text-[9px] uppercase tracking-[0.12em] font-montserrat-medium">
                  No Harmful Chemical Added
                </span>
              </motion.div>

              {/* Card 3: 12 HRS+ */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-black/30 border border-[#e2bb61]/20 hover:border-[#e2bb61]/50 p-8 rounded-[20px] flex flex-col justify-center items-center text-center shadow-2xl backdrop-blur-sm transition-all duration-300 h-44 md:h-52 group"
              >
                <span className="text-white text-3xl sm:text-4xl font-montserrat-bold tracking-tight mb-2 group-hover:text-[#e2bb61] transition-colors">
                  12 HRS+
                </span>
                <span className="text-white/60 group-hover:text-white/80 transition-colors text-[10px] sm:text-xs uppercase tracking-[0.15em] font-montserrat-medium leading-snug">
                  Long Lasting<br />Fragrance
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
          <footer className="w-full bg-[#d4b474] text-[#5a4522] py-5 px-6 md:px-16 border-t border-[#b8892f]/20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs font-montserrat-medium">
              <p className="max-w-2xl text-center md:text-left leading-relaxed">
                <span className="font-montserrat-bold text-[#3d2e13]">Disclaimer:</span> Raanae is not just a perfume brand but a purpose, a vision, a platform, community for one united muslim ummah.
              </p>
              <p className="whitespace-nowrap font-montserrat-bold text-[#3d2e13]">
                Our Touch Point: <a href="mailto:contact@raanae.com" className="underline hover:text-black transition-colors">contact@raanae.com</a>
              </p>
            </div>
          </footer>

        </section>

      </main>

      {/* Product Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={PRE_ORDER_PRODUCT}
      />
    </>
  );
}
