"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-[#050505] border-l border-white/5 z-[101] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h2 className="text-xl font-black uppercase tracking-tighter">Your Bag</h2>
                <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors group"
              >
                <X className="w-5 h-5 text-white/50 group-hover:text-white" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <ShoppingBag className="w-12 h-12" />
                  <p className="text-xs uppercase tracking-[0.2em] font-bold">Your bag is empty</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-gold text-[10px] font-bold uppercase tracking-widest hover:underline underline-offset-8"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 h-24 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center p-4 relative shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex-grow space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-tight text-white group-hover:text-gold transition-colors">{item.name}</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{item.category}</p>
                        </div>
                        <p className="text-sm font-black text-gold">Rs {item.price.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-full px-3 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-gold transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-gold transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/20 hover:text-red-500/50 transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-white/[0.01] space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                    <span>Subtotal</span>
                    <span>Rs {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                    <span>Shipping</span>
                    <span className="text-gold">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-lg font-black uppercase tracking-tighter pt-2">
                    <span>Estimate Total</span>
                    <span className="text-gold">Rs {subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <Link href="/checkout" className="w-full">
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="w-full btn-premium-gold py-5 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] group"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                
                <p className="text-[9px] text-center text-white/20 uppercase tracking-widest font-bold">
                  Secure checkout powered by Raanae
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
