import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import {
  newCouponCode,
  paymentWindowExpiry,
  couponCheckoutUrl,
  customerBalance,
  creditedDeposit,
  mapPreorder,
} from '@/lib/preorder';
import { sendPreorderBalancePaymentEmail } from '@/lib/preorder-email';

/**
 * POST - Email the customer their coupon code to complete the pre-order.
 *
 * Behind the admin's "Send Payment Email" button. Admin only: it opens the
 * payment window on someone else's pre-order.
 *
 * Pressing it again is safe: it re-sends the customer's existing code and
 * reopens the payment window, which is what an admin wants when the email
 * never arrived or the old request expired.
 *
 * It deliberately does NOT mint a new code when one already exists. The code
 * is issued with the pre-order and printed in the confirmation email, so
 * rotating it here would kill the one the customer has already saved. A code
 * is only minted as a fallback, for pre-orders placed before codes existed
 * and missed by the 009 backfill.
 */
export async function POST(req: NextRequest, props: { params: Promise<{ preorderId: string }> }) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { preorderId } = await props.params;

    const { data: preorder, error: readError } = await supabaseAdmin
      .from('preorders')
      .select('*')
      .eq('preorder_id', preorderId)
      .single();

    if (readError || !preorder) {
      return NextResponse.json({ error: 'Pre-order not found' }, { status: 404 });
    }

    if (preorder.status === 'fully_paid' || preorder.coupon_used_at) {
      return NextResponse.json(
        { error: 'This pre-order is already complete' },
        { status: 409 }
      );
    }
    if (preorder.status === 'cancelled') {
      return NextResponse.json({ error: 'This pre-order was cancelled' }, { status: 409 });
    }

    // The figure the customer is asked for, which credits a transferred-but-
    // not-yet-verified deposit. Must match what the checkout page shows them.
    const balance = customerBalance(preorder);
    if (balance <= 0) {
      return NextResponse.json(
        { error: 'There is no balance outstanding on this pre-order' },
        { status: 409 }
      );
    }

    const couponCode: string = preorder.coupon_code || newCouponCode();
    // Don't drag a pre-order backwards out of "customer has already paid,
    // awaiting our check" just because the admin resent the request.
    const awaitingOurCheck = preorder.status === 'balance_unverified';

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('preorders')
      .update({
        coupon_code: couponCode,
        // The code itself never expires; this is the deadline on the payment
        // window it opens. Resending restarts it.
        balance_token_expires_at: paymentWindowExpiry().toISOString(),
        balance_email_sent_at: new Date().toISOString(),
        status: awaitingOurCheck ? preorder.status : 'balance_requested',
        updated_at: new Date().toISOString(),
      })
      .eq('preorder_id', preorderId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    const result = await sendPreorderBalancePaymentEmail({
      preorderId: updated.preorder_id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      product: updated.product_name,
      quantity: updated.quantity,
      totalAmount: Number(updated.total_amount),
      depositAmount: creditedDeposit(updated),
      balanceAmount: balance,
      deliveryFee: Number(updated.delivery_fee || 0),
      couponCode,
      checkoutUrl: couponCheckoutUrl(),
    });

    if (result && (result as any).success === false) {
      // The window is open but the code never reached the customer. Say so,
      // rather than reporting a sent email the admin will then wait on. The
      // admin screen shows the same code, so they can still pass it on.
      return NextResponse.json(
        { error: `Payment window opened but the email failed to send: ${(result as any).error}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      sentTo: updated.email,
      balanceAmount: balance,
      preorder: mapPreorder(updated),
    });
  } catch (error: any) {
    console.error('❌ Pre-order Payment Email Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
