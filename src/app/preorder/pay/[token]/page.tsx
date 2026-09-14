"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Loader2, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import SiteFooter from "@/app/components/SiteFooter";
import ManualPaymentPanel, { type ManualMethod } from "@/app/components/ManualPaymentPanel";

interface BalancePreorder {
  preorderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  depositPaid: number;
  deliveryFee: number;
  balanceAmount: number;
  status: string;
  alreadySubmitted: boolean;
}

/**
 * Balance checkout, reached only through the unique link emailed to the
 * customer. The token in the URL is the sole credential, so nothing is looked
 * up or shown until the server has validated it.
 */
export default function BalancePaymentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [preorder, setPreorder] = useState<BalancePreorder | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [method, setMethod] = useState<ManualMethod>("bank");
  const [proofUrl, setProofUrl] = useState("");
  const [reference, setReference] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/preorders/pay/${token}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(data.error || "This payment link is not valid");
        } else {
          setPreorder(data.preorder);
          if (data.preorder.alreadySubmitted) setDone(true);
        }
      } catch {
        if (!cancelled) setLoadError("Could not load your pre-order. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!proofUrl) {
      setSubmitError("Upload proof of your transfer to continue.");
      document.querySelector("[data-payment-proof]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/preorders/pay/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balanceMethod: method,
          balanceProofUrl: proofUrl,
          balanceReference: reference.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your payment");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
      </main>
    );
  }

  if (loadError || !preorder) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-8">
        <div className="max-w-md text-center space-y-5">
          <AlertCircle className="w-8 h-8 text-white/20 mx-auto" />
          <h1 className="text-2xl font-black uppercase tracking-tight">Link Not Valid</h1>
          <p className="text-xs text-white/40 leading-relaxed">{loadError}</p>
          <Link
            href="/contact"
            className="inline-block btn-premium-gold px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Contact Us
          </Link>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-black text-white font-sans">
        <div className="max-w-2xl mx-auto px-8 py-24 text-center space-y-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-emerald-400" strokeWidth={3} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black uppercase tracking-tight">Payment Received</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gold">
              {preorder.preorderId}
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 text-xs text-white/60 leading-relaxed">
            <p>
              Thank you, {preorder.name}. We have your receipt for the remaining balance on{" "}
              <strong className="text-white">
                {preorder.productName} &times; {preorder.quantity}
              </strong>
              . Once verified, your order is confirmed and released for dispatch &mdash; we will email you
              to confirm.
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
      <header className="px-8 md:px-24 py-6 flex items-center justify-between border-b border-white/5">
        <span className="text-2xl font-black tracking-tighter">RAANAE</span>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Balance Payment
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3">
          Complete Your Pre-Order
        </h1>
        <p className="text-xs text-white/40 mb-12 max-w-xl leading-relaxed">
          Hello {preorder.name} — your pre-order{" "}
          <span className="text-gold font-bold">{preorder.preorderId}</span> is ready. Settle the
          remaining balance below and we will release it for dispatch.
        </p>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <section className="space-y-5">
            <h2 className="text-sm font-black uppercase tracking-widest text-white/80">
              Pay Remaining Balance
            </h2>
            <ManualPaymentPanel
              amount={preorder.balanceAmount}
              label="Balance To Transfer"
              method={method}
              onMethodChange={setMethod}
              proofUrl={proofUrl}
              onProofChange={setProofUrl}
              reference={reference}
              onReferenceChange={setReference}
            />
          </section>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/10 rounded-3xl p-7 space-y-6 lg:sticky lg:top-10"
          >
            <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-white/50">
                <span className="pr-3">
                  {preorder.productName} &times; {preorder.quantity}
                </span>
                <span className="text-white/80 font-bold whitespace-nowrap">
                  Rs {preorder.totalAmount.toLocaleString()}
                </span>
              </div>
              {preorder.deliveryFee > 0 && (
                <div className="flex justify-between text-white/50">
                  <span>Delivery</span>
                  <span className="text-white/80 font-bold">
                    Rs {preorder.deliveryFee.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-emerald-400">
                <span>Deposit Already Paid</span>
                <span className="font-bold">&minus; Rs {preorder.depositPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline pt-4 border-t border-white/10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  Due Now
                </span>
                <span className="text-2xl font-black text-gold">
                  Rs {preorder.balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-[10px] text-white/40 leading-relaxed">
              <p className="text-white/60 font-bold mb-1">Delivering To</p>
              <p>
                {preorder.name} ({preorder.phone})
                <br />
                {preorder.address}
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
                  Submitting…
                </>
              ) : (
                <>Submit Payment Proof</>
              )}
            </button>

            <p className="flex items-center gap-2 text-[9px] text-white/25 justify-center">
              <ShieldCheck className="w-3 h-3" />
              Secure link, unique to your pre-order
            </p>
          </motion.aside>
        </form>
      </div>

      <SiteFooter />
    </main>
  );
}
