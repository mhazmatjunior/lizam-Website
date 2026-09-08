/**
 * Order reference numbers.
 *
 * The prefix used to be "ORD"; the client asked for "OCT" (after the 7TH OCT
 * line). Kept in one place so changing it again is a single edit rather than a
 * hunt through the checkout, the API and the admin.
 *
 * Orders placed before this change keep their original "ORD-" references —
 * a receipt or a bank statement referring to one must still match, so history
 * is deliberately left alone.
 */
export const ORDER_ID_PREFIX = "OCT";

/** A fresh order reference, e.g. "OCT-1787234049226". */
export function newOrderId(): string {
  return `${ORDER_ID_PREFIX}-${Date.now()}`;
}
