"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Linkedin, ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";

export default function Home() {
  return (
    <main className="bg-black text-white selection:bg-gold selection:text-black">
      {/* Section 1: Hero */}
      <section className="section devialet-bg overflow-hidden relative h-screen snap-start">
        <div className="absolute inset-0 hero-grid px-8 md:px-16 py-10">
          {/* Row 1: Navbar */}
          <header className="flex justify-between items-start z-50">
            <div className="text-xl font-bold tracking-tighter">7TH OCTOBER</div>
            <nav className="hidden md:flex gap-12 text-[10px] uppercase tracking-[0.3em] font-medium text-white/50 pt-2">
              <a href="#home" className="hover:text-gold transition-colors text-white">Home</a>
              <a href="#about" className="hover:text-gold transition-colors">About</a>
              <a href="#collection" className="hover:text-gold transition-colors">Collection</a>
            </nav>
            <button className="btn-premium-gold text-[10px] uppercase tracking-[0.3em] font-extrabold px-8 py-2.5 rounded-full">
              Buy Now
            </button>
          </header>

          {/* Row 2: Body (Two Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full h-full relative mt-[-20px]">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="z-10"
            >
              <h1 className="text-[9vw] huge-title-solid select-none tracking-[-0.04em]">
                7TH<br />OCTOBER
              </h1>
              <div className="mt-6 flex items-center gap-6">
                <div className="w-12 h-[1px] bg-gold" />
                <p className="text-gold text-xs uppercase tracking-[0.5em] font-light">Elevate the Essence</p>
              </div>
            </motion.div>

            <div className="relative flex justify-center items-center h-full">
              {/* Enhanced Spotlight Effect - Centered */}
              <div className="absolute spotlight-bg w-[700px] h-[700px] rounded-full z-0 opacity-80" />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.2 }}
                className="relative z-10 flex flex-col items-center"
              >
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    rotateZ: [-3, 3, -3],
                    filter: [
                      "brightness(1) contrast(1)",
                      "brightness(1.1) contrast(1.05)",
                      "brightness(1) contrast(1)"
                    ]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10"
                >
                  <Image
                    src="/Pic_1_Transparent.png"
                    alt="7th October Bottle"
                    width={340}
                    height={440}
                    className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                    priority
                  />
                </motion.div>
                {/* Product Stand (Rack) - Now in flow for perfect contact */}
                <div className="platform-rack mt-[-12px] z-0" />
              </motion.div>
            </div>
          </div>

          {/* Row 3: Footer */}
          <footer className="grid grid-cols-1 md:grid-cols-3 items-center w-full z-50 gap-8 md:gap-0">
            {/* Left: Brand Statement */}
            <div className="max-w-[320px]">
              <p className="text-[14px] text-white/40 leading-relaxed font-normal tracking-wide">
                Get your scent fit. Where luxury meets artisanal euphoria with 7th October.
              </p>
            </div>

            {/* Center: Scroll Indicator */}
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="opacity-40 cursor-pointer"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="px-6 py-2 border border-white/20 rounded-full hover:border-white/50 transition-colors">
                  <ArrowDown className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Right: Social Icons - Width matched to header button */}
            <div className="flex justify-between items-center w-[140px] ml-auto">
              <Instagram className="w-[18px] h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
              <Twitter className="w-[18px] h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
              <Facebook className="w-[18px] h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
              <Linkedin className="w-[18px] h-[18px] text-white/40 hover:text-gold cursor-pointer transition-colors" />
            </div>
          </footer>
        </div>
      </section>

      {/* Section 2: About Us */}
      <section id="about" className="section bg-black px-12 md:px-32">
        <div className="w-full max-w-6xl space-y-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">About Us</h2>
            <p className="text-gold text-[10px] uppercase tracking-[0.4em]">Scent in its purest state.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-sm text-white/40 leading-relaxed font-light">
            <p>
              7th October is a luxury fragrance house renowned for delivering unmatched scent quality through innovative infusions like the Obsidian series. Founded in 2024, the brand blends advanced distillation and elegant design to create an exceptional olfactory experience.
            </p>
            <p>
              We are recognized for our premium products and captivating aesthetics, earning acclaim for the unique fusion of superior aromatic quality and appealing design. As a leader in the luxury niche industry, the brand continues to combine top-tier scent technology with beautiful design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gallery-grid h-64">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden relative group">
              <Image src="/Pic_1.png" alt="Process" fill className="object-cover opacity-50 group-hover:opacity-100 transition-all" />
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden relative group">
              <Image src="/Pic_1.png" alt="Workshop" fill className="object-cover opacity-50 group-hover:opacity-100 transition-all" />
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden relative group">
              <Image src="/Pic_1.png" alt="Showroom" fill className="object-cover opacity-50 group-hover:opacity-100 transition-all" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Collection */}
      <section id="collection" className="section bg-black px-12 pb-32">
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
              className="relative z-30"
            >
              <div className="w-80 h-[500px] flex items-center justify-center p-12">
                <Image src="/Pic_1.png" alt="Main Product" width={300} height={400} className="object-contain drop-shadow-[0_30px_60px_rgba(207,181,59,0.2)]" />
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
          <div className="absolute bottom-0 w-full flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">7TH OCTOBER<br />COLLECTION</h3>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-40 h-[1px] bg-white/10 relative">
                <div className="absolute top-0 left-0 w-8 h-full bg-gold" />
              </div>
              <div className="flex gap-4 text-[10px] uppercase tracking-[0.2em] font-bold">
                <span className="text-gold">01</span>
                <span className="text-white/20">02</span>
                <span className="text-white/20">03</span>
                <span className="text-white/20">04</span>
                <span className="text-white/20">05</span>
              </div>
            </div>

            <div className="flex gap-6 text-[8px] uppercase tracking-widest text-white/30 font-bold">
              <span>T&P</span>
              <span>PR</span>
              <span>TQ</span>
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
