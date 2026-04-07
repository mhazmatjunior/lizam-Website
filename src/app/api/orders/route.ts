import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

function readOrders() {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeOrders(orders: any[]) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

// POST - Create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, amount, currency, product } = body;

    if (!name || !email || !phone || !address) {
      return NextResponse.json({ error: 'All customer fields are required' }, { status: 400 });
    }

    const orderId = `ORD-${Date.now()}`;
    const newOrder = {
      orderId,
      name,
      email,
      phone,
      address,
      product: product || '7TH OCTOBER (Pre-Order)',
      amount: amount || 150,
      currency: currency || 'PKR',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = readOrders();
    orders.push(newOrder);
    writeOrders(orders);

    console.log(`✅ New Order Saved: ${orderId} - ${name} (${email})`);

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error('❌ Order Save Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update order status (called after payment confirmation)
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, tracker } = await req.json();

    const orders = readOrders();
    const index = orders.findIndex((o: any) => o.orderId === orderId);

    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    orders[index].status = status;
    orders[index].tracker = tracker || null;
    orders[index].updatedAt = new Date().toISOString();
    writeOrders(orders);

    console.log(`🔄 Order ${orderId} updated to: ${status}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Retrieve all orders (for admin use later)
export async function GET() {
  try {
    const orders = readOrders();
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
