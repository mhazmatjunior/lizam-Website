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
 * The secret in the emailed balance-payment link.
 *
 * 32 random bytes, so it cannot be guessed or walked: the link is the only
 * thing standing between a stranger and a customer's name, phone and address.
 *
 * Web Crypto rather than node:crypto, because the admin screen imports the
 * status labels from this module and a node: import would break the browser
 * bundle. getRandomValues is cryptographically secure on both sides.
 */
export function newBalanceToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** How long an emailed payment link stays usable. */
export const BALANCE_TOKEN_TTL_DAYS = 30;

export function balanceTokenExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + BALANCE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
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
 * What the customer sees when they scan their pass.
 *
 * The QR is issued the moment the pre-order is placed and stays the same code
 * for its whole life, so scanning it has to mean something at every point --
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

/** The only stage at which the pass accepts a payment. */
export const PAYABLE_STAGE: PreorderStage = 'pay';

export function preorderStage(row: {
  status?: string | null;
  total_amount?: number | string | null;
  delivery_fee?: number | string | null;
  deposit_paid?: number | string | null;
  deposit_amount?: number | string | null;
  balance_paid?: number | string | null;
  balance_token_used_at?: string | null;
  balance_token_expires_at?: string | null;
}): PreorderStage {
  if (row.status === 'cancelled') return 'cancelled';
  if (row.status === 'fully_paid') return 'paid';

  // Spent pass or admin-recorded proof -- either way the money is claimed and
  // we are the ones holding things up, so never re-offer the payment form.
  if (row.balance_token_used_at || row.status === 'balance_unverified') return 'verifying';

  if (row.status === 'deposit_rejected') return 'deposit_rejected';

  // Only once an admin has actually asked. Before that the delivery fee is
  // still 0 and unset, so a customer paying "early" would underpay by it.
  if (row.status === 'balance_requested' || row.status === 'balance_rejected') {
    if (customerBalance(row) <= 0) return 'reserved';
    // Expiry closes the payment window, not the pass. The customer can still
    // scan and see where their pre-order stands; they just cannot pay against
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
 * Absolute URL of the customer's pre-order pass.
 *
 * Lands on the ordinary checkout page, which recognises the token and renders
 * whichever stage above the pre-order is at -- a progress note early on, the
 * balance payment form once it is due.
 */
export function balancePaymentUrl(token: string): string {
  return `${siteUrl()}/checkout?preorder=${token}`;
}

/**
 * Absolute URL of the PNG QR code for that pass.
 *
 * Absolute because an email client fetches it from wherever the customer reads
 * their mail. The route behind it is stateless -- it draws whatever token it is
 * handed without touching the database -- so this is safe to build anywhere.
 */
export function balancePaymentQrUrl(token: string): string {
  return `${siteUrl()}/api/preorders/qr/${token}`;
}

/**
 * The same QR for the admin screen, which has a session but not the token.
 * Relative, because it is only ever loaded from one of our own pages.
 */
export function adminPreorderQrUrl(preorderId: string): string {
  return `/api/preorders/${encodeURIComponent(preorderId)}/qr`;
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
    // The token itself is deliberately never mapped out to the client. Only
    // whether a link is currently outstanding, and whether it has been spent:
    // the QR is single use, so a link that exists is not necessarily one the
    // customer can still pay through.
    hasBalanceLink: Boolean(p.balance_token),
    balanceLinkUsedAt: p.balance_token_used_at || null,
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
