import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { newOrderId } from '@/lib/order-id';
import { creditedDeposit, customerBalance, preorderStage, PAYABLE_STAGE } from '@/lib/preorder';
import { sendPreorderCompletedEmail } from '@/lib/preorder-email';
import { loadByCoupon, notPayableReason } from '../lookup';

// 'cod' settles the balance in cash at the door. It carries no screenshot --
// there is nothing to capture until the courier is paid.
const VALID_METHODS = ['bank', 'easypaisa', 'jazzcash', 'cod'];
const PROOFLESS_METHODS = ['cod'];

/**
 * POST - Complete a pre-order with its coupon code.
 *
 * The customer has entered their code, transferred the balance and uploaded
 * the screenshot (or chosen cash on delivery). A matching, unspent code
 * completes the order on the spot:
 *
 *   - the pre-order is marked fully paid and the code is spent,
 *   - a real order is raised, so it flows through the Orders screen,
 *     receipts and profit & loss like any other, and
 *   - the customer is sent the "Order Complete" email.
 *
 * The screenshot is still checked -- on the Orders screen. The order is
 * raised as "unverified" (or "cashondelivery"), exactly like an ordinary
 * manual-transfer checkout, so a bad screenshot is caught before dispatch.
 */
export async function POST(req: NextRequest) {
  try {
    const { couponCode, balanceMethod, balanceProofUrl, balanceReference } = await req.json();

    const result = await loadByCoupon(couponCode);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const preorder = result.data;
    const code = result.code;
    const stage = preorderStage(preorder);

    // Before an admin asks for the balance the delivery fee may still be unset,
    // and a customer completing "early" would underpay by the carriage.
    if (stage !== PAYABLE_STAGE) {
      return NextResponse.json({ error: notPayableReason(stage), stage }, { status: 409 });
    }

    if (!VALID_METHODS.includes(balanceMethod)) {
      return NextResponse.json({ error: 'Choose how you sent the payment' }, { status: 400 });
    }
    const isCod = PROOFLESS_METHODS.includes(balanceMethod);
    if (!balanceProofUrl && !isCod) {
      return NextResponse.json(
        { error: 'Upload a screenshot of your transfer to continue' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const deposit = creditedDeposit(preorder);
    const due = customerBalance(preorder);

    // Spending the code in the same statement that completes the pre-order is
    // what makes it single use. The filters are a compare-and-set: they match
    // only while the code is unspent and the pre-order still payable, so a
    // second submission -- a double tap, a forwarded code, a replayed request
    // racing the first -- updates no rows and is turned away below.
    const { data: spent, error } = await supabaseAdmin
      .from('preorders')
      .update({
        // An admin may have sent the payment email without pressing Verify
        // Deposit. Credit it to the deposit rather than letting the whole sum
        // land in balance_paid, which would misreport the split.
        deposit_paid: deposit,
        deposit_verified_at: preorder.deposit_verified_at || now,
        balance_paid: Number(preorder.balance_paid || 0) + due,
        balance_method: balanceMethod,
        balance_proof_url: balanceProofUrl || null,
        balance_reference: balanceReference || null,
        balance_verified_at: now,
        status: 'fully_paid',
        coupon_used_at: now,
        balance_token_expires_at: null,
        updated_at: now,
      })
      .eq('coupon_code', code)
      .is('coupon_used_at', null)
      .in('status', ['balance_requested', 'balance_rejected'])
      .select('*');

    if (error) throw error;

    if (!spent || spent.length === 0) {
      return NextResponse.json(
        { error: notPayableReason('paid'), stage: 'paid', preorderId: preorder.preorder_id },
        { status: 409 }
      );
    }

    const completed = spent[0];

    // Raise the order. A failure here must not strand a completed pre-order:
    // it is logged and the admin can raise the order by hand.
    let orderId: string | null = completed.order_id || null;
    if (!orderId) {
      const candidate = newOrderId();
      const { error: orderError } = await supabaseAdmin.from('orders').insert([
        {
          order_id: candidate,
          name: completed.name,
          email: completed.email,
          phone: completed.phone,
          address: completed.address,
          product: `${completed.product_name} x${completed.quantity} (Pre-Order ${completed.preorder_id})`,
          amount: Number(completed.total_amount) + Number(completed.delivery_fee || 0),
          currency: completed.currency || 'PKR',
          // Same statuses an ordinary checkout uses, so the Orders screen asks
          // the admin to check the screenshot before this ships.
          status: isCod ? 'cashondelivery' : 'unverified',
          payment_method: isCod ? 'cod_standard' : 'online_manual',
          payment_proof_url: balanceProofUrl || completed.deposit_proof_url || null,
          payment_reference: balanceReference || null,
          delivery_fee: Number(completed.delivery_fee || 0),
        },
      ]);

      if (orderError) {
        console.error(`❌ Could not create order for ${completed.preorder_id}:`, orderError.message);
      } else {
        orderId = candidate;
        await supabaseAdmin
          .from('preorders')
          .update({ order_id: candidate })
          .eq('preorder_id', completed.preorder_id);
      }
    }

    // A failed email must not undo a completed order, so it is logged only.
    try {
      await sendPreorderCompletedEmail({
        preorderId: completed.preorder_id,
        name: completed.name,
        email: completed.email,
        phone: completed.phone,
        address: completed.address,
        product: completed.product_name,
        quantity: completed.quantity,
        totalAmount: Number(completed.total_amount),
        depositAmount: deposit,
        balanceAmount: due,
        deliveryFee: Number(completed.delivery_fee || 0),
        orderId: orderId || undefined,
        isCod,
      });
    } catch (err: any) {
      console.error('❌ Failed to send pre-order completed email:', err.message);
    }

    return NextResponse.json({
      success: true,
      preorderId: completed.preorder_id,
      orderId,
      isCod,
    });
  } catch (error: any) {
    console.error('❌ Pre-order coupon redeem error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
