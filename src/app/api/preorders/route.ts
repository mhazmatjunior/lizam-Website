import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import {
  newPreorderId,
  mapPreorder,
  newBalanceToken,
  balancePaymentUrl,
  balancePaymentQrUrl,
} from '@/lib/preorder';
import { sendPreorderConfirmationEmail } from '@/lib/preorder-email';

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

    const unitPrice = Number(product.price);
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

    // The customer's pass, minted here rather than when the balance is later
    // requested, so the QR on the thank-you screen and in the confirmation
    // email is the same code they will eventually pay with. It carries no
    // expiry: a pre-order can sit for months, and a pass that died before the
    // stock arrived would be worse than useless. What expires is the payment
    // window, which opens with its own deadline when an admin asks for the
    // balance -- until then preorderStage() will not offer a payment form.
    const passToken = newBalanceToken();

    const { data: created, error } = await supabaseAdmin
      .from('preorders')
      .insert([
        {
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
          balance_token: passToken,
        },
      ])
      .select('*')
      .single();

    if (error) throw error;

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
        paymentUrl: balancePaymentUrl(passToken),
        qrUrl: balancePaymentQrUrl(passToken),
      });
    } catch (err: any) {
      console.error('❌ Failed to send pre-order confirmation email:', err.message);
    }

    // The QR goes back to the thank-you screen so the customer can save it
    // before they ever open their email. Handing the browser a URL containing
    // their own token is not a leak -- the code they are about to be shown
    // encodes exactly the same thing, and it is their own pre-order.
    return NextResponse.json({
      success: true,
      preorderId,
      qrUrl: balancePaymentQrUrl(passToken),
      passUrl: balancePaymentUrl(passToken),
      preorder: mapPreorder(created),
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
