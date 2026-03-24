"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Search,
    SlidersHorizontal,
    ArrowUpRight,
    Sparkles,
    Droplets,
    Wind,
    ChevronDown,
    ShoppingBag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

// --- Types ---
import { type Product } from '@/data/products';
import { useProducts } from '@/context/ProductContext';

const SORT_OPTIONS = [
    { label: "Newest", value: "new" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
];

export default function ProductListPage() {
    const { products } = useProducts();
    const { addToCart, setIsCartOpen, itemsCount } = useCart();
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState("new");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const dynamicCategories = useMemo(() => {
        const cats = ["All", ...new Set(products.map(p => p.category))];
        return cats;
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Filter by Category
        if (filter !== "All") {
            result = result.filter(p => p.category === filter);
        }

        // Filter by Search
        if (searchQuery) {
            result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Sort
        if (sortBy === "price_asc") {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price_desc") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [filter, sortBy, searchQuery, products]);

    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-gold/30">

            {/* Header Section */}
            <header className="px-8 md:px-24 py-16 border-b border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.3em] font-bold"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return Home
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none whitespace-nowrap gold-text">
                            THE COLLECTIONS
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search & Meta */}
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH SCENTS..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-full py-4 pl-14 pr-8 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-gold/30 transition-all placeholder:text-white/30"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Cart Trigger */}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-4 bg-white/[0.03] border border-white/10 rounded-full hover:border-gold/50 transition-all group"
                        >
                            <ShoppingBag className="w-5 h-5 text-white/70 group-hover:text-gold transition-colors" />
                            {itemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                                    {itemsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Filter / Sort Bar */}
            <section className="px-8 md:px-24 py-8 border-b border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {dynamicCategories.map((cat: string) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${filter === cat
                                    ? "bg-gold text-black border-gold font-black shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
                                    : "bg-transparent border-white/10 text-white/70 hover:text-white hover:border-white/30"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-4 group px-4 py-2 hover:bg-white/[0.03] rounded-xl transition-all"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-gold/40 group-hover:text-gold transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">
                                {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
                            </span>
                            <ChevronDown className={`w-3 h-3 text-white/30 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-56 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                                    >
                                        <div className="py-2">
                                            {SORT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setSortBy(opt.value);
                                                        setIsSortOpen(false);
                                                    }}
                                                    className={`w-full text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between group
                                                        ${sortBy === opt.value ? 'bg-gold/10 text-gold' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    {opt.label}
                                                    {sortBy === opt.value && <div className="w-1 h-1 rounded-full bg-gold shadow-[0_0_8px_#D4AF37]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Product Grid */}
            <section className="px-8 md:px-24 py-16 min-h-[60vh]">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                        >
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="group relative"
                                >
                                    <div className="aspect-[4/5] bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden relative group-hover:border-gold/20 transition-all duration-500 backdrop-blur-sm flex flex-col">
                                        {/* Background Spotlight on Hover */}
                                        <div className="absolute inset-0 bg-radial-gradient from-gold/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                        {/* Category Tag */}
                                        <div className="absolute top-5 left-5 z-20">
                                            <span className="px-3 py-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-md text-[7px] font-bold uppercase tracking-widest text-gold/60 group-hover:text-gold transition-colors">
                                                {product.category}
                                            </span>
                                        </div>

                                        {/* Image Container */}
                                        <Link href={`/products/${product.id}`} className="flex-grow flex items-center justify-center p-12 transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-4">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={240}
                                                height={300}
                                                className="object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_30px_60px_rgba(212,175,55,0.15)] transition-all duration-700"
                                            />
                                        </Link>

                                        {/* Bottom Info (Always Visible) */}
                                        <div className="px-6 pb-6 pt-2 z-10 relative">
                                            <div className="flex justify-between items-end">
                                                {/* Name & Title */}
                                    <div className="space-y-1">
                                        <Link href={`/products/${product.id}`} className="block group/title">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90 group-hover/title:text-gold transition-colors">{product.name}</h3>
                                            <p className="text-[9px] text-white/30 uppercase tracking-[0.1em] font-bold">{product.category}</p>
                                        </Link>
                                    </div>
                                                <div className="text-right">
                                                    <span className="text-base font-black text-white/80 group-hover:text-gold transition-colors duration-300">Rs {product.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Overlaid Info (Revealed on Hover) */}
                                        <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center text-center backdrop-blur-3xl translate-y-4 group-hover:translate-y-0 z-30 overflow-hidden">
                                            {/* Link Wrapper for the whole overlay area */}
                                            <Link href={`/products/${product.id}`} className="absolute inset-0 z-0 cursor-pointer" />
                                            
                                            <div className="relative z-10 p-10 space-y-6 pointer-events-none">
                                                <div className="flex justify-center gap-4 text-gold/60">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span className="text-[6px] uppercase font-black tracking-widest">{product.notes.top}</span>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-white/5" />
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <Droplets className="w-3.5 h-3.5" />
                                                        <span className="text-[6px] uppercase font-black tracking-widest">{product.notes.heart}</span>
                                                    </div>
                                                    <div className="w-[1px] h-6 bg-white/5" />
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <Wind className="w-3.5 h-3.5" />
                                                        <span className="text-[6px] uppercase font-black tracking-widest">{product.notes.base}</span>
                                                    </div>
                                                </div>
                                                <div className="group/desc">
                                                    <p className="text-white/40 text-[10px] leading-relaxed italic font-light max-w-[180px] mx-auto transition-colors">
                                                        &quot;{product.description}&quot;
                                                    </p>
                                                    <span className="text-[7px] text-gold/60 uppercase tracking-[0.4em] font-bold mt-2 block">Discover the Story</span>
                                                </div>
                                            </div>

                                            <div className="relative z-20 pb-10">
                                                <button 
                                                    onClick={() => addToCart(product)}
                                                    className="bg-gold text-black hover:bg-white hover:text-black transition-all duration-300 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto active:scale-95 shadow-[0_15px_30px_rgba(212,175,55,0.2)]"
                                                >
                                                    ADD TO BAG
                                                    <ShoppingBag className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Empty State */}
                    {filteredProducts.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full py-40 flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <Search className="w-12 h-12 text-white/10" />
                            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">No scents matching your selection.</p>
                            <button onClick={() => { setFilter("All"); setSearchQuery(""); }} className="text-gold text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-8">Clear all filters</button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="px-8 md:px-24 py-16 border-t border-white/5 opacity-40">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-[8px] uppercase tracking-[0.4em] font-black">
                    <span>RAANAI &copy; 2024</span>
                    <div className="flex gap-8">
                        <span className="cursor-pointer hover:text-gold">PRIVACY</span>
                        <span className="cursor-pointer hover:text-gold">TERMS</span>
                        <span className="cursor-pointer hover:text-gold">SHIPPING</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
