"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  Truck, 
  CheckCircle,
  Clock,
  ExternalLink,
  Mail
} from "lucide-react";
import { ORDERS } from "@/data/orders";

const STATUS_CONFIG: Record<string, { color: string, icon: any }> = {
  Processing: { color: "text-gold bg-gold/10 border-gold/20", icon: Clock },
  Shipped: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Truck },
  Delivered: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  Cancelled: { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: Clock },
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredOrders = ORDERS.filter(o => {
    const matchesSearch = o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm);
    const matchesFilter = activeFilter === "All" || o.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Order History</h1>
        <div className="flex items-center gap-3">
          <button className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/10 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
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
          {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
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
                <th className="px-8 py-6 text-left text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Status</th>
                <th className="px-8 py-6 text-right text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, index) => {
                  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.Processing;
                  return (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-white/[0.01] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-black tracking-widest text-gold">{order.id}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40">
                            {order.customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-white/90">{order.customer.name}</p>
                            <p className="text-[9px] text-white/20 font-medium">{order.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-bold text-white/40">{order.date}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-white/90">Rs {order.total.toLocaleString()}</p>
                          <p className="text-[8px] text-white/20 font-medium tracking-tight">{order.items} Items</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.color}`}>
                          <status.icon className="w-3 h-3" />
                          <span className="text-[8px] font-black uppercase tracking-widest">{order.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-3 text-white/20 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-3 text-white/20 hover:text-gold hover:bg-gold/5 rounded-xl transition-all">
                            <Truck className="w-4 h-4" />
                          </button>
                          <button className="p-3 text-white/20 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[40px] text-white/10">
              <Search className="w-12 h-12" />
            </div>
            <div className="text-center">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">No orders found</h4>
              <p className="text-[9px] text-white/20 font-medium">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Fulfillment Notice */}
      <div className="p-10 rounded-[40px] bg-gradient-to-r from-gold/10 to-transparent border border-gold/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 text-gold">
            <CheckCircle className="w-6 h-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Artisan Fulfillment Ready</h3>
          </div>
          <p className="text-[13px] text-white/40 leading-relaxed font-medium">
            Once orders are confirmed, you can update their status to "Shipped" or "Delivered". 
            Automated notifications will be sent to customers to maintain the luxury experience.
          </p>
        </div>
        <button className="whitespace-nowrap btn-premium-gold h-14 px-10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(212,175,55,0.2)]">
           View Fulfillment Secrets <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
