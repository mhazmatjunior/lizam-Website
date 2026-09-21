import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import {
  newBalanceToken,
  balanceTokenExpiry,
  balancePaymentUrl,
  balancePaymentQrUrl,
  customerBalance,
  creditedDeposit,
  mapPreorder,
} from '@/lib/preorder';
import { sendPreorderBalancePaymentEmail } from '@/lib/preorder-email';

/**
 * POST - Email the customer a unique QR code to pay their remaining balance.
 *
 * Behind the admin's "Send Payment Email" button. Admin only: the response
 * would otherwise let anyone mint a working payment code for someone else's
 * pre-order, and scanning it exposes that customer's details.
 *
 * Pressing it again is safe: it re-sends the customer's existing pass and
 * reopens the payment window on it, which is what an admin wants when the
 * email never arrived or the old request expired.
 *
 * It deliberately does NOT mint a new token when one already exists. The pass
 * is issued with the pre-order and printed in the confirmation email, so
 * rotating it here would kill the code the customer has already saved, and
 * they would be holding a QR that reports nothing. A token is only minted as
 * a fallback, for pre-orders placed before passes existed.
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

    if (preorder.status === 'fully_paid') {
      return NextResponse.json(
        { error: 'This pre-order is already paid in full' },
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

    // Their existing pass, kept. Only a pre-order from before passes existed
    // arrives here without one.
    const token = preorder.balance_token || newBalanceToken();
    const expiresAt = balanceTokenExpiry();
    // Don't drag a pre-order backwards out of "customer has already paid,
    // awaiting our check" just because the admin resent the request.
    const awaitingOurCheck = preorder.status === 'balance_unverified';

    const update: Record<string, unknown> = {
      balance_token: token,
      // The pass itself never expires; this is the deadline on the payment
      // window it opens. Resending restarts it.
      balance_token_expires_at: expiresAt.toISOString(),
      balance_email_sent_at: new Date().toISOString(),
      status: awaitingOurCheck ? preorder.status : 'balance_requested',
      updated_at: new Date().toISOString(),
    };

    // Asking for the balance means the pass has to be able to take a payment
    // again -- otherwise a customer whose proof was rejected is sent a request
    // their code will refuse. Left alone when we are already holding their
    // proof, so re-sending does not erase the record of when they paid.
    if (!awaitingOurCheck) update.balance_token_used_at = null;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('preorders')
      .update(update)
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
      paymentUrl: balancePaymentUrl(token),
      qrUrl: balancePaymentQrUrl(token),
    });

    if (result && (result as any).success === false) {
      // The code is live but never reached the customer. Say so, rather than
      // reporting a sent email the admin will then wait on. The admin screen
      // shows the same QR, so they can still pass it on by hand.
      return NextResponse.json(
        { error: `QR code created but the email failed to send: ${(result as any).error}` },
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
