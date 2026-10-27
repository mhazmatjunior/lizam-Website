import { NextRequest, NextResponse } from 'next/server';
import { getSafepayClient, hasWebhookSecret } from '@/lib/safepay';
import { markSafepayPaid } from '@/lib/orders';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    // Fail closed. Without a real secret every signature would validate
    // against a placeholder, so a forged payment callback would be trusted.
    if (!hasWebhookSecret()) {
      console.error('❌ SAFEPAY_WEBHOOK_SECRET is not set — refusing to process webhooks');
      return NextResponse.json({ error: 'Webhook verification is not configured' }, { status: 503 });
    }

    const safepay = getSafepayClient();
    const event = JSON.parse(rawBody);

    // 1. Verify Webhook Signature. The SDK signs JSON.stringify(body.data), so
    // it needs the parsed body -- passing the raw string threw on every call.
    const isValid = await (safepay.verify as any).webhook({ headers, body: event });

    if (!isValid) {
      console.warn('❌ Safepay Webhook: Invalid Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('✅ Safepay Webhook Received:', event.type);

    // 2. A completed payment marks its order paid -- the same transition the
    // signed customer return makes, so whichever arrives first wins and the
    // confirmation email goes out once.
    if (event.type === 'payment.succeeded') {
      const data = event.data || {};
      const order = await markSafepayPaid(
        data.order_id ? { orderId: String(data.order_id) } : { tracker: String(data.tracker || data.token || '') }
      );
      if (!order) console.log(`ℹ️ Webhook for ${data.order_id || data.tracker}: already paid or not found`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Safepay Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
