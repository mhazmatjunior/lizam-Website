'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    currency?: string;
  };
}

type Step = 'details' | 'processing';

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setIsSubmitting(false);
      setErrors({});
      setForm({ name: '', email: '', phone: '', address: '' });
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // Step 1: Save order details
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          product: product.name,
          amount: product.price,
          currency: product.currency || 'PKR',
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error);

      const orderId = orderData.orderId;

      // Step 2: Create Safepay checkout session
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price,
          currency: product.currency || 'PKR',
          orderId,
        }),
      });

      const contentType = checkoutRes.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Server error: Check API route.');
      }

      const checkoutData = await checkoutRes.json();
      if (!checkoutData.url) throw new Error(checkoutData.error || 'Could not create checkout session');

      // Step 3: Show processing screen, then redirect
      setStep('processing');
      
      setTimeout(() => {
        window.location.href = checkoutData.url;
      }, 1800);

    } catch (error: any) {
      console.error('Checkout Error:', error);
      setErrors({ general: error.message || 'Something went wrong. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/50 transition-colors`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={(e) => { if (e.target === e.currentTarget && step !== 'processing') onClose(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full md:max-w-lg bg-[#0a0a0a] border border-white/8 md:rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
            style={{ maxHeight: '95dvh', overflowY: 'auto' }}
          >
            
            {/* Gold top line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent" />

            {/* --- STEP: DETAILS --- */}
            <AnimatePresence mode="wait">
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 md:p-8"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-gold text-[10px] uppercase tracking-[0.3em] font-black mb-1">Pre Order Now</p>
                      <h2 className="text-white text-lg md:text-xl font-black uppercase tracking-widest">Your Details</h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/30 hover:text-white transition-colors p-1 -mr-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white/3 border border-white/6 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Product</p>
                      <p className="text-white text-sm font-bold uppercase tracking-wider">{product.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Booking Amount</p>
                      <p className="text-gold font-black text-lg">PKR {product.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={form.name}
                          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          className={`${inputClass('name')} pl-10`}
                        />
                      </div>
                      {errors.name && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={form.email}
                          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                          className={`${inputClass('email')} pl-10`}
                        />
                      </div>
                      {errors.email && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="tel"
                          placeholder="Phone Number (e.g. +923001234567)"
                          value={form.phone}
                          onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                          className={`${inputClass('phone')} pl-10`}
                        />
                      </div>
                      {errors.phone && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.phone}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-white/30" />
                        <textarea
                          placeholder="Delivery Address"
                          rows={2}
                          value={form.address}
                          onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                          className={`${inputClass('address')} pl-10 resize-none`}
                        />
                      </div>
                      {errors.address && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.address}</p>}
                    </div>

                    {/* General Error */}
                    {errors.general && (
                      <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                        {errors.general}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full btn-premium-gold py-4 rounded-xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest mt-2 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Proceed to Payment
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Trust Badge */}
                    <div className="flex items-center justify-center gap-2 text-white/25 text-[10px] uppercase tracking-widest pt-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Secured by Safepay
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- STEP: PROCESSING --- */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[320px] gap-6"
                >
                  {/* Animated gold ring */}
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-[6px] rounded-full bg-gold/5 flex items-center justify-center">
                      <ShieldCheck className="w-7 h-7 text-gold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-black uppercase tracking-widest text-lg">Order Confirmed</h3>
                    <p className="text-white/40 text-xs uppercase tracking-[0.2em]">Redirecting to secure payment...</p>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gold"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Gold bottom line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
