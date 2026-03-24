"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu, 
  ArrowLeft
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Inventory", href: "/admin/inventory", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-gold/30 flex">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 flex-shrink-0 transition-all duration-500 ease-in-out
          ${isSidebarOpen ? 'w-72' : 'w-0 lg:w-72'} 
          bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col overflow-hidden`}
      >
        {/* Logo Section */}
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <span className="text-2xl font-black tracking-tighter">
            RAANAI
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-grow py-8 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-gold/10 text-gold border border-gold/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'}`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-gold' : 'group-hover:text-white'}`} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 opacity-100">
                  {item.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1 h-1 rounded-full bg-gold"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white/40 hover:text-gold hover:bg-gold/5 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 opacity-100">
              Back to Shop
            </span>
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white/40 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 opacity-100">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow min-w-0 flex flex-col h-screen overflow-hidden bg-radial-gradient from-white/[0.02] to-transparent">
        {/* Header */}
        <header className="h-24 flex-shrink-0 flex items-center justify-between px-8 md:px-12 border-b border-white/5 bg-black/20 backdrop-blur-xl z-30">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-white/40 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Admin</p>
                <p className="text-[9px] font-medium text-white/30 tracking-tight">System Overseer</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center font-black text-gold text-xs shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-8 md:p-12 relative">
          {/* Background Decorative Bloom */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
