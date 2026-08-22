import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  sendOrderConfirmationEmail, 
  sendPaymentVerifiedEmail, 
  sendOrderShippedEmail 
} from '@/lib/email';

// POST - Create a new order in Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, 
      email, 
      phone, 
      address, 
      amount, 
      currency, 
      product, 
      payment_method,
      payment_sub_method,
      payment_screenshot,
      delivery_fee,
      status: requestedStatus
    } = body;

    if (!name || !email || !phone || !address) {
      return NextResponse.json({ error: 'All customer fields are required' }, { status: 400 });
    }

    const orderId = `ORD-${Date.now()}`;
    const initialStatus = requestedStatus || (payment_method === 'online_manual' ? 'unverified' : 'pending');
    
    let insertObj: any = {
      order_id: orderId,
      name,
      email,
      phone,
      address,
      product: product || '7TH OCT (Pre-Order)',
      amount: amount || 150,
      currency: currency || 'PKR',
      status: initialStatus,
      tracker: null,
      payment_method: payment_method || 'safepay',
      payment_sub_method: payment_sub_method || null,
      payment_screenshot: payment_screenshot || null,
      delivery_fee: delivery_fee || 0
    };

    let { data: newOrder, error } = await supabaseAdmin
      .from('orders')
      .insert([insertObj])
      .select('*')
      .single();

    if (error) {
      console.warn('⚠️ Standard insert failed, retrying with compatible fallback keys...', error.message);
      // Fallback: strip extended columns if DB schema hasn't migrated yet
      delete insertObj.payment_sub_method;
      delete insertObj.payment_screenshot;
      delete insertObj.delivery_fee;

      // Encode screenshot / sub-method metadata directly in product descriptor
      let metaTag = `[method:${payment_method || 'safepay'}`;
      if (payment_sub_method) metaTag += `|sub:${payment_sub_method}`;
      if (payment_screenshot) metaTag += `|ss:${encodeURIComponent(payment_screenshot.slice(0, 5000))}`; // truncation safe tag
      metaTag += `]`;

      insertObj.product = `${insertObj.product} ${metaTag}`;

      const retryResult = await supabaseAdmin
        .from('orders')
        .insert([insertObj])
        .select('*')
        .single();
      
      if (retryResult.error) {
        // Ultimate fallback: minimal insert
        delete insertObj.payment_method;
        const ultimateResult = await supabaseAdmin
          .from('orders')
          .insert([insertObj])
          .select('*')
          .single();

        if (ultimateResult.error) throw ultimateResult.error;
        newOrder = ultimateResult.data;
      } else {
        newOrder = retryResult.data;
      }
    }

    // Send order confirmation email for new order
    try {
      await sendOrderConfirmationEmail({
        orderId,
        name,
        email,
        phone,
        address,
        product: product || '7TH OCT (Pre-Order)',
        amount: amount || 150,
        paymentMethod: payment_method || 'safepay',
      });
    } catch (err: any) {
      console.error('❌ Failed to send order confirmation email:', err.message);
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error('❌ Order Save Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update order status (called after payment confirmation or by admin)
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, tracker } = await req.json();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    if (tracker !== undefined) {
      updateData.tracker = tracker;
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
      let payScreenshot = o.payment_screenshot || '';
      let prodName = o.product || '';

      // Parse metadata tag if embedded in product
      if (prodName.includes('[method:')) {
        const match = prodName.match(/\[method:([^|\]]+)(?:\|sub:([^|\]]+))?(?:\|ss:([^\]]+))?\]/);
        if (match) {
          payMethod = match[1];
          if (match[2]) paySubMethod = match[2];
          if (match[3]) payScreenshot = decodeURIComponent(match[3]);
          prodName = prodName.replace(/\s*\[method:[^\]]+\]/, '');
        }
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
