import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { newPreorderId, mapPreorder, newCouponCode, couponCheckoutUrl } from '@/lib/preorder';
import { sendPreorderConfirmationEmail } from '@/lib/preorder-email';
import { preorderUnitPrice, promoApplies } from '@/data/preorder-promo';

const VALID_DEPOSIT_METHODS = ['bank', 'easypaisa', 'jazzcash'];

/**
 * POST - Place a pre-order.
 *
 * Public: a customer submits this from /preorder/[productId] after transferring
 * the deposit and uploading their proof.
 *
 * Every figure is recomputed here from the products table. The browser sends
 * only a product id and a quantity -- nothing it says about price or deposit is
 * trusted, or a crafted request could reserve a Rs 18,500 bottle for Rs 1.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      quantity,
      name,
      email,
      phone,
      address,
      city,
      depositMethod,
      depositProofUrl,
      depositReference,
    } = body;

    if (!name || !email || !phone || !address) {
      return NextResponse.json({ error: 'All customer fields are required' }, { status: 400 });
    }
    if (!VALID_DEPOSIT_METHODS.includes(depositMethod)) {
      return NextResponse.json({ error: 'Choose how you sent the deposit' }, { status: 400 });
    }
    if (!depositProofUrl) {
      return NextResponse.json(
        { error: 'Upload a screenshot of your deposit transfer to continue' },
        { status: 400 }
      );
    }

    const qty = Math.floor(Number(quantity || 1));
    if (!Number.isFinite(qty) || qty <= 0 || qty > 100) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, preorder_enabled, preorder_amount')
      .eq('id', Number(productId))
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (!product.preorder_enabled) {
      return NextResponse.json(
        { error: 'This product is not available for pre-order' },
        { status: 400 }
      );
    }

    // The launch offer, applied server-side so the figure charged is never
    // whatever the browser happened to be showing. A page left open past the
    // closing date prices at the full amount here, which is the correct
    // outcome even though the stale tab still says otherwise.
    const listPrice = Number(product.price);
    const unitPrice = preorderUnitPrice(listPrice);
    const unitDeposit = Number(product.preorder_amount);

    // A deposit of zero, or one at/above the full price, means the product was
    // misconfigured in the admin. Fail loudly rather than take the money.
    if (!Number.isFinite(unitDeposit) || unitDeposit <= 0) {
      return NextResponse.json(
        { error: 'Pre-order deposit is not configured for this product' },
        { status: 409 }
      );
    }
    if (unitDeposit >= unitPrice) {
      return NextResponse.json(
        { error: 'Pre-order deposit is misconfigured for this product' },
        { status: 409 }
      );
    }

    const preorderId = newPreorderId();
    const totalAmount = unitPrice * qty;
    const depositAmount = unitDeposit * qty;

    // The customer's coupon code, minted here rather than when the balance is
    // later requested, so the code on the thank-you screen and in the
    // confirmation email is the same one they will complete the order with. It
    // carries no expiry: a pre-order can sit for months. What expires is the
    // payment window, which opens with its own deadline when an admin asks for
    // the balance -- until then preorderStage() will not accept the code.
    const row = {
      preorder_id: preorderId,
      name,
      email,
      phone,
      address,
      city: city || null,
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      // deposit_paid stays 0 until an admin verifies the screenshot, so the
      // generated balance_amount only ever counts money actually confirmed.
      deposit_paid: 0,
      delivery_fee: 0,
      status: 'deposit_unverified',
      deposit_method: depositMethod,
      deposit_proof_url: depositProofUrl,
      deposit_reference: depositReference || null,
    };

    // A collision on ~59 bits is vanishingly unlikely, but the unique index
    // would turn one into a lost reservation -- so draw again rather than fail.
    let created: any = null;
    let couponCode = '';
    for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
      couponCode = newCouponCode();
      const { data, error } = await supabaseAdmin
        .from('preorders')
        .insert([{ ...row, coupon_code: couponCode }])
        .select('*')
        .single();
      if (!error) {
        created = data;
      } else if (error.code !== '23505' || !String(error.message).includes('coupon')) {
        throw error;
      }
    }
    if (!created) throw new Error('Could not issue a coupon code. Please try again.');

    // A failed email must not lose a paid-for reservation, so this is logged
    // rather than thrown -- the admin can resend from the pre-orders screen.
    try {
      await sendPreorderConfirmationEmail({
        preorderId,
        name,
        email,
        phone,
        address,
        product: product.name,
        quantity: qty,
        totalAmount,
        depositAmount,
        balanceAmount: totalAmount - depositAmount,
        couponCode,
        checkoutUrl: couponCheckoutUrl(),
        // So the email can promise free delivery only where it is actually
        // owed, and say what the reservation saved against the list price.
        promo: promoApplies(listPrice)
          ? { listTotal: listPrice * qty, freeDelivery: true }
          : undefined,
      });
    } catch (err: any) {
      console.error('❌ Failed to send pre-order confirmation email:', err.message);
    }

    // The code goes back to the thank-you screen so the customer can save it
    // before they ever open their email. Only the reference and the code:
    // mapPreorder is the admin shape and is not for a public response.
    return NextResponse.json({
      success: true,
      preorderId,
      couponCode,
    });
  } catch (error: any) {
    console.error('❌ Pre-order Save Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET - Every pre-order, newest first. Admin only.
 *
 * Like /api/orders this returns names, emails, phones and addresses, so it must
 * never be readable by an anonymous visitor.
 */
export async function GET() {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { data: preorders, error } = await supabaseAdmin
      .from('preorders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ preorders: (preorders || []).map(mapPreorder) });
  } catch (error: any) {
    console.error('❌ Pre-orders Retrieve Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
