import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { creditedDeposit, customerBalance, preorderStage, PAYABLE_STAGE } from '@/lib/preorder';

// 'cod' settles the balance in cash at the door. It carries no screenshot --
// there is nothing to capture until the courier is paid -- so the admin marks
// it received on delivery instead.
const VALID_METHODS = ['bank', 'easypaisa', 'jazzcash', 'cod'];
const PROOFLESS_METHODS = ['cod'];

/**
 * The pre-order pass: one QR, issued when the pre-order is placed, scanned
 * through to /checkout?preorder=<token> for the rest of its life.
 *
 * The token IS the authentication -- there is no session behind a scanned
 * code -- so the lookup is deliberately narrow: strictly by exact token, and
 * nothing else is accepted as identifying a pre-order.
 *
 * What the pass is *for* changes as the pre-order moves along, so this no
 * longer refuses a settled or not-yet-payable pre-order. It loads the row and
 * lets preorderStage() say which of the two jobs applies: report progress, or
 * take the balance. Refusing outright would have meant a customer who scanned
 * the code the day after placing their order got an error, which is exactly
 * the moment they are most likely to try it.
 */
async function loadByToken(token: string) {
  if (!token || token.length < 32) {
    return { error: 'Invalid pre-order code', status: 404 } as const;
  }

  const { data, error } = await supabaseAdmin
    .from('preorders')
    .select('*')
    .eq('balance_token', token)
    .maybeSingle();

  if (error || !data) {
    return { error: 'This QR code is not valid', status: 404 } as const;
  }
  return { data } as const;
}

/**
 * GET - Everything the page needs to render whichever stage the pass is at.
 *
 * Name, phone, address and email come back only while the balance is actually
 * payable, because that is the only stage with a form to prefill. At every
 * other stage the pass shows progress, which needs the reference, the product
 * and the figures and nothing else -- so a code that goes astray after the
 * pre-order is settled no longer hands over the customer's contact details.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await props.params;
    const result = await loadByToken(token);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const p = result.data;
    const stage = preorderStage(p);

    return NextResponse.json({
      preorder: {
        preorderId: p.preorder_id,
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
    console.error('❌ Pre-order pass read error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST - The customer submits proof of their balance transfer.
 *
 * This records the claim and moves the pre-order to balance_unverified. It does
 * NOT mark it paid: balance_paid is only credited when an admin verifies the
 * screenshot, exactly as the deposit works. Anything else would let a customer
 * confirm their own order by uploading any image at all.
 *
 * It is also where the pass is spent -- see the update below.
 */
export async function POST(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await props.params;
    const result = await loadByToken(token);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const preorder = result.data;
    const stage = preorderStage(preorder);

    // The pass exists from the day the pre-order is placed, so this guard is
    // load-bearing in a way it was not when the token only appeared alongside
    // a payment request. Before an admin asks for the balance the delivery fee
    // is still 0 and unset, and a customer paying "early" off their own bat
    // would settle goods-only and underpay by the carriage.
    if (stage !== PAYABLE_STAGE) {
      return NextResponse.json({ error: notPayableReason(stage), stage }, { status: 409 });
    }

    const { balanceMethod, balanceProofUrl, balanceReference } = await req.json();

    if (!VALID_METHODS.includes(balanceMethod)) {
      return NextResponse.json({ error: 'Choose how you sent the payment' }, { status: 400 });
    }
    if (!balanceProofUrl && !PROOFLESS_METHODS.includes(balanceMethod)) {
      return NextResponse.json(
        { error: 'Upload a screenshot of your transfer to continue' },
        { status: 400 }
      );
    }

    // Spending the pass in the same statement that records the payment is what
    // makes it single use. The two filters are a compare-and-set: they match
    // only while the code is unspent, so a second submission -- a double tap, a
    // forwarded screenshot, a replayed request racing the first -- updates no
    // rows and is turned away below. Reading balance_token_used_at and then
    // writing would leave exactly that race open.
    const { data: spent, error } = await supabaseAdmin
      .from('preorders')
      .update({
        balance_method: balanceMethod,
        balance_proof_url: balanceProofUrl || null,
        balance_reference: balanceReference || null,
        status: 'balance_unverified',
        balance_token_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('balance_token', token)
      .is('balance_token_used_at', null)
      .select('preorder_id');

    if (error) throw error;

    if (!spent || spent.length === 0) {
      return NextResponse.json(
        {
          error: notPayableReason('verifying'),
          stage: 'verifying',
          preorderId: preorder.preorder_id,
        },
        { status: 409 }
      );
    }

    const isCod = PROOFLESS_METHODS.includes(balanceMethod);
    return NextResponse.json({
      success: true,
      preorderId: preorder.preorder_id,
      isCod,
      message: isCod
        ? 'Your order is confirmed. Pay the remaining balance in cash when it arrives.'
        : 'Payment proof received. We will verify it and confirm your order shortly.',
    });
  } catch (error: any) {
    console.error('❌ Balance payment submit error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** Why a scan cannot pay right now, in the customer's terms. */
function notPayableReason(stage: string): string {
  switch (stage) {
    case 'verifying':
      return 'We already have your payment for this pre-order and are verifying it.';
    case 'paid':
      return 'This pre-order has already been paid in full.';
    case 'cancelled':
      return 'This pre-order was cancelled.';
    case 'expired':
      return 'This payment request has expired. Please contact us for a fresh one.';
    case 'deposit_rejected':
      return 'There is a problem with your deposit. Please contact us before paying the balance.';
    default:
      return 'There is nothing to pay on this pre-order yet. We will email you when the balance is due.';
  }
}
