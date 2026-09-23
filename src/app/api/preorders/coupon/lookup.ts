import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCouponCode } from '@/lib/preorder';

/**
 * Find a pre-order by the coupon code a customer typed at checkout.
 *
 * The code IS the authentication -- there is no session behind it -- so the
 * lookup is deliberately narrow: exact match on the normalised code, and
 * nothing else is accepted as identifying a pre-order.
 */
export async function loadByCoupon(input: unknown) {
  const code = normalizeCouponCode(input);
  if (!code) {
    return { error: 'Please enter a valid coupon code', status: 404 } as const;
  }

  const { data, error } = await supabaseAdmin
    .from('preorders')
    .select('*')
    .eq('coupon_code', code)
    .maybeSingle();

  if (error || !data) {
    return { error: 'This coupon code is not valid', status: 404 } as const;
  }
  return { data, code } as const;
}

/** Why a code cannot complete an order right now, in the customer's terms. */
export function notPayableReason(stage: string): string {
  switch (stage) {
    case 'verifying':
      return 'We already have your payment for this pre-order and are verifying it.';
    case 'paid':
      return 'This coupon code has already been used — your order is complete.';
    case 'cancelled':
      return 'This pre-order was cancelled.';
    case 'expired':
      return 'This payment request has expired. Please contact us for a fresh one.';
    case 'deposit_rejected':
      return 'There is a problem with your deposit. Please contact us before paying the balance.';
    default:
      return 'There is nothing to pay on this pre-order yet. We will email you when the balance is due.';
  }
}
