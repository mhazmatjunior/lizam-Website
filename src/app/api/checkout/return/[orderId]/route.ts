import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { siteUrl } from '@/data/site';
import { isValidSafepaySignature, markSafepayPaid } from '@/lib/orders';

/**
 * Where Safepay sends the customer after a completed payment.
 *
 * Safepay attaches `tracker` and `sig` (an HMAC of the tracker under our
 * merchant secret). The order is marked paid only when the signature is
 * genuine AND the tracker is the one this order was opened with -- so neither
 * a forged link nor a real signature from a different, cheaper payment works.
 *
 * Either way the customer lands on the confirmation page, which shows the
 * order's actual status.
 */
async function handle(req: NextRequest, orderId: string, params: URLSearchParams) {
  const tracker = params.get('tracker') || '';
  const sig = params.get('sig') || '';

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('order_id, status, payment_method, payment_reference')
    .eq('order_id', orderId)
    .maybeSingle();

  if (!order) {
    console.warn(`⚠️ Safepay return for unknown order ${orderId}`);
  } else if (order.payment_reference !== tracker || !isValidSafepaySignature(tracker, sig)) {
    console.warn(`⚠️ Safepay return for ${orderId} failed verification; leaving status "${order.status}".`);
  } else {
    await markSafepayPaid({ orderId });
  }

  // 303 so a POSTed return becomes a GET of the confirmation page.
  return NextResponse.redirect(`${siteUrl()}/checkout/success/${encodeURIComponent(orderId)}`, 303);
}

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { orderId } = await params;
  return handle(req, orderId, req.nextUrl.searchParams);
}

// Safepay may return by form POST; accept its fields from the body or the URL.
export async function POST(req: NextRequest, { params }: Ctx) {
  const { orderId } = await params;
  const merged = new URLSearchParams(req.nextUrl.searchParams);
  try {
    const form = await req.formData();
    for (const [k, v] of form.entries()) if (typeof v === 'string') merged.set(k, v);
  } catch {
    /* Not a form body; the query string is all there is. */
  }
  return handle(req, orderId, merged);
}
