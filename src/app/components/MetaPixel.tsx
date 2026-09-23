"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/** Meta (Facebook) Pixel ID, from the Events Manager setup page. */
export const META_PIXEL_ID = "1078262171838173";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Meta Pixel.
 *
 * Meta's instructions say to paste the snippet between <head> and </head>.
 * The App Router has no hand-written <head>, so the equivalent is `next/script`
 * with `afterInteractive` -- Next injects it and guarantees it runs once per
 * full page load, on every route, which is what those instructions are really
 * asking for.
 *
 * The base snippet fires PageView once, when the script loads. This site
 * navigates client-side, so a customer going from the homepage to a product to
 * checkout would otherwise be recorded as a single page view. The effect below
 * fires the missing ones. It deliberately skips the first pathname it sees,
 * because the snippet has already counted that one.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const initialPathSkipped = useRef(false);

  useEffect(() => {
    if (!initialPathSkipped.current) {
      initialPathSkipped.current = true;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* next/image cannot be used inside <noscript>: the whole point is that
            it must work with JavaScript disabled. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
