import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import {
  newBalanceToken,
  balanceTokenExpiry,
  balancePaymentUrl,
  remainingBalance,
  mapPreorder,
} from '@/lib/preorder';
import { sendPreorderBalancePaymentEmail } from '@/lib/preorder-email';

/**
 * POST - Email the customer a unique link to pay their remaining balance.
 *
 * Behind the admin's "Send Payment Email" button. Admin only: the response
 * would otherwise let anyone mint a working payment link for someone else's
 * pre-order, and the link exposes that customer's details.
 *
 * Pressing it again is safe and deliberate -- it mints a *fresh* token and
 * invalidates the previous one, which is what an admin wants when a customer
 * says the email never arrived or the old link expired.
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

    const balance = remainingBalance(preorder);
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
      depositAmount: Number(updated.deposit_paid || updated.deposit_amount),
      balanceAmount: balance,
      deliveryFee: Number(updated.delivery_fee || 0),
      paymentUrl: balancePaymentUrl(token),
    });

    if (result && (result as any).success === false) {
      // The token is live but never reached the customer. Say so, rather than
      // reporting a sent email the admin will then wait on.
      return NextResponse.json(
        { error: `Payment link created but the email failed to send: ${(result as any).error}` },
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
