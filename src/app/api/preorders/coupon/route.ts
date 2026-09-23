import { NextRequest, NextResponse } from 'next/server';
import { creditedDeposit, customerBalance, preorderStage, PAYABLE_STAGE } from '@/lib/preorder';
import { loadByCoupon } from './lookup';

/**
 * POST - Apply a pre-order coupon code at checkout.
 *
 * POST rather than GET with the code in the path, so the customer's code
 * does not end up in access logs or browser history.
 *
 * A recognised code comes back 200 with a stage, however far along the
 * pre-order is; the checkout page decides from that whether to show the
 * balance form or a progress note.
 *
 * Name, phone, address and email come back only while the balance is actually
 * payable, because that is the only stage with a form to prefill.
 */
export async function POST(req: NextRequest) {
  try {
    const { couponCode } = await req.json();
    const result = await loadByCoupon(couponCode);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const p = result.data;
    const stage = preorderStage(p);

    return NextResponse.json({
      preorder: {
        preorderId: p.preorder_id,
        couponCode: result.code,
        stage,
        productName: p.product_name,
        quantity: p.quantity,
        currency: p.currency || 'PKR',
        status: p.status,
        unitPrice: Number(p.unit_price || 0),
        totalAmount: Number(p.total_amount || 0),
        // These two must agree: crediting the deposit in one and not the other
        // showed the customer their deposit and then charged them for it again.
        depositPaid: creditedDeposit(p),
        deliveryFee: Number(p.delivery_fee || 0),
        balanceAmount: customerBalance(p),
        ...(stage === PAYABLE_STAGE
          ? {
              name: p.name,
              email: p.email,
              phone: p.phone,
              address: p.address,
              city: p.city || '',
            }
          : {}),
      },
    });
  } catch (error: any) {
    console.error('❌ Pre-order coupon lookup error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
