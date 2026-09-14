import { NextRequest, NextResponse } from 'next/server';
import { getSafepayClient } from '@/lib/safepay';
import { newOrderId } from '@/lib/order-id';
import { siteUrl } from '@/data/site';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency, orderId } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const safepay = getSafepayClient();

    // Same source as the pre-order payment links. Falling back to localhost
    // here sent Safepay's post-payment redirect to a machine the customer is
    // not on, stranding them after they had already paid.
    const site = siteUrl();

    // Step 1: Create a payment tracker token
    const payment = await safepay.payments.create({
      amount,
      currency: currency || 'PKR',
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
