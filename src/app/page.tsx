"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductContext";
import { BUSINESS, LEGAL_PAGES, telHref, whatsappHref } from "@/data/legal";
import { COD_ADVANCE, COD_DELIVERY_FEE, ONLINE_DISCOUNT_PERCENT } from "@/data/pricing";
import "./home.css";

// The launch fragrance. Price, name and stock come from the live catalogue;
// the id is the fixed products-table id for 7TH OCT.
const PRODUCT_ID = 71099;
const PRODUCT_HREF = `/products/${PRODUCT_ID}`;
const MAX_QTY = 10;

const NOTES = [
  {
    id: "first",
    label: "01 / Top notes",
    title: "Crisp apple. Rich davana.",
    body: "A bright, expressive introduction. Crisp apple meets the distinctive richness of davana, opening the story with contrast.",
  },
  {
    id: "heart",
    label: "02 / Heart notes",
    title: "Rose. Cedarwood. Osmanthus.",
    body: "Damask rose and osmanthus unfold against cedarwood, bringing floral nuance and a composed woody character to the heart.",
  },
  {
    id: "trail",
    label: "03 / Base notes",
    title: "Vanilla. Tonka. Patchouli.",
    body: "Vanilla absolute and tonka bean meet the earthy depth of patchouli. A warm, textured close to a personal story.",
  },
];

const NAV = [
  { href: "#fragrance", label: "The fragrance" },
  { href: "#story", label: "Our story" },
  { href: "#notes", label: "The experience" },
];

