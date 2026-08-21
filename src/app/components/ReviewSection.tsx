"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2, AlertCircle, CheckCircle, ImagePlus, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: number;
  authorName: string;
  rating: number;
  title: string | null;
  body: string | null;
  photos: string[];
  isVerified: boolean;
  createdAt: string;
}

interface Summary {
  average: number;
  count: number;
  distribution: Record<string, number>;
}

const MAX_PHOTOS = 3;

/** Row of stars. Interactive when onPick is supplied. */
const Stars = ({
  value, size = 14, onPick,
}: { value: number; size?: number; onPick?: (n: number) => void }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => {
      const filled = n <= Math.round(value);
      const cls = filled ? "text-gold fill-gold" : "text-white/15";
      if (!onPick) return <Star key={n} style={{ width: size, height: size }} className={cls} />;
      return (
        <button
          key={n}
          type="button"
          onClick={() => onPick(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="p-1 -m-1 hover:scale-125 transition-transform"
        >
          <Star style={{ width: size, height: size }} className={cls} />
        </button>
      );
    })}
  </div>
);

export default function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary>({ average: 0, count: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [orderId, setOrderId] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Full-size photo viewer. Holds the whole photo list so arrows can step
  // through one reviewer's images without closing.
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number; author: string } | null>(null);

  // Escape to close, arrows to move between photos.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((l) => (l ? { ...l, index: (l.index + 1) % l.photos.length } : l));
      if (e.key === "ArrowLeft") setLightbox((l) => (l ? { ...l, index: (l.index - 1 + l.photos.length) % l.photos.length } : l));
    };
    window.addEventListener("keydown", onKey);
    // Stop the page scrolling behind the overlay.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const load = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      if (data.summary) setSummary(data.summary);
    } catch {
      /* a failed load just shows the empty state */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [productId]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const next = [...photos, ...Array.from(files)].slice(0, MAX_PHOTOS);
    setPhotos(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1) return setError("Please choose a star rating.");
    if (!authorName.trim()) return setError("Please enter your name.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("productId", String(productId));
      fd.append("rating", String(rating));
      fd.append("authorName", authorName.trim());
      if (title.trim()) fd.append("title", title.trim());
      if (body.trim()) fd.append("body", body.trim());
      if (orderId.trim()) fd.append("orderId", orderId.trim());
      photos.forEach((p) => fd.append("photos", p));

      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit your review");

      setSubmitted(true);
      setFormOpen(false);
      setRating(0); setAuthorName(""); setTitle(""); setBody(""); setOrderId(""); setPhotos([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:border-gold/50 focus:outline-none transition-colors";

  return (
    <div className="border-t border-white/5 py-16 space-y-12">
      {/* Heading + summary */}
      <div className="text-center space-y-3">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gold/60">Reviews</span>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
          What Our Customers Say
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
        </div>
      ) : (
        <>
          {summary.count > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
              <div className="text-center space-y-2">
                <p className="text-5xl font-black text-white">{summary.average.toFixed(1)}</p>
                <Stars value={summary.average} size={18} />
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                  {summary.count} review{summary.count === 1 ? "" : "s"}
                </p>
              </div>

              <div className="w-full max-w-xs space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = summary.distribution?.[String(star)] || 0;
                  const pct = summary.count ? (n / summary.count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-white/30 w-3">{star}</span>
                      <Star className="w-3 h-3 text-white/20" />
                      <div className="flex-grow h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-gold/70 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-white/25 w-4 text-right">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {submitted && (
            <div className="max-w-md mx-auto flex items-start gap-2 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0 mt-px" />
              <span>Thank you. Your review will appear once it has been approved.</span>
            </div>
          )}

          {/* Write a review */}
          {!formOpen ? (
            <div className="text-center">
              <button
                onClick={() => { setFormOpen(true); setSubmitted(false); }}
                className="px-10 py-4 rounded-full border border-gold/30 text-gold text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold/10 transition-all"
              >
                Write a Review
              </button>
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={submit}
              className="max-w-xl mx-auto rounded-3xl border border-gold/20 bg-gold/[0.02] p-6 md:p-8 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold">Your Review</h3>
                <button type="button" onClick={() => setFormOpen(false)} className="p-1.5 text-white/30 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Your rating</label>
                <Stars value={rating} size={26} onPick={(n) => { setRating(n); setError(null); }} />
              </div>

              <div className="space-y-2">
                <label htmlFor="rv-name" className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Your name</label>
                <input id="rv-name" type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className={inputCls} placeholder="Ayesha K." />
              </div>

              <div className="space-y-2">
                <label htmlFor="rv-title" className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Headline <span className="text-white/20">(optional)</span></label>
                <input id="rv-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Lasts all day" />
              </div>

              <div className="space-y-2">
                <label htmlFor="rv-body" className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">Your review <span className="text-white/20">(optional)</span></label>
                <textarea id="rv-body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} className={`${inputCls} resize-none leading-relaxed`} placeholder="Tell others what you think — or just leave the stars." />
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">
                  Photos <span className="text-white/20">(optional, up to {MAX_PHOTOS})</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                      {/* Local preview only; nothing is uploaded until submit. */}
                      <img src={URL.createObjectURL(p)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                        className="absolute top-0 right-0 bg-black/80 p-0.5 rounded-bl-lg text-white/70 hover:text-rose-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <label className="w-16 h-16 rounded-xl border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-gold/40 transition-colors">
                      <ImagePlus className="w-5 h-5 text-white/25" />
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="rv-order" className="block text-[9px] uppercase tracking-widest text-white/40 font-bold">
                  Order number <span className="text-white/20">(optional)</span>
                </label>
                <input id="rv-order" type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} className={inputCls} placeholder="ORD-1787234049226" />
                <p className="text-[9px] text-white/25 leading-relaxed">
                  Add it to have your review marked as a verified purchase.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#846828] via-[#C8A44D] to-[#E8CD94] text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
              >
                {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending</> : "Submit Review"}
              </button>

              <p className="text-[9px] text-white/25 text-center leading-relaxed">
                Reviews are checked before they appear on the site.
              </p>
            </motion.form>
          )}

          {/* The reviews themselves */}
          {reviews.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {reviews.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars value={r.rating} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-white/80">{r.authorName}</span>
                    {r.isVerified && (
                      <span className="text-[7px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  {r.title && <p className="text-sm font-black text-white">{r.title}</p>}
                  {r.body && <p className="text-white/50 text-[12px] leading-relaxed">{r.body}</p>}

                  {r.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {r.photos.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setLightbox({ photos: r.photos, index: i, author: r.authorName })}
                          className="block w-20 h-20 rounded-xl overflow-hidden border border-white/10 hover:border-gold/40 transition-colors cursor-zoom-in"
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            !formOpen && (
              <p className="text-center text-[11px] uppercase tracking-widest text-white/25 font-bold">
                No reviews yet — be the first
              </p>
            )
          )}
        </>
      )}

      {/* Photo viewer. Clicking the backdrop closes; the image itself does not. */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-5 right-5 p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-gold/40 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-7 left-6 text-[10px] uppercase tracking-[0.2em] font-black text-white/40">
            {lightbox.author}
            {lightbox.photos.length > 1 && (
              <span className="text-white/25"> &nbsp;·&nbsp; {lightbox.index + 1} / {lightbox.photos.length}</span>
            )}
          </div>

          {lightbox.photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.photos.length) % lightbox.photos.length }); }}
                aria-label="Previous photo"
                className="absolute left-3 md:left-6 p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-gold hover:border-gold/40 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.photos.length }); }}
                aria-label="Next photo"
                className="absolute right-3 md:right-6 p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-gold hover:border-gold/40 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <motion.img
            key={lightbox.index}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            src={lightbox.photos[lightbox.index]}
            alt=""
            className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
