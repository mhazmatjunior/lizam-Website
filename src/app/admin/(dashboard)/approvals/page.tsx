"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  Eye, 
  ExternalLink, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Wallet,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface Order {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  paymentSubMethod?: string;
  paymentScreenshot?: string;
  deliveryFee?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ApprovalsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders for approvals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [confirmVerifyOrderId, setConfirmVerifyOrderId] = useState<string | null>(null);

  const confirmVerifyPayment = async () => {
    if (!confirmVerifyOrderId) return;
    const targetId = confirmVerifyOrderId;
    setConfirmVerifyOrderId(null);
    await handleVerifyPayment(targetId);
  };

  const handleVerifyPayment = async (orderId: string) => {
    setVerifyingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "paid" }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: "paid" } : o));
      }
    } catch (error) {
      console.error("Failed to verify payment:", error);
    } finally {
      setVerifyingId(null);
    }
  };

  const pendingApprovals = orders.filter(o => o.status === "unverified" || (o.paymentScreenshot && o.status === "pending"));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Payment Approvals Hub</h1>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-2 ml-13">
            Verify manual bank, EasyPaisa & JazzCash transfer screenshots to count towards revenue
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={fetchOrders}
            className="px-5 py-3 bg-white/[0.02] border border-white/10 hover:border-gold/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-gold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Approvals
          </button>
        </div>
      </div>

      {/* Pending Status Summary Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-black to-black border border-amber-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-wide text-amber-400">
              {pendingApprovals.length} Payment(s) Awaiting Admin Approval
            </h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
              Inspected payment proofs will instantly shift order status to PAID and update your revenue totals
            </p>
          </div>
        </div>
        <div className="px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-widest">
          {pendingApprovals.length} Action Needed
        </div>
      </div>

      {/* Main Approvals List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="p-20 text-center text-[10px] font-black uppercase tracking-widest text-white/20">
              Fetching pending payment screenshot submissions...
            </div>
          ) : pendingApprovals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 rounded-[36px] bg-white/[0.01] border border-white/5 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">All Payments Verified!</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest max-w-md mx-auto">
                There are no pending unverified manual bank or mobile wallet transfer receipts waiting for approval.
              </p>
            </motion.div>
          ) : (
            pendingApprovals.map((order, index) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#0a0a0a] border border-gold/20 rounded-[36px] p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Unverified Payment
                      </span>
                      <span className="text-xs font-black tracking-widest text-gold font-mono">{order.orderId}</span>
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">
                      Submitted on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Total Amount Due</p>
                    <p className="text-2xl font-black text-gold">Rs {order.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Client & Order Details */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                        <User className="w-4 h-4 text-gold shrink-0" />
                        <div>
                          <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Client Name</p>
                          <p className="text-[11px] font-bold text-white">{order.name}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gold shrink-0" />
                        <div>
                          <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Phone Number</p>
                          <p className="text-[11px] font-bold text-white">{order.phone}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gold shrink-0" />
                        <div>
                          <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Email Address</p>
                          <p className="text-[11px] font-bold text-white truncate max-w-[180px]">{order.email}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                        <Wallet className="w-4 h-4 text-gold shrink-0" />
                        <div>
                          <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Transfer Sub-Type</p>
                          <p className="text-[11px] font-bold text-gold uppercase">{order.paymentSubMethod || "Manual Transfer"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Shipping Address</p>
                      <p className="text-[11px] font-bold text-white/90">{order.address}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Items Included</p>
                      <p className="text-[11px] font-bold text-gold">{order.product}</p>
                    </div>
                  </div>

                  {/* Right Column: Payment Screenshot Preview */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gold flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Uploaded Proof Screenshot
                      </span>
                      {order.paymentScreenshot && (
                        <button 
                          onClick={() => setPreviewImage(order.paymentScreenshot || null)}
                          className="text-[9px] font-bold text-white/40 hover:text-gold flex items-center gap-1 uppercase"
                        >
                          Enlarge Image <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {order.paymentScreenshot ? (
                      <div 
                        onClick={() => setPreviewImage(order.paymentScreenshot || null)}
                        className="cursor-pointer relative w-full h-64 bg-black border border-white/10 rounded-2xl overflow-hidden group flex items-center justify-center p-2"
                      >
                        <img 
                          src={order.paymentScreenshot} 
                          alt="Payment Proof" 
                          className="max-h-60 object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'text-center p-4 text-amber-300/80 text-[9px] uppercase font-black tracking-widest';
                              fallback.innerHTML = '⚠️ Legacy screenshot truncated on previous build';
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold uppercase">
                          <Eye className="w-4 h-4 text-gold" /> Click to Inspect
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-center p-6 text-[10px] text-white/30 uppercase tracking-widest">
                        No Screenshot Uploaded (Direct Gateway Transfer)
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">
                    ⚠️ Verify that the money has entered your account before clicking approve.
                  </div>

                  <button
                    onClick={() => setConfirmVerifyOrderId(order.orderId)}
                    disabled={verifyingId === order.orderId}
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {verifyingId === order.orderId ? (
                      <>
                        Verifying... <RefreshCw className="w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" /> Verify Payment & Approve
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Screenshot Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="relative max-w-4xl max-h-[90vh] bg-[#0c0c0c] border border-gold/30 rounded-3xl p-6 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm font-black uppercase text-gold tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Full Resolution Payment Screenshot Proof
              </h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-2 bg-white/5 text-white/40 hover:text-white rounded-xl"
              >
                Close (ESC)
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center">
              <img 
                src={previewImage} 
                alt="Payment Proof Fullscreen" 
                className="max-h-[70vh] object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Verification Confirmation Modal */}
      {confirmVerifyOrderId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmVerifyOrderId(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-emerald-500/30 rounded-[32px] p-8 shadow-2xl space-y-6 z-10 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-white">Confirm Payment Verification</h3>
              <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                Are you sure you want to verify and approve payment for order <span className="text-emerald-400 font-mono font-bold">{confirmVerifyOrderId}</span>?
              </p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest pt-2">
                💡 This will mark the order as PAID in database and send a Payment Verified confirmation email to the customer.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={confirmVerifyPayment}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Verify & Approve
              </button>
              <button
                onClick={() => setConfirmVerifyOrderId(null)}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
