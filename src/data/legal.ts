// ---------------------------------------------------------------------------
// Business identity and policy commitments, shared by every legal page.
//
// These values are published to customers and to the payment gateway's
// compliance reviewer, so they must be true. Anything still carrying an "X"
// or the word PLACEHOLDER has NOT been confirmed by the client -- see
// UNCONFIRMED below. Fill those in before go-live; `isPlaceholder()` keeps a
// half-filled value from being rendered as a live tel:/mailto: link, and
// LegalPage shows a warning banner in development while any remain.
//
// The delivery figures are NOT repeated here on purpose. They are imported
// from src/data/founder-cities.ts and read from /api/settings, so the
// shipping policy can never quote a price that checkout no longer charges.
// ---------------------------------------------------------------------------

export const BUSINESS = {
  /** Trading name, as shown across the site. */
  brandName: "RAANAE",

  /** Name the business is registered under. PLACEHOLDER — confirm with client. */
  legalName: "RAANAE Fragrances",

  /** Confirmed: set as the site's contact address in commit 6c08fc0. */
  email: "raanae980@gmail.com",

  /** PLACEHOLDER — the customer-service landline / mobile. */
  phone: "+92 3XX XXX XXXX",

  /** PLACEHOLDER — WhatsApp number for order support. Often the same as `phone`. */
  whatsapp: "+92 3XX XXX XXXX",

  /** PLACEHOLDER — registered/business address required on a contact page. */
  address: "PLACEHOLDER — registered business address, City, Pakistan",

  /** When a customer can expect a human to answer. */
  hours: "Monday to Saturday, 10:00 AM – 7:00 PM (PKT)",

  country: "Pakistan",
} as const;

/**
 * Service-level commitments quoted on the complaints and contact pages.
 *
 * A published timeline is a promise the business has to be able to keep, so
 * these are deliberately conservative. Shorten them only if the client says
 * they can meet the shorter window every time.
 */
export const RESPONSE_TIMES = {
  /** Acknowledgement that a complaint has been received and logged. */
  acknowledgement: "2 working days",
  /** Ordinary complaints closed out within this window. */
  resolution: "7 working days",
  /** Complex cases: the outer limit, with progress updates in the meantime. */
  escalated: "15 working days",
  /** General enquiries that are not complaints. */
  enquiry: "2 working days",
} as const;

/**
 * Order lifecycle windows.
 *
 * `paymentVerification` matches VERIFICATION_WINDOW in src/data/bank-details.ts
 * — the same 24 hours is already promised to customers who upload a receipt at
 * checkout, and the two must not disagree.
 */
export const ORDER_POLICY = {
  /** Manual bank / wallet receipts are checked within this window. */
  paymentVerification: "24 hours",
  /** Time from a confirmed order to handing the parcel to the courier. */
  dispatch: "1–2 working days",
  /** Courier transit, major cities. */
  deliveryMajorCities: "2–4 working days",
  /** Courier transit, smaller towns and remote areas. */
  deliveryRemote: "4–7 working days",
  /** A customer may cancel freely inside this window, or any time pre-dispatch. */
  cancellation: "24 hours",
  /** Deadline for raising a damaged / wrong / faulty item claim, from delivery. */
  claimWindow: "48 hours",
  /** Deadline for returning an unopened, sealed order, from delivery. */
  returnWindow: "7 days",
  /** Deadline for requesting an exchange, from delivery. */
  exchangeWindow: "7 days",
  /** Once a return is approved and received, refunds are issued within this. */
  refundProcessing: "7–10 working days",
} as const;

/** Shown as "Last updated" on every legal page. Bump when the text changes. */
export const POLICY_UPDATED = "9 September 2026";

/**
 * Third parties that receive customer data, for the privacy policy's
 * disclosure section. Kept here so adding a processor means editing one list.
 */
export const DATA_PROCESSORS: Array<{ name: string; purpose: string }> = [
  { name: "Safepay", purpose: "Processing online card and wallet payments. Card details are entered on Safepay's own secure page and are never stored by us." },
  { name: "Supabase", purpose: "Hosting our database and the private storage buckets that hold payment receipts and review photographs." },
  { name: "Vercel", purpose: "Hosting and serving this website." },
  { name: "Email delivery providers", purpose: "Sending order confirmations, dispatch notices and replies to your enquiries." },
  { name: "Courier and delivery partners", purpose: "Delivering your order. They receive your name, address and phone number only." },
];

/** Every legal page, in the order they appear in the site footer. */
export const LEGAL_PAGES: Array<{ href: string; label: string; short: string }> = [
  { href: "/terms", label: "Terms & Conditions", short: "Terms" },
  { href: "/privacy", label: "Privacy Policy", short: "Privacy" },
  { href: "/shipping-returns", label: "Shipping, Returns & Refunds", short: "Shipping & Returns" },
  { href: "/complaints", label: "Complaint Handling", short: "Complaints" },
  { href: "/contact", label: "Contact Us", short: "Contact" },
];

/**
 * True while a value is still an unconfirmed placeholder.
 *
 * Callers use this to render the value as plain text instead of a working
 * tel:/mailto: link — a live link to a fake number is worse than no link,
 * because it looks correct.
 */
export function isPlaceholder(value: string): boolean {
  return /X{2,}|PLACEHOLDER/.test(value);
}

/** `tel:` href for a phone number, or null while the number is a placeholder. */
export function telHref(phone: string): string | null {
  if (isPlaceholder(phone)) return null;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** `wa.me` href for a WhatsApp number, or null while it is a placeholder. */
export function whatsappHref(phone: string): string | null {
  if (isPlaceholder(phone)) return null;
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

/** Field names still awaiting a real value, for the development-only warning. */
export function unconfirmedFields(): string[] {
  return (["legalName", "phone", "whatsapp", "address"] as const).filter((key) =>
    isPlaceholder(BUSINESS[key])
  );
}
