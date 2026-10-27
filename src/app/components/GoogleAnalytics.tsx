"use client";

import Script from "next/script";
import { GA4_ID } from "@/lib/analytics";

/**
 * Google Analytics 4 (gtag.js), for the property in GA4_ID (lib/analytics.ts).
 * Client-side route changes are counted by GA4's enhanced measurement
 * ("Page changes based on browser history events", on by default), so there
 * is no manual page_view here -- adding one would double count.
 */
export default function GoogleAnalytics() {
  if (!GA4_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
      </Script>
    </>
  );
}
