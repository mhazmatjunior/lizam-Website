import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST - Create a new order in Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, amount, currency, product } = body;

    if (!name || !email || !phone || !address) {
      return NextResponse.json({ error: 'All customer fields are required' }, { status: 400 });
    }

    const orderId = `ORD-${Date.now()}`;
    
    const { data: newOrder, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          order_id: orderId,
          name,
          email,
          phone,
          address,
          product: product || '7TH OCT (Pre-Order)',
          amount: amount || 150,
          currency: currency || 'PKR',
          status: 'pending',
          tracker: null
        }
      ])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    console.log(`✅ New Order Saved in Supabase: ${orderId} - ${name} (${email})`);

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
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map database snake_case fields to frontend camelCase fields
    const mappedOrders = (orders || []).map((o: any) => ({
      orderId: o.order_id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      address: o.address,
      product: o.product,
      amount: o.amount,
      currency: o.currency,
      status: o.status,
      tracker: o.tracker,
      createdAt: o.created_at,
      updatedAt: o.updated_at
    }));

    return NextResponse.json({ orders: mappedOrders });
  } catch (error: any) {
    console.error('❌ Orders Retrieve Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
