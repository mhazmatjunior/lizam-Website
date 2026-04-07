'use client';

import { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const hasUpdated = useRef(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!orderId || hasUpdated.current) return;
    hasUpdated.current = true;

    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: 'paid' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(`✅ Order ${orderId} marked as PAID`);
          setUpdated(true);
        }
      })
      .catch((err) => console.error('Failed to update order:', err));
  }, [orderId]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
      <div className="max-w-md w-full text-center space-y-8">
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
          <p className="text-white/25 text-[11px] uppercase tracking-widest">
            Order ID: {orderId}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/40 text-xs leading-relaxed"
        >
          We are preparing your exclusive Raanae fragrance experience. You will receive a confirmation shortly.
        </motion.p>

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
