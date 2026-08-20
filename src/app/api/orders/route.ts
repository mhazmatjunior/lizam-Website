import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { isAdminRequest } from '@/lib/auth';

// POST - Create a new order in Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, amount, currency, product, payment_method } = body;

    if (!name || !email || !phone || !address) {
      return NextResponse.json({ error: 'All customer fields are required' }, { status: 400 });
    }

    const orderId = `ORD-${Date.now()}`;
    
    let insertObj: any = {
      order_id: orderId,
      name,
      email,
      phone,
      address,
      product: product || '7TH OCT',
      amount: amount || 150,
      currency: currency || 'PKR',
      status: 'pending',
      tracker: null,
      payment_method: payment_method || 'safepay'
    };

    let { data: newOrder, error } = await supabaseAdmin
      .from('orders')
      .insert([insertObj])
      .select('*')
      .single();

    if (error && (
      error.message.includes('column "payment_method"') ||
      error.message.includes('payment_method') ||
      error.message.includes('schema cache')
    )) {
      console.warn('⚠️ Column "payment_method" does not exist. Retrying with fallback (appending to product field)...');
      delete insertObj.payment_method;
      insertObj.product = `${insertObj.product} [${payment_method || 'safepay'}]`;
      
      const retryResult = await supabaseAdmin
        .from('orders')
        .insert([insertObj])
        .select('*')
        .single();
      
      if (retryResult.error) {
        throw retryResult.error;
      }
      newOrder = retryResult.data;
    } else if (error) {
      throw error;
    }

    console.log(`✅ New Order Saved in Supabase: ${orderId} - ${name} (${email})`);

    // If the payment method is Cash on Delivery, send confirmation email immediately
    if (payment_method && payment_method.startsWith('cod_')) {
      sendOrderConfirmationEmail({
        orderId,
        name,
        email,
        phone,
        address,
        product: product || '7TH OCT',
        amount: amount || 150,
        paymentMethod: payment_method,
      }).catch(err => {
        console.error('❌ Failed to send COD order confirmation email:', err.message);
      });
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
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Order Status Update Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve all orders from Supabase (for admin use)
export async function GET() {
  try {
    // Admin only. This returns every customer name, email, phone and address,
    // so it must never be readable by an anonymous visitor.
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
      // Determine payment method (read from column, or fallback parsed from product name)
      let payMethod = o.payment_method || 'safepay';
      let prodName = o.product || '';
      if (!o.payment_method && prodName.includes('[cod_')) {
        const match = prodName.match(/\[(cod_[a-z_]+|safepay)\]/);
        if (match) {
          payMethod = match[1];
          prodName = prodName.replace(/\s*\[(cod_[a-z_]+|safepay)\]/, '');
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
        hasProof: Boolean(o.payment_proof_url),
        paymentReference: o.payment_reference ?? null,
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
