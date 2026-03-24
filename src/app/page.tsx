"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { Instagram, Twitter, Facebook, Linkedin, ChevronLeft, ChevronRight, ArrowDown, Sparkles, ShieldCheck, Droplets, Globe, Palette, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { setIsCartOpen, itemsCount } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBottleEntrance, setShowBottleEntrance] = useState(false);
  const [isBeyondSection1, setIsBeyondSection1] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
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
  const bottleX = useTransform(smoothProgress, [0, 0.25, 0.45, 0.55, 0.75, 0.85, 0.95], ["22vw", "22vw", "22vw", "-23vw", "-23vw", "0vw", "0vw"]);
  const bottleY = useTransform(smoothProgress, [0, 0.25, 0.45, 0.55, 0.75, 0.85, 0.95], ["0vh", "0vh", "0vh", "0vh", "0vh", "-4vh", "-4vh"]);
  const bottleScale = useTransform(smoothProgress, [0, 0.25, 0.45, 0.55, 0.75, 0.85, 0.95], [1, 1, 1, 0.85, 0.85, 0.7, 0.7]);
  const bottleRotateBase = useTransform(smoothProgress, [0, 0.25, 0.45, 0.55, 0.75, 0.85, 0.95], [0, 0, 0, -5, -5, 0, 0]);
  const bottleOpacity = useTransform(smoothProgress, [0, 0.25, 0.75, 0.85, 0.95], [1, 1, 1, 1, 0]);

  // Clean up legacy opacities
  const heroBottleOpacity = 0; 
  const collectionBottleOpacity = useTransform(smoothProgress, [0, 0.8, 0.9], [0, 0, 1]);

  return (
    <main ref={containerRef} className="bg-black text-white selection:bg-gold selection:text-black relative">
      {/* Cinematic Travelling Bottle (Overlay) */}
      <motion.div
        style={{
          x: bottleX,
          y: bottleY,
          scale: bottleScale,
          opacity: isBeyondSection1 ? bottleOpacity : 0
        }}
        className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none hidden md:block"
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
        <section id="home" className="section relative h-screen snap-start flex flex-col px-8 md:px-16 pt-2 pb-10 overflow-hidden bg-black">
        {/* Cinematic Logo Background Layer */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.2] pointer-events-none scale-110">
          <Image
            src="/hero-bg-2.png"
            alt="Brand Pattern Background"
            fill
            className="object-contain mix-blend-screen"
            priority
          />
        </div>

        {/* Subtle Brand Ambient Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none z-10" />
        {/* Navbar - Refined 3-Column Grid */}
        <header className="grid grid-cols-2 md:grid-cols-3 items-center z-50 w-full pb-6 md:pb-10">
          <div className="flex items-center">
            <Image
              src="/logo-transparent.png"
              alt="RAANAI Logo"
              width={180}
              height={60}
              className="h-14 md:h-16 w-auto object-contain mix-blend-screen"
              priority
            />
          </div>
          
          <nav className="hidden md:flex justify-center gap-10 lg:gap-14 text-[10px] uppercase tracking-[0.3em] font-medium text-white/50">
            <a href="#home" className="hover:text-gold transition-colors text-white">Home</a>
            <a href="#october" className="hover:text-gold transition-colors">7th October</a>
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#collection" className="hover:text-gold transition-colors">Collection</a>
          </nav>

          <div className="flex justify-end items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-white/[0.03] border border-white/10 rounded-full hover:border-gold/50 transition-all group"
            >
              <ShoppingBag className="w-4 h-4 text-white/70 group-hover:text-gold transition-colors" />
              {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-[8px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                      {itemsCount}
                  </span>
              )}
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn-premium-gold text-[10px] uppercase tracking-[0.3em] font-extrabold px-8 py-2.5 rounded-full whitespace-nowrap"
            >
              Buy Now
            </button>
          </div>
        </header>

        {/* Mission Content */}
        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center space-y-10"
          >
            <div className="space-y-4">
              <h2 className="text-gold text-xl md:text-3xl font-black uppercase tracking-[0.8em] opacity-80">Raanai</h2>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight uppercase">
                A Proud Muslim Brand
              </h1>
            </div>

            <p className="text-sm md:text-lg text-white/60 leading-relaxed font-medium max-w-3xl">
              An Initiative Which Is Taken By A Student To Build Something That Will Support People Financially, Those Who Are Oppressed, Needy and Helpless
            </p>

            <div className="pt-6">
              <span className="text-gold text-[11px] font-black uppercase tracking-[0.4em] border-t border-gold/20 pt-8 px-10">
                Our Aim Is To Help Them Without Asking Anyone For Donations
              </span>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Section 2: Original 7th October Hero */}
      <section id="october" className="section devialet-bg overflow-hidden relative h-screen snap-start">
        <div className="absolute inset-0 hero-grid py-10 flex flex-col justify-between">
          <div className="flex-grow flex flex-col justify-center px-8 md:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full relative">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="z-10"
              >
                <h1 className="text-[7vw] huge-title-solid select-none tracking-[-0.04em]">
                  7TH<br />OCTOBER
                </h1>
                <div className="mt-6 flex items-center gap-6">
                  <div className="w-12 h-[1px] bg-gold" />
                  <p className="text-gold text-xs uppercase tracking-[0.5em] font-light">Elevate the Essence</p>
                </div>
              </motion.div>

              <div className="relative flex justify-center items-center h-full">
                {/* Dual Diagonal Spotlight Beams - shifted right to align with bottle */}
                <div className="absolute inset-0" style={{ transform: 'translateX(220px)' }}>
                  <div className="light-beam light-beam-left" />
                  <div className="light-beam light-beam-right" />
                </div>

                <div
                  className="relative z-10 flex flex-col items-center opacity-0 pointer-events-none"
                >
                  {/* Reference point for layout, hidden but maintains spacing */}
                  <div className="w-[340px] h-[440px]" />
                  {/* Product Stand (Rack) - Now in flow for perfect contact */}
                  <div className="platform-rack mt-[-12px] z-0" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Absolute Footer pinned to bottom of section - bypasses hero-grid constraints */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 md:px-16 pb-8 z-50">
          {/* Left: Mission Text only */}
          <div className="flex flex-col gap-1 select-none">
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">Its a self-taken initiative for others</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30">Inspired by the cause of palestine</p>
          </div>

          {/* Center: Scroll Arrow */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 -translate-x-1/2 opacity-40 cursor-pointer hover:opacity-100 transition-opacity"
          >
            <div className="px-6 py-2 border border-white/20 rounded-full flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-white" />
            </div>
          </motion.div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-6 md:gap-8">
            <Instagram className="w-[18px] h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
            <Twitter className="w-[18px] h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
            <Facebook className="w-[18px] h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
            <Linkedin className="w-[18px] h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
          </div>
        </div>
      </section>

      {/* Section 3: About Us (Redesigned Grid - Flipped) */}
      <section id="about" className="section bg-black px-8 md:px-24 relative overflow-hidden flex items-center justify-center snap-start">

        <div className="relative z-10 w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 items-center">

            {/* Left: Bottle Landing Area */}
            <div className="md:col-span-12 lg:col-span-6 flex justify-center items-center relative h-[380px]">
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
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="md:col-span-12 lg:col-span-6 space-y-6 pt-0"
            >
              <div className="space-y-1">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 40 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="h-[1px] bg-gold"
                />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">The House of RAANAI</h3>
                <div className="w-10 h-[1px] bg-gold" />
                <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] leading-relaxed font-bold">
                  Raanai is a luxury fragrance house renowned for delivering unmatched scent quality through innovative infusions. We blend advanced distillation with architectural design.
                </p>
              </div>

              {/* Minimalist Bullets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                    className="flex items-start gap-3 group"
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
            className="mt-8 flex justify-center"
          >
            <button className="btn-premium-gold px-10 py-3 rounded-full flex items-center gap-3 text-[11px] font-black uppercase tracking-widest group">
              Experience the Scent
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Collection */}
      <section id="collection" className="section bg-black px-12 pb-32 snap-start">
        <div className="relative w-full h-full flex flex-col justify-center items-center">
          {/* Product Carousel Mock */}
          <div className="flex items-center gap-12 w-full justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden md:flex flex-col items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all"
            >
              <span className="text-[10px] uppercase tracking-widest flex items-center gap-2"><ChevronLeft className="w-3 h-3" /> Left</span>
              <div className="w-48 h-64 bg-[#111111] rounded-[3rem] border border-white/5 flex items-center justify-center p-8">
                <Image src="/Pic_1.png" alt="Previous" width={100} height={150} className="object-contain" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              style={{ opacity: collectionBottleOpacity }}
              className="relative z-30"
            >
              <div className="w-80 h-[500px] flex items-center justify-center p-12">
                <Image src="/Pic_1.png" alt="Main Product" width={300} height={400} className="object-contain drop-shadow-[0_30px_60px_rgba(212,175,55,0.3)]" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden md:flex flex-col items-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all"
            >
              <span className="text-[10px] uppercase tracking-widest flex items-center gap-2">Right <ChevronRight className="w-3 h-3" /></span>
              <div className="w-48 h-64 bg-[#111111] rounded-[3rem] border border-white/5 flex items-center justify-center p-8">
                <Image src="/Pic_1.png" alt="Next" width={100} height={150} className="object-contain" />
              </div>
            </motion.div>
          </div>

          {/* Collection Footer */}
          <div className="absolute bottom-0 w-full grid grid-cols-3 items-end">
            <div className="flex justify-start">
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none gold-text">
                7TH OCTOBER<br />COLLECTION
              </h3>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-8 h-full bg-gold shadow-[0_0_10px_rgba(176,141,87,0.5)]"
                />
              </div>
              <div className="flex gap-4 text-[11px] uppercase tracking-[0.3em] font-black">
                <span className="text-gold cursor-pointer">01</span>
                <span className="text-white/20 cursor-pointer hover:text-white/40 transition-colors">02</span>
                <span className="text-white/20 cursor-pointer hover:text-white/40 transition-colors">03</span>
                <span className="text-white/20 cursor-pointer hover:text-white/40 transition-colors">04</span>
                <span className="text-white/20 cursor-pointer hover:text-white/40 transition-colors">05</span>
              </div>
            </div>

            <div className="flex justify-end gap-6 text-[10px] uppercase tracking-[0.4em] text-white/30 font-black pb-2">
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
