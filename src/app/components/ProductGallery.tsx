"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

/** A drag has to clear one of these before it counts as a swipe to the next shot. */
const SWIPE_DISTANCE = 55;
const SWIPE_VELOCITY = 350;
/** Drag the full-screen photo this far down and the viewer closes. */
const DISMISS_DISTANCE = 130;
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const TAP_SCALE = 2.5;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Slide distance is the measured frame width in px, not "100%": a drag sets
 * `x` in pixels, and mixing the two units makes the release jump.
 */
type SlideCustom = { dir: number; w: number };

const slideVariants = {
  enter: ({ dir, w }: SlideCustom) => ({ x: dir >= 0 ? w : -w, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: ({ dir, w }: SlideCustom) => ({ x: dir >= 0 ? -w : w, opacity: 0 }),
};

type Props = { images: string[]; alt: string };

/**
 * Product image slider. The dots used to be the only way to change photo, and
 * their 10px hit area made them near-impossible to tap on a phone, so the
 * slider now also swipes, has arrows, and opens a pinch/double-tap zoom view.
 */
export default function ProductGallery({ images, alt }: Props) {
  const count = images.length;
  // Direction rides along with the index so the outgoing photo knows which way to leave.
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [zoomOpen, setZoomOpen] = useState(false);
  // Set while a drag is in flight so the drag does not also open the zoom view.
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);

  // The slide animation travels one frame width, so it has to be measured.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    // The observer reports the current size as soon as it starts observing.
    const ro = new ResizeObserver(([entry]) => setFrameWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paginate = useCallback(
    (dir: number) => setSlide(([i]) => [(i + dir + count) % count, dir]),
    [count],
  );

  const jumpTo = useCallback(
    (next: number) => setSlide(([i]) => (next === i ? [i, 0] : [next, next > i ? 1 : -1])),
    [],
  );

  return (
    <div className="relative group h-full flex items-center">
      <motion.div
        ref={frameRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="aspect-square lg:aspect-[4/5] w-full max-h-[60vh] bg-white/[0.02] border border-white/5 rounded-[40px] relative overflow-hidden"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-gold/10 to-transparent opacity-30 blur-3xl" />

        <AnimatePresence initial={false} custom={{ dir: direction, w: frameWidth }}>
          <motion.div
            key={`${images[index]}-${index}`}
            custom={{ dir: direction, w: frameWidth }}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 320, damping: 34 }, opacity: { duration: 0.2 } }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragMomentum={false}
            onDragStart={() => {
              dragging.current = true;
            }}
            onDragEnd={(_, info) => {
              const { offset, velocity } = info;
              if (Math.abs(offset.x) > SWIPE_DISTANCE || Math.abs(velocity.x) > SWIPE_VELOCITY) {
                paginate(offset.x < 0 ? 1 : -1);
              }
              // The click that follows the drag has to be swallowed first.
              setTimeout(() => {
                dragging.current = false;
              }, 80);
            }}
            onClick={() => {
              if (dragging.current) {
                dragging.current = false;
                return;
              }
              setZoomOpen(true);
            }}
            className="absolute inset-0 z-10 p-8 md:p-12 cursor-zoom-in touch-pan-y"
          >
            <Image
              src={images[index]}
              alt={`${alt} — image ${index + 1} of ${count}`}
              fill
              sizes="(max-width: 1024px) 92vw, 45vw"
              draggable={false}
              priority={index === 0}
              className="object-contain select-none pointer-events-none filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom affordance — the whole photo is tappable, this just says so. */}
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label="Zoom in on this image"
          className="absolute top-4 right-4 md:top-5 md:right-5 z-30 flex items-center gap-2 px-3 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-gold hover:border-gold/40 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
          <span className="hidden md:inline text-[9px] uppercase tracking-[0.25em] font-black">Zoom</span>
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous image"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next image"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Gallery picker. Each dot now sits in a ~30px pad so it can
                actually be hit with a thumb; the dark pill keeps them legible
                over both bright and dark photos. */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === index}
                  className="p-2.5 grid place-items-center"
                >
                  <span
                    className={`block w-2.5 h-2.5 rounded-full transition-all ${
                      i === index
                        ? "bg-gold scale-125 shadow-[0_0_8px_rgba(226,187,97,0.8)]"
                        : "bg-white/60 hover:bg-white"
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {zoomOpen && (
          <ZoomViewer
            images={images}
            alt={alt}
            index={index}
            onNavigate={paginate}
            onJump={jumpTo}
            onClose={() => setZoomOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type View = { scale: number; x: number; y: number };

type Gesture =
  | { kind: "pan"; id: number; startX: number; startY: number; from: View; moved: boolean }
  | { kind: "pinch"; dist: number; mid: { x: number; y: number }; from: View };

/**
 * Full-screen photo viewer: pinch or wheel to zoom, double-tap to toggle,
 * drag to pan once zoomed, swipe sideways to change photo, drag down to close.
 */
function ZoomViewer({
  images,
  alt,
  index,
  onNavigate,
  onJump,
  onClose,
}: Props & {
  index: number;
  onNavigate: (dir: number) => void;
  onJump: (i: number) => void;
  onClose: () => void;
}) {
  const count = images.length;
  const frameRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ scale: MIN_SCALE, x: 0, y: 0 });
  const [dragX, setDragX] = useState(0);
  const [gesturing, setGesturing] = useState(false);
  // Natural size of the loaded photo — needed to keep panning inside its edges.
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);

  // A different photo always arrives fitted, not stuck at the last zoom.
  // Adjusted during render rather than in an effect so the new photo never
  // paints once at the old transform first.
  const [shownIndex, setShownIndex] = useState(index);
  if (shownIndex !== index) {
    setShownIndex(index);
    setView({ scale: MIN_SCALE, x: 0, y: 0 });
    setDragX(0);
    setNat(null);
  }

  // Escape closes, arrows step through, and the page behind stays put.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onNavigate]);

  /** Keep the pan inside the drawn photo so it can never be dragged off-screen. */
  const clampOffset = useCallback(
    (o: { x: number; y: number }, scale: number) => {
      const frame = frameRef.current;
      if (!frame || !nat) return o;
      const fw = frame.clientWidth;
      const fh = frame.clientHeight;
      const fit = Math.min(fw / nat.w, fh / nat.h);
      const maxX = Math.max(0, (nat.w * fit * scale - fw) / 2);
      const maxY = Math.max(0, (nat.h * fit * scale - fh) / 2);
      return { x: clamp(o.x, -maxX, maxX), y: clamp(o.y, -maxY, maxY) };
    },
    [nat],
  );

  /** Zoom to `next`, keeping whatever sits under (clientX, clientY) in place. */
  const zoomAt = useCallback(
    (next: number, clientX?: number, clientY?: number) => {
      const s = clamp(next, MIN_SCALE, MAX_SCALE);
      if (s <= MIN_SCALE) {
        setView({ scale: MIN_SCALE, x: 0, y: 0 });
        return;
      }
      const frame = frameRef.current;
      setView((v) => {
        let px = 0;
        let py = 0;
        if (frame && clientX !== undefined && clientY !== undefined) {
          const r = frame.getBoundingClientRect();
          px = clientX - (r.left + r.width / 2);
          py = clientY - (r.top + r.height / 2);
        }
        // The photo point under the cursor, in unscaled coordinates.
        const ux = (px - v.x) / v.scale;
        const uy = (py - v.y) / v.scale;
        const o = clampOffset({ x: px - ux * s, y: py - uy * s }, s);
        return { scale: s, x: o.x, y: o.y };
      });
    },
    [clampOffset],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    frameRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setGesturing(true);
    if (pointers.current.size === 1) {
      gesture.current = {
        kind: "pan",
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        from: view,
        moved: false,
      };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        kind: "pinch",
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        from: view,
      };
      setDragX(0);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const frame = frameRef.current;
    if (!g) return;

    if (g.kind === "pinch" && pointers.current.size >= 2 && frame) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const r = frame.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const s = clamp((g.from.scale * dist) / g.dist, MIN_SCALE, MAX_SCALE);
      // Anchor the pinch on the photo point that sat between the fingers.
      const ux = (g.mid.x - cx - g.from.x) / g.from.scale;
      const uy = (g.mid.y - cy - g.from.y) / g.from.scale;
      const mx = (a.x + b.x) / 2 - cx;
      const my = (a.y + b.y) / 2 - cy;
      const o = clampOffset({ x: mx - ux * s, y: my - uy * s }, s);
      setView({ scale: s, x: o.x, y: o.y });
      return;
    }

    if (g.kind === "pan" && g.id === e.pointerId) {
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
      if (g.from.scale > MIN_SCALE) {
        const o = clampOffset({ x: g.from.x + dx, y: g.from.y + dy }, g.from.scale);
        setView({ scale: g.from.scale, x: o.x, y: o.y });
      } else if (count > 1) {
        setDragX(dx * 0.6);
      }
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    try {
      frameRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* the pointer was already released */
    }
    if (pointers.current.size === 0) setGesturing(false);

    if (g?.kind === "pinch") {
      if (pointers.current.size === 1) {
        // One finger left: carry on as a pan from where it now is.
        const [id] = [...pointers.current.keys()];
        const p = pointers.current.get(id)!;
        gesture.current = { kind: "pan", id, startX: p.x, startY: p.y, from: view, moved: true };
      } else {
        gesture.current = null;
        // Barely zoomed when the pinch ended — snap back to a clean fit.
        if (view.scale <= MIN_SCALE + 0.02) setView({ scale: MIN_SCALE, x: 0, y: 0 });
      }
      return;
    }

    if (g?.kind !== "pan" || g.id !== e.pointerId) return;
    gesture.current = null;
    setDragX(0);
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (g.from.scale <= MIN_SCALE) {
      if (count > 1 && Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
        onNavigate(dx < 0 ? 1 : -1);
        return;
      }
      if (Math.abs(dy) > DISMISS_DISTANCE && Math.abs(dy) > Math.abs(dx)) {
        onClose();
        return;
      }
    }

    if (g.moved) return;

    // A tap. A second one inside 300ms toggles the zoom (mouse double-click included).
    const now = Date.now();
    const prev = lastTap.current;
    lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    if (prev && now - prev.t < 300 && Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < 30) {
      lastTap.current = null;
      zoomAt(view.scale > MIN_SCALE ? MIN_SCALE : TAP_SCALE, e.clientX, e.clientY);
    }
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    gesture.current = null;
    setDragX(0);
    if (pointers.current.size === 0) setGesturing(false);
  };

  const zoomedIn = view.scale > MIN_SCALE;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — zoomed image ${index + 1} of ${count}`}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col"
    >
      {/* Top bar */}
      <div className="relative z-20 shrink-0 flex items-center justify-between px-5 md:px-8 py-4">
        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/50">
          {index + 1} / {count}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoomAt(view.scale - 0.6)}
            disabled={!zoomedIn}
            aria-label="Zoom out"
            className="p-2.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomAt(view.scale + 0.6)}
            disabled={view.scale >= MAX_SCALE}
            aria-label="Zoom in"
            className="p-2.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close zoom"
            className="p-2.5 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo */}
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={onPointerCancel}
        onWheel={(e) => zoomAt(view.scale * (1 - e.deltaY * 0.0016), e.clientX, e.clientY)}
        style={{ touchAction: "none" }}
        className={`relative flex-1 overflow-hidden select-none ${
          zoomedIn ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
        }`}
      >
        <div
          className={`absolute inset-0 will-change-transform ${
            gesturing ? "" : "transition-transform duration-200"
          }`}
          style={{ transform: `translate3d(${view.x + dragX}px, ${view.y}px, 0) scale(${view.scale})` }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={`${images[index]}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 p-4 md:p-10"
            >
              <Image
                src={images[index]}
                alt={`${alt} — image ${index + 1} of ${count}`}
                fill
                sizes="100vw"
                priority
                draggable={false}
                onLoad={(e) => {
                  const t = e.currentTarget;
                  if (t.naturalWidth) setNat({ w: t.naturalWidth, h: t.naturalHeight });
                }}
                className="object-contain select-none"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => onNavigate(-1)}
            aria-label="Previous image"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate(1)}
            aria-label="Next image"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom bar: the hint plus thumbnails to jump between shots. */}
      <div className="relative z-20 shrink-0 flex flex-col items-center gap-3 px-5 pb-6 pt-2">
        <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-white/35 text-center">
          {zoomedIn ? "Drag to move — double tap to fit" : "Pinch or double tap to zoom"}
        </p>
        {count > 1 && (
          <div className="flex items-center gap-2">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                className={`relative w-14 h-14 rounded-2xl overflow-hidden border transition-all ${
                  i === index ? "border-gold opacity-100" : "border-white/10 opacity-50 hover:opacity-90"
                }`}
              >
                <Image src={src} alt="" fill sizes="56px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
