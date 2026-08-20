"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Eye, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  X,
  Mail,
  Phone,
  MapPin
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
  hasProof?: boolean;
  paymentReference?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { color: string, icon: any }> = {
  pending: { color: "text-gold bg-gold/10 border-gold/20", icon: Clock },
  awaiting_verification: { color: "text-amber-300 bg-amber-500/10 border-amber-500/25", icon: Clock },
  proof_rejected: { color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: XCircle },
  processing: { color: "text-sky-300 bg-sky-500/10 border-sky-500/20", icon: Clock },
  paid: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  shipped: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Truck },
  cancelled: { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod_founder: 'Cash on Delivery (Founder Delivery)',
  cod_standard: 'Cash on Delivery (Standard)',
  bank_transfer: 'Bank Transfer / Wallet (manual)',
  safepay: 'Online Payment (Safepay)',
};

// Admin can only manually trigger these transitions
const ADMIN_STATUS_OPTIONS = ["shipped", "cancelled"];

const StatusDropdown = ({ currentStatus, onUpdate, isLoading }: { 
  currentStatus: string, 
  onUpdate: (s: string) => void,
  isLoading: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const statusInfo = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
  const Icon = statusInfo.icon;

  return (
    <div className="relative">
      <button
        disabled={isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-32 px-4 py-2.5 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-between gap-2 hover:scale-105 active:scale-95
          ${statusInfo.color} ${isLoading ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-2">
           <Icon className="w-3 h-3" />
           {currentStatus}
        </div>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 top-full mt-2 left-0 w-40 bg-[#0d0d0d] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-3xl overflow-hidden"
            >
              <div className="space-y-1">
                {ADMIN_STATUS_OPTIONS.map((opt) => {
                  const optInfo = STATUS_CONFIG[opt];
                  const OptIcon = optInfo.icon;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        onUpdate(opt);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-3
                        ${currentStatus === opt 
                          ? 'bg-gold/10 text-gold' 
                          : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      <OptIcon className="w-3.5 h-3.5" />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Bank-transfer verification. The proofs bucket is private, so the receipt is
 * fetched through a short-lived signed link rather than a public URL.
 */
const PaymentProofPanel = ({ order, onUpdated }: { order: Order; onUpdated?: () => void }) => {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(order.paymentReference ?? null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(order.status);

  useEffect(() => {
    if (!order.hasProof) return;
    setLoading(true);
    fetch(`/api/orders/${order.orderId}/proof`)
      .then((r) => r.json())
      .then((d) => {
        if (d.url) { setProofUrl(d.url); setReference(d.reference ?? null); }
        else setError(d.error || 'Could not load the receipt');
      })
      .catch(() => setError('Could not load the receipt'))
      .finally(() => setLoading(false));
  }, [order.orderId, order.hasProof]);

  const setOrderStatus = async (next: string) => {
    setActing(next);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId, status: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Update failed');
      setStatus(next);
      onUpdated?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActing(null);
    }
  };

  if (!order.hasProof) {
    return (
      <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-5 space-y-1">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Payment Proof</p>
        <p className="text-[11px] text-white/50">
          Customer has not uploaded a receipt yet. Order stays pending until they do.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/[0.03] p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-300/70">Payment Proof</p>
        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{status.replace(/_/g, ' ')}</span>
      </div>

      {reference && (
        <div className="space-y-0.5">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Bank Reference</p>
          <p className="text-[13px] font-mono font-bold text-white/90 break-all">{reference}</p>
          <p className="text-[9px] text-white/30">Match this against your bank statement before verifying.</p>
        </div>
      )}

      {loading && <p className="text-[11px] text-white/40">Loading receipt…</p>}

      {proofUrl && (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-white/10 bg-black/40 p-3 text-[10px] font-black uppercase tracking-widest text-gold hover:border-gold/40 transition-colors text-center"
        >
          Open receipt in new tab
        </a>
      )}

      {error && <p className="text-[10px] text-rose-300">{error}</p>}

      {status !== 'paid' && (
        <div className="flex gap-2">
          <button
            onClick={() => setOrderStatus('paid')}
            disabled={acting !== null}
            className="flex-grow h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/25 disabled:opacity-40 transition-all"
          >
            {acting === 'paid' ? 'Verifying…' : 'Verify payment'}
          </button>
          <button
            onClick={() => setOrderStatus('proof_rejected')}
            disabled={acting !== null}
            className="px-5 h-11 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest hover:text-rose-300 hover:border-rose-500/30 disabled:opacity-40 transition-all"
          >
            {acting === 'proof_rejected' ? '…' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose, onUpdated }: { order: Order; onClose: () => void; onUpdated?: () => void }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const DetailRow = ({ icon: Icon, label, value, field, index }: any) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      className="group relative flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-gold/30 transition-all duration-500 overflow-hidden"
    >
       <div className="flex items-center gap-4 relative z-10">
        <div className="w-11 h-11 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-0.5">{label}</p>
          <p className="text-[12px] font-bold text-white/90 leading-tight">{value}</p>
        </div>
      </div>
      
      {field && (
        <button 
          onClick={() => copyToClipboard(value, field)}
          className="relative z-10 px-3 py-2 rounded-lg bg-white/5 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-gold hover:bg-gold/10 transition-all"
        >
          {copiedField === field ? "Copied" : "Copy"}
        </button>
      )}

      <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -mr-12 -mt-12" />
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/95 backdrop-blur-2xl" 
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-lg bg-[#080808] border border-gold/10 rounded-[40px] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.8),0_0_80px_rgba(200,164,77,0.05)] overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32 animate-pulse" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-px bg-gold/40" />
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Client Vault</h2>
              </div>
              <p className="text-[9px] font-black tracking-[0.4em] text-gold/60 uppercase ml-8">REF: {order.orderId.split('-')[1].slice(-8)}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-gold/40 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <DetailRow icon={MapPin} label="Full Identity" value={order.name} index={0} />
            <DetailRow icon={Mail} label="Digital Contact" value={order.email} field="email" index={1} />
            <DetailRow icon={Phone} label="Line of Communication" value={order.phone} field="phone" index={2} />
            <DetailRow icon={Truck} label="Dispatch Coordinates" value={order.address} field="address" index={3} />
            <DetailRow
              icon={CheckCircle}
              label="Payment / Delivery Method"
              value={PAYMENT_LABELS[order.paymentMethod || 'safepay'] || 'Online Payment (Safepay)'}
              index={4}
            />
          </div>

          {order.paymentMethod === 'bank_transfer' && (
            <PaymentProofPanel order={order} onUpdated={onUpdated} />
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClose}
              className="flex-grow btn-premium-gold h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_20px_50px_rgba(200,164,77,0.1)] group"
            >
              Close <CheckCircle className="w-4 h-4" />
            </button>
            <button 
               onClick={() => window.print()}
               className="px-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] text-white/40 hover:text-white transition-all"
            >
               Log
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderId.includes(searchTerm);
    const matchesFilter = activeFilter === "All" || o.status === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Order Management</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOrders}
            className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/10 transition-all flex items-center gap-2"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Utilities */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 w-full lg:w-96 group focus-within:border-gold/30 transition-all">
          <Search className="w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search by ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-[11px] font-medium placeholder:text-white/10 w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full lg:w-auto pb-2 lg:pb-0">
          {["All", "Pending", "Paid", "Shipped", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300
                ${activeFilter === status 
                  ? 'bg-gold/10 text-gold border border-gold/20' 
                  : 'text-white/30 hover:text-white bg-white/[0.02] border border-transparent'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Order ID</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Customer</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Date</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Value</th>
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Update Status</th>
                <th className="px-8 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-white/20">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center text-[10px] font-black uppercase tracking-widest text-white/10">Synchronizing Vault...</td>
                  </tr>
                ) : filteredOrders.map((order, index) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  return (
                    <motion.tr 
                      key={order.orderId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-white/[0.01] transition-all"
                    >
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-black tracking-widest text-gold uppercase">{order.orderId.split('-')[1].slice(-6)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40">
                            {order.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-white/90">{order.name}</p>
                            <p className="text-[9px] text-white/20 font-medium">{order.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-bold text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-white/90">Rs {order.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {order.paymentMethod === 'cod_founder' && (
                              <span className="text-[7px] font-black uppercase tracking-widest text-[#e2bb61] bg-[#e2bb61]/10 px-1.5 py-0.5 rounded border border-[#e2bb61]/20">COD Founder</span>
                            )}
                            {order.paymentMethod === 'cod_standard' && (
                              <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">COD Standard</span>
                            )}
                            {order.paymentMethod === 'bank_transfer' && (
                              <span className="text-[7px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Bank Transfer</span>
                            )}
                            {/* Flags a manual payment still waiting on a receipt, so it is
                                visible without opening the order. */}
                            {order.paymentMethod === 'bank_transfer' && !order.hasProof && (
                              <span className="text-[7px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">No Receipt</span>
                            )}
                            {(order.paymentMethod === 'safepay' || !order.paymentMethod) && (
                              <span className="text-[7px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10">Safepay</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusDropdown 
                          currentStatus={order.status} 
                          onUpdate={(newStatus) => updateOrderStatus(order.orderId, newStatus)}
                          isLoading={updatingId === order.orderId}
                        />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-3 text-white/20 hover:text-gold hover:bg-gold/5 rounded-xl transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[40px] text-white/10">
              <Search className="w-12 h-12" />
            </div>
            <div className="text-center">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">No orders found</h4>
              <p className="text-[9px] text-white/20 font-medium">The vault is currently empty</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdated={fetchOrders} />
        )}
      </AnimatePresence>

      {/* Artisan fulfillment panel */}
      <div className="p-10 rounded-[40px] bg-gradient-to-r from-gold/10 to-transparent border border-gold/10 flex flex-col md:flex-row items-center justify-between gap-8 mt-10">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 text-gold">
            <CheckCircle className="w-6 h-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Live Order Control</h3>
          </div>
          <p className="text-[13px] text-white/40 leading-relaxed font-medium">
            Status changes are immediate. Once an order is marked as "Shipped", 
            it reflects instantly across all system reports.
          </p>
        </div>
      </div>
    </div>
  );
}
