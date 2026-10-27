// ---------------------------------------------------------------------------
// Ecommerce events, sent to GA4 and the Meta Pixel together.
//
//   GA4             Meta              Fired from
//   view_item       ViewContent       product page, home page (one-product landing)
//   add_to_cart     AddToCart         CartContext.addToCart
//   begin_checkout  InitiateCheckout  checkout page, once per visit
//   purchase        Purchase          confirmation page, once per order
//
// Values are in PKR. Purchase uses the server-priced order total, not the
// cart, and the order id as Meta's eventID so a later Conversions API (server)
// event for the same order deduplicates against this browser one.
//
// Every call is a no-op when its tag is absent (ad blockers included).
// ---------------------------------------------------------------------------

/** GA4 Measurement ID (Admin -> Data streams -> Raanae Web). NEXT_PUBLIC_GA4_ID overrides it. */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-MGYJ4HSDNL';
const CURRENCY = 'PKR';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface AnalyticsItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
}

function ga(event: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined' || !GA4_ID) return;
  window.gtag?.('event', event, params);
}

function meta(event: string, params: Record<string, unknown>, eventId?: string) {
  if (typeof window === 'undefined') return;
  if (eventId) window.fbq?.('track', event, params, { eventID: eventId });
  else window.fbq?.('track', event, params);
}

const gaItems = (items: AnalyticsItem[]) =>
  items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity }));

const metaContents = (items: AnalyticsItem[]) =>
  items.map((i) => ({ id: String(i.id), quantity: i.quantity, item_price: i.price }));

const total = (items: AnalyticsItem[]) => items.reduce((s, i) => s + i.price * i.quantity, 0);

export function trackViewItem(item: Omit<AnalyticsItem, 'quantity'>) {
  const items = [{ ...item, quantity: 1 }];
  ga('view_item', { currency: CURRENCY, value: item.price, items: gaItems(items) });
  meta('ViewContent', {
    content_ids: [String(item.id)],
    content_name: item.name,
    content_type: 'product',
    contents: metaContents(items),
    value: item.price,
    currency: CURRENCY,
  });
}

export function trackAddToCart(item: AnalyticsItem) {
  const items = [item];
  ga('add_to_cart', { currency: CURRENCY, value: total(items), items: gaItems(items) });
  meta('AddToCart', {
    content_ids: [String(item.id)],
    content_name: item.name,
    content_type: 'product',
    contents: metaContents(items),
    value: total(items),
    currency: CURRENCY,
  });
}

export function trackBeginCheckout(items: AnalyticsItem[]) {
  if (!items.length) return;
  ga('begin_checkout', { currency: CURRENCY, value: total(items), items: gaItems(items) });
  meta('InitiateCheckout', {
    content_ids: items.map((i) => String(i.id)),
    content_type: 'product',
    contents: metaContents(items),
    num_items: items.reduce((s, i) => s + i.quantity, 0),
    value: total(items),
    currency: CURRENCY,
  });
}

// --- Purchase ---------------------------------------------------------------
//
// The confirmation page can be reloaded, bookmarked or opened by anyone with
// the link, so Purchase must not fire just because it rendered. Checkout
// stashes the cart under the order id (rememberCheckoutItems) in this tab;
// the confirmation page fires Purchase only if that stash exists, then
// removes it and records the order as tracked.

const PENDING_KEY = 'raanae_checkout_items';
const TRACKED_KEY = 'raanae_tracked_orders';

/** Called by checkout before leaving for the confirmation page or Safepay. */
export function rememberCheckoutItems(items: AnalyticsItem[]) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(items));
  } catch {
    /* Storage unavailable: Purchase is skipped rather than guessed. */
  }
}

function trackedOrders(): string[] {
  try {
    return JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Fires Purchase once for an order placed in this browser. `value` is the
 * server's order total (delivery included). Returns true if it fired.
 */
export function trackPurchase(orderId: string, value: number): boolean {
  if (typeof window === 'undefined') return false;
  let items: AnalyticsItem[] = [];
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return false;
    items = JSON.parse(raw);
  } catch {
    return false;
  }

  const done = trackedOrders();
  if (done.includes(orderId)) return false;

  ga('purchase', { transaction_id: orderId, currency: CURRENCY, value, items: gaItems(items) });
  meta(
    'Purchase',
    {
      content_ids: items.map((i) => String(i.id)),
      content_type: 'product',
      contents: metaContents(items),
      num_items: items.reduce((s, i) => s + i.quantity, 0),
      value,
      currency: CURRENCY,
    },
    orderId
  );

  try {
    sessionStorage.removeItem(PENDING_KEY);
    localStorage.setItem(TRACKED_KEY, JSON.stringify([...done, orderId].slice(-50)));
  } catch {
    /* Best effort. */
  }
  return true;
}
