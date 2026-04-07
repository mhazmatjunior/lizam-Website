"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, ChevronLeft, ChevronRight, ArrowDown, Sparkles, ShieldCheck, Droplets, Globe, Palette, ArrowUpRight, ShoppingBag, Volume2, VolumeX } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CheckoutModal from "./components/CheckoutModal";

export default function Home() {
  const { addToCart, setIsCartOpen, itemsCount } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const SLIDESHOW_IMAGES = [
    "/Slideshow- (1).png",
    "/Slideshow- (2).png",
    "/Slideshow- (3).png",
    "/Slideshow- (4).png",
    "/Slideshow- (5).png"
  ];


  // Signature Product definition for the landing page
  const SIGNATURE_PRODUCT = {
    id: 710,
    name: "7TH OCT",
    price: 24500,
    category: "Signature Collection",
    image: "/product_1.png"
  };

  // Pre-Order Rate Product
  const PRE_ORDER_PRODUCT = {
    id: 71099,
    name: "7TH OCT (Pre-Order Booking)",
    price: 150,
    category: "Signature Collection",
    image: "/product_1.png"
  };

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 6000); // Premium 6-second cadence
    return () => clearInterval(timer);
  }, [currentSlide]); // Dependency ensures timer Resets on manual interaction

  return (
    <>
    <main 
      ref={containerRef} 
      className="bg-black text-white selection:bg-gold selection:text-black relative h-[100dvh] overflow-y-auto overflow-x-hidden md:snap-y md:snap-mandatory scroll-smooth"
    >


        {/* Section 1: Brand Mission Hero */}
        <section id="home" className="section relative h-[100dvh] max-h-[100dvh] md:snap-start flex flex-col px-4 md:px-16 pt-2 overflow-hidden bg-black">

        {/* Cinematic Logo Background Layer - Responsive */}
        <div className="absolute inset-0 h-[100dvh] w-full z-0 opacity-50 mix-blend-screen pointer-events-none overflow-hidden">
          {/* Mobile Background */}
          <div className="md:hidden absolute inset-0 w-full h-full">
            <Image
              src="/hero-bg-5.png"
              alt="Brand Pattern Mobile Background"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
          {/* Desktop Background */}
          <div className="hidden md:block absolute inset-0 w-full h-full">
            <Image
              src="/hero-bg-4.png"
              alt="Brand Pattern Desktop Background"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Strong Centered Radial Ambient Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 55%, rgba(200, 164, 77,0.07) 0%, rgba(200, 164, 77,0.03) 40%, transparent 70%)'
        }} />

        {/* Top Vignette */}
        <div className="absolute top-0 left-0 right-0 h-32 z-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)'
        }} />

        {/* Bottom Gradient Fade - teases next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
        }} />

        {/* Floating Ambient Gold Orbs - Scaled for mobile */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="float-orb absolute w-[150px] md:w-[300px] h-[150px] md:h-[300px] rounded-full bg-gold/[0.04] blur-[40px] md:blur-[80px]" style={{ top: '15%', left: '10%', '--orb-duration': '9s', '--orb-delay': '0s' } as React.CSSProperties} />
          <div className="float-orb absolute w-[100px] md:w-[200px] h-[100px] md:h-[200px] rounded-full bg-gold/[0.05] blur-[30px] md:blur-[60px]" style={{ top: '60%', right: '12%', '--orb-duration': '12s', '--orb-delay': '2s' } as React.CSSProperties} />
          <div className="float-orb absolute w-[80px] md:w-[150px] h-[80px] md:h-[150px] rounded-full bg-gold/[0.04] blur-[25px] md:blur-[50px]" style={{ bottom: '20%', left: '30%', '--orb-duration': '7s', '--orb-delay': '1s' } as React.CSSProperties} />
          <div className="float-orb absolute w-[60px] md:w-[100px] h-[60px] md:h-[100px] rounded-full bg-white/[0.02] blur-[20px] md:blur-[40px]" style={{ top: '35%', right: '30%', '--orb-duration': '10s', '--orb-delay': '3s' } as React.CSSProperties} />
          <div className="float-orb absolute w-[50px] md:w-[80px] h-[50px] md:h-[80px] rounded-full bg-gold/[0.06] blur-[15px] md:blur-[30px]" style={{ top: '50%', left: '55%', '--orb-duration': '6s', '--orb-delay': '0.5s' } as React.CSSProperties} />
        </div>

        {/* Navbar - Refined Layout for Massive Mobile Logo */}
        <header className="flex justify-between md:grid md:grid-cols-3 items-center z-50 w-full pb-4 md:pb-10">
          <div className="flex items-center -ml-6 md:ml-0 shrink-0 relative h-[100px] md:h-[85px] w-[180px] md:w-[180px]">
            <Image
              src="/logo-transparent.png"
              alt="RAANAE Logo"
              fill
              className="object-contain object-left mix-blend-screen"
              priority
            />
          </div>
          
          <nav className="hidden md:flex justify-center gap-10 lg:gap-14 text-[10px] uppercase tracking-[0.3em] font-medium text-white/50">
            <a href="#home" className="hover:text-gold transition-colors text-white">Home</a>
            <a href="#october" className="hover:text-gold transition-colors">7th Oct</a>
            <a href="#about" className="hover:text-gold transition-colors">About</a>
          </nav>

          <div className="flex justify-end items-center gap-2 md:gap-4 -mt-5 md:mt-0">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 md:p-3 bg-white/[0.03] border border-white/10 rounded-full hover:border-gold/50 transition-all group"
            >
              <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70 group-hover:text-gold transition-colors" />
              {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-gold text-black text-[7px] md:text-[8px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(200, 164, 77,0.5)]">
                      {itemsCount}
                  </span>
              )}
            </button>
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="btn-premium-gold text-[10px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-extrabold px-5 md:px-8 py-2 md:py-2.5 rounded-full whitespace-nowrap inline-block"
            >
              Pre Order Now
            </button>
          </div>
        </header>

        {/* Mission Content */}
        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 md:space-y-12 max-w-4xl mx-auto px-4 md:px-6 relative z-20 md:pb-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-8 md:space-y-12"
          >
            {/* Raanae Label */}
            <motion.h2
              initial={{ opacity: 0, letterSpacing: '1em' }}
              animate={{ opacity: 1, letterSpacing: '0.8em' }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="text-gold text-lg md:text-3xl font-black uppercase drop-shadow-[0_0_15px_rgba(200,164,77,0.4)]"
            >
              Raanae
            </motion.h2>

            {/* Staggered Word Reveal for Main Title - Responsive sizing */}
            <div className="overflow-hidden px-2">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase flex flex-wrap justify-center gap-x-2 md:gap-x-4">
                {["A", "Proud", "Muslim", "Brand"].map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 60, skewY: 4 }}
                    animate={{ opacity: 1, y: 0, skewY: 0 }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </div>



            <motion.div
              initial={{ opacity: 0, letterSpacing: '0.5em', y: 20 }}
              animate={{ opacity: 1, letterSpacing: '0.15em', y: 0 }}
              transition={{ duration: 1.5, delay: 1.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              <h3 className="text-gold text-[12px] md:text-[15px] font-black uppercase max-w-sm md:max-w-2xl leading-loose text-center">
                Our Aim Is To Help The Needy And Helpless People Without Asking Anyone For Donations
              </h3>
            </motion.div>
          </motion.div>
        </div>

      </section>

      {/* Section 2: Initiative */}
      <section className="section bg-black overflow-hidden relative h-[50dvh] md:h-[100dvh] md:snap-start flex items-center justify-center">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
          {/* Mobile Background */}
          <div className="md:hidden absolute inset-0 w-full h-full">
            <Image
              src="/section-2-mob-new.png"
              alt="Initiative Mobile Background"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover opacity-90"
              priority
            />
          </div>
          {/* Desktop Background */}
          <div className="hidden md:block absolute inset-0 w-full h-full">
            <Image
              src="/section-2-new.png"
              alt="Initiative Desktop Background"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover opacity-90"
              priority
            />
          </div>
          {/* Top Vignette */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black to-transparent z-10" />
          
          {/* Bottom Gradient for Text Readability replacing the box */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        </div>

        {/* Content - Responsive Alignment */}
        <div className="relative z-20 flex flex-col items-center justify-center md:justify-end h-full pt-60 md:pt-0 md:pb-16 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center text-center max-w-2xl mx-auto px-6 py-4 border border-white/40 bg-black/10 backdrop-blur-sm rounded-2xl md:px-10 md:py-8 md:bg-black/40 md:backdrop-blur-md md:border-white/10 md:shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          >
            {/* Minimalist Top Accent */}
            
            
            <h3 className="text-gold text-sm md:text-base font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 drop-shadow-md">
              Our Initiative
            </h3>
            
            <p className="font-algerian text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-[1.8] md:leading-[1.9] tracking-wide drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
              It's a self-taken initiative for others, inspired by the cause of Palestine.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Original 7th October Hero */}
      <section id="october" className="w-full bg-black overflow-hidden relative h-auto md:h-[100dvh] md:snap-start py-0 md:py-0">

        <div className="relative md:absolute md:inset-0 pt-6 md:pt-10 pb-20 md:pb-10 flex flex-col md:justify-between z-10 px-6 md:px-0">
          <div className="flex flex-col md:justify-center px-0 md:px-16 md:flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 items-center w-full relative">
              <div className="z-10 flex flex-col items-center text-center">
                {/* Redesigned 7TH OCT - 7 is anchored center, OCT is accent right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative flex items-center justify-center w-full"
                >
                  <div className="flex items-center gap-3 sm:gap-4 md:gap-6 translate-x-4 md:translate-x-8">
                    <h1 className="text-7xl sm:text-8xl md:text-[10vw] huge-title-solid select-none tracking-tighter text-white leading-none">
                      7
                    </h1>
                    
                    <div className="flex flex-col justify-start items-start -space-y-1 md:-space-y-2 mt-1 md:mt-2">
                      <span className="text-xl sm:text-2xl md:text-[3vw] font-black tracking-tight text-white/90 ml-1 md:ml-2">
                        TH
                      </span>
                      <motion.span 
                        animate={{ y: [0, -4, 0] }} 
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="font-black text-gold tracking-widest uppercase text-base sm:text-xl md:text-[2.5vw]"
                      >
                        OCT
                      </motion.span>
                    </div>
                  </div>
                </motion.div>

                  {/* Tagline & Gold Accent Line */}
                  <div className="mt-4 md:mt-6 flex items-center gap-4 md:gap-6">
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileInView={{ scaleX: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left' }}
                      className="hidden md:block w-8 md:w-12 h-[1px] bg-gold"
                    />
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 1.0 }}
                      className="text-gold text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] font-light"
                    >
                    </motion.p>
                  </div>

                  {/* Desktop Pre-Order Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    viewport={{ once: true }}
                    className="hidden md:flex mt-10"
                  >
                    <button 
                      onClick={() => setIsCheckoutOpen(true)}
                      className="btn-premium-gold px-12 py-3.5 rounded-full flex items-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(200,164,77,0.3)] transition-transform hover:scale-105 active:scale-95"
                    >
                      Pre Order Now
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>

                <div className="relative flex justify-center items-center h-[380px] md:h-[420px] lg:h-[500px] -mt-4 md:mt-0 w-full overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    onViewportEnter={(entry) => {
                      const video = entry?.target?.querySelector('video');
                      if (video) {
                        video.currentTime = 0;
                        video.play();
                      }
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    viewport={{ once: false, amount: 0.5 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <video
                      key={isMobile ? `mobile-video-${isMuted}` : `desktop-video-${isMuted}`}
                      autoPlay
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover md:object-contain"
                    >
                      <source src={isMobile ? "/Raanae Masterpiece Mob.mp4" : "/Raanae Masterpiece.mp4"} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Minimalist Sound Toggle */}
                    <motion.button
                      onPointerDown={(e) => {
                         e.stopPropagation();
                         setIsMuted(!isMuted);
                      }}
                      className="absolute bottom-6 right-6 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full z-50 hover:bg-gold/20 transition-all group"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white group-hover:text-gold" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-gold" />
                      )}
                    </motion.button>
                  </motion.div>
                </div>
            </div>

            {/* Mobile: Our First Launch & Pre-Order Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="md:hidden flex flex-col items-center text-center mt-1 z-20"
            >
              <span className="text-white text-[15px] uppercase tracking-[0.4em] font-black drop-shadow-sm mb-4">
                Our First Launch
              </span>
              <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="btn-premium-gold px-6 py-2.5 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(200,164,77,0.3)]"
              >
                Pre Order Now
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            </motion.div>

          </div>

        </div>

        {/* Absolute Footer pinned to bottom of section - bypasses hero-grid constraints */}
        <div className="absolute bottom-14 md:bottom-8 left-0 right-0 flex flex-col items-center justify-center px-6 md:px-16 z-50">
          {/* Center: Scroll Arrow (Desktop Only) */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:block absolute left-1/2 -translate-x-1/2 cursor-pointer transition-opacity"
          >
            <div className="px-5 md:px-6 py-1.5 md:py-2 border border-gold rounded-full flex items-center justify-center hover:bg-gold/10 transition-colors">
              <ArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold" />
            </div>
          </motion.div>
        </div>

        {/* Right Most Vertical Social Icons (Centered Vertically) */}
        <div className="hidden md:flex absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-8 z-50">
          <Instagram className="w-[18px] md:w-[20px] h-[18px] md:h-[20px] text-white hover:text-gold cursor-pointer transition-colors" />
          <Facebook className="w-[18px] md:w-[20px] h-[18px] md:h-[20px] text-white hover:text-gold cursor-pointer transition-colors" />
        </div>
      </section>

      {/* Section 4: About Us (Redesigned Grid - Flipped) */}
      <section id="about" className="flex section bg-black px-6 md:px-24 relative overflow-hidden items-center justify-center md:snap-start md:py-0">

        <div className="relative z-10 w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-center">

            {/* Left: Product Visualization (Moved here) */}
            <div className="lg:col-span-6 flex justify-center items-center relative h-[450px] md:h-[420px] w-[85%] mx-auto md:w-full">
              {/* Decorative Spotlight Glow - Hidden on mobile for more blackish bg */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2 }}
                className="hidden md:block absolute w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px] z-0"
              />
              
              <div className="flex flex-col lg:flex-row items-center w-full gap-4 lg:gap-12">
                {/* 3-Box Preview Grid (Vertical on Desktop, Horizontal on Mobile) */}
                <div className="order-2 lg:order-1 flex lg:flex-col gap-4 items-center justify-center lg:w-32">
                  {[ -1, 0, 1 ].map((offset) => {
                    const index = (currentSlide + offset + SLIDESHOW_IMAGES.length) % SLIDESHOW_IMAGES.length;
                    const isActive = offset === 0;
                    return (
                      <motion.div
                        key={SLIDESHOW_IMAGES[index]}
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: isActive ? 1 : 0.15, 
                          scale: isActive ? 1.05 : 0.9,
                          borderColor: isActive ? "rgba(200, 164, 77, 1)" : "rgba(255, 255, 255, 0)"
                        }}
                        transition={{ 
                          layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.6 },
                          scale: { duration: 0.6 }
                        }}
                        className={`w-16 h-20 md:w-20 md:h-24 relative border-2 rounded-xl overflow-hidden cursor-pointer ${!isActive ? 'grayscale' : 'shadow-[0_0_20px_rgba(200,164,77,0.2)]'}`}
                        onClick={() => setCurrentSlide(index)}
                      >
                        <Image 
                          src={SLIDESHOW_IMAGES[index]}
                          alt={`Thumbnail ${index}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Main Slideshow Image - Uses Static Persistence for Zero-Lag */}
                <div className="order-1 lg:order-2 relative w-full h-[380px] md:h-[450px] lg:h-[500px] flex items-center justify-center flex-grow">
                  {SLIDESHOW_IMAGES.map((src, i) => (
                    <motion.div
                      key={src}
                      initial={false}
                      animate={{ 
                        opacity: i === currentSlide ? 1 : 0, 
                        scale: i === currentSlide ? 1 : 1.1, // Zoom out during dissolve
                        zIndex: i === currentSlide ? 10 : 0 
                      }}
                      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute inset-0 w-full h-full flex items-center justify-center rounded-[40px] overflow-hidden bg-black"
                    >
                      <Image 
                        src={src} 
                        alt={`Raanae Slideshow ${i + 1}`} 
                        fill
                        unoptimized
                        priority={i === 0} // Instant-load for the very first bottle
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center drop-shadow-[0_40px_100px_rgba(200,164,77,0.3)]"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Heading Content & Bullets - Desktop Only (Shared Grid) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="hidden lg:flex lg:col-span-6 space-y-8 md:space-y-12 text-center lg:text-left flex-col items-center lg:items-start w-full"
            >
              <div className="space-y-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 40 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="h-[1px] bg-gold"
                />
                <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">The House of RAANAE</h3>
                <div className="w-10 h-[1px] bg-gold" />
                <p className="text-[10px] md:text-[11px] text-white uppercase tracking-[0.1em] leading-relaxed font-bold max-w-md">
                  Raanae is a luxury fragrance house renowned for delivering unmatched scent quality through innovative infusions. We blend advanced distillation with architectural design.
                </p>
              </div>

              {/* Minimalist Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 w-full px-4 md:px-0">
                {[
                  { icon: Sparkles, title: "Rare Infusions", desc: "Obsidian series depth using molecular infusion." },
                  { icon: Palette, title: "Artisanal Craft", desc: "Hand-poured precision from our distillery." },
                  { icon: Droplets, title: "Pure Integrity", desc: "Zero synthetic fillers—just pure nature." },
                  { icon: ShieldCheck, title: "Modern Design", desc: "Aesthetics meet advanced distillation tech." },
                  { icon: Globe, title: "Global Heritage", desc: "Sourcing world's most elusive botanicals." }
                ].map((item, id) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: id * 0.05 }}
                    className="flex items-start gap-3 group text-left"
                  >
                    <div className="w-7 h-7 rounded-full border border-gold/20 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
                      <item.icon className="w-3 h-3 text-gold" />
                    </div>
                    <div className="space-y-0 pt-0.5">
                      <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">{item.title}</h3>
                      <p className="text-white/50 text-[9px] leading-tight">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA Button - Visible on All Screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
            className="flex mt-10 md:mt-16 justify-center"
          >
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="btn-premium-gold px-8 md:px-10 py-3 rounded-full flex items-center gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest group"
            >
              Pre Order Now
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {isMobile && (
        <section id="about-details" className="section flex bg-black px-6 relative overflow-y-auto flex-col items-center justify-start py-16 md:pt-16 md:snap-start">
          <div className="relative z-10 w-full max-w-xl space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4 flex flex-col items-center text-center relative mt-0"
            >
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gold pt-2">The House of RAANAE</h3>
              <p className="text-[11px] text-white/90 uppercase tracking-[0.1em] leading-relaxed font-bold">
                Raanae is a luxury fragrance house renowned for delivering unmatched scent quality through innovative infusions. We blend advanced distillation with architectural design.
              </p>
            </motion.div>

            {/* Minimalist Bullets Grid */}
            <div className="grid grid-cols-1 gap-y-8 w-full max-w-[280px] mx-auto">
              {[
                { icon: Sparkles, title: "Rare Infusions", desc: "Obsidian series depth using molecular infusion." },
                { icon: Palette, title: "Artisanal Craft", desc: "Hand-poured precision from our distillery." },
                { icon: Droplets, title: "Pure Integrity", desc: "Zero synthetic fillers—just pure nature." },
                { icon: ShieldCheck, title: "Modern Design", desc: "Aesthetics meet advanced distillation tech." },
                { icon: Globe, title: "Global Heritage", desc: "Sourcing world's most elusive botanicals." }
              ].map((item, id) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: id * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-[11px] uppercase tracking-widest">{item.title}</h3>
                    <p className="text-white/40 text-[10px] leading-tight">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Icons - Mobile Only */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex gap-10 items-center justify-center pt-8 pb-4"
            >
              <Instagram className="w-5 h-5 text-white hover:text-gold transition-colors cursor-pointer" />
              <Facebook className="w-5 h-5 text-white hover:text-gold transition-colors cursor-pointer" />
            </motion.div>
          </div>
        </section>
      )}
      
      {/* Section 5: Collection Highlights - Disconnected per user request */}
      {/* 
      <section id="collection" className="section bg-black px-6 md:px-12 pb-20 md:pb-32 md:snap-start">
        <div className="relative w-full h-full flex flex-col justify-center items-center">
          <div className="flex items-center justify-center py-10 w-full">
            <div className="hidden md:flex items-center justify-center gap-4">

              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex flex-col items-center gap-4 opacity-70 grayscale transition-all duration-700"
              >
                <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white">Coming Soon</span>
                <div className="w-44 h-72 bg-gradient-to-b from-white/[0.08] to-transparent rounded-[2.5rem] border border-white/20 flex flex-col items-center justify-center p-6 gap-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="w-10 h-10 border border-white/30 rounded-xl mb-1 flex items-center justify-center">
                    <div className="w-5 h-[1px] bg-white/20" />
                  </div>
                  <div className="w-2 h-3 bg-white/20" />
                  <div className="w-24 h-40 border border-white/30 rounded-[2rem] relative flex items-center justify-center">
                    <div className="w-8 h-8 border border-white/20 rounded-md opacity-40" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative z-30 flex flex-col items-center"
              >
                <div className="w-80 h-[520px] flex items-center justify-center">
                  <Image src="/Pic_1.png" alt="7th Oct Perfume" width={320} height={420} className="object-contain drop-shadow-[0_30px_60px_rgba(200, 164, 77,0.35)]" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex flex-col items-center gap-4 opacity-70 grayscale transition-all duration-700"
              >
                <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white">Coming Soon</span>
                <div className="w-44 h-72 bg-gradient-to-b from-white/[0.08] to-transparent rounded-[2.5rem] border border-white/20 flex flex-col items-center justify-center p-6 gap-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="w-10 h-10 border border-white/30 rounded-xl mb-1 flex items-center justify-center">
                    <div className="w-5 h-[1px] bg-white/20" />
                  </div>
                  <div className="w-2 h-3 bg-white/20" />
                  <div className="w-24 h-40 border border-white/30 rounded-[2rem] relative flex items-center justify-center">
                    <div className="w-8 h-8 border border-white/20 rounded-md opacity-40" />
                  </div>
                </div>
              </motion.div>

            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="md:hidden relative z-30 flex flex-col items-center w-full max-w-[280px]"
            >
              <h3 className="text-2xl font-black uppercase tracking-tighter gold-text mb-4 text-center">
                7TH OCT<br />COLLECTION
              </h3>
              <div className="w-full h-[350px] flex items-center justify-center p-4">
                <Image src="/Pic_1.png" alt="7th October Perfume" width={280} height={380} className="object-contain drop-shadow-[0_20px_40px_rgba(200, 164, 77,0.2)]" />
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-4 md:bottom-0 w-full flex flex-col items-center md:grid md:grid-cols-3 md:items-end gap-8 md:gap-0 md:pb-0">
            <div className="hidden md:flex justify-center md:justify-start text-center md:text-left">
              <h3 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none gold-text">
                7TH OCT<br />COLLECTION
              </h3>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-24 md:w-32 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-8 h-full bg-gold shadow-[0_0_10px_rgba(200, 164, 77,0.5)]"
                />
              </div>
              <div className="flex gap-4 text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-black">
                <span className="text-gold cursor-pointer">01</span>
                <span className="text-white cursor-pointer hover:text-white transition-colors">02</span>
                <span className="text-white cursor-pointer hover:text-white transition-colors">03</span>
                <span className="text-white cursor-pointer hover:text-white transition-colors">04</span>
                <span className="text-white cursor-pointer hover:text-white transition-colors">05</span>
              </div>
            </div>

            <div className="hidden md:flex justify-center md:justify-end gap-6 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white font-black pb-2">
              <span className="hover:text-gold transition-colors cursor-pointer">T&P</span>
              <span className="hover:text-gold transition-colors cursor-pointer">PR</span>
              <span className="hover:text-gold transition-colors cursor-pointer">TQ</span>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Modern Custom Cursor Overlay (Visual only) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] p-4 opacity-20">
        <div className="w-full h-full border border-white/5 rounded-[4rem]" />
      </div>
    </main>

      <div className="fixed bottom-0 opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        {SLIDESHOW_IMAGES.map((src) => (
          <Image key={src} src={src} alt="Preload" width={10} height={10} unoptimized />
        ))}
      </div>

      {/* Premium Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={PRE_ORDER_PRODUCT}
      />
    </>
  );
}
