'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const tracker = searchParams.get('tracker');
  const hasUpdated = useRef(false);
  const [orderSaved, setOrderSaved] = useState(false);

  useEffect(() => {
    // Only run once even in StrictMode
    if (!orderId || hasUpdated.current) return;
    hasUpdated.current = true;

    // Update order status to "paid"
    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        status: 'paid',
        tracker: tracker || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(`✅ Order ${orderId} marked as PAID`);
          setOrderSaved(true);
        }
      })
      .catch((err) => console.error('Failed to update order:', err));
  }, [orderId, tracker]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-gold" />
          </div>
        </motion.div>

        {/* Title */}
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
            Your pre-order has been successfully received.
          </p>
          {orderId && (
            <p className="text-white/30 text-[11px] uppercase tracking-widest">
              Order ID: {orderId}
            </p>
          )}
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/40 text-xs leading-relaxed"
        >
          We are preparing your exclusive Raanae fragrance experience. You will receive a confirmation email shortly.
        </motion.p>

        {/* CTA */}
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

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse text-gold/20 uppercase tracking-[0.3em] text-[10px] font-black">Finalizing Order...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
