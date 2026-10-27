import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { createOrder, OrderInputError, sendConfirmation } from '@/lib/orders';
import { 
  sendPaymentVerifiedEmail, 
  sendOrderShippedEmail 
} from '@/lib/email';

// POST - Create a COD or bank-transfer order. Safepay orders go through
// /api/checkout, which also opens the payment.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, order } = await createOrder(body);
    await sendConfirmation(order);
    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    if (error instanceof OrderInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('❌ Order Save Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update order status. Admin only, except that a shopper returning
// from Safepay's cancel page may cancel their own unpaid Safepay order.
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, tracker, deliveryFee } = await req.json();

    // Order references are timestamps and easy to guess, so a shopper must not
    // be able to mark an order paid, shipped or anything else. "Paid" for
    // Safepay is set only by the verified return / webhook (lib/orders.ts).
    if (!(await isAdminRequest())) {
      if (status !== 'cancelled' || tracker !== undefined || deliveryFee !== undefined) {
        return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
      }
      const { data: cancelled } = await supabaseAdmin
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .eq('payment_method', 'safepay')
        .select('order_id')
        .maybeSingle();
      return NextResponse.json({ success: Boolean(cancelled) });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    if (status !== undefined) {
      updateData.status = status;
    }
    if (tracker !== undefined) {
      updateData.tracker = tracker;
    }

    // Changing the delivery charge moves real money, so unlike a status update
    // (which the customer's own confirmation page performs) this is admin-only.
    if (deliveryFee !== undefined) {
      if (!(await isAdminRequest())) {
        return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
      }

      const fee = Number(deliveryFee);
      if (!Number.isFinite(fee) || fee < 0 || fee > 100000) {
        return NextResponse.json(
          { error: 'Enter a delivery fee between 0 and 100,000' },
          { status: 400 }
        );
      }

      // Keep the product subtotal intact and swap only the delivery portion,
      // so the total stays consistent with what was actually ordered.
      const { data: current, error: readError } = await supabaseAdmin
        .from('orders')
        .select('amount, delivery_fee')
        .eq('order_id', orderId)
        .single();

      if (readError || !current) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const subtotal = Math.max(0, Number(current.amount || 0) - Number(current.delivery_fee || 0));
      updateData.delivery_fee = fee;
      updateData.amount = subtotal + fee;
    }

    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('order_id', orderId)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Order not found or update failed' }, { status: 404 });
    }

    console.log(`🔄 Order ${orderId} updated to: ${status}`);

    // Trigger automated email notifications based on status change
    if (updatedOrder) {
      const emailPayload = {
        orderId: updatedOrder.order_id,
        name: updatedOrder.name,
        email: updatedOrder.email,
        phone: updatedOrder.phone,
        address: updatedOrder.address,
        product: updatedOrder.product,
        amount: updatedOrder.amount,
        paymentMethod: updatedOrder.payment_method || 'safepay',
      };

      try {
        if (status === 'paid') {
          await sendPaymentVerifiedEmail(emailPayload);
        } else if (status === 'shipped') {
          await sendOrderShippedEmail(emailPayload);
        }
      } catch (eErr: any) {
        console.error(`❌ Status email sending error for status ${status}:`, eErr.message);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('❌ Order Status Update Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve all orders from Supabase (for admin use)
export async function GET() {
  try {
    // Admin only. This returns every customer's name, email, phone and
    // address, so it must never be readable by an anonymous visitor.
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map database snake_case fields to frontend camelCase fields
    const mappedOrders = (orders || []).map((o: any) => {
      let payMethod = o.payment_method || 'safepay';
      let paySubMethod = o.payment_sub_method || '';
      let payScreenshot = o.payment_proof_url || o.payment_screenshot || '';
      let prodName = o.product || '';

      // Robust Metadata Parser supporting both extended columns & embedded product tags
      if (prodName.includes('|ss:') || prodName.includes('[ss:') || prodName.includes('[method:') || prodName.includes('[m:')) {
        const ssMatch = prodName.match(/\|ss:([^\]]+)/) || prodName.match(/\[ss:([^\]]+)/);
        if (ssMatch) {
          try {
            payScreenshot = decodeURIComponent(ssMatch[1]);
          } catch (e) {
            payScreenshot = ssMatch[1];
          }
        }

        const methodMatch = prodName.match(/(?:\[method:|\[m:)([^|\]]+)/);
        if (methodMatch) payMethod = methodMatch[1];

        const subMatch = prodName.match(/(?:\|sub:|\|s:)([^|\]]+)/);
        if (subMatch) paySubMethod = subMatch[1];

        // Clean metadata tag from display product name
        prodName = prodName.replace(/\s*\[(?:method:|m:)[^\]]+\]/, '').replace(/\s*\[ss:[^\]]+\]/, '').trim();
      } else if (!o.payment_method && prodName.includes('[cod_')) {
        const match = prodName.match(/\[(cod_[a-z_]+|safepay|online_manual)\]/);
        if (match) {
          payMethod = match[1];
          prodName = prodName.replace(/\s*\[(cod_[a-z_]+|safepay|online_manual)\]/, '');
        }
      }

      return {
        orderId: o.order_id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        address: o.address,
        product: prodName,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        tracker: o.tracker,
        paymentMethod: payMethod,
        paymentSubMethod: paySubMethod,
        paymentScreenshot: payScreenshot,
        deliveryFee: o.delivery_fee || 0,
        utmSource: o.utm_source || '',
        utmMedium: o.utm_medium || '',
        utmCampaign: o.utm_campaign || '',
        utmContent: o.utm_content || '',
        createdAt: o.created_at,
        updatedAt: o.updated_at
      };
    });

    return NextResponse.json({ orders: mappedOrders });
  } catch (error: any) {
    console.error('❌ Orders Retrieve Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
