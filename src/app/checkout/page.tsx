"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag, ShieldCheck, Truck, CreditCard, ArrowRight, Loader2, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { decrementStock } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Pakistan",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP/Postal code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`;
      const productSummary = cart.map(item => `${item.name} x${item.quantity}`).join(', ');

      // 1. Create order in Database (Supabase)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: fullAddress,
          product: productSummary,
          amount: subtotal,
          currency: 'PKR',
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to save order');

      const orderId = orderData.orderId;

      // 2. Decrement stock in database for each item in cart
      cart.forEach(item => {
        decrementStock(item.id, item.quantity);
      });

      // 3. Create Safepay checkout session
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: subtotal,
          currency: 'PKR',
          orderId,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutData.url) throw new Error(checkoutData.error || 'Failed to initialize payment');

      // 4. Clear client cart
      clearCart();

      // 5. Redirect to Safepay Checkout URL
      window.location.href = checkoutData.url;
    } catch (err: any) {
      console.error('❌ Checkout placement failed:', err.message);
      alert(`Checkout failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-gold/30 pb-20">
      {/* Header */}
      <header className="px-8 md:px-24 py-10 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/products"
            className="group flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.3em] font-bold"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>
          <div className="text-xl font-bold tracking-tighter">RAANAE</div>
          <div className="w-24 md:w-32 flex justify-end">
             <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold hidden md:block">Secure Checkout</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 md:px-24 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Checkout Form */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Contact Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">1</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Contact Information</h2>
              </div>
              <div className="space-y-4">
                <div className="relative group">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-2 block ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ENTER YOUR EMAIL..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all placeholder:text-white/20 ${errors.email ? 'border-red-500/50' : 'border-white/10'}`}
                    required
                  />
                  {errors.email && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.email}</span>}
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">2</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Shipping Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="RECEIVER NAME..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.fullName ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.fullName && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.fullName}</span>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="HOUSE NO, STREET..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.address ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.address && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.address}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="CITY..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.city ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.city && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.city}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="STATE..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.state ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.state && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.state}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="POSTCODE..."
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.zipCode ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.zipCode && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.zipCode}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1 block ml-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className={`w-full bg-white/[0.03] border rounded-xl py-4 px-6 text-[11px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all ${errors.phone ? 'border-red-500/50' : 'border-white/10'}`}
                  />
                  {errors.phone && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.phone}</span>}
                </div>
              </div>
            </section>

            {/* Payment Gateway */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">3</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Payment Method</h2>
              </div>
              <div className="bg-white/[0.02] border border-[#e2bb61]/30 rounded-2xl p-6 flex items-center justify-between relative shadow-[0_0_15px_rgba(226,187,97,0.03)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e2bb61]/10 flex items-center justify-center border border-[#e2bb61]/20">
                    <ShieldCheck className="w-5 h-5 text-[#e2bb61]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Safepay Payment Gateway</h4>
                    <p className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">Secure Credit/Debit Cards & Mobile Wallets</p>
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest bg-[#e2bb61]/10 text-[#e2bb61] px-2.5 py-1 rounded border border-[#e2bb61]/20">Active</span>
                <div className="absolute inset-0 bg-[#e2bb61]/5 blur-2xl opacity-10 -z-10" />
              </div>
            </section>

          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 pr-1">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 sticky top-[120px] h-fit self-start shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-tight">Your Order</h2>
                <ShoppingBag className="w-5 h-5 text-gold" />
              </div>

              {/* Product List */}
              <div className="space-y-6 mb-8 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center p-2 relative shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-[10px] font-black uppercase tracking-tight text-white">{item.name}</h3>
                      <p className="text-[9px] text-white/30 uppercase tracking-[0.1em]">{item.category} x {item.quantity}</p>
                    </div>
                    <p className="text-[10px] font-black text-gold">Rs {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Calculation */}
              <div className="space-y-4 border-t border-white/5 pt-8">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  <span>Subtotal</span>
                  <span>Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  <span>Shipping</span>
                  <span className="text-gold">FREE (PREMIUM)</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  <span>Taxes</span>
                  <span>Rs 0.00</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-black uppercase tracking-widest">Total Amount</span>
                  <span className="text-xl font-black text-gold underline underline-offset-8 decoration-gold/30">Rs {subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-white/30">
                  <ShieldCheck className="w-4 h-4 text-green-500/50" />
                  Secure Transaction
                </div>
                <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-white/30">
                  <Truck className="w-4 h-4 text-gold/50" />
                  White-Glove Priority Shipping
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full btn-premium-gold py-5 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] mt-10 group shadow-[0_20px_40px_rgba(200, 164, 77,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    Processing Payment...
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
