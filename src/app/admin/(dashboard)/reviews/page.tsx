"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star, Loader2, CheckCircle, XCircle, Trash2, Clock, ShieldCheck, AlertCircle
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";

interface Review {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  photos: string[];
  photoCount: number;
  isVerified: boolean;
  status: string;
  orderId: string | null;
  createdAt: string;
}

const FILTERS = [
  { key: "pending", label: "Awaiting Review" },
  { key: "approved", label: "Published" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const STATUS_STYLE: Record<string, string> = {
  pending: "text-amber-300 bg-amber-500/10 border-amber-500/25",
  approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const Stars = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`w-3.5 h-3.5 ${n <= value ? "text-gold fill-gold" : "text-white/15"}`} />
    ))}
  </div>
);

export default function ReviewsPage() {
  const { products } = useProducts();
  const [filter, setFilter] = useState("pending");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const productName = (id: number) =>
    products.find((p) => p.id === id)?.name || `Product #${id}`;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews?status=${filter}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load reviews");
      setReviews(data.reviews || []);
    } catch (err: any) {
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id: number, status: string) => {
    setActing(id);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActing(null);
    }
  };

  const remove = async (id: number) => {
    setActing(id);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setConfirmDelete(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActing(null);
    }
  };

  const pendingCount = filter === "pending" ? reviews.length : null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Reviews</h1>
          <p className="text-[11px] text-white/30 font-medium">
            Nothing appears on the website until you publish it.
          </p>
        </div>
        {pendingCount !== null && pendingCount > 0 && (
          <div className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-500/25 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {pendingCount} waiting
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all
              ${filter === f.key
                ? "bg-gold/10 border-gold/40 text-gold"
                : "bg-transparent border-white/10 text-white/30 hover:text-white/60"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <Star className="w-10 h-10 text-white/10 mx-auto" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/25 font-bold">
            {filter === "pending" ? "Nothing waiting for review" : "No reviews here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-[28px] border border-white/5 bg-white/[0.02] p-6 space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars value={r.rating} />
                    <span className="text-[12px] font-black uppercase tracking-widest text-white/90">{r.authorName}</span>
                    {r.isVerified && (
                      <span className="text-[7px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified Purchase
                      </span>
                    )}
                    <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_STYLE[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-white/25 font-bold">
                    {productName(r.productId)} &nbsp;·&nbsp; {new Date(r.createdAt).toLocaleDateString()}
                    {r.orderId && <> &nbsp;·&nbsp; order {r.orderId}</>}
                  </p>
                </div>
              </div>

              {/* Content */}
              {r.title && <p className="text-sm font-black text-white">{r.title}</p>}
              {r.body ? (
                <p className="text-white/50 text-[12px] leading-relaxed">{r.body}</p>
              ) : (
                <p className="text-white/20 text-[11px] italic">Rating only — no comment left.</p>
              )}

              {/* Photos. These are unpublished, so they load through the
                  admin-gated proxy rather than a public URL. */}
              {r.photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {r.photos.map((src, idx) => (
                    <a
                      key={idx}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-24 h-24 rounded-xl overflow-hidden border border-white/10 hover:border-gold/40 transition-colors"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                {r.status !== "approved" && (
                  <button
                    onClick={() => setStatus(r.id, "approved")}
                    disabled={acting === r.id}
                    className="h-11 px-6 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/25 disabled:opacity-40 transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {acting === r.id ? "Publishing..." : "Publish"}
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(r.id, "rejected")}
                    disabled={acting === r.id}
                    className="h-11 px-6 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest hover:text-rose-300 hover:border-rose-500/30 disabled:opacity-40 transition-all flex items-center gap-2"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                {r.status === "approved" && (
                  <button
                    onClick={() => setStatus(r.id, "pending")}
                    disabled={acting === r.id}
                    className="h-11 px-6 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white disabled:opacity-40 transition-all"
                  >
                    Unpublish
                  </button>
                )}

                <div className="flex-grow" />

                {confirmDelete === r.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-rose-300 font-bold">Delete for good?</span>
                    <button
                      onClick={() => remove(r.id)}
                      disabled={acting === r.id}
                      className="h-11 px-5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/25 disabled:opacity-40"
                    >
                      {acting === r.id ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="h-11 px-5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(r.id)}
                    className="h-11 px-4 rounded-xl text-white/20 hover:text-rose-300 transition-colors"
                    title="Delete permanently, including photos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
