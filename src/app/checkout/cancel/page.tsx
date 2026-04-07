'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const hasUpdated = useRef(false);

  useEffect(() => {
    if (!orderId || hasUpdated.current) return;
    hasUpdated.current = true;

    // Mark order as cancelled
    fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: 'cancelled' }),
    })
      .then(() => console.log(`🚫 Order ${orderId} marked as CANCELLED`))
      .catch((err) => console.error('Failed to update order:', err));
  }, [orderId]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white px-6">
      <div className="max-w-md w-full text-center space-y-8">

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full border border-white/10 bg-white/3 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-white/30" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white/50">
            Payment Cancelled
          </h1>
          <p className="text-sm uppercase tracking-[0.1em] text-white/40 leading-relaxed font-light">
            Your payment was not completed. No charges were made.
          </p>
          {orderId && (
            <p className="text-white/20 text-[11px] uppercase tracking-widest">
              Order ID: {orderId}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/"
            className="inline-block px-10 py-3.5 border border-white/15 text-white/60 font-black uppercase tracking-widest rounded-full hover:bg-white/5 transition-all text-sm"
          >
            Return Home
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
