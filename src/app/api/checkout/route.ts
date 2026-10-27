import { NextRequest, NextResponse } from 'next/server';
import { getSafepayClient } from '@/lib/safepay';
import { siteUrl } from '@/data/site';
import { createOrder, OrderInputError } from '@/lib/orders';

/**
 * POST — start a Safepay payment.
 *
 * Saves the order first, as `pending`, priced server-side, with Safepay's
 * tracker in payment_reference. It becomes `paid` only when Safepay's signed
 * return (/api/checkout/return/[orderId]) or webhook proves the payment.
 *
 * The order used to be saved by the browser *after* the redirect, with
 * status "paid" -- which anyone could send without paying -- and under a new
 * id the webhook could never match.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const safepay = getSafepayClient();

    // Same source as the pre-order payment links. Falling back to localhost
    // here sent Safepay's post-payment redirect to a machine the customer is
    // not on, stranding them after they had already paid.
    const site = siteUrl();
    let checkoutUrl = '';

    const { orderId } = await createOrder(
      { ...body, payment_method: 'safepay', payment_sub_method: 'safepay', payment_screenshot: null },
      {
        beforeInsert: async (priced, orderId) => {
          const payment = await safepay.payments.create({ amount: priced.total, currency: 'PKR' });
          console.log('📦 Payment tracker created:', payment.token);

          checkoutUrl = safepay.checkout.create({
            token: payment.token,
            orderId,
            redirectUrl: `${site}/api/checkout/return/${orderId}`,
            cancelUrl: `${site}/checkout/cancel/${orderId}`,
            source: 'custom',
            webhooks: true,
          });

          return { payment_reference: payment.token };
        },
      }
    );

    console.log(`🔗 Safepay checkout opened for ${orderId}`);
    return NextResponse.json({ url: checkoutUrl, orderId });
  } catch (error: any) {
    if (error instanceof OrderInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const upstreamStatus = error?.response?.status;
    const upstreamMessage = error?.response?.data?.message || error?.response?.data?.error;
    const message = upstreamMessage || error?.message || 'Unable to initialize Safepay checkout';
    console.error('❌ Safepay Checkout Error:', { status: upstreamStatus, message });
    return NextResponse.json(
      { error: upstreamStatus ? `Safepay returned ${upstreamStatus}: ${message}` : message },
      { status: 502 }
    );
  }
}
