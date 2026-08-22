"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  Lock,
  Upload,
  CheckCircle,
  Copy,
  AlertCircle,
  Sparkles,
  Crown,
  Wallet,
  Building
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { decrementStock } = useProducts();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod' | 'founder'>('online');
  const [subMethod, setSubMethod] = useState<'safepay' | 'manual'>('safepay');
  const [manualAccountType, setManualAccountType] = useState<'bank' | 'easypaisa' | 'jazzcash'>('bank');
  
  // Screenshot Upload State
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

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

  const [standardDeliveryFee, setStandardDeliveryFee] = useState<number>(250);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.deliveryFee !== undefined) {
          setStandardDeliveryFee(data.settings.deliveryFee);
        }
      })
      .catch((err) => console.error("Failed to load delivery fee:", err));
  }, []);

  // Calculation Logic
  const codDeliveryFee = paymentMethod === 'cod' ? standardDeliveryFee : 0;
  const founderDeliveryFee = paymentMethod === 'founder' ? 5000 : 0;
  const totalAmount = subtotal + codDeliveryFee + founderDeliveryFee;

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshotFile(file);
    setIsUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();

      if (result.success && result.url) {
        setScreenshotUrl(result.url);
      } else {
        alert(result.error || "Failed to upload image screenshot");
      }
    } catch (err: any) {
      console.error("Upload Error:", err);
      alert("Failed to upload payment screenshot");
    } finally {
      setIsUploading(false);
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

    // City validation for Founder Delivery
    if (paymentMethod === 'founder') {
      const normalizedCity = formData.city.toLowerCase().trim();
      if (normalizedCity !== 'lahore' && normalizedCity !== 'lhr') {
        newErrors.city = "Founder Delivery is currently only available in Lahore.";
      }
    }

    // Manual payment screenshot validation
    if (subMethod === 'manual' && !screenshotUrl) {
      newErrors.screenshot = "Please upload proof of payment screenshot to proceed.";
    }

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

      const calculatedStatus = subMethod === 'manual' ? 'unverified' : (paymentMethod === 'cod' ? 'cashondelivery' : 'pending');
      const backendPaymentMethod = paymentMethod === 'founder' ? 'cod_founder' : (paymentMethod === 'cod' ? 'cod_standard' : 'safepay');

      const tempOrderId = `ORD-${Date.now()}`;

      const orderPayload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        product: productSummary,
        amount: totalAmount,
        currency: 'PKR',
        payment_method: backendPaymentMethod,
        payment_sub_method: subMethod === 'manual' ? manualAccountType : subMethod,
        payment_screenshot: screenshotUrl || null,
        delivery_fee: codDeliveryFee + founderDeliveryFee,
        status: calculatedStatus
      };

      // If choosing Safepay online payment, store pending order details locally and redirect to Safepay portal.
      // Order will ONLY be inserted into DB upon successful payment return.
      if (paymentMethod === 'online' && subMethod === 'safepay') {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`pending_safepay_order_${tempOrderId}`, JSON.stringify(orderPayload));
        }

        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            currency: 'PKR',
            orderId: tempOrderId,
          }),
        });

        const checkoutData = await checkoutRes.json();
        if (!checkoutData.url) throw new Error(checkoutData.error || 'Failed to initialize payment');

        clearCart();
        window.location.href = checkoutData.url;
        return;
      }

      // For Manual Bank Transfer, EasyPaisa, JazzCash, and COD:
      // Create order in Database (Supabase) now that user has explicitly submitted proof/confirmation
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error || 'Failed to save order');

      const orderId = orderData.orderId;

      // Decrement stock in database
      cart.forEach(item => {
        decrementStock(item.id, item.quantity);
      });

      clearCart();
      router.push(`/checkout/success/${orderId}`);
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
                    placeholder="e.g. LAHORE..."
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

            {/* Payment Method Selector */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">3</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Payment Method</h2>
              </div>
              <div className="space-y-4">

                {/* Option 1: Online Payment */}
                <div 
                  onClick={() => setPaymentMethod('online')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex items-center justify-between relative ${paymentMethod === 'online' ? 'bg-[#e2bb61]/5 border-[#e2bb61] shadow-[0_0_20px_rgba(226,187,97,0.05)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'online' ? 'border-[#e2bb61] bg-[#e2bb61]' : 'border-white/20'}`}>
                      {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                        Online Payment (Full Amount)
                        <span className="text-[7px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Free Shipping</span>
                      </h4>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">Safepay Card OR Manual Bank / Easypaisa Transfer</p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Cash on Delivery (COD) */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex items-center justify-between relative ${paymentMethod === 'cod' ? 'bg-[#e2bb61]/5 border-[#e2bb61] shadow-[0_0_20px_rgba(226,187,97,0.05)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-[#e2bb61] bg-[#e2bb61]' : 'border-white/20'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">Cash on Delivery</h4>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">Pay product amount on doorstep (+ Rs {standardDeliveryFee} Delivery fee paid online upfront)</p>
                    </div>
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest bg-white/10 text-white/60 px-2 py-0.5 rounded border border-white/10">+ Rs {standardDeliveryFee} Delivery</span>
                </div>

                {/* Option 3: Founder Delivery */}
                <div 
                  onClick={() => setPaymentMethod('founder')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex items-center justify-between relative ${paymentMethod === 'founder' ? 'bg-gold/10 border-gold shadow-[0_0_25px_rgba(200,164,77,0.1)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'founder' ? 'border-gold bg-gold' : 'border-white/20'}`}>
                      {paymentMethod === 'founder' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-gold flex items-center gap-2">
                        Founder Delivery <Crown className="w-3.5 h-3.5 text-gold" />
                      </h4>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5">Exclusive hand-delivery by RAANAE Founder (Lahore Only)</p>
                    </div>
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest bg-gold text-black px-2 py-0.5 rounded font-black border border-gold">+ Rs 5,000</span>
                </div>

              </div>

              {/* COD Free Shipping Alert Banner */}
              {paymentMethod === 'cod' && (
                <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 flex items-center gap-3 text-[10px] text-gold font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>💡 Tip: Select <strong>Online Payment</strong> to get 100% FREE delivery!</span>
                </div>
              )}

              {/* Founder Delivery City Warning */}
              {paymentMethod === 'founder' && formData.city && formData.city.toLowerCase().trim() !== 'lahore' && formData.city.toLowerCase().trim() !== 'lhr' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-[10px] text-red-400 font-bold uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Founder Delivery is not yet available in your city ({formData.city}). Available in Lahore only.</span>
                </div>
              )}
            </section>

            {/* Sub-Payment Method Details (Safepay Card vs Manual Bank Transfer) */}
            <section className="space-y-6 pt-4 border-t border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Choose How To Complete Payment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setSubMethod('safepay')}
                  className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center gap-3 ${subMethod === 'safepay' ? 'bg-gold/10 border-gold' : 'bg-white/[0.02] border-white/10'}`}
                >
                  <CreditCard className="w-5 h-5 text-gold" />
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white">Credit / Debit Card (Safepay)</h5>
                    <p className="text-[8px] text-white/40 uppercase">Instant Card Checkout</p>
                  </div>
                </div>

                <div 
                  onClick={() => setSubMethod('manual')}
                  className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center gap-3 ${subMethod === 'manual' ? 'bg-gold/10 border-gold' : 'bg-white/[0.02] border-white/10'}`}
                >
                  <Building className="w-5 h-5 text-gold" />
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white">Manual Bank / Wallet Transfer</h5>
                    <p className="text-[8px] text-white/40 uppercase">Bank, EasyPaisa or JazzCash</p>
                  </div>
                </div>
              </div>

              {/* Manual Payment Accounts Box */}
              {subMethod === 'manual' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-[#0c0c0c] border border-gold/20 rounded-2xl p-6 space-y-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <Wallet className="w-5 h-5 text-gold" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-gold">Manual Account Transfer Details</h4>
                      <p className="text-[9px] uppercase text-white/40">Send payment to one of the accounts below & upload receipt screenshot</p>
                    </div>
                  </div>

                  {/* Account Selector Tabs */}
                  <div className="flex gap-2">
                    {[
                      { id: 'bank', label: 'Bank Account' },
                      { id: 'easypaisa', label: 'EasyPaisa' },
                      { id: 'jazzcash', label: 'JazzCash' },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setManualAccountType(acc.id as any)}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${manualAccountType === acc.id ? 'bg-gold text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>

                  {/* Account Details Box */}
                  <div className="bg-black/60 border border-white/5 rounded-xl p-4 space-y-3">
                    {manualAccountType === 'bank' && (
                      <>
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-white/40">Bank Name</span>
                          <span className="text-white">Meezan Bank</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-white/40">Account Title</span>
                          <span className="text-gold font-black">RAANAE PERFUMES LUXURY</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase pt-2 border-t border-white/5">
                          <span className="text-white/40">IBAN / Account #</span>
                          <div className="flex items-center gap-2 font-mono text-gold">
                            <span>PK82 MEZN 0001 0203 0405 0607</span>
                            <button 
                              type="button"
                              onClick={() => copyToClipboard('PK82 MEZN 0001 0203 0405 0607', 'iban')} 
                              className="p-1 hover:text-white"
                            >
                              {copiedText === 'iban' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {manualAccountType === 'easypaisa' && (
                      <>
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-white/40">Account Title</span>
                          <span className="text-gold font-black">RAANAE OFFICIAL</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase pt-2 border-t border-white/5">
                          <span className="text-white/40">EasyPaisa Mobile #</span>
                          <div className="flex items-center gap-2 font-mono text-gold">
                            <span>0300 1234567</span>
                            <button 
                              type="button"
                              onClick={() => copyToClipboard('03001234567', 'ep')} 
                              className="p-1 hover:text-white"
                            >
                              {copiedText === 'ep' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {manualAccountType === 'jazzcash' && (
                      <>
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-white/40">Account Title</span>
                          <span className="text-gold font-black">RAANAE OFFICIAL</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase pt-2 border-t border-white/5">
                          <span className="text-white/40">JazzCash Mobile #</span>
                          <div className="flex items-center gap-2 font-mono text-gold">
                            <span>0300 1234567</span>
                            <button 
                              type="button"
                              onClick={() => copyToClipboard('03001234567', 'jc')} 
                              className="p-1 hover:text-white"
                            >
                              {copiedText === 'jc' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Upload Screenshot File Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gold uppercase tracking-widest font-black block">Upload Payment Screenshot / Receipt</label>
                    <div className="relative border-2 border-dashed border-white/20 hover:border-gold/50 rounded-xl p-6 text-center transition-all bg-black/40">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-6 h-6 text-gold animate-spin" />
                            <span className="text-[10px] text-gold font-bold uppercase">Processing Image...</span>
                          </>
                        ) : screenshotUrl ? (
                          <div className="flex items-center gap-3 text-emerald-400 text-[11px] font-bold uppercase">
                            <CheckCircle className="w-5 h-5" />
                            Screenshot Uploaded & Verified!
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-white/40" />
                            <span className="text-[10px] text-white/60 font-bold uppercase">Click or Drag Screenshot Here</span>
                            <span className="text-[8px] text-white/30 uppercase">JPG, PNG, WebP Supported</span>
                          </>
                        )}
                      </div>
                    </div>
                    {errors.screenshot && <span className="text-[9px] text-red-500 font-bold ml-1 block mt-1">{errors.screenshot}</span>}
                  </div>

                  <p className="text-[9px] text-white/40 uppercase tracking-wider italic">
                    ℹ️ Note: Your order will be placed with status <strong className="text-gold">UNVERIFIED</strong>. You will receive an email once our admin verifies your payment screenshot.
                  </p>
                </motion.div>
              )}
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

                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/60 font-bold">
                    <span>COD Delivery Fee (Upfront)</span>
                    <span className="text-gold">Rs 250</span>
                  </div>
                )}

                {paymentMethod === 'founder' && (
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#e2bb61] font-bold">
                    <span>Founder Delivery Fee</span>
                    <span>Rs 5,000</span>
                  </div>
                )}

                <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  <span>Shipping</span>
                  <span className="text-gold">{paymentMethod === 'online' ? 'FREE (ONLINE PROMO)' : 'STANDARD'}</span>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-black uppercase tracking-widest">Total Amount</span>
                  <span className="text-xl font-black text-gold underline underline-offset-8 decoration-gold/30">Rs {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-white/30">
                  <ShieldCheck className="w-4 h-4 text-green-500/50" />
                  100% Encrypted & Authenticated Order
                </div>
                <div className="flex items-center gap-3 text-[9px] uppercase tracking-widest font-bold text-white/30">
                  <Truck className="w-4 h-4 text-gold/50" />
                  Priority Dispatch Guarantee
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full btn-premium-gold py-5 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] mt-10 group shadow-[0_20px_40px_rgba(200,164,77,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    Processing Payment...
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  </>
                ) : (
                  <>
                    {subMethod === 'safepay' ? 'Proceed to Safepay' : 'Submit Manual Order'}
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
