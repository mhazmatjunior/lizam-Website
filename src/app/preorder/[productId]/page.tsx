"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, Check, Loader2, AlertCircle, Package } from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { type Product } from "@/data/products";
import SiteFooter from "@/app/components/SiteFooter";
import ManualPaymentPanel, { type ManualMethod } from "@/app/components/ManualPaymentPanel";

const inputCls =
  "w-full bg-white/[0.02] border border-white/10 focus:border-gold/30 rounded-xl px-4 py-3 text-xs text-white outline-none font-medium tracking-wide";

/**
 * Pre-order checkout: deposit only.
 *
 * Deliberately separate from /checkout. A pre-order is one product, paid in two
 * instalments, with no delivery charge at this stage — folding that into the
 * cart checkout would mean every total, fee and order record there had to know
 * about deposits.
 */
export default function PreorderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, isLoading } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  const [method, setMethod] = useState<ManualMethod>("bank");
  const [proofUrl, setProofUrl] = useState("");
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    const id = Number(params.productId);
    const found = products.find((p) => p.id === id);
    if (!found) {
      router.replace("/products");
      return;
    }
    setProduct(found);

    const qty = Number(searchParams.get("qty"));
    if (Number.isFinite(qty) && qty > 0 && qty <= 100) setQuantity(Math.floor(qty));
  }, [isLoading, products, params.productId, searchParams, router]);

  if (isLoading || !product) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
      </main>
    );
  }

  const depositUnit = Number(product.preorderAmount || 0);
  const isPreorder =
    Boolean(product.preorderEnabled) && depositUnit > 0 && depositUnit < product.price;

  // Someone can reach this URL directly for a product that is not on pre-order,
  // or whose deposit was cleared in the admin after the link was shared.
  if (!isPreorder) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-8">
        <div className="max-w-md text-center space-y-5">
          <AlertCircle className="w-8 h-8 text-white/20 mx-auto" />
          <h1 className="text-2xl font-black uppercase tracking-tight">Not Available For Pre-Order</h1>
          <p className="text-xs text-white/40 leading-relaxed">
            {product.name} is not currently open for pre-order. It may be available to buy outright.
          </p>
          <Link
            href={`/products/${product.id}`}
            className="inline-block btn-premium-gold px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
          >
            View Product
          </Link>
        </div>
      </main>
    );
  }

  const total = product.price * quantity;
  const deposit = depositUnit * quantity;
  const balance = total - deposit;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Your name is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (form.phone.trim().length < 10) next.phone = "Enter a valid phone number";
    if (form.address.trim().length < 10) next.address = "Enter your full delivery address";
    if (!proofUrl) next.proof = "Upload proof of your deposit transfer";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) {
      document.querySelector("[data-payment-proof]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Only the product id and quantity are sent. The server prices the
      // pre-order from the products table.
      const res = await fetch("/api/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          depositMethod: method,
          depositProofUrl: proofUrl,
          depositReference: reference.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place your pre-order");
      setPlaced(data.preorderId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placed) {
    return (
      <main className="min-h-screen bg-black text-white font-sans">
        <div className="max-w-2xl mx-auto px-8 py-24 text-center space-y-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-emerald-400" strokeWidth={3} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black uppercase tracking-tight">Pre-Order Placed</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gold">{placed}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 text-left space-y-4 text-xs text-white/60 leading-relaxed">
            <p>
              Thank you. We have your deposit receipt for{" "}
              <strong className="text-white">{product.name} &times; {quantity}</strong> and a confirmation
              email is on its way to <strong className="text-white">{form.email}</strong>.
            </p>
            <p>
              Once we verify your transfer your reservation is confirmed. When your fragrance is ready to
              dispatch we will email you a secure link to pay the remaining{" "}
              <strong className="text-white">Rs {balance.toLocaleString()}</strong> plus delivery.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block btn-premium-gold px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Continue Browsing
          </Link>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-gold/30">
      <header className="px-8 md:px-24 py-6 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-xl z-50 border-b border-white/5">
        <Link
          href={`/products/${product.id}`}
          className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] font-black"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Pre-Order
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">Reserve Yours</h1>
        <p className="text-xs text-white/40 mb-12 max-w-xl leading-relaxed">
          Pay a deposit today to secure your bottle. The balance and delivery are settled later through a
          secure link we email you when it is ready to dispatch.
        </p>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div className="space-y-10">
            {/* Customer details -------------------------------------------- */}
            <section className="space-y-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Your Details</h2>

              <div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full Name"
                  className={inputCls}
                />
                {errors.name && <p className="text-[10px] text-rose-400 mt-1.5">{errors.name}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email Address"
                    className={inputCls}
                  />
                  {errors.email && <p className="text-[10px] text-rose-400 mt-1.5">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone Number"
                    className={inputCls}
                  />
                  {errors.phone && <p className="text-[10px] text-rose-400 mt-1.5">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Full Delivery Address"
                  rows={3}
                  className={`${inputCls} resize-none leading-relaxed`}
                />
                {errors.address && <p className="text-[10px] text-rose-400 mt-1.5">{errors.address}</p>}
              </div>

              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                className={inputCls}
              />
            </section>

            {/* Deposit payment --------------------------------------------- */}
            <section className="space-y-5 pt-8 border-t border-white/5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white/80">
                Pay Your Deposit
              </h2>
              <ManualPaymentPanel
                amount={deposit}
                label="Deposit To Transfer"
                method={method}
                onMethodChange={setMethod}
                proofUrl={proofUrl}
                onProofChange={(url) => {
                  setProofUrl(url);
                  if (url) setErrors((prev) => ({ ...prev, proof: "" }));
                }}
                reference={reference}
                onReferenceChange={setReference}
              />
              {errors.proof && <p className="text-[10px] text-rose-400">{errors.proof}</p>}
            </section>
          </div>

          {/* Summary ------------------------------------------------------- */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/10 rounded-3xl p-7 space-y-6 lg:sticky lg:top-28"
          >
            <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Your Pre-Order</h2>

            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 relative">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <Package className="w-5 h-5 text-white/20 m-auto" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider text-white truncate">
                  {product.name}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Rs {product.price.toLocaleString()} each
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">
                Quantity
              </span>
              <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 hover:text-gold transition-colors"
                >
                  &minus;
                </button>
                <span className="w-8 text-center text-xs font-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  className="w-9 h-9 hover:text-gold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-5 border-t border-white/10 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Product Total</span>
                <span className="text-white/80 font-bold">Rs {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gold">
                <span className="font-bold">Deposit Due Now</span>
                <span className="font-black">Rs {deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Balance Later</span>
                <span>Rs {balance.toLocaleString()}</span>
              </div>
              <p className="text-[9px] text-white/25 leading-relaxed pt-2">
                Delivery charges are added to the balance, not to this deposit.
              </p>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-rose-300 leading-relaxed">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-premium-gold h-14 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Pre-Order…
                </>
              ) : (
                <>Confirm Pre-Order &mdash; Rs {deposit.toLocaleString()}</>
              )}
            </button>
          </motion.aside>
        </form>
      </div>

      <SiteFooter />
    </main>
  );
}
