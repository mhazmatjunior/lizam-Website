// ---------------------------------------------------------------------------
// The pre-order launch offer.
//
// Reserve before the closing date and the bottle is Rs 3,000 instead of
// Rs 3,600, with delivery included. Both figures are the client's, and they
// are what the customer is charged -- so this module is the single place they
// are written down. The API prices from it, the storefront quotes from it, and
// the admin reads it to know not to add a delivery charge.
//
// The saving is Rs 600, which is 16.7%, not the 15% the offer was first
// described with. The prices are the authority; PROMO_HEADLINE is what the
// badges say, and can be reworded without touching what anyone pays.
// ---------------------------------------------------------------------------

/**
 * Applies only to units normally priced at this.
 *
 * A flat promo price with no guard would sell an Rs 18,500 bottle for
 * Rs 3,000 the moment someone switched pre-ordering on for it. The catalogue
 * has nine other products, so this is not hypothetical.
 */
export const PROMO_LIST_PRICE = 3600;

/** What one unit costs while the offer runs. */
export const PROMO_PRICE = 3000;

/** Delivery is included in the promo price. */
export const PROMO_FREE_DELIVERY = true;

/** Last day the offer is open, inclusive. */
export const PROMO_ENDS_ON_LABEL = "7 October";

/**
 * The instant the offer closes: midnight at the end of 7 October, Pakistan
 * time. Pinned to an absolute instant rather than a local date because the
 * server, the customer's phone and the database are not in the same timezone,
 * and "is it still the 7th?" has three different answers otherwise. PKT is
 * UTC+5 year-round with no daylight saving.
 */
export const PROMO_ENDS_AT = new Date(Date.UTC(2026, 9, 7, 19, 0, 0));

/** What the badges say. Reword freely — it changes no figure. */
export const PROMO_HEADLINE = `Save Rs ${(PROMO_LIST_PRICE - PROMO_PRICE).toLocaleString()}`;

export const PROMO_PERCENT = Math.round(
  ((PROMO_LIST_PRICE - PROMO_PRICE) / PROMO_LIST_PRICE) * 100
);

/** Is the offer open right now? */
export function promoIsLive(now: Date = new Date()): boolean {
  return now < PROMO_ENDS_AT;
}

/**
 * What one unit of a product costs on pre-order.
 *
 * Everything that quotes or charges a pre-order price goes through here, so
 * the page, the API and the emails cannot disagree. A product the offer does
 * not cover simply gets its own price back.
 */
export function preorderUnitPrice(listPrice: number, now: Date = new Date()): number {
  return promoApplies(listPrice, now) ? PROMO_PRICE : listPrice;
}

/** Whether this product, at this moment, is in the offer. */
export function promoApplies(listPrice: number, now: Date = new Date()): boolean {
  return promoIsLive(now) && Number(listPrice) === PROMO_LIST_PRICE;
}

/**
 * Whether a pre-order already placed was taken under the offer, and so has
 * delivery included.
 *
 * Derived from the row rather than stored on it. The unit price is snapshotted
 * when the pre-order is placed, so a pre-order priced at PROMO_PRICE was taken
 * during the offer by construction -- no extra column, and no way for a flag
 * to drift out of step with the money. Checking created_at as well keeps a
 * later, unrelated Rs 3,000 product from inheriting free delivery.
 */
export function preorderHasFreeDelivery(row: {
  unit_price?: number | string | null;
  created_at?: string | null;
}): boolean {
  if (!PROMO_FREE_DELIVERY) return false;
  if (Number(row.unit_price || 0) !== PROMO_PRICE) return false;
  if (!row.created_at) return true;
  return new Date(row.created_at) < PROMO_ENDS_AT;
}
