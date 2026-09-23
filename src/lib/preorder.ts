import { siteUrl } from '@/data/site';
import { preorderHasFreeDelivery } from '@/data/preorder-promo';

/**
 * Pre-order references and the small amount of logic shared between the API
 * routes, the admin screen and the emails.
 *
 * Kept separate from order-id.ts because a pre-order is not an order: it only
 * becomes one (with its own OCT- reference) once the balance is settled.
 */
export const PREORDER_ID_PREFIX = 'PRE';

/** A fresh pre-order reference, e.g. "PRE-1787234049226". */
export function newPreorderId(): string {
  return `${PREORDER_ID_PREFIX}-${Date.now()}`;
}

/**
 * The customer's coupon code, e.g. "RAN-7KQ2-M9XW-4HTP".
 *
 * Issued with the pre-order and shown on the thank-you screen and in every
 * pre-order email. At checkout it is the only thing that identifies the
 * pre-order -- there is no session behind it -- so it has to be unguessable:
 * 12 characters from a 31-letter alphabet is ~59 bits of randomness.
 *
 * The alphabet leaves out 0/O and 1/I/L, which customers misread when they
 * copy a code out of an email by hand.
 *
 * Web Crypto rather than node:crypto, because the admin screen imports the
 * status labels from this module and a node: import would break the browser
 * bundle. getRandomValues is cryptographically secure on both sides.
 */
const COUPON_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const COUPON_PREFIX = 'RAN';
const COUPON_LENGTH = 12;

export function newCouponCode(): string {
  const chars: string[] = [];
  const bytes = new Uint8Array(COUPON_LENGTH * 2);
  while (chars.length < COUPON_LENGTH) {
    globalThis.crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (chars.length === COUPON_LENGTH) break;
      // 248 = 31 * 8. Rejecting the top of the byte range keeps every letter
      // equally likely instead of biasing a modulo toward the first few.
      if (b < 248) chars.push(COUPON_ALPHABET[b % COUPON_ALPHABET.length]);
    }
  }
  return formatCoupon(chars.join(''));
}

