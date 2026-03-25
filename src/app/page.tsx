"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { Instagram, Twitter, Facebook, Linkedin, ChevronLeft, ChevronRight, ArrowDown, Sparkles, ShieldCheck, Droplets, Globe, Palette, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { setIsCartOpen, itemsCount } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBottleEntrance, setShowBottleEntrance] = useState(false);
  const [isBeyondSection1, setIsBeyondSection1] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 25,
    restDelta: 0.001
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsBeyondSection1(latest > 0.24);
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (latest >= 0.24) {
      setShowBottleEntrance(true);
    } else {
      setShowBottleEntrance(false);
    }
  });

  // Bottle Motion Logic - Adjusted for 4-section layout (0.25 intervals)
  // On mobile, keep it centered (0vw) as content is stacked
  const desktopX = ["22vw", "22vw", "22vw", "-23vw", "-23vw", "0vw", "0vw"];
  const mobileX = ["0vw", "0vw", "0vw", "0vw", "0vw", "0vw", "0vw"];
  
  const desktopY = ["0vh", "0vh", "0vh", "0vh", "0vh", "-4vh", "-4vh"];
  const mobileY = ["14vh", "14vh", "14vh", "0vh", "0vh", "20vh", "20vh"]; // 14vh -> 0vh -> 20vh (exit)

  const desktopScale = [1, 1, 1, 0.85, 0.85, 0.7, 0.7];
  const mobileScale = [0.9, 0.9, 0.9, 0.8, 0.8, 0.7, 0.7];

  const desktopOpacity = [1, 1, 1, 1, 1, 1, 0];
  const mobileOpacity = [0, 0, 0, 0, 0, 0, 0]; // Hidden on mobile

  // On mobile, bottle stays put at 14vh until deep into Section 2 scroll (0.72),
  // then starts moving down into Section 3 and fades out.
  const scrollCheckpoints = isMobile
    ? [0,    0.25, 0.55, 0.72, 0.80, 0.85, 0.95]
    : [0,    0.25, 0.45, 0.55, 0.75, 0.85, 0.95];

  const bottleX = useTransform(smoothProgress, scrollCheckpoints, isMobile ? mobileX : desktopX);
  const bottleY = useTransform(smoothProgress, scrollCheckpoints, isMobile ? mobileY : desktopY);
  const bottleScale = useTransform(smoothProgress, scrollCheckpoints, isMobile ? mobileScale : desktopScale);
  const bottleRotateBase = useTransform(smoothProgress, scrollCheckpoints, [0, 0, 0, -5, -5, 0, 0]);
  const bottleOpacity = useTransform(smoothProgress, scrollCheckpoints, isMobile ? mobileOpacity : desktopOpacity);

  // Clean up legacy opacities
  const heroBottleOpacity = 0; 
  const collectionBottleOpacity = useTransform(smoothProgress, [0, 0.8, 0.9], [0, 0, 1]);

  return (
    <main 
      ref={containerRef} 
      className="bg-black text-white selection:bg-gold selection:text-black relative h-[100dvh] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth"
    >
      {/* Cinematic Travelling Bottle (Overlay) */}
      <motion.div
        style={{
          x: bottleX,
          y: bottleY,
          scale: bottleScale,
          opacity: isBeyondSection1 ? bottleOpacity : 0
        }}
        className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7, x: 50, rotate: 10 }}
          animate={showBottleEntrance ? { 
            opacity: 1, 
            scale: 1, 
            x: 0, 
            rotate: 0,
            y: [0, -12, 0],
            rotateZ: [-3, 3, -3],
          } : { opacity: 0 }}
          transition={{
            opacity: { duration: showBottleEntrance ? 1.5 : 0 },
            scale: { duration: 2, ease: [0.22, 1, 0.36, 1] },
            x: { duration: 2, ease: [0.22, 1, 0.36, 1] },
            rotate: { duration: 2, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotateZ: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Image
            src="/Pic_1_Transparent.png"
            alt="Travelling Perfume Bottle"
            width={500}
            height={700}
            className="w-[320px] h-auto object-contain drop-shadow-[20px_40px_80px_rgba(0,0,0,0.8)]"
            priority
          />
        </motion.div>
      </motion.div>

        {/* Section 1: Brand Mission Hero */}
        <section id="home" className="section relative h-[100dvh] snap-start flex flex-col px-6 md:px-16 pt-2 pb-4 md:pb-10 overflow-hidden bg-black">

        {/* Cinematic Logo Background Layer - visible on all screens */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.2] pointer-events-none scale-[2] md:scale-110">
          <Image
            src="/hero-bg-2.png"
            alt="Brand Pattern Background"
            fill
            className="object-contain mix-blend-screen"
            priority
          />
        </div>

        {/* Strong Centered Radial Ambient Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 55%, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.03) 40%, transparent 70%)'
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

        {/* Navbar - Refined 3-Column Grid */}
        <header className="grid grid-cols-2 md:grid-cols-3 items-center z-50 w-full pb-4 md:pb-10">
          <div className="flex items-center">
            <Image
              src="/logo-transparent.png"
              alt="RAANAI Logo"
              width={180}
              height={60}
              className="h-10 md:h-16 w-auto object-contain mix-blend-screen"
              priority
            />
          </div>
          
          <nav className="hidden md:flex justify-center gap-10 lg:gap-14 text-[10px] uppercase tracking-[0.3em] font-medium text-white/50">
            <a href="#home" className="hover:text-gold transition-colors text-white">Home</a>
            <a href="#october" className="hover:text-gold transition-colors">7th October</a>
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#collection" className="hover:text-gold transition-colors">Collection</a>
          </nav>

          <div className="flex justify-end items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 md:p-3 bg-white/[0.03] border border-white/10 rounded-full hover:border-gold/50 transition-all group"
            >
              <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70 group-hover:text-gold transition-colors" />
              {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-gold text-black text-[7px] md:text-[8px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                      {itemsCount}
                  </span>
              )}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn-premium-gold text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-extrabold px-4 md:px-8 py-2 md:py-2.5 rounded-full whitespace-nowrap"
            >
              Buy Now
            </button>
          </div>
        </header>

        {/* Mission Content */}
        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 md:space-y-12 max-w-4xl mx-auto px-4 md:px-6 relative z-20 pb-20 md:pb-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center space-y-8 md:space-y-12"
          >
            {/* Raanai Label */}
            <motion.h2
              initial={{ opacity: 0, letterSpacing: '1em' }}
              animate={{ opacity: 0.8, letterSpacing: '0.8em' }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="text-gold text-lg md:text-3xl font-black uppercase"
            >
              Raanai
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

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1, ease: 'easeOut' }}
              className="text-sm md:text-lg text-white/50 leading-relaxed font-medium max-w-3xl"
            >
              An Initiative Which Is Taken By A Student To Build Something That Will Support People Financially, Those Who Are Oppressed, Needy and Helpless
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              <h3 className="text-gold text-[12px] md:text-[14px] font-black uppercase tracking-[0.4em]">
                OUR AIM IS TO HELP THEM WITHOUT ASKING ANYONE FOR DONATIONS
              </h3>
            </motion.div>
          </motion.div>
        </div>

      </section>

      {/* Section 2: Original 7th October Hero */}
      <section id="october" className="section devialet-bg overflow-hidden relative h-[100dvh] snap-start">

        {/* Editorial Dot Grid Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Radial Gold Glow — bottom center (behind bottle) */}
        <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[250px] md:h-[400px] pointer-events-none z-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)',
          filter: 'blur(20px)'
        }} />

        <div className="absolute inset-0 pt-10 pb-32 md:py-20 px-6 md:px-0 flex flex-col justify-between z-10">
          <div className="flex-grow flex flex-col justify-center px-0 md:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-center w-full relative">
              <div className="z-10 flex flex-col items-center md:items-start text-center md:text-left">
                {/* 7TH OCTOBER TITLE - Simplified for Mobile Visibility */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="z-10 flex flex-col items-center md:items-start"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-[7vw] huge-title-solid select-none tracking-[-0.04em] leading-[1.1] md:leading-[0.8] text-white">
                    7TH OCTOBER
                  </h1>

                  {/* Tagline & Gold Accent Line */}
                  <div className="mt-4 md:mt-6 flex items-center gap-4 md:gap-6">
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileInView={{ scaleX: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left' }}
                      className="w-8 md:w-12 h-[1px] bg-gold"
                    />
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 1.0 }}
                      className="text-gold text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] font-light"
                    >
                      Elevate the Essence
                    </motion.p>
                  </div>
                </motion.div>
              </div>

              <div className="relative flex justify-center items-center h-48 md:h-full">
                {/* Dual Diagonal Spotlight Beams - offset removed on mobile to center behind bottle */}
                <div className="absolute inset-0" style={{ transform: isMobile ? 'none' : 'translateX(220px)' }}>
                  <div className="light-beam light-beam-left" />
                  <div className="light-beam light-beam-right" />
                </div>

                {isMobile ? (
                  /* Mobile: Static transparent bottle with tilt animation */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Image
                        src="/Pic_1_Transparent.png"
                        alt="7th October Perfume Bottle"
                        width={200}
                        height={260}
                        className="w-[180px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(212,175,55,0.25)]"
                        priority
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  /* Desktop: invisible spacer — travelling overlay handles the bottle */
                  <div className="relative z-10 flex flex-col items-center opacity-0 pointer-events-none">
                    <div className="w-[200px] md:w-[340px] h-[250px] md:h-[440px]" />
                    <div className="platform-rack mt-[-8px] md:mt-[-12px] z-0" />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Absolute Footer pinned to bottom of section - bypasses hero-grid constraints */}
        <div className="absolute bottom-12 md:bottom-8 left-0 right-0 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 gap-6 md:gap-0 z-50">
          {/* Left: Mission Text only */}
          <div className="flex flex-col gap-1 select-none text-center md:text-left">
            <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">Its a self-taken initiative for others</p>
            <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-white/30">Inspired by the cause of palestine</p>
          </div>

          {/* Center: Scroll Arrow */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="md:absolute md:left-1/2 md:-translate-x-1/2 opacity-40 cursor-pointer hover:opacity-100 transition-opacity"
          >
            <div className="px-5 md:px-6 py-1.5 md:py-2 border border-white/20 rounded-full flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
          </motion.div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-6 md:gap-8">
            <Instagram className="w-[16px] md:w-[18px] h-[16px] md:h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
            <Twitter className="w-[16px] md:w-[18px] h-[16px] md:h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
            <Facebook className="w-[16px] md:w-[18px] h-[16px] md:h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
            <Linkedin className="w-[16px] md:w-[18px] h-[16px] md:h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
          </div>
        </div>
      </section>

      {/* Section 3: About Us (Redesigned Grid - Flipped) */}
      <section id="about" className="section bg-black px-6 md:px-24 relative overflow-hidden flex items-center justify-center snap-start md:py-0">

        <div className="relative z-10 w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-center">

            {/* Left: Bottle Landing Area - Hidden on Mobile */}
            <div className="hidden lg:flex lg:col-span-6 justify-center items-center relative h-[380px]">
              {/* Landing Spotlight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute w-[300px] h-[300px] bg-gold/5 rounded-full blur-[80px] z-0"
              />
            </div>

            {/* Right: Heading Content & Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="lg:col-span-6 space-y-8 md:space-y-12 text-center lg:text-left flex flex-col items-center lg:items-start w-full"
            >
              <div className="space-y-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 40 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="h-[1px] bg-gold"
                />
                <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">The House of RAANAI</h3>
                <div className="w-10 h-[1px] bg-gold" />
                <p className="text-[10px] md:text-[11px] text-white/30 uppercase tracking-[0.1em] leading-relaxed font-bold max-w-md">
                  Raanai is a luxury fragrance house renowned for delivering unmatched scent quality through innovative infusions. We blend advanced distillation with architectural design.
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
                      <p className="text-white/30 text-[9px] leading-tight">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </motion.div>
          </div>

          {/* Bottom CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-10 md:mt-16 flex justify-center"
          >
            <button className="btn-premium-gold px-8 md:px-10 py-3 rounded-full flex items-center gap-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest group">
              Experience the Scent
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Collection Highlights */}
      <section id="collection" className="section bg-black px-6 md:px-12 pb-20 md:pb-32 snap-start">
        <div className="relative w-full h-full flex flex-col justify-center items-center">
          {/* Product Carousel Mock - Fixed-Width Tight Composition */}
          <div className="flex items-center justify-center py-10 w-full">
            <div className="hidden md:flex items-center justify-center gap-4">

              {/* Left Placeholder: Coming Soon */}
              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex flex-col items-center gap-4 opacity-70 grayscale transition-all duration-700"
              >
                <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white/60">Coming Soon</span>
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

              {/* Main Product */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                style={{ opacity: collectionBottleOpacity }}
                className="relative z-30 flex flex-col items-center"
              >
                <div className="w-80 h-[520px] flex items-center justify-center">
                  <Image src="/Pic_1.png" alt="7th October Perfume" width={320} height={420} className="object-contain drop-shadow-[0_30px_60px_rgba(212,175,55,0.35)]" />
                </div>
              </motion.div>

              {/* Right Placeholder: Coming Soon */}
              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex flex-col items-center gap-4 opacity-70 grayscale transition-all duration-700"
              >
                <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white/60">Coming Soon</span>
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

            {/* Mobile: Main product only */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              style={{ opacity: collectionBottleOpacity }}
              className="md:hidden relative z-30 flex flex-col items-center w-full max-w-[280px]"
            >
              <h3 className="text-2xl font-black uppercase tracking-tighter gold-text mb-4 text-center">
                7TH OCTOBER<br />COLLECTION
              </h3>
              <div className="w-full h-[350px] flex items-center justify-center p-4">
                <Image src="/Pic_1.png" alt="7th October Perfume" width={280} height={380} className="object-contain drop-shadow-[0_20px_40px_rgba(212,175,55,0.2)]" />
              </div>
            </motion.div>
          </div>
          {/* Collection Footer - Simplified for Mobile */}
          <div className="absolute bottom-4 md:bottom-0 w-full flex flex-col items-center md:grid md:grid-cols-3 md:items-end gap-8 md:gap-0 md:pb-0">
            {/* Title: Hidden on mobile, already shown above image */}
            <div className="hidden md:flex justify-center md:justify-start text-center md:text-left">
              <h3 className="text-2xl md:text-5xl font-black uppercase tracking-tighter leading-none gold-text">
                7TH OCTOBER<br />COLLECTION
              </h3>
            </div>

            {/* Navigation Indicators: Now central and prominent on mobile */}
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-24 md:w-32 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-8 h-full bg-gold shadow-[0_0_10px_rgba(176,141,87,0.5)]"
                />
              </div>
              <div className="flex gap-4 text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-black">
                <span className="text-gold cursor-pointer">01</span>
                <span className="text-white/20 cursor-pointer hover:text-white/40 transition-colors">02</span>
                <span className="text-white/20 cursor-pointer hover:text-white/40 transition-colors">03</span>
                <span className="text-white/20 cursor-pointer hover:text-white/40 transition-colors">04</span>
                <span className="text-white/20 cursor-pointer hover:text-white/40 transition-colors">05</span>
              </div>
            </div>

            {/* Labels: Hidden on mobile per user request */}
            <div className="hidden md:flex justify-center md:justify-end gap-6 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/30 font-black pb-2">
              <span className="hover:text-gold transition-colors cursor-pointer">T&P</span>
              <span className="hover:text-gold transition-colors cursor-pointer">PR</span>
              <span className="hover:text-gold transition-colors cursor-pointer">TQ</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Custom Cursor Overlay (Visual only) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] p-4 opacity-20">
        <div className="w-full h-full border border-white/5 rounded-[4rem]" />
      </div>
    </main>
  );
}
