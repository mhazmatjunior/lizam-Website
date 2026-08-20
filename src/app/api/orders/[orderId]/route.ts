import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET — the buyer's own order state, used by the confirmation page to decide
 * whether to ask for a payment screenshot.
 *
 * Returns only what the buyer already knows plus the payment state. No name,
 * email, phone or address, because order IDs are sequential timestamps and so
 * are guessable; anything personal here would be a data leak.
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

    return NextResponse.json({
      order: {
        orderId: order.order_id,
        status: order.status,
        paymentMethod: order.payment_method || 'safepay',
        amount: order.amount,
        currency: order.currency || 'PKR',
        hasProof: Boolean(order.payment_proof_url),
      },
    });
  } catch (error: any) {
    console.error('❌ Order lookup error:', error.message);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
