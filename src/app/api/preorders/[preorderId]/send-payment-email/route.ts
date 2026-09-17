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
 * Pressing it again is safe and deliberate -- it mints a *fresh* token and
 * invalidates the previous one, which is what an admin wants when a customer
 * says the email never arrived, the old code expired, or they scanned it and
 * abandoned the page halfway through. The customer scans a QR code rather
 * than following a link, and that code is good for exactly one payment.
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

    const token = newBalanceToken();
    const expiresAt = balanceTokenExpiry();

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('preorders')
      .update({
        balance_token: token,
        balance_token_expires_at: expiresAt.toISOString(),
        // A fresh code is an unspent one. Without this a customer who used
        // their last QR -- and then had the balance rejected, or needed the
        // figure corrected -- would be handed a code already marked spent.
        balance_token_used_at: null,
        balance_email_sent_at: new Date().toISOString(),
        // Don't drag a pre-order backwards out of "customer has already paid,
        // awaiting our check" just because the admin resent the link.
        status: preorder.status === 'balance_unverified' ? preorder.status : 'balance_requested',
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
