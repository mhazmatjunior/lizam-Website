"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, ShoppingBag, Volume2, VolumeX, Star, ArrowDown } from "lucide-react";
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

  // Pre-Order Product
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
            <div className="absolute inset-0 bg-gradient-to-r from-black-pure/70 via-black-pure/40 to-transparent md:from-black-pure/60 md:via-black-pure/20 md:to-transparent" />
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
            
            {/* Navigation links */}
            <nav className="hidden md:flex justify-center gap-10 lg:gap-14 text-[11px] uppercase tracking-[0.3em] font-semibold text-white/60">
              <a href="#home" className="hover:text-gold transition-colors text-white">Home</a>
              <a href="#about" className="hover:text-gold transition-colors">About</a>
              <a href="#video-section" className="hover:text-gold transition-colors">Experience</a>
              <a href="#testimonials" className="hover:text-gold transition-colors">Testimonials</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-5">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-white/[0.03] border border-white/10 rounded-[8px] hover:border-gold/50 transition-all group"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-4 h-4 text-white/70 group-hover:text-gold transition-colors" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-gold text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(226,187,97,0.5)]">
                    {itemsCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="btn-premium-gold text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-extrabold px-6 md:px-8 py-2.5 rounded-[8px] whitespace-nowrap inline-block transition-all"
              >
                Pre Order Now
              </button>
            </div>
          </header>

          {/* Hero Content (Left-Aligned, Vertically Centered) */}
          <div className="flex-grow flex flex-col justify-center items-start text-left max-w-7xl mx-auto w-full px-6 md:px-16 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex flex-col items-start space-y-1 md:space-y-2 max-w-xl md:max-w-2xl"
            >
              {/* Quietly Distinct Serif Typography */}
              <h1 className="font-kalieb text-gold text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] select-none drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                <span className="block">Quietly</span>
                <span className="block mt-1">Distinct</span>
              </h1>

              {/* Tagline & Divider */}
              <div className="mt-8 flex flex-col items-start">
                <p className="text-white/95 text-[11px] sm:text-xs md:text-sm font-medium uppercase tracking-[0.25em] max-w-md leading-relaxed drop-shadow-md">
                  A Refined Fragrance Designed For Everyday Presence
                </p>
                {/* Elegant underline matching the PDF design */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "160px" }}
                  transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                  className="h-[1.5px] bg-[#e2bb61] mt-3"
                />
              </div>
            </motion.div>
          </div>

          {/* Down Indicator */}
          <div className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 z-30 hidden md:block">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="cursor-pointer"
              onClick={() => {
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="w-10 h-10 border border-gold/40 rounded-[8px] flex items-center justify-center bg-black/30 backdrop-blur-sm hover:border-gold transition-colors">
                <ArrowDown className="w-4 h-4 text-gold" />
              </div>
            </motion.div>
          </div>

          {/* Wave Divider to Section 2 (Black) */}
          <WaveDivider fillColor="fill-black-pure" />
        </section>

        {/* Section 2: One Fragrance. Carefully Made. */}
        <section id="about" className="section relative min-h-[100dvh] h-auto md:h-[100dvh] md:snap-start flex flex-col justify-between py-16 md:py-0 overflow-hidden bg-black-pure">
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Subtle central glow */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle 50% 50% at 50% 50%, rgba(226, 187, 97, 0.03) 0%, transparent 100%)'
            }} />
          </div>

          <div className="flex-grow flex items-center justify-center w-full max-w-7xl mx-auto px-6 md:px-16 relative z-10 py-8 md:py-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center w-full">
              {/* Left Column: Image of Woman holding the bottle */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="md:col-span-6 flex justify-center items-center"
              >
                <div className="relative w-full max-w-[360px] md:max-w-[420px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-zinc-950">
                  <Image
                    src="/theme-image2.jpeg"
                    alt="One Fragrance Carefully Made"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </motion.div>

              {/* Right Column: Title and Content */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="md:col-span-6 flex flex-col items-start space-y-4 md:space-y-6 text-left"
              >
                <div className="space-y-1">
                  <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
                    One Fragrance.
                  </h2>
                  <h3 className="font-kalieb text-gold text-4xl sm:text-5xl md:text-6xl font-light leading-tight">
                    Carefully Made.
                  </h3>
                </div>
                
                <p className="text-white/80 text-sm md:text-base font-normal leading-relaxed max-w-md">
                  We Focused On Creating One Scent That Fits Every Moment — Whether It’s A Normal Day Or Something Important.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Wave Divider to Section 3 (Cream Fabric) */}
          <WaveDivider fillColor="fill-[#f3e8d2]" />
        </section>

        {/* Section 3: Designed to Feel Right (Video Section) */}
        <section id="video-section" className="section relative min-h-[100dvh] h-auto md:h-[100dvh] md:snap-start flex flex-col justify-between py-16 md:py-0 overflow-hidden bg-[#f3e8d2]">
          {/* Background cream fabric texture */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <Image
              src="/theme-image3.png"
              alt="Cream fabric texture"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-100"
            />
            <div className="absolute inset-0 bg-[#f3e8d2]/40 mix-blend-multiply" />
          </div>

          <div className="flex-grow flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 md:px-16 relative z-10 py-12 md:py-0">
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0 }}
              className="flex items-center gap-3 md:gap-5 mb-8 md:mb-12"
            >
              <div className="w-8 md:w-16 h-[1px] bg-[#766235]" />
              <h2 className="font-kalieb text-[#766235] text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-center">
                Designed to Feel Right
              </h2>
              <div className="w-8 md:w-16 h-[1px] bg-[#766235]" />
            </motion.div>

            {/* Video Container with Elegant Double Gold Border */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full max-w-[640px] aspect-video border-[3px] border-[#e2bb61] p-1.5 bg-[#f3e8d2]/20 rounded-lg shadow-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 border border-[#766235]/40 rounded z-10 pointer-events-none" />
              <video
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover rounded"
              >
                <source src={isMobile ? "/Raanae Masterpiece Mob.mp4" : "/Raanae Masterpiece.mp4"} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Sound Toggle Overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute bottom-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 border border-white/10 rounded-[8px] z-30 transition-all group"
                aria-label={isMuted ? "Unmute Video" : "Mute Video"}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/90 group-hover:text-gold transition-colors" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gold" />
                )}
              </button>
            </motion.div>
          </div>

          {/* Wave Divider to Section 4 (Black) */}
          <WaveDivider fillColor="fill-black-pure" />
        </section>

        {/* Section 4: What People Say */}
        <section id="testimonials" className="section relative min-h-[100dvh] h-auto md:h-[100dvh] md:snap-start flex flex-col justify-between py-16 md:py-0 overflow-hidden bg-black-pure">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle 60% 60% at 50% 40%, rgba(226, 187, 97, 0.02) 0%, transparent 100%)'
            }} />
          </div>

          <div className="flex-grow flex flex-col justify-center items-center w-full max-w-7xl mx-auto px-6 md:px-16 relative z-10 py-10 md:py-0">
            {/* Header */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-kalieb text-white text-3xl sm:text-4xl md:text-5xl text-center mb-10 md:mb-16"
            >
              What People Say
            </motion.h2>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
              {[
                {
                  quote: "A scent that lingers beautifully all day. I get compliments everywhere I go. Absolute luxury.",
                  author: "Sarah K.",
                  role: "Verified Buyer"
                },
                {
                  quote: "Perfect balance of depth and freshness. It really does fit every moment. Quietly distinct indeed!",
                  author: "Zayd M.",
                  role: "Verified Buyer"
                },
                {
                  quote: "The purpose behind the fragrance makes it even more special. The design, the bottle, the smell—all 10/10.",
                  author: "Layla H.",
                  role: "Verified Buyer"
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.2, ease: "easeOut" }}
                  className="bg-white/[0.02] border border-white/5 hover:border-gold/20 p-6 md:p-8 rounded-xl flex flex-col justify-between space-y-6 shadow-xl backdrop-blur-sm transition-all group duration-500"
                >
                  {/* Star rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold stroke-gold" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-white/80 text-sm md:text-base leading-relaxed italic">
                    "{item.quote}"
                  </p>
                  {/* Author */}
                  <div className="border-t border-white/10 pt-4 flex flex-col">
                    <span className="text-white font-bold text-xs md:text-sm">{item.author}</span>
                    <span className="text-gold text-[10px] md:text-xs tracking-wider uppercase font-semibold">{item.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Linear gradient fade down into Section 5 Cave */}
          <div className="w-full h-[60px] bg-gradient-to-b from-black-pure to-transparent relative z-20" />
        </section>

        {/* Section 5: More Than a Fragrance */}
        <section className="section relative min-h-[100dvh] h-auto md:h-[100dvh] md:snap-start flex flex-col justify-between overflow-hidden bg-black-pure">
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
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black-pure to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black-pure/80 to-transparent" />
          </div>

          {/* Top Info Text */}
          <div className="relative z-20 flex flex-col items-center text-center mt-12 md:mt-20 px-6">
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-white/90 text-[11px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.2em] italic"
            >
              First Release — Limited quantity available
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gold text-[11px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.2em] italic mt-1"
            >
              Restock will take time
            </motion.p>
          </div>

          {/* Centered Box Frame Overlay */}
          <div className="flex-grow flex items-center justify-center px-6 relative z-20 py-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full max-w-[500px] border-[1.5px] border-[#e2bb61]/40 px-6 py-8 md:px-10 md:py-12 bg-black-pure/55 backdrop-blur-md rounded-lg shadow-2xl flex flex-col items-center text-center space-y-4 md:space-y-6"
            >
              <h3 className="font-kalieb text-gold text-2xl sm:text-3xl md:text-4xl leading-tight">
                More Than a Fragrance
              </h3>
              
              <div className="space-y-1.5 text-white/90 text-xs sm:text-sm md:text-base font-normal tracking-wide leading-relaxed">
                <p>A part of every purchase supports</p>
                <p>meaningful initiatives.</p>
                <p className="font-semibold text-white">Built with purpose, beyond the product.</p>
              </div>
            </motion.div>
          </div>

          {/* Wave Divider to Section 6 (Cream Fabric) */}
          <WaveDivider fillColor="fill-[#f3e8d2]" />
        </section>

        {/* Section 6: A fragrance you can rely on — every day. */}
        <section className="section relative min-h-[100dvh] h-auto md:h-[100dvh] md:snap-start flex flex-col justify-between py-16 md:py-0 overflow-hidden bg-[#f3e8d2]">
          {/* Background cream fabric texture */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <Image
              src="/theme-image3.png"
              alt="Cream fabric texture background"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-100"
            />
            <div className="absolute inset-0 bg-[#f3e8d2]/30 mix-blend-multiply" />
          </div>

          <div className="flex-grow flex items-center justify-center w-full max-w-7xl mx-auto px-6 md:px-16 relative z-10 py-8 md:py-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center w-full">
              {/* Left Column: Bottle next to box on branches */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="md:col-span-6 flex justify-center items-center"
              >
                <div className="relative w-full max-w-[340px] md:max-w-[400px] aspect-[4/5] rounded-2xl overflow-hidden border border-[#766235]/20 shadow-[0_25px_60px_rgba(0,0,0,0.15)] bg-[#f3e8d2]/30">
                  <Image
                    src="/theme-image5.png"
                    alt="Raanae Fragrance Bottle next to Box"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </motion.div>

              {/* Right Column: Text & Pre-Order Button */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="md:col-span-6 flex flex-col items-start space-y-6 md:space-y-8 text-left"
              >
                {/* Serif Elegant Title */}
                <h2 className="font-kalieb text-[#766235] text-4xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight">
                  <span className="block">A fragrance you</span>
                  <span className="block mt-1">can rely on —</span>
                  <span className="block mt-1 font-semibold text-[#b8892f]">every day.</span>
                </h2>
                
                {/* Action Button styled with exact 8px border radius */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="bg-black-pure text-white text-xs md:text-sm tracking-[0.25em] font-extrabold uppercase px-10 py-4 rounded-[8px] hover:bg-zinc-900 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)] transition-all"
                >
                  Pre-Order Now
                </button>
              </motion.div>
            </div>
          </div>

          {/* Simple Bottom Vignette Fade to end the snaps */}
          <div className="w-full h-[30px] md:h-[60px] bg-gradient-to-t from-black-pure/90 to-transparent relative z-20" />
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
