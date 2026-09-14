/**
 * Where this site lives.
 *
 * Used to build absolute links that leave the app — payment redirects, and the
 * balance-payment link emailed to pre-order customers.
 *
 * The fallback is the live domain, NOT localhost. These URLs are handed to real
 * customers and to Safepay: a link to http://localhost:3000 is broken for every
 * recipient, whereas a link to the live site is correct in production and at
 * worst inconvenient while developing. Set NEXT_PUBLIC_SITE_URL to point a
 * local or preview build back at itself.
 */
export const PRODUCTION_SITE_URL = "https://www.raanae.com";

/** The site's base URL, with no trailing slash. */
export function siteUrl(): string {
  // Pasting a value into the Vercel UI can leave the surrounding quotes
  // attached, the same way SMTP_FROM_EMAIL can — strip them rather than emit a
  // link beginning with a quote mark.
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "")
    .replace(/^["']|["']$/g, "")
    .trim();

  return (configured || PRODUCTION_SITE_URL).replace(/\/+$/, "");
}
