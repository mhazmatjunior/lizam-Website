"use client";

import { useEffect, useState } from "react";

/** Scroll depth before the bar may appear, so it never covers the first screen. */
const MIN_SCROLL = 300;

/**
 * Whether a page's sticky mobile buy bar should be showing.
 *
 * Shown once the shopper has scrolled past the first screen and the page's
 * main Add to Bag button is off-screen -- above or below. Hidden whenever that
 * button is visible, so the two never compete, and while `suppressed` (the
 * cart drawer is open).
 *
 * Returns the flag and a callback ref for the main button. A callback ref,
 * not useRef, because the button mounts only after the product loads and the
 * observer has to attach then.
 */
export function useStickyBuyBar(suppressed = false) {
  const [cta, setCta] = useState<HTMLElement | null>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!cta) return;
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting));
    io.observe(cta);
    return () => io.disconnect();
  }, [cta]);

  useEffect(() => {
    let scheduled = false;
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > MIN_SCROLL);
        scheduled = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { shown: scrolled && !ctaVisible && !suppressed, ctaRef: setCta };
}
