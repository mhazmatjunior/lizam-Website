import { NextRequest, NextResponse } from 'next/server';
import { getSafepayClient } from '@/lib/safepay';
import { newOrderId } from '@/lib/order-id';
import { siteUrl } from '@/data/site';
import { priceOrder } from '@/lib/order-pricing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, orderId } = body;

    // The charge is priced server-side from the cart. Taking `amount` from the
    // browser let anyone open a Safepay payment for Rs 1 against a full order.
    let amount: number;
    try {
      amount = (await priceOrder(items, 'safepay')).total;
    } catch (err: any) {
      return NextResponse.json(
        { error: `${err.message}. Please refresh the page and try again.` },
        { status: 400 }
      );
    }

    const safepay = getSafepayClient();

    // Same source as the pre-order payment links. Falling back to localhost
    // here sent Safepay's post-payment redirect to a machine the customer is
    // not on, stranding them after they had already paid.
    const site = siteUrl();

    // Step 1: Create a payment tracker token
    const payment = await safepay.payments.create({
      amount,
      currency: 'PKR',
    });

    console.log('📦 Payment tracker created:', payment.token);

    // Step 2: Generate the official Safepay checkout URL using the SDK
    const finalOrderId = orderId || newOrderId();
    const checkoutUrl = safepay.checkout.create({
      token: payment.token,
      orderId: finalOrderId,
      redirectUrl: `${site}/checkout/success/${finalOrderId}`,
      cancelUrl: `${site}/checkout/cancel/${finalOrderId}`,
      source: 'custom',
      webhooks: true,
    });

    console.log('🔗 Checkout URL generated:', checkoutUrl);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
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
