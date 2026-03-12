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
    Wind
} from 'lucide-react';

// --- Types ---
interface Product {
    id: number;
    name: string;
    price: number;
    category: 'Obsidian' | 'Floral' | 'Woody' | 'Musk';
    description: string;
    notes: {
        top: string;
        heart: string;
        base: string;
    };
    image: string;
}

// --- Dummy Data ---
const PRODUCTS: Product[] = [
    {
        id: 1,
        name: "NOCTURNAL OUD",
        price: 320,
        category: 'Obsidian',
        description: "A deep, smoky journey into the heart of the night.",
        notes: { top: "Saffron", heart: "Oud Wood", base: "Black Leather" },
        image: "/Pic_1_Transparent.png"
    },
    {
        id: 2,
        name: "VELVET ROSE",
        price: 280,
        category: 'Floral',
        description: "The elegance of a midnight bloom, captured in glass.",
        notes: { top: "Bergamot", heart: "Damask Rose", base: "Ambergris" },
        image: "/Pic_1_Transparent.png"
    },
    {
        id: 3,
        name: "OBSIDIAN VII",
        price: 450,
        category: 'Obsidian',
        description: "Our rarest infusion. Pure, architectural, unmatched.",
        notes: { top: "Incense", heart: "Iris Root", base: "Sandalwood" },
        image: "/Pic_1_Transparent.png"
    },
    {
        id: 4,
        name: "SILVER BIRCH",
        price: 240,
        category: 'Woody',
        description: "Clean, crisp, and revitalizing like a morning forest.",
        notes: { top: "Juniper", heart: "Silver Birch", base: "Oakmoss" },
        image: "/Pic_1_Transparent.png"
    },
    {
        id: 5,
        name: "PURE MUSK",
        price: 190,
        category: 'Musk',
        description: "A second skin of warmth and subtle attraction.",
        notes: { top: "White Pepper", heart: "Cotton Bloom", base: "White Musk" },
        image: "/Pic_1_Transparent.png"
    },
    {
        id: 6,
        name: "EMERALD VETIVER",
        price: 260,
        category: 'Woody',
        description: "Earthy depth meeting the vibrance of fresh greens.",
        notes: { top: "Citron", heart: "Vetiver", base: "Cedarwood" },
        image: "/Pic_1_Transparent.png"
    },
    {
        id: 7,
        name: "GLACIER WATER",
        price: 210,
        category: 'Musk',
        description: "The arctic chill meeting a warm horizon.",
        notes: { top: "Sea Salt", heart: "Aldehydes", base: "Ambrette" },
        image: "/Pic_1_Transparent.png"
    },
    {
        id: 8,
        name: "GOLDEN AMBER",
        price: 340,
        category: 'Obsidian',
        description: "Liquid gold. Warm, resinous, and deeply opulent.",
        notes: { top: "Labdanum", heart: "Benzoin", base: "Vanilla Bean" },
        image: "/Pic_1_Transparent.png"
    },
    {
        id: 9,
        name: "NEROLI MIST",
        price: 230,
        category: 'Floral',
        description: "The sun-drenched spirit of the Mediterranean.",
        notes: { top: "Neroli", heart: "Orange Blossom", base: "Petitgrain" },
        image: "/Pic_1_Transparent.png"
    }
];

const CATEGORIES = ["All", "Obsidian", "Floral", "Woody", "Musk"];
const SORT_OPTIONS = [
    { label: "Newest", value: "new" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
];

export default function ProductListPage() {
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState("new");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProducts = useMemo(() => {
        let result = [...PRODUCTS];

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
    }, [filter, sortBy, searchQuery]);

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
                </div>
            </header>

            {/* Filter / Sort Bar */}
            <section className="px-8 md:px-24 py-8 border-b border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {CATEGORIES.map((cat) => (
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
                    <div className="flex items-center gap-4 group">
                        <SlidersHorizontal className="w-4 h-4 text-gold/40 group-hover:text-gold transition-colors" />
                        <select
                            className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none cursor-pointer text-white/80 hover:text-white transition-colors"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-black text-[12px]">{opt.label}</option>
                            ))}
                        </select>
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
                                        <div className="flex-grow flex items-center justify-center p-12 transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-4">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={240}
                                                height={300}
                                                className="object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_30px_60px_rgba(212,175,55,0.15)] transition-all duration-700"
                                            />
                                        </div>

                                        {/* Bottom Info (Always Visible) */}
                                        <div className="px-6 pb-6 pt-2 z-10 relative">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-gold transition-colors duration-300">{product.name}</h3>
                                                    <p className="text-white/40 text-[8px] uppercase tracking-[0.4em] font-bold mt-1">L&apos;EAU DE PARFUM</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-base font-black text-white/80 group-hover:text-gold transition-colors duration-300">${product.price}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Overlaid Info (Revealed on Hover) */}
                                        <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center p-10 text-center backdrop-blur-xl translate-y-4 group-hover:translate-y-0 z-30">
                                            <div className="space-y-6">
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
                                                <p className="text-white/40 text-[10px] leading-relaxed italic font-light max-w-[180px] mx-auto">
                                                    &quot;{product.description}&quot;
                                                </p>
                                                <button className="bg-gold text-black hover:bg-white hover:text-black transition-colors px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                                                    DISCOVER
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
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
                    <span>7th October &copy; 2024</span>
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