function formatCoupon(body: string): string {
  return `${COUPON_PREFIX}-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

/**
 * A code as typed by a customer, in the form it is stored.
 *
 * People paste it with stray spaces, type it in lower case, or leave out the
 * dashes -- none of that should turn a correct code into "not valid".
 */
export function normalizeCouponCode(input: unknown): string {
  const raw = String(input ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  const body = raw.startsWith(COUPON_PREFIX) ? raw.slice(COUPON_PREFIX.length) : raw;
  return body.length === COUPON_LENGTH ? formatCoupon(body) : '';
}

/** How long the payment window opened by "Send Payment Email" stays open. */
export const PAYMENT_WINDOW_DAYS = 30;

export function paymentWindowExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + PAYMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

export type PreorderStatus =
  | 'deposit_unverified'
  | 'deposit_paid'
  | 'deposit_rejected'
  | 'balance_requested'
  | 'balance_unverified'
  | 'balance_rejected'
  | 'fully_paid'
  | 'cancelled';

/** Statuses an admin is allowed to set directly. */
export const PREORDER_STATUSES: PreorderStatus[] = [
  'deposit_unverified',
  'deposit_paid',
  'deposit_rejected',
  'balance_requested',
  'balance_unverified',
  'balance_rejected',
  'fully_paid',
  'cancelled',
];

export const PREORDER_STATUS_LABELS: Record<PreorderStatus, string> = {
  deposit_unverified: 'Deposit — Awaiting Verification',
  deposit_paid: 'Deposit Received',
  deposit_rejected: 'Deposit Proof Rejected',
  balance_requested: 'Balance Requested',
  balance_unverified: 'Balance — Awaiting Verification',
  balance_rejected: 'Balance Proof Rejected',
  fully_paid: 'Fully Paid — Confirmed',
  cancelled: 'Cancelled',
};

export function preorderStatusLabel(status: string): string {
  return PREORDER_STATUS_LABELS[status as PreorderStatus] || status;
}

/**
 * The balance still owed.
 *
 * The database computes this too (a generated column), but the checkout needs
 * the figure before anything is written, and an email needs it without a
 * re-read. Both must agree, so the formula lives here once.
 */
export function remainingBalance(row: {
  total_amount?: number | string | null;
  delivery_fee?: number | string | null;
  deposit_paid?: number | string | null;
  balance_paid?: number | string | null;
}): number {
  const n = (v: unknown) => Number(v || 0);
  return Math.max(
    0,
    n(row.total_amount) + n(row.delivery_fee) - n(row.deposit_paid) - n(row.balance_paid)
  );
}

/**
 * The deposit to credit against what the customer still owes.
 *
 * deposit_paid is the verified figure and stays the ledger's truth, but it is
 * still 0 until an admin presses Verify Deposit -- and an admin can quite
 * reasonably send the payment link first. The customer has transferred the
 * money either way, so billing on deposit_paid alone asks them for it a second
 * time. A deposit that was actually rejected earns no credit.
 */
export function creditedDeposit(row: {
  deposit_paid?: number | string | null;
  deposit_amount?: number | string | null;
  status?: string | null;
}): number {
  if (row.status === 'deposit_rejected') return 0;
  const verified = Number(row.deposit_paid || 0);
  return verified > 0 ? verified : Number(row.deposit_amount || 0);
}

/**
 * What the customer is actually asked to pay.
 *
 * This is the figure on the checkout page and in the payment email, and the two
 * must never disagree -- so both read it from here.
 */
export function customerBalance(row: {
  total_amount?: number | string | null;
  delivery_fee?: number | string | null;
  deposit_paid?: number | string | null;
  deposit_amount?: number | string | null;
  balance_paid?: number | string | null;
  status?: string | null;
}): number {
  const n = (v: unknown) => Number(v || 0);
  return Math.max(
    0,
    n(row.total_amount) + n(row.delivery_fee) - creditedDeposit(row) - n(row.balance_paid)
  );
}

/**
 * What the customer sees when they enter their coupon code at checkout.
 *
 * The code is issued the moment the pre-order is placed and stays the same
 * for its whole life, so entering it has to mean something at every point --
 * not just during the window when there is a balance to collect. These are
 * those points. The page owns the wording; this owns which one applies, so the
 * API and the page cannot disagree about what state a pre-order is in.
 */
export type PreorderStage =
  | 'deposit_pending'
  | 'deposit_rejected'
  | 'reserved'
  | 'pay'
  | 'expired'
  | 'verifying'
  | 'paid'
  | 'cancelled';

/** The only stage at which the coupon code can complete the order. */
export const PAYABLE_STAGE: PreorderStage = 'pay';

export function preorderStage(row: {
  status?: string | null;
  total_amount?: number | string | null;
  delivery_fee?: number | string | null;
  deposit_paid?: number | string | null;
  deposit_amount?: number | string | null;
  balance_paid?: number | string | null;
  coupon_used_at?: string | null;
  balance_token_expires_at?: string | null;
}): PreorderStage {
  if (row.status === 'cancelled') return 'cancelled';
  if (row.status === 'fully_paid' || row.coupon_used_at) return 'paid';

  // Admin-recorded proof -- the money is claimed and we are the ones holding
  // things up, so never re-offer the payment form.
  if (row.status === 'balance_unverified') return 'verifying';

  if (row.status === 'deposit_rejected') return 'deposit_rejected';

  // Only once an admin has actually asked. Before that the delivery fee is
  // still 0 and unset, so a customer paying "early" would underpay by it.
  if (row.status === 'balance_requested' || row.status === 'balance_rejected') {
    if (customerBalance(row) <= 0) return 'reserved';
    // Expiry closes the payment window, not the code. The customer can still
    // enter it and see where their pre-order stands; they just cannot pay against
    // a stale figure until an admin sends a fresh request.
    if (row.balance_token_expires_at && new Date(row.balance_token_expires_at) < new Date()) {
      return 'expired';
    }
    return 'pay';
  }

  if (row.status === 'deposit_paid') return 'reserved';
  return 'deposit_pending';
}

/**
 * Where the customer enters their coupon code. Absolute, for emails.
 *
 * Deliberately the bare checkout page with no code in the URL: the code is
 * the customer's secret, and a link carrying it would end up in browser
 * history and forwarded emails.
 */
export function couponCheckoutUrl(): string {
  return `${siteUrl()}/checkout`;
}

/** Database row -> the camelCase shape the admin screen and pages consume. */
export function mapPreorder(p: any) {
  return {
    preorderId: p.preorder_id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    address: p.address,
    city: p.city || '',
    productId: p.product_id,
    productName: p.product_name,
    quantity: p.quantity,
    unitPrice: Number(p.unit_price || 0),
    currency: p.currency || 'PKR',
    totalAmount: Number(p.total_amount || 0),
    depositAmount: Number(p.deposit_amount || 0),
    depositPaid: Number(p.deposit_paid || 0),
    deliveryFee: Number(p.delivery_fee || 0),
    balancePaid: Number(p.balance_paid || 0),
    // What the customer is asked for, so the admin's Remaining column reconciles
    // against the payment email rather than quietly differing by the deposit.
    // depositPaid above stays the verified figure for the ledger.
    balanceAmount: customerBalance(p),
    status: p.status,
    depositMethod: p.deposit_method || '',
    depositProofUrl: p.deposit_proof_url || '',
    depositReference: p.deposit_reference || '',
    depositVerifiedAt: p.deposit_verified_at,
    // Taken under the launch offer, which included delivery. Derived from the
    // snapshotted unit price rather than stored, so it cannot drift from what
    // the customer was actually charged.
    freeDelivery: preorderHasFreeDelivery(p),
    // Every caller of mapPreorder is admin-only, so the code is included: an
    // admin may need to read it out to a customer whose email never arrived.
    couponCode: p.coupon_code || '',
    couponUsedAt: p.coupon_used_at || null,
    balanceEmailSentAt: p.balance_email_sent_at,
    balanceMethod: p.balance_method || '',
    balanceProofUrl: p.balance_proof_url || '',
    balanceReference: p.balance_reference || '',
    balanceVerifiedAt: p.balance_verified_at,
    orderId: p.order_id || '',
    tracker: p.tracker || '',
    adminNotes: p.admin_notes || '',
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}
