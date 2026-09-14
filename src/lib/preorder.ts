import { siteUrl } from '@/data/site';

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

/** Absolute URL of the emailed balance-payment link. */
export function balancePaymentUrl(token: string): string {
  return `${siteUrl()}/preorder/pay/${token}`;
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
    balanceAmount: Number(p.balance_amount ?? remainingBalance(p)),
    status: p.status,
    depositMethod: p.deposit_method || '',
    depositProofUrl: p.deposit_proof_url || '',
    depositReference: p.deposit_reference || '',
    depositVerifiedAt: p.deposit_verified_at,
    // The token itself is deliberately never mapped out to the client. Only
    // whether a link is currently outstanding.
    hasBalanceLink: Boolean(p.balance_token),
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
