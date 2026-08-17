'use client';

import { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Upload, Loader2, Clock, AlertCircle } from 'lucide-react';
import { VERIFICATION_WINDOW, PROOF_ACCEPTED_LABEL, PROOF_MAX_BYTES } from '@/data/bank-details';

type OrderState = {
  orderId: string;
  status: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  hasProof: boolean;
};

export default function SuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const hasRun = useRef(false);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (!orderId || hasRun.current) return;
    hasRun.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        const found: OrderState | undefined = data.order;
        setOrder(found ?? null);

        // Only the gateway flow may auto-confirm. A bank transfer stays pending
        // until a human verifies the receipt, and cash on delivery is settled
        // at the door — marking either 'paid' here would be false.
        if (found && found.paymentMethod === 'safepay' && found.status === 'pending') {
          await fetch('/api/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status: 'paid' }),
          });
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const needsProof =
    order?.paymentMethod === 'bank_transfer' && !order.hasProof && !uploaded;

  const awaitingReview =
    order?.paymentMethod === 'bank_transfer' && (uploaded || order.hasProof);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!file) {
      setUploadError('Please choose your receipt file.');
      return;
    }
    if (file.size > PROOF_MAX_BYTES) {
      setUploadError('That file is larger than 5 MB. Please pick a smaller one.');
      return;
    }
    if (!reference.trim()) {
      setUploadError('Please enter the transaction reference from your bank.');
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('reference', reference.trim());

      const res = await fetch(`/api/orders/${orderId}/proof`, { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploaded(true);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
            {awaitingReview ? (
              <Clock className="w-10 h-10 text-gold" />
            ) : (
              <CheckCircle className="w-10 h-10 text-gold" />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-gold drop-shadow-[0_0_15px_rgba(200,164,77,0.4)]">
            Thank You
          </h1>
          <p className="text-sm md:text-base uppercase tracking-[0.2em] text-white/60 leading-relaxed font-light">
            Your order has been successfully received.
          </p>
          <p className="text-white/25 text-[11px] uppercase tracking-widest">
            Order ID: {orderId}
          </p>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
          </div>
        )}

        {/* Bank transfer: ask for the receipt */}
        {!loading && needsProof && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleUpload}
            className="text-left rounded-2xl border border-gold/20 bg-gold/[0.03] p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">
                One last step
              </h2>
              <p className="text-white/50 text-xs leading-relaxed">
                Upload your transfer receipt and enter the transaction reference so we can
                confirm your payment. We usually verify within {VERIFICATION_WINDOW}.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="proof" className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">
                Receipt or screenshot
              </label>
              <input
                id="proof"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUploadError(null); }}
                className="w-full text-[11px] text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-widest file:bg-gold/15 file:text-gold hover:file:bg-gold/25 file:cursor-pointer cursor-pointer"
              />
              <p className="text-[9px] text-white/25 uppercase tracking-wider">{PROOF_ACCEPTED_LABEL}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="reference" className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">
                Transaction reference
              </label>
              <input
                id="reference"
                type="text"
                value={reference}
                onChange={(e) => { setReference(e.target.value); setUploadError(null); }}
                placeholder="e.g. TRX8891042"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-colors"
              />
              <p className="text-[9px] text-white/25 uppercase tracking-wider">
                Found on your bank or wallet confirmation
              </p>
            </div>

            {uploadError && (
              <div className="flex items-start gap-2 text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                <span>{uploadError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#846828] via-[#C8A44D] to-[#E8CD94] text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Submit payment proof</>
              )}
            </button>
          </motion.form>
        )}

        {/* Bank transfer: receipt received */}
        {!loading && awaitingReview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gold/20 bg-gold/[0.03] p-6 space-y-2"
          >
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">
              Payment under review
            </h2>
            <p className="text-white/50 text-xs leading-relaxed">
              We have your receipt and will confirm your order within {VERIFICATION_WINDOW}.
              You will get an email as soon as it is verified.
            </p>
          </motion.div>
        )}

        {!loading && !needsProof && !awaitingReview && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/40 text-xs leading-relaxed"
          >
            We are preparing your exclusive Raanae fragrance experience. You will receive a
            confirmation shortly.
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/"
            className="inline-block mt-4 px-12 py-4 bg-gradient-to-r from-[#846828] via-[#C8A44D] to-[#E8CD94] text-black font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
