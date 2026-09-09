import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { BUSINESS, LEGAL_PAGES, isPlaceholder, telHref } from "@/data/legal";

/**
 * Site-wide footer carrying the policy links.
 *
 * The payment gateway's review asks for these policies to be *displayed* on
 * the site, which means reachable from every page rather than merely existing
 * at a URL — so this component belongs at the bottom of each route, and the
 * link list comes from LEGAL_PAGES so a new policy page appears everywhere at
 * once.
 *
 * `variant="ochre"` matches the gold disclaimer bar on the homepage; the
 * default dark variant matches the catalog and checkout pages.
 */
export default function SiteFooter({ variant = "dark" }: { variant?: "dark" | "ochre" }) {
  const ochre = variant === "ochre";
  const tel = telHref(BUSINESS.phone);

  const wrap = ochre
    ? "bg-[#e9d8ab] text-[#4a3813] border-t border-[#b8892f]/30"
    : "bg-black text-white/60 border-t border-white/5";
  const link = ochre
    ? "hover:text-black transition-colors"
    : "hover:text-gold transition-colors";
  const heading = ochre ? "text-[#3d2e13]" : "text-gold";

  return (
    <footer className={`w-full px-6 md:px-16 py-12 ${wrap}`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          {/* Policy links */}
          <nav className="flex flex-col gap-3">
            <span className={`text-[9px] uppercase tracking-[0.3em] font-black ${heading}`}>
              Policies
            </span>
            <ul className="flex flex-col gap-2.5">
              {LEGAL_PAGES.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className={`text-[11px] tracking-wide ${link}`}>
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact details. Required on the contact page, and useful here so a
              customer never has to hunt for a way to reach a human. */}
          <div className="flex flex-col gap-3">
            <span className={`text-[9px] uppercase tracking-[0.3em] font-black ${heading}`}>
              Customer Support
            </span>
            <a
              href={`mailto:${BUSINESS.email}`}
              className={`flex items-center gap-2.5 text-[11px] tracking-wide ${link}`}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {BUSINESS.email}
            </a>
            {tel ? (
              <a href={tel} className={`flex items-center gap-2.5 text-[11px] tracking-wide ${link}`}>
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {BUSINESS.phone}
              </a>
            ) : (
              <span className="flex items-center gap-2.5 text-[11px] tracking-wide opacity-70">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {BUSINESS.phone}
              </span>
            )}
            <span className="text-[10px] tracking-wide opacity-70">{BUSINESS.hours}</span>
          </div>
        </div>

        <div
          className={`flex flex-col md:flex-row justify-between gap-3 pt-6 text-[9px] uppercase tracking-[0.25em] font-bold ${
            ochre ? "border-t border-[#b8892f]/30" : "border-t border-white/5 opacity-60"
          }`}
        >
          <span>
            {BUSINESS.brandName} &copy; {new Date().getFullYear()} — All rights reserved
          </span>
          {!isPlaceholder(BUSINESS.address) && (
            <span className="tracking-[0.15em] normal-case font-medium opacity-80">
              {BUSINESS.address}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
