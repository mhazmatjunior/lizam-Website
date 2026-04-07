import { NextRequest, NextResponse } from 'next/server';
import { getSafepayClient } from '@/lib/safepay';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());

    const safepay = getSafepayClient();
    // 1. Verify Webhook Signature
    const isValid = await (safepay.verify as any).webhook({
      headers,
      body: rawBody,
    });

    if (!isValid) {
      console.warn('❌ Safepay Webhook: Invalid Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse Event
    const event = JSON.parse(rawBody);
    console.log('✅ Safepay Webhook Received:', JSON.stringify(event, null, 2));

    // 3. Handle specific events (e.g., payment succeeded)
    if (event.type === 'payment.succeeded') {
       console.log(`💰 Payment Succeeded for Order: ${event.data.order_id}`);
       // TODO: Update Order status in Database
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Safepay Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
