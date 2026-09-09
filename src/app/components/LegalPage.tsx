import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import SiteFooter from "./SiteFooter";
import { POLICY_UPDATED, unconfirmedFields } from "@/data/legal";

/**
 * Shared shell for the policy pages (terms, privacy, shipping, complaints,
 * contact).
 *
 * These pages are read, not browsed: the measure is capped at ~68 characters
 * and the body sits at 13px/1.8 rather than the 10px uppercase tracking used
 * for the shop's chrome, which is unreadable at paragraph length.
 *
 * Everything here is a server component -- no hooks, no client bundle.
 */
export default function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Values the client still has to supply. Shown only in development so the
  // gap is impossible to miss while working, and never leaks to a customer.
  const unconfirmed = process.env.NODE_ENV === "production" ? [] : unconfirmedFields();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-gold/30">

      {/* Header */}
      <header className="px-6 md:px-16 pt-10 pb-12 border-b border-white/5">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.3em] font-bold"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return Home
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.3em] font-bold"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shop</span>
            </Link>
          </div>

          <div className="space-y-3">
            <span className="text-gold/70 text-[10px] uppercase tracking-[0.35em] font-bold block">
              {eyebrow}
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight gold-text">
              {title}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/30">
              Last updated: {POLICY_UPDATED}
            </p>
          </div>

          {intro && (
            <div className="text-[13px] leading-[1.85] text-white/70 max-w-[68ch] space-y-4">
              {intro}
            </div>
          )}
        </div>
      </header>

      {unconfirmed.length > 0 && (
        <div className="px-6 md:px-16 pt-8">
          <div className="max-w-3xl mx-auto rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-400 mb-1.5">
              Development notice — not shown in production
            </p>
            <p className="text-[12px] leading-relaxed text-amber-100/80">
              These business details are still placeholders in{" "}
              <code className="text-amber-300">src/data/legal.ts</code>:{" "}
              {unconfirmed.join(", ")}. Replace them with the client&apos;s real values
              before going live.
            </p>
          </div>
        </div>
      )}

      {/* Body */}
      <article className="px-6 md:px-16 py-14">
        <div className="max-w-3xl mx-auto space-y-12">{children}</div>
      </article>

      <SiteFooter />
    </main>
  );
}

/** A numbered top-level clause. */
export function Section({
  n,
  title,
  children,
}: {
  n?: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[15px] md:text-base font-black uppercase tracking-[0.12em] text-gold flex gap-3">
        {n !== undefined && <span className="text-white/25 tabular-nums shrink-0">{String(n).padStart(2, "0")}</span>}
        <span>{title}</span>
      </h2>
      {/* The indent lines body copy up with the heading text, clearing the
          number in the gutter. An unnumbered section has no gutter to clear. */}
      <div
        className={`space-y-4 text-[13px] leading-[1.85] text-white/70 max-w-[68ch] ${
          n !== undefined ? "md:pl-9" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}

/** A sub-heading inside a clause. */
export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 pt-2">
      {children}
    </h3>
  );
}

/** Bulleted list. Gold markers, because `list-disc` inherits the muted body colour. */
export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="text-gold/60 shrink-0 select-none pt-0.5">&mdash;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Ordered steps, used for the complaint-handling stages. */
export function Steps({ items }: { items: Array<{ title: string; body: React.ReactNode; meta?: string }> }) {
  return (
    <ol className="space-y-4">
      {items.map((step, i) => (
        <li
          key={i}
          className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 flex gap-4"
        >
          <span className="w-7 h-7 shrink-0 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-black flex items-center justify-center tabular-nums">
            {i + 1}
          </span>
          <div className="space-y-1.5 min-w-0">
            <p className="text-[12px] font-black uppercase tracking-[0.15em] text-white/90">
              {step.title}
            </p>
            {step.meta && (
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold/70">
                {step.meta}
              </p>
            )}
            <div className="text-[13px] leading-[1.8] text-white/65">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Highlighted aside for the points a customer must not miss. */
export function Callout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gold/25 bg-gold/[0.05] px-5 py-4 space-y-1.5">
      {title && (
        <p className="text-[10px] uppercase tracking-[0.25em] font-black text-gold">{title}</p>
      )}
      <div className="text-[12.5px] leading-[1.8] text-white/75">{children}</div>
    </div>
  );
}

/** Inline link styled for body copy. */
export function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gold hover:underline underline-offset-4">
      {children}
    </Link>
  );
}
