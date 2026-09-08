import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';

/**
 * GET — one order.
 *
 * Two shapes, depending on who is asking:
 *
 *  - A shopper (no session) gets only the payment state, which the confirmation
 *    page needs. No name, email, phone or address: order references are
 *    timestamp-based and therefore guessable, so anything personal here would
 *    be a data leak.
 *  - An admin gets the full record, which the delivery receipt prints from.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*') // '*' on purpose: payment_proof_url may not exist until migration 001 runs
      .eq('order_id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const base = {
      orderId: order.order_id,
      status: order.status,
      paymentMethod: order.payment_method || 'safepay',
      amount: order.amount,
      currency: order.currency || 'PKR',
      hasProof: Boolean(order.payment_proof_url || order.payment_screenshot),
    };

    if (!(await isAdminRequest())) {
      return NextResponse.json({ order: base });
    }

    return NextResponse.json({
      order: {
        ...base,
        name: order.name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        product: order.product,
        deliveryFee: order.delivery_fee ?? 0,
        paymentSubMethod: order.payment_sub_method ?? null,
        paymentReference: order.payment_reference ?? null,
        tracker: order.tracker ?? null,
        createdAt: order.created_at,
      },
    });
  } catch (error: any) {
    console.error('❌ Order lookup error:', error.message);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
