import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { remainingBalance } from '@/lib/preorder';

// 'cod' settles the balance in cash at the door. It carries no screenshot --
// there is nothing to capture until the courier is paid -- so the admin marks
// it received on delivery instead.
const VALID_METHODS = ['bank', 'easypaisa', 'jazzcash', 'cod'];
const PROOFLESS_METHODS = ['cod'];

/**
 * The emailed balance link is public -- the token IS the authentication, so
 * everything here is deliberately narrow: look up strictly by exact token,
 * refuse an expired or spent one, and return only the fields the balance
 * checkout needs to render.
 */
async function loadByToken(token: string) {
  if (!token || token.length < 32) return { error: 'Invalid payment link', status: 404 } as const;

  const { data, error } = await supabaseAdmin
    .from('preorders')
    .select('*')
    .eq('balance_token', token)
    .maybeSingle();

  if (error || !data) {
    return { error: 'This payment link is not valid or has already been used', status: 404 } as const;
  }
  if (data.status === 'fully_paid') {
    return { error: 'This pre-order has already been paid in full', status: 409 } as const;
  }
  if (data.status === 'cancelled') {
    return { error: 'This pre-order was cancelled', status: 409 } as const;
  }
  if (data.balance_token_expires_at && new Date(data.balance_token_expires_at) < new Date()) {
    return {
      error: 'This payment link has expired. Please contact us for a fresh link.',
      status: 410,
    } as const;
  }
  return { data } as const;
}

/** GET - What the balance checkout page needs to render. */
export async function GET(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await props.params;
    const result = await loadByToken(token);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
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
        depositPaid: Number(p.deposit_paid || p.deposit_amount || 0),
        deliveryFee: Number(p.delivery_fee || 0),
        balanceAmount: remainingBalance(p),
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
 */
export async function POST(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await props.params;
    const result = await loadByToken(token);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
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

    const { error } = await supabaseAdmin
      .from('preorders')
      .update({
        balance_method: balanceMethod,
        balance_proof_url: balanceProofUrl || null,
        balance_reference: balanceReference || null,
        status: 'balance_unverified',
        updated_at: new Date().toISOString(),
      })
      .eq('balance_token', token);

    if (error) throw error;

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
