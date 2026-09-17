import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { creditedDeposit, customerBalance } from '@/lib/preorder';

// 'cod' settles the balance in cash at the door. It carries no screenshot --
// there is nothing to capture until the courier is paid -- so the admin marks
// it received on delivery instead.
const VALID_METHODS = ['bank', 'easypaisa', 'jazzcash', 'cod'];
const PROOFLESS_METHODS = ['cod'];

/**
 * How the balance page is reached: the customer scans the QR code in their
 * payment email, which resolves to /checkout?preorder=<token>.
 *
 * The token IS the authentication -- there is no session behind a scanned code
 * -- so everything here is deliberately narrow: look up strictly by exact
 * token, refuse an expired or spent one, and return only the fields the
 * balance checkout needs to render.
 *
 * "settled" separates the two ways this can fail. A dead or unknown code is an
 * error the customer should worry about; a code they have already paid through
 * is not, and the page shows them their confirmation rather than an alarming
 * red screen. Only the pre-order reference travels with it -- the same one
 * printed in the email the code arrived in.
 */
type TokenFailure = {
  error: string;
  status: number;
  settled?: boolean;
  preorderId?: string;
};

async function loadByToken(token: string): Promise<{ data: any } | TokenFailure> {
  if (!token || token.length < 32) return { error: 'Invalid payment link', status: 404 };

  const { data, error } = await supabaseAdmin
    .from('preorders')
    .select('*')
    .eq('balance_token', token)
    .maybeSingle();

  if (error || !data) {
    return { error: 'This QR code is not valid or has already been used', status: 404 };
  }
  if (data.status === 'fully_paid') {
    return {
      error: 'This pre-order has already been paid in full.',
      status: 409,
      settled: true,
      preorderId: data.preorder_id,
    };
  }
  if (data.status === 'cancelled') {
    return { error: 'This pre-order was cancelled', status: 409 };
  }
  // Single use. The code may well still be inside its 30 days, but it was spent
  // the moment the customer submitted their payment through it -- a printed or
  // screenshotted QR outlives the email it arrived in, and re-scanning one must
  // not reopen a payment that has already been made.
  if (data.balance_token_used_at) {
    return {
      error:
        'This QR code has already been used. We have your payment and will confirm your order once it is verified.',
      status: 409,
      settled: true,
      preorderId: data.preorder_id,
    };
  }
  if (data.balance_token_expires_at && new Date(data.balance_token_expires_at) < new Date()) {
    return {
      error: 'This QR code has expired. Please contact us for a fresh one.',
      status: 410,
    };
  }
  return { data };
}

/** GET - What the balance checkout page needs to render. */
export async function GET(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await props.params;
    const result = await loadByToken(token);
    if ('error' in result) {
      return NextResponse.json(
        {
          error: result.error,
          settled: Boolean(result.settled),
          preorderId: result.preorderId,
        },
        { status: result.status }
      );
    }

    const p = result.data;
    return NextResponse.json({
      preorder: {
        preorderId: p.preorder_id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        address: p.address,
        city: p.city || '',
        productName: p.product_name,
        quantity: p.quantity,
        unitPrice: Number(p.unit_price || 0),
        totalAmount: Number(p.total_amount || 0),
        // These two must agree: crediting the deposit in one and not the other
        // showed the customer their deposit and then charged them for it again.
        depositPaid: creditedDeposit(p),
        deliveryFee: Number(p.delivery_fee || 0),
        balanceAmount: customerBalance(p),
        currency: p.currency || 'PKR',
        status: p.status,
        // So the page can show "we already have your proof, we're checking it"
        // instead of inviting a second upload.
        alreadySubmitted: Boolean(p.balance_proof_url),
      },
    });
  } catch (error: any) {
    console.error('❌ Balance link read error:', error.message);
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
 * It is also where the QR code is spent -- see the update below.
 */
export async function POST(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await props.params;
    const result = await loadByToken(token);
    if ('error' in result) {
      // Carries "settled" for the same reason GET does, and this is where it
      // usually fires: the page was opened on a good code and submitted after
      // it was spent, which is a customer pressing the button twice.
      return NextResponse.json(
        {
          error: result.error,
          settled: Boolean(result.settled),
          preorderId: result.preorderId,
        },
        { status: result.status }
      );
    }

    const preorder = result.data;
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

    // Spending the code in the same statement that records the payment is what
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
          error:
            'This QR code has already been used. We have your payment and will confirm your order once it is verified.',
          settled: true,
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
