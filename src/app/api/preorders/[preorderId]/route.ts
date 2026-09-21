import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { newOrderId } from '@/lib/order-id';
import { mapPreorder, remainingBalance, PREORDER_STATUSES } from '@/lib/preorder';
import { preorderHasFreeDelivery } from '@/data/preorder-promo';
import { sendPreorderCompletedEmail } from '@/lib/preorder-email';

/** GET - One pre-order. Admin only. */
export async function GET(req: NextRequest, props: { params: Promise<{ preorderId: string }> }) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }
    const { preorderId } = await props.params;

    const { data, error } = await supabaseAdmin
      .from('preorders')
      .select('*')
      .eq('preorder_id', preorderId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Pre-order not found' }, { status: 404 });
    }
    return NextResponse.json({ preorder: mapPreorder(data) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH - Admin actions on a pre-order.
 *
 * Everything here moves money or confirms it was received, so the whole route
 * is admin-only -- unlike /api/orders PATCH, where the customer's own success
 * page performs a status update.
 *
 * Actions:
 *   verify_deposit   - the deposit screenshot checks out; reservation confirmed
 *   reject_deposit   - it does not
 *   verify_balance   - the balance is in; creates the order and confirms
 *   reject_balance   - it does not
 *   set_delivery_fee - set before requesting the balance
 *   set_status       - manual override
 *   set_tracker      - dispatch tracking reference
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ preorderId: string }> }) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { preorderId } = await props.params;
    const { action, status, deliveryFee, tracker, adminNotes } = await req.json();

    const { data: current, error: readError } = await supabaseAdmin
      .from('preorders')
      .select('*')
      .eq('preorder_id', preorderId)
      .single();

    if (readError || !current) {
      return NextResponse.json({ error: 'Pre-order not found' }, { status: 404 });
    }

    const update: any = { updated_at: new Date().toISOString() };
    let createdOrderId: string | null = null;

    switch (action) {
      case 'verify_deposit': {
        if (Number(current.deposit_paid) > 0) {
          return NextResponse.json({ error: 'Deposit is already verified' }, { status: 409 });
        }
        update.deposit_paid = Number(current.deposit_amount);
        update.deposit_verified_at = new Date().toISOString();
        update.status = 'deposit_paid';
        break;
      }

      case 'reject_deposit': {
        update.deposit_paid = 0;
        update.deposit_verified_at = null;
        update.status = 'deposit_rejected';
        break;
      }

      case 'verify_balance': {
        if (current.status === 'fully_paid') {
          return NextResponse.json({ error: 'Pre-order is already fully paid' }, { status: 409 });
        }
        // An admin can reach here having never pressed "Verify Deposit" -- the
        // customer paid it all the same. Credit it to the deposit rather than
        // letting the whole sum land in balance_paid, which would misreport the
        // split in the ledger even though the total came out right.
        const settling = { ...current };
        if (Number(current.deposit_paid || 0) === 0) {
          update.deposit_paid = Number(current.deposit_amount);
          update.deposit_verified_at = new Date().toISOString();
          settling.deposit_paid = Number(current.deposit_amount);
        }

        // Whatever is still outstanding at this moment, delivery included.
        const due = remainingBalance(settling);
        update.balance_paid = Number(current.balance_paid || 0) + due;
        update.balance_verified_at = new Date().toISOString();
        update.status = 'fully_paid';
        // The payment window closes, but the pass stays. It is the customer's
        // record of the whole pre-order, and scanning it now reports
        // "confirmed" rather than dying on them the moment they are paid up.
        // Nothing can be paid through it again: preorderStage() reads
        // fully_paid before anything else, so the pay route refuses it and the
        // page stops returning their name, phone and address entirely.
        update.balance_token_expires_at = null;

        // A fully paid pre-order becomes a real order, so it flows through the
        // existing orders screen, receipts and profit & loss like any other.
        if (!current.order_id) {
          const orderId = newOrderId();
          const { error: orderError } = await supabaseAdmin.from('orders').insert([
            {
              order_id: orderId,
              name: current.name,
              email: current.email,
              phone: current.phone,
              address: current.address,
              product: `${current.product_name} x${current.quantity} (Pre-Order ${current.preorder_id})`,
              amount: Number(current.total_amount) + Number(current.delivery_fee || 0),
              currency: current.currency || 'PKR',
              status: 'paid',
              payment_method: 'online_manual',
              payment_proof_url: current.balance_proof_url || current.deposit_proof_url || null,
              payment_reference: current.balance_reference || null,
              delivery_fee: Number(current.delivery_fee || 0),
            },
          ]);

          if (orderError) {
            // Don't strand the money: the pre-order is still marked paid and the
            // admin can raise the order by hand.
            console.error(`❌ Could not create order for ${preorderId}:`, orderError.message);
          } else {
            update.order_id = orderId;
            createdOrderId = orderId;
          }
        }
        break;
      }

      case 'reject_balance': {
        update.status = 'balance_rejected';
        // Their proof did not check out, so they have to pay again -- which
        // means un-spending the pass they paid through. Without this the
        // customer is told to try again while holding a code that refuses.
        update.balance_token_used_at = null;
        break;
      }

      case 'set_delivery_fee': {
        const fee = Number(deliveryFee);
        if (!Number.isFinite(fee) || fee < 0 || fee > 100000) {
          return NextResponse.json(
            { error: 'Enter a delivery fee between 0 and 100,000' },
            { status: 400 }
          );
        }
        // The launch offer included delivery. The customer has already been
        // shown a total with nothing further to pay, and the figure they were
        // shown is the one we are held to -- so the promise is enforced here
        // rather than left to whoever is working the admin screen that day.
        if (fee > 0 && preorderHasFreeDelivery(current)) {
          return NextResponse.json(
            {
              error:
                'This pre-order was taken under the launch offer, which included free delivery. Leave the charge at 0.',
            },
            { status: 409 }
          );
        }
        update.delivery_fee = fee;
        break;
      }

      case 'set_status': {
        if (!PREORDER_STATUSES.includes(status)) {
          return NextResponse.json({ error: `Unknown status: ${status}` }, { status: 400 });
        }
        update.status = status;
        break;
      }

      case 'set_tracker': {
        update.tracker = tracker || null;
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    if (adminNotes !== undefined) update.admin_notes = adminNotes;

    const { data: updated, error } = await supabaseAdmin
      .from('preorders')
      .update(update)
      .eq('preorder_id', preorderId)
      .select('*')
      .single();

    if (error) throw error;

    if (action === 'verify_balance') {
      try {
        await sendPreorderCompletedEmail({
          preorderId: updated.preorder_id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          address: updated.address,
          product: updated.product_name,
          quantity: updated.quantity,
          totalAmount: Number(updated.total_amount),
          depositAmount: Number(updated.deposit_paid),
          balanceAmount: 0,
          deliveryFee: Number(updated.delivery_fee || 0),
          orderId: updated.order_id || createdOrderId || undefined,
        });
      } catch (err: any) {
        console.error('❌ Failed to send pre-order completed email:', err.message);
      }
    }

    return NextResponse.json({ success: true, preorder: mapPreorder(updated) });
  } catch (error: any) {
    console.error('❌ Pre-order Update Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
