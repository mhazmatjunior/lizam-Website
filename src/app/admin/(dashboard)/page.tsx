"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Users,
  Clock,
  ChevronRight
} from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { ORDERS } from "@/data/orders";
import { useProducts } from "@/context/ProductContext";
import { AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { products } = useProducts();
  // Logic Refinement: Calculate real metrics
  const totalRevenue = ORDERS.reduce((acc, order) => acc + order.total, 0);
  const activeOrdersCount = ORDERS.filter(o => o.status === "Processing" || o.status === "Shipped").length;
  const totalProductsCount = products.length;
  const totalCustomersCount = new Set(ORDERS.map(o => o.customer.email)).size;

  const STATS = [
    { 
      label: "Total Revenue", 
      value: `Rs ${totalRevenue.toLocaleString()}`, 
      icon: DollarSign,
      color: "from-gold/20 to-gold/5"
    },
    { 
      label: "Active Orders", 
      value: activeOrdersCount.toString(), 
      icon: ShoppingBag,
      color: "from-blue-500/10 to-blue-500/5"
    },
    { 
      label: "Total Products", 
      value: totalProductsCount.toString(), 
      icon: Package,
      color: "from-purple-500/10 to-purple-500/5"
    },
    { 
      label: "Total Customers", 
      value: totalCustomersCount.toString(), 
      icon: Users,
      color: "from-emerald-500/10 to-emerald-500/5"
    },
  ];

  // Filter for today's orders only
  const todayStr = "2026-03-13"; // Using the system date from metadata
  const recentOrders = ORDERS.filter(order => order.date.startsWith(todayStr))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Command Center</h1>
        <div className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gold bg-gold/10 border border-gold/20">
          Monthly View
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
            
            {/* Decorative Glow */}
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
              <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Recent Orders</h3>
            </div>
            <Link 
              href="/admin/orders"
              className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-gold transition-colors flex items-center gap-2 group"
            >
              View All <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center text-[10px] font-black text-gold group-hover:bg-gold/10 transition-all">
                      {order.id.replace('#', '')}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black tracking-widest">{order.customer.name}</h4>
                      <p className="text-[10px] text-white/30 font-medium">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-white/90">Rs {order.total.toLocaleString()}</p>
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border 
                      ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        order.status === 'Shipped' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-gold/10 text-gold border-gold/20'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl gap-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">No orders placed today</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stock Alerts */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Critical Stock Alerts</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => p.stock < 10).length > 0 ? (
              products.filter(p => p.stock < 10).map((p) => (
                <div 
                  key={p.id}
                  className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-rose-500/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center p-2 relative">
                    <Image src={p.image} alt={p.name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">{p.name}</h4>
                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">{p.stock} Units Remaining</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center border border-dashed border-white/5 rounded-3xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/10">All fragrances optimally stocked</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
