"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Users,
  Clock,
  ChevronRight,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Truck,
  CheckCircle
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
  createdAt: string;
  updatedAt: string;
}

const OrderDetailsModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
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
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <DetailRow icon={MapPin} label="Full Identity" value={order.name} index={0} />
            <DetailRow icon={Mail} label="Digital Contact" value={order.email} field="email" index={1} />
            <DetailRow icon={Phone} label="Line of Communication" value={order.phone} field="phone" index={2} />
            <DetailRow icon={Truck} label="Dispatch Coordinates" value={order.address} field="address" index={3} />
          </div>

          <div className="pt-4">
            <button 
              onClick={onClose}
              className="w-full btn-premium-gold h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_20px_50px_rgba(200,164,77,0.1)] group"
            >
              Close <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrders() {
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
    fetchOrders();
  }, []);

  // Logic Refinement: Calculate real metrics
  const totalRevenue = orders.reduce((acc, order) => acc + (order.amount || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== "cancelled").length;
  const totalCustomersCount = new Set(orders.map(o => o.email)).size;

  const STATS = [
    { 
      label: "Total Revenue", 
      value: `Rs ${totalRevenue.toLocaleString()}`, 
      icon: DollarSign,
      color: "from-gold/20 to-gold/5"
    },
    { 
      label: "Order Volume", 
      value: activeOrdersCount.toString(), 
      icon: ShoppingBag,
      color: "from-blue-500/10 to-blue-500/5"
    },
    { 
      label: "Live Fragrance", 
      value: "1", 
      icon: Package,
      color: "from-purple-500/10 to-purple-500/5"
    },
    { 
      label: "Unique Clients", 
      value: totalCustomersCount.toString(), 
      icon: Users,
      color: "from-emerald-500/10 to-emerald-500/5"
    },
  ];

  // Logic: 24h Filtered + Sorted Latest First
  const now = new Date().getTime();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  const recentOrders = [...orders]
    .filter(o => now - new Date(o.createdAt).getTime() <= ONE_DAY)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Command Center</h1>
        <div className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 border border-gold/20">
          Last 24 Hours Metrics
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-8 rounded-[32px] bg-gradient-to-br ${stat.color} border border-white/5 relative overflow-hidden group hover:border-gold/20 transition-all duration-500`}
          >
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-black/40 rounded-2xl border border-white/5 text-gold group-hover:scale-110 transition-transform">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{stat.label}</p>
                <p className="text-3xl font-black tracking-tight">{stat.value}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-gold/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white/90">24h Elite Activity</h3>
            </div>
            <Link 
              href="/admin/orders"
              className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-gold transition-colors flex items-center gap-2 group"
            >
              Master Console <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div 
                  key={order.orderId}
                  className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center text-[8px] px-2 text-center font-black text-gold group-hover:bg-gold/10 transition-all leading-tight">
                      {order.orderId.split('-')[1].slice(-4)}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black tracking-widest uppercase">{order.name}</h4>
                      <p className="text-[10px] text-white/30 font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[11px] font-black text-white/90">Rs {order.amount.toLocaleString()}</p>
                      <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border 
                        ${order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-gold/10 text-gold border-gold/20'}`}>
                        {order.status}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-gold hover:bg-gold/10 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[32px] gap-4">
                <Clock className="w-10 h-10 text-white/5" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No Elite Activity in 24h</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Global Collection Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold/10 rounded-2xl text-gold">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Curated Collection</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-gold/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center p-2 relative">
                <Image src="/product_2.png" alt="7th Oct" fill className="object-contain p-2" />
              </div>
              <div className="flex-grow">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">7th Oct</h4>
                <p className="text-[9px] font-bold text-gold uppercase tracking-tighter">Premium Edition</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
