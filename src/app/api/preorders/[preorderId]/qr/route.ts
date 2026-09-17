import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { balancePaymentUrl } from '@/lib/preorder';
import { qrPng } from '@/lib/qr';

export const runtime = 'nodejs';

/**
 * GET - The QR code currently outstanding on a pre-order, as a PNG.
 *
 * The admin screen needs to show the admin the same code the customer was
 * emailed -- to reprint it, or to send it over WhatsApp when the email did not
 * arrive. It cannot use the public /api/preorders/qr/[token] route for that,
 * because it has no token: mapPreorder never hands one to the browser, and
 * putting one there just to draw a picture would leak a live payment secret
 * into an admin's browser history and dev tools.
 *
 * So the lookup happens here instead. Admin only, and it renders only a token
 * that is still good: a spent or expired one would produce a QR that fails at
 * the till, which is worse than showing none.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ preorderId: string }> }) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { preorderId } = await props.params;

    const { data, error } = await supabaseAdmin
      .from('preorders')
      .select('balance_token, balance_token_expires_at, balance_token_used_at, status')
      .eq('preorder_id', preorderId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Pre-order not found' }, { status: 404 });
    }
    if (!data.balance_token) {
      return NextResponse.json({ error: 'No payment link has been sent yet' }, { status: 404 });
    }
    if (data.balance_token_used_at) {
      return NextResponse.json({ error: 'This QR code has already been used' }, { status: 409 });
    }
    if (
      data.balance_token_expires_at &&
      new Date(data.balance_token_expires_at) < new Date()
    ) {
      return NextResponse.json({ error: 'This QR code has expired' }, { status: 410 });
    }

    const png = qrPng(balancePaymentUrl(data.balance_token), { scale: 8, margin: 4 });

    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(png.length),
        // Never cached: the admin resends links, and a stale QR on this screen
        // is one an admin would confidently hand to a customer.
        'Cache-Control': 'no-store',
        'Content-Disposition': `inline; filename="${preorderId}-qr.png"`,
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error: any) {
    console.error('❌ Admin pre-order QR error:', error.message);
    return NextResponse.json({ error: 'Could not render the QR code' }, { status: 500 });
  }
}
