"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShoppingBag, Mail } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function OrderSuccessPage() {
  const { clearCart } = useCart();

  // Clear the cart on successful landing
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-gold/30 flex items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-12">
        
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="relative inline-block"
        >
          <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-gold shadow-[0_0_20px_#D4AF37]" />
          </div>
          {/* Decorative Rings */}
          <motion.div 
             animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute inset-0 rounded-full border border-gold/30"
          />
        </motion.div>

        {/* Messaging */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gold/60">Order Confirmed</span>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Thank You <br /> For Seeking Us
          </h1>
          <p className="text-white/40 text-[12px] leading-relaxed max-w-sm mx-auto font-medium">
            Your order has been placed into our priority artisan queue. A confirmation email with tracking details will arrive shortly.
          </p>
        </motion.div>

        {/* Steps Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white/40" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Check Inbox</p>
              <p className="text-[8px] text-white/20 uppercase tracking-[0.1em] font-bold">Confirmation sent</p>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-white/40" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Priority List</p>
              <p className="text-[8px] text-white/20 uppercase tracking-[0.1em] font-bold">Preparation started</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="pt-8"
        >
          <Link href="/products">
            <button className="w-full btn-premium-gold py-5 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] group shadow-[0_20px_40px_rgba(212,175,55,0.1)]">
              Continue Exploration
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/" className="block mt-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors">
            Return to Home
          </Link>
        </motion.div>

      </div>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 blur-[120px] rounded-full" />
      </div>
    </main>
  );
}
