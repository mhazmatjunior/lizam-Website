import { NextRequest, NextResponse } from 'next/server';
import { getSafepayClient } from '@/lib/safepay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency, orderId } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const safepay = getSafepayClient();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Step 1: Create a payment tracker token
    const payment = await safepay.payments.create({
      amount,
      currency: currency || 'PKR',
    });

    console.log('📦 Payment tracker created:', payment.token);

    // Step 2: Generate the official Safepay checkout URL using the SDK
    const finalOrderId = orderId || `ORD-${Date.now()}`;
    const checkoutUrl = safepay.checkout.create({
      token: payment.token,
      orderId: finalOrderId,
      redirectUrl: `${siteUrl}/checkout/success/${finalOrderId}`,
      cancelUrl: `${siteUrl}/checkout/cancel/${finalOrderId}`,
      source: 'custom',
      webhooks: true,
    });

    console.log('🔗 Checkout URL generated:', checkoutUrl);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('❌ Safepay Checkout Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