export default function Home() {
  const { addToCart, setIsCartOpen, itemsCount } = useCart();
  const { products } = useProducts();
  const product = products.find((p) => p.id === PRODUCT_ID);

  const [qty, setQty] = useState(1);
  const [activeNote, setActiveNote] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stickyShown, setStickyShown] = useState(false);
  // Admin-editable COD charge, fetched the way the product page fetches it.
  const [codFee, setCodFee] = useState<number>(COD_DELIVERY_FEE);

  const rootRef = useRef<HTMLDivElement>(null);
  const storyImgRef = useRef<HTMLImageElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuOpenRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.deliveryFee !== undefined) setCodFee(data.settings.deliveryFee);
      })
      .catch(() => {
        /* Keep the default. */
      });
  }, []);

  // React does not reliably render the `muted` attribute, and iOS refuses to
  // autoplay a film it thinks has sound, so mute and start them by hand.
  useEffect(() => {
    rootRef.current?.querySelectorAll("video").forEach((v) => {
      v.muted = true;
      v.play().catch(() => {
        /* Autoplay blocked: the poster stays up. */
      });
    });
  }, []);

  // Scroll reveals are a progressive enhancement: content is visible until
  // this runs, and stays visible for reduced-motion visitors.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootRef.current;
    if (reduced || !("IntersectionObserver" in window) || !root) return;
    // Set on the DOM directly: className below is static, so React never
    // overwrites it.
    root.classList.add("js-motion");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.07 }
    );
    root.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Sticky buy bar (mobile) and a gentle parallax on the story photo (desktop).
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scheduled = false;
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        setStickyShown(window.scrollY > 650);
        const img = storyImgRef.current;
        if (img && !reduced && window.innerWidth > 760) {
          const r = img.parentElement!.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) {
            img.style.transform = `translateY(${Math.max(-70, Math.min(70, -r.top * 0.08))}px)`;
          }
        }
        scheduled = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock page scroll, close on Escape, return focus on close.
  useEffect(() => {
    if (!menuOpen) return;
    const opener = menuOpenRef.current;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [menuOpen]);

  const addToBag = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    setIsCartOpen(true);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = NOTES.length;
    const target =
      e.key === "ArrowRight" ? (i + 1) % n :
      e.key === "ArrowLeft" ? (i + n - 1) % n :
      e.key === "Home" ? 0 :
      e.key === "End" ? n - 1 : -1;
    if (target < 0) return;
    e.preventDefault();
    setActiveNote(target);
    tabRefs.current[target]?.focus();
  };

  const price = product?.price;
  const money = (n: number) => `Rs ${n.toLocaleString()}`;
  const outOfStock = product !== undefined && product.stock <= 0;
  const tel = telHref(BUSINESS.phone) ?? undefined;
  const wa = whatsappHref(BUSINESS.whatsapp) ?? undefined;

  return (
    <div ref={rootRef} className="rh">
      <a className="skip" href="#main">Skip to content</a>
      <div className="announcement">The first chapter · Discover 7th October</div>

      <header className="header">
        <div className="wrap nav">
          <a className="logo" href="#" aria-label="Raanae home">
            <Image className="logo-image" src="/raanae-logo.webp" alt="Raanae" width={1538} height={2176} priority />
          </a>
          <nav className="desktop-links" aria-label="Main navigation">
            {NAV.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
            <Link href={PRODUCT_HREF}>Order</Link>
          </nav>
          <div className="nav-actions">
            <button className="bag-button" onClick={() => setIsCartOpen(true)} aria-label="Open bag">
              <span className="bag-label">Bag</span>
              <svg viewBox="0 0 24 26" fill="none" aria-hidden="true">
                <path d="M3 8h18l1 16H2L3 8Z" stroke="currentColor" />
                <path d="M8 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" />
              </svg>
              <span>{itemsCount}</span>
            </button>
            <button
              ref={menuOpenRef}
              className="menu-button"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-media">
            <video autoPlay muted loop playsInline preload="metadata" poster="/home/hero-poster.jpg" aria-label="Raanae 7th October cinematic fragrance film">
              <source src="/home/hero-film.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="film-grain" aria-hidden="true"></div>
          <div className="wrap hero-inner">
            <div className="hero-copy">
              <div className="eyebrow gold">Independent spirit. Pakistani soul.</div>
              <h1 id="hero-title">A presence.<br /><em>A purpose.</em></h1>
              <p className="hero-description">
                Introducing 7th October. Our debut fragrance, inspired by the courage to stand tall and the freedom to be.
              </p>
              <div className="hero-ctas">
                <a className="button" href="#fragrance">Discover the fragrance</a>
                <a className="text-link" href="#story">The story behind it</a>
              </div>
              <div className="launch-note">The first fragrance by Raanae</div>
            </div>
          </div>
          <div className="hero-foot">
            <span className="edition">Chapter 01 / 7th October</span>
            <span>A fragrance with conviction</span>
          </div>
        </section>

        <div className="intro-strip">
          <div className="wrap">
            <span>A Pakistani fragrance house</span>
            <span>Rooted in meaning</span>
            <span>Made to leave an impression</span>
          </div>
        </div>

        <section className="product" id="fragrance" aria-labelledby="product-title">
          <div className="wrap">
            <div className="section-top reveal">
              <div className="eyebrow">The debut collection / 01</div>
              <h2>Some things stay<br />with you.</h2>
            </div>
            <div className="product-grid">
              <div className="product-visual reveal">
                <Image src="/home/packshot.webp" alt="7th October perfume and presentation box by Raanae" width={1200} height={1500} sizes="(max-width: 760px) 100vw, 50vw" />
                <div className="image-caption"><span>The first chapter</span><span>Raanae</span></div>
              </div>
              <div className="product-info reveal">
                <div className="eyebrow">The signature debut</div>
                <h3 id="product-title">7th October</h3>
                <p className="product-type">A fragrance by Raanae</p>
                <p className="product-story">
                  A name to remember. A presence that is entirely your own. Our first fragrance brings the spirit of Raanae to life: considered, expressive and grounded in something deeper.
                </p>

                {/* Online and COD prices differ, so both are spelled out, the
                    same way the product page shows them. */}
                <dl className="price-pair">
                  <div className="online">
                    <dt>Pay online</dt>
                    <dd>
                      <span className="price">{price !== undefined ? money(price) : "—"}</span>
                      <small>{ONLINE_DISCOUNT_PERCENT}% off + free delivery</small>
                    </dd>
                  </div>
                  <div className="cod">
                    <dt>Cash on delivery</dt>
                    <dd>
                      <span className="price">{price !== undefined ? money(price + codFee) : "—"}</span>
                      <small>Rs {COD_ADVANCE.toLocaleString()} advance to book</small>
                    </dd>
                  </div>
                </dl>

                <div className="purchase-controls">
                  <div className="quantity" aria-label="Select quantity">
                    <button type="button" aria-label="Decrease quantity" disabled={qty === 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                    <output aria-live="polite">{qty}</output>
                    <button type="button" aria-label="Increase quantity" disabled={qty === MAX_QTY} onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}>+</button>
                  </div>
                  <button className="button" onClick={addToBag} disabled={!product || outOfStock}>
                    {outOfStock ? "Out of stock" : "Add to bag"}
                  </button>
                </div>
                <p className="small-notice">
                  Prefer cash? Pay Rs {COD_ADVANCE.toLocaleString()} in advance to book your order, then the rest at the door.{" "}
                  <Link href={PRODUCT_HREF} className="text-link" style={{ fontSize: 11, padding: 0 }}>Full details</Link>
                </p>
                <dl className="product-facts">
                  <div><dt>The house</dt><dd>Raanae, Pakistan</dd></div>
                  <div><dt>Longevity</dt><dd>12+ hours</dd></div>
                  <div><dt>Oil concentration</dt><dd>40%</dd></div>
                  <div><dt>Made for</dt><dd>Him &amp; her</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="craft" aria-labelledby="craft-title">
          <div className="wrap">
            <div className="craft-head reveal">
              <div>
                <div className="eyebrow gold">Made to be noticed</div>
                <h2 id="craft-title">Every detail<br />holds the light.</h2>
              </div>
              <p>The weight of dark glass. The fine lines of the cap. A precise spray. 7th October is designed as an object of presence before the fragrance even touches skin.</p>
            </div>
            <div className="craft-grid">
              <figure className="craft-card reveal">
                <Image src="/home/atomizer.webp" alt="Close view of the gold atomizer spraying a fine perfume mist" fill sizes="(max-width: 760px) 100vw, 60vw" />
                <figcaption className="craft-caption">
                  <span className="eyebrow gold">The first impression</span>
                  <h3>A fine, even mist.</h3>
                  <p>Controlled application. A quiet ritual.</p>
                </figcaption>
              </figure>
              <figure className="craft-card small reveal">
                <Image src="/home/cap.webp" alt="Close view of the ribbed black and gold perfume cap" fill sizes="(max-width: 760px) 100vw, 40vw" />
                <figcaption className="craft-caption">
                  <span className="eyebrow gold">The finishing detail</span>
                  <h3>Black. Gold. Intentional.</h3>
                  <p>A tactile finish made to feel substantial.</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="purpose-film" aria-labelledby="purpose-title">
          <video autoPlay muted loop playsInline preload="none" poster="/home/legacy-poster.jpg" aria-label="Hands passing an olive branch">
            <source src="/home/legacy-film.mp4" type="video/mp4" />
          </video>
          <Image src="/home/purpose.webp" alt="Hands holding an olive branch in warm light" fill sizes="100vw" />
          <div className="purpose-copy reveal">
            <div className="eyebrow gold">What we carry forward</div>
            <h2 id="purpose-title">A symbol of<br /><em>hope.</em></h2>
            <p>The olive branch has lived through generations as a sign of peace, endurance and belonging. In our first chapter, it becomes a quiet reminder: dignity is carried from one hand to another.</p>
          </div>
        </section>

        <section className="notes" id="notes" aria-labelledby="notes-title">
          <div className="wrap">
            <div className="notes-heading reveal">
              <div className="eyebrow">The composition</div>
              <h2 id="notes-title">An impression. Then a memory.</h2>
              <p>Freshness gives way to depth. Warmth stays with the story.</p>
            </div>
            <div className="note-tabs" role="tablist" aria-label="Explore the fragrance notes">
              {NOTES.map((n, i) => (
                <button
                  key={n.id}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  className="note-tab"
                  id={`tab-${n.id}`}
                  role="tab"
                  aria-selected={activeNote === i}
                  aria-controls={`panel-${n.id}`}
                  tabIndex={activeNote === i ? 0 : -1}
                  onClick={() => setActiveNote(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  {n.label}
                </button>
              ))}
            </div>
            {NOTES.map((n, i) => (
              <div key={n.id} className="note-panel" id={`panel-${n.id}`} role="tabpanel" aria-labelledby={`tab-${n.id}`} hidden={activeNote !== i}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="story" id="story" aria-labelledby="story-title">
          <div className="story-photo">
            <Image ref={storyImgRef} src="/home/story.jpg" alt="An atmospheric detail from the world of Raanae" width={1000} height={1200} sizes="(max-width: 760px) 100vw, 50vw" />
            <div className="story-photo-label">Rooted in dignity. Carried with purpose.</div>
          </div>
          <div className="story-copy reveal">
            <div className="eyebrow gold">More than a name</div>
            <h2 id="story-title">Freedom is<br />something<br /><em>you carry.</em></h2>
            <p>Raanae began with a belief: what we create should reflect what we stand for.</p>
            <p>Inspired by the resilience of the Palestinian people, our first chapter is a tribute to dignity, hope and the enduring human spirit. A Pakistani fragrance house with a story that reaches beyond a bottle.</p>
            <p>7th October is both the name of our debut fragrance and the date its story begins.</p>
            <div className="story-sign">The fragrance of freedom.</div>
          </div>
        </section>

        <section className="values" aria-label="The Raanae philosophy">
          <div className="wrap values-grid">
            <article className="reveal">
              <span className="value-number">01</span>
              <h3>Identity, worn well.</h3>
              <p>A Pakistani perspective. An independent spirit. Fragrance for those who know that presence is personal.</p>
            </article>
            <article className="reveal">
              <span className="value-number">02</span>
              <h3>Purpose, held close.</h3>
              <p>Our inspiration begins with human dignity. We honour resilience through considered storytelling, not spectacle.</p>
            </article>
            <article className="reveal">
              <span className="value-number">03</span>
              <h3>A story, unfolding.</h3>
              <p>One fragrance begins the collection. Each chapter to come will carry a character and a meaning of its own.</p>
            </article>
          </div>
        </section>

        <section className="wear" aria-labelledby="wear-title">
          <div className="wrap">
            <div className="wear-head reveal">
              <div>
                <div className="eyebrow">A shared signature</div>
                <h2 id="wear-title">Made for presence.<br />Not a category.</h2>
              </div>
              <p>7th October is for anyone drawn to depth, warmth and a fragrance that feels personal.</p>
            </div>
            <div className="wear-grid">
              <figure className="wear-card reveal">
                <Image src="/home/man.webp" alt="A man applying 7th October perfume at a wooden dresser" fill sizes="(max-width: 760px) 100vw, 50vw" />
                <figcaption className="wear-label"><span>On skin / 01</span><h3>Quiet confidence.</h3></figcaption>
              </figure>
              <figure className="wear-card reveal">
                <Image src="/home/woman.webp" alt="A woman applying 7th October perfume at a wooden vanity" fill sizes="(max-width: 760px) 100vw, 50vw" />
                <figcaption className="wear-label"><span>On skin / 02</span><h3>Entirely your own.</h3></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <div className="chapter-line">
          <span>Chapter 01 · 7th October</span>
          <span>Crisp apple · Rose · Cedarwood · Vanilla · Patchouli</span>
          <span>Raanae · Pakistan</span>
        </div>

        <section className="reviews" id="first-impressions" aria-labelledby="reviews-title">
          <div className="wrap">
            <div className="reveal">
              <div className="eyebrow gold">First impressions</div>
              <h2 id="reviews-title">The next story<br />is yours.</h2>
              <p>Our first chapter is just beginning. Honest experiences from the people wearing Raanae are shared on the product page.</p>
            </div>
            <div className="review-prompt reveal">
              <div className="quote-mark" aria-hidden="true">“</div>
              <h3>What does a fragrance<br />mean to you?</h3>
              <p>When your bottle arrives, take your time with it. We look forward to hearing your unfiltered first impression.</p>
              <Link href={PRODUCT_HREF} className="eyebrow" style={{ display: "inline-block" }}>Read &amp; share reviews →</Link>
            </div>
          </div>
        </section>

        <section className="faq" id="faq" aria-labelledby="faq-title">
          <div className="wrap faq-grid">
            <div className="faq-intro reveal">
              <div className="eyebrow">Before the first spray</div>
              <h2 id="faq-title">A few things<br />to know.</h2>
              <p>A considered purchase starts with clear information.</p>
            </div>
            <div className="reveal">
              <details open>
                <summary>What is 7th October?</summary>
                <p>7th October is the name of Raanae’s first perfume. It launched on 7 October 2026 and marks the beginning of our fragrance collection.</p>
              </details>
              <details>
                <summary>How do I order?</summary>
                <p>Choose your quantity and tap “Add to bag”, then check out. Pay online for {ONLINE_DISCOUNT_PERCENT}% off and free delivery, or choose cash on delivery and pay Rs {COD_ADVANCE.toLocaleString()} in advance to book your order, with the rest paid at the door.</p>
              </details>
              <details>
                <summary>What inspired the fragrance?</summary>
                <p>Raanae’s debut is inspired by Palestinian resilience and the universal values of dignity, hope and freedom. It is a tribute to the human spirit.</p>
              </details>
              <details>
                <summary>How do I apply and care for my fragrance?</summary>
                <p>Apply lightly to pulse points and allow the fragrance to settle without rubbing. Store the bottle away from direct sunlight and heat. Avoid contact with eyes and irritated skin; stop use if irritation occurs.</p>
              </details>
              <details>
                <summary>Will there be more fragrances?</summary>
                <p>Yes. 7th October is our first release. Future fragrances will become new chapters in the Raanae collection.</p>
              </details>
              <details>
                <summary>What about delivery and returns?</summary>
                <p>
                  Delivery is free when you pay online. Full details are in our{" "}
                  <Link href="/shipping-returns" style={{ textDecoration: "underline" }}>shipping &amp; returns policy</Link>.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Closing call-to-action and contact card, hidden for now. To bring it
            back, remove this comment wrapper. The number and its links come
            from BUSINESS, so they only ever change in src/data/legal.ts.
        <section className="final-cta" aria-labelledby="final-title">
          <div className="wrap reveal">
            <div className="eyebrow gold">Raanae · Chapter 01</div>
            <h2 id="final-title">Wear something<br /><em>that means something.</em></h2>
            <p>7th October. The beginning of a lasting story.</p>
            <a className="button" href="#fragrance">Discover 7th October</a>

            <div>
              <div className="contact-card">
                <span className="eyebrow gold">Contact us</span>
                <a className="phone" href={tel}>{BUSINESS.phone}</a>
                <p className="muted">{BUSINESS.hours}</p>
                <div className="contact-actions">
                  <a className="button" href={tel}>Call now</a>
                  <a className="button outline" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
        </section>
        */}
      </main>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="logo" href="#" aria-label="Raanae home">
                <Image className="logo-image" src="/raanae-logo.webp" alt="Raanae" width={1538} height={2176} />
              </a>
              <p>A Pakistani fragrance house.<br />Inspired by freedom. Carried with purpose.</p>
              <div className="footer-contact">
                <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              </div>
            </div>
            <div>
              <h3>Explore</h3>
              <nav className="footer-links" aria-label="Footer navigation">
                <Link href={PRODUCT_HREF}>7th October</Link>
                <a href="#story">Our story</a>
                <a href="#notes">The experience</a>
                <a href="#faq">Questions &amp; answers</a>
              </nav>
            </div>
            <div>
              <h3>Policies</h3>
              <div className="footer-links">
                {LEGAL_PAGES.map((page) => (
                  <Link key={page.href} href={page.href}>{page.label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Raanae. All rights reserved.</span>
            <span>Born in Pakistan. Inspired by freedom.</span>
          </div>
        </div>
      </footer>

      <div className={`sticky-buy${stickyShown ? " shown" : ""}`}>
        <div className="name">7th October<small>THE FIRST FRAGRANCE BY RAANAE</small></div>
        <a href="#fragrance" className="button">Order now</a>
      </div>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation" inert={!menuOpen}>
        <button ref={menuCloseRef} className="close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>×</button>
        <div className="eyebrow">The house of Raanae</div>
        <nav>
          {NAV.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <a href="#faq" onClick={() => setMenuOpen(false)}>A few questions</a>
        </nav>
        <a href="#fragrance" className="button" onClick={() => setMenuOpen(false)}>Discover 7th October</a>
      </div>
    </div>
  );
}
