import { NextRequest, NextResponse } from 'next/server';
import { getSafepayClient, hasWebhookSecret } from '@/lib/safepay';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPaymentVerifiedEmail } from '@/lib/email';

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
       const orderId = event.data.order_id;
       console.log(`💰 Payment Succeeded for Order: ${orderId}`);

       // Update Order status in Database
       const { data: order, error: updateError } = await supabaseAdmin
         .from('orders')
         .update({ 
           status: 'paid', 
           updated_at: new Date().toISOString() 
         })
         .eq('order_id', orderId)
         .select('*')
         .single();

       if (updateError) {
         console.error(`❌ Webhook Order Update Error for ${orderId}:`, updateError.message);
       } else if (order) {
         console.log(`🔄 Database Status updated to PAID for order: ${orderId}`);
         // Trigger transactional email
         sendPaymentVerifiedEmail({
           orderId: order.order_id,
           name: order.name,
           email: order.email,
           phone: order.phone,
           address: order.address,
           product: order.product,
           amount: order.amount,
           paymentMethod: order.payment_method || 'safepay'
         }).catch(err => {
           console.error('❌ Failed to send online payment verified email:', err.message);
         });
       }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Safepay Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
