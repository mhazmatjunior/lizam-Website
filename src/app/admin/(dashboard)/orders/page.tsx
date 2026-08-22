"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  MapPin,
  AlertTriangle,
  FileText,
  ShieldAlert,
  History,
  CheckCheck,
  ExternalLink
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

const STATUS_CONFIG: Record<string, { color: string, icon: any, label: string }> = {
  unverified: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle, label: "Unverified" },
  pending: { color: "text-amber-300 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "Pending" },
  paid: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle, label: "Paid" },
  cashondelivery: { color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", icon: Truck, label: "COD" },
  shipped: { color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", icon: Truck, label: "Shipped" },
  delivered: { color: "text-gold bg-gold/10 border-gold/20", icon: CheckCheck, label: "Delivered" },
  cancelled: { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle, label: "Cancelled" },
};

const ADMIN_STATUS_OPTIONS = ["shipped", "delivered", "cancelled"];

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
        className={`w-36 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between gap-2 hover:scale-105 active:scale-95
          ${statusInfo.color} ${isLoading ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
           <Icon className="w-3.5 h-3.5 shrink-0" />
           <span className="truncate">{statusInfo.label}</span>
        </div>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 top-full mt-2 left-0 w-44 bg-[#0d0d0d] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-3xl overflow-hidden"
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
                      className={`w-full text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-3
                        ${currentStatus === opt 
                          ? 'bg-gold/10 text-gold' 
                          : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      <OptIcon className="w-3.5 h-3.5" />
                      {optInfo.label}
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

const OrderDetailsModal = ({ 
  order, 
  onClose,
  onVerifyPayment 
}: { 
  order: Order; 
  onClose: () => void;
  onVerifyPayment: (orderId: string) => void;
}) => {
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
      transition={{ delay: 0.05 + index * 0.05 }}
      className="group relative flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-gold/30 transition-all duration-300 overflow-hidden"
    >
       <div className="flex items-center gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">{label}</p>
          <p className="text-[11px] font-bold text-white/90 leading-tight">{value}</p>
        </div>
      </div>
      
      {field && (
        <button 
          onClick={() => copyToClipboard(value, field)}
          className="relative z-10 px-3 py-1.5 rounded-lg bg-white/5 text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-gold hover:bg-gold/10 transition-all"
        >
          {copiedField === field ? "Copied" : "Copy"}
        </button>
      )}
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#080808] border border-gold/20 rounded-[32px] p-6 md:p-8 shadow-2xl overflow-y-auto custom-scrollbar space-y-6"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-px bg-gold/40" />
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Order Vault Inspection</h2>
            </div>
            <p className="text-[9px] font-black tracking-widest text-gold/60 uppercase ml-8 mt-0.5">REF: {order.orderId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-gold/40 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailRow icon={MapPin} label="Client Name" value={order.name} index={0} />
          <DetailRow icon={Mail} label="Email Contact" value={order.email} field="email" index={1} />
          <DetailRow icon={Phone} label="Phone Number" value={order.phone} field="phone" index={2} />
          <DetailRow icon={Truck} label="Shipping Address" value={order.address} field="address" index={3} />
          <DetailRow icon={FileText} label="Product Ordered" value={order.product} index={4} />
          <DetailRow 
            icon={CheckCircle} 
            label="Payment & Delivery Mode" 
            value={`${order.paymentMethod === 'cod_founder' ? 'Founder Delivery (Lahore)' : order.paymentMethod === 'cod_standard' ? 'Cash on Delivery' : 'Online Payment'} (${order.paymentSubMethod || 'Standard'})`} 
            index={5} 
          />
        </div>

        {/* Uploaded Payment Screenshot Section */}
        {order.paymentScreenshot ? (
          <div className="bg-white/[0.02] border border-gold/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Uploaded Payment Screenshot
              </span>
              <a 
                href={order.paymentScreenshot} 
                target="_blank" 
                rel="noreferrer"
                className="text-[9px] font-bold text-white/40 hover:text-gold flex items-center gap-1 uppercase"
              >
                Full Screen <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative w-full min-h-40 max-h-80 bg-black/60 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
              <img 
                src={order.paymentScreenshot} 
                alt="Payment Proof" 
                className="max-h-72 object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'text-center p-6 text-amber-300/80 text-[10px] uppercase font-black tracking-widest space-y-1';
                    fallback.innerHTML = '<span>⚠️ Legacy screenshot string was truncated on previous build.</span><br/><span class="text-[8px] text-white/40 font-medium">New orders upload in 100% full resolution.</span>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[9px] text-white/30 uppercase tracking-widest text-center">
            No Payment Screenshot Uploaded (Direct Card / Gateway Payment)
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-2">
          {order.status === 'unverified' && (
            <button 
              onClick={() => onVerifyPayment(order.orderId)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle className="w-4 h-4" /> Verify Payment & Mark Paid
            </button>
          )}
          <button 
            onClick={onClose}
            className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 text-white/60 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Close Inspection
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [historyFilter, setHistoryFilter] = useState("All");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    newStatus: string;
  } | null>(null);

  const promptStatusChange = (orderId: string, newStatus: string) => {
    setPendingStatusChange({ orderId, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    const { orderId, newStatus } = pendingStatusChange;
    setPendingStatusChange(null);
    await updateOrderStatus(orderId, newStatus);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    promptStatusChange(orderId, 'paid');
  };

  // Split orders into Active vs History
  const isHistoryStatus = (status: string) => status === 'delivered' || status === 'cancelled';

  const unverifiedOrders = orders.filter(o => o.status === 'unverified');

  const activeOrders = orders.filter(o => !isHistoryStatus(o.status)).filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || o.status === activeFilter.toLowerCase().replace(/\s+/g, '');
    return matchesSearch && matchesFilter;
  });

  const historyOrders = orders.filter(o => isHistoryStatus(o.status)).filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = historyFilter === "All" || o.status === historyFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Order Command Center</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Manage active dispatches & verify manual payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOrders}
            className="px-5 py-3 bg-white/[0.02] border border-white/10 hover:border-gold/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-gold transition-all"
          >
            Refresh Orders
          </button>
        </div>
      </div>

      {/* Unverified Approval Banner Popup Notification */}
      {unverifiedOrders.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                {unverifiedOrders.length} Manual Payment(s) Awaiting Verification
              </h3>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">
                Customers submitted Bank / EasyPaisa / JazzCash payment screenshots requiring admin approval.
              </p>
            </div>
          </div>
          <Link
            href="/admin/approvals"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shrink-0 flex items-center gap-2"
          >
            Review Payment Proofs <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Global Search Bar */}
      <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 group focus-within:border-gold/30 transition-all">
        <Search className="w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
        <input 
          type="text" 
          placeholder="Search Active or History orders by ID, Client Name, or Email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-[11px] font-bold uppercase placeholder:text-white/20 w-full"
        />
      </div>

      {/* SECTION 1: ACTIVE ORDERS */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Active Dispatches & Pending Orders</h2>
            <span className="text-[10px] font-black bg-white/5 text-white/40 px-3 py-1 rounded-full border border-white/5">
              {activeOrders.length} Active
            </span>
          </div>

          {/* Active Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
            {["All", "Unverified", "Paid", "Cash on Delivery", "Shipped"].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300
                  ${activeFilter === status 
                    ? 'bg-gold/10 text-gold border border-gold/30' 
                    : 'text-white/30 hover:text-white bg-white/[0.02] border border-transparent'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Active Orders Table */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Order ID</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Customer Details</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Payment Mode</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Amount</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Status Control</th>
                  <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest text-white/20">Loading Active Orders...</td>
                    </tr>
                  ) : activeOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest text-white/20">No active orders matching current filter.</td>
                    </tr>
                  ) : activeOrders.map((order) => {
                    const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <motion.tr 
                        key={order.orderId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-white/[0.01] transition-all"
                      >
                        <td className="px-6 py-5">
                          <span className="text-[11px] font-black tracking-widest text-gold uppercase">{order.orderId}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-white/90">{order.name}</p>
                            <p className="text-[9px] text-white/30 font-medium">{order.email} • {order.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {order.paymentMethod === 'cod_founder' ? 'Founder Delivery' : order.paymentMethod === 'cod_standard' ? 'COD' : 'Online'}
                            </span>
                            {order.paymentScreenshot && (
                              <span className="block text-[7px] text-gold font-bold uppercase tracking-widest">★ SS Uploaded</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[11px] font-black text-white/90">Rs {order.amount.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-5">
                          <StatusDropdown 
                            currentStatus={order.status} 
                            onUpdate={(newStatus) => promptStatusChange(order.orderId, newStatus)}
                            isLoading={updatingId === order.orderId}
                          />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2.5 text-white/30 hover:text-gold hover:bg-gold/10 rounded-xl transition-all"
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
        </div>
      </section>

      {/* SECTION 2: ORDER HISTORY */}
      <section className="space-y-6 pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-gold" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Order History (Delivered & Cancelled)</h2>
            <span className="text-[10px] font-black bg-white/5 text-white/40 px-3 py-1 rounded-full border border-white/5">
              {historyOrders.length} Completed
            </span>
          </div>

          {/* History Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
            {["All", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setHistoryFilter(status)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300
                  ${historyFilter === status 
                    ? 'bg-gold/10 text-gold border border-gold/30' 
                    : 'text-white/30 hover:text-white bg-white/[0.02] border border-transparent'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* History Orders Table */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden opacity-90">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Order ID</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Customer</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Payment Mode</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Total Value</th>
                  <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Final Status</th>
                  <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {historyOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-[10px] font-black uppercase tracking-widest text-white/20">No order history records found.</td>
                  </tr>
                ) : historyOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.delivered;
                  const Icon = statusInfo.icon;
                  return (
                    <tr key={order.orderId} className="hover:bg-white/[0.01] transition-all">
                      <td className="px-6 py-5">
                        <span className="text-[11px] font-black tracking-widest text-white/40 uppercase">{order.orderId}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">{order.name}</p>
                        <p className="text-[9px] text-white/20">{order.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {order.paymentMethod === 'cod_founder' ? 'Founder Delivery' : order.paymentMethod === 'cod_standard' ? 'COD' : 'Online'}
                          </span>
                          {order.paymentScreenshot && (
                            <span className="block text-[7px] text-gold font-bold uppercase tracking-widest">★ SS Uploaded</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-black text-gold">Rs {order.amount.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                          <Icon className="w-3 h-3" /> {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-white/20 hover:text-gold transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal View Inspection */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onVerifyPayment={handleVerifyPayment}
        />
      )}

      {/* Admin Status Change Confirmation Modal */}
      {pendingStatusChange && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPendingStatusChange(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-gold/30 rounded-[32px] p-8 shadow-2xl space-y-6 z-10 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto">
              <AlertTriangle className="w-7 h-7 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-white">Confirm Status Change</h3>
              <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                Are you sure you want to update order <span className="text-gold font-mono font-bold">{pendingStatusChange.orderId}</span> status to <span className="text-gold font-black uppercase">{pendingStatusChange.newStatus}</span>?
              </p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest pt-2">
                💡 This action will update the database and trigger an automated email notification to the customer.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={confirmStatusChange}
                className="flex-1 py-4 bg-gold hover:bg-gold-light text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(226,187,97,0.3)]"
              >
                Confirm & Apply
              </button>
              <button
                onClick={() => setPendingStatusChange(null)}
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
