import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { balancePaymentUrl } from '@/lib/preorder';
import { qrPng } from '@/lib/qr';

export const runtime = 'nodejs';

/**
 * GET - A pre-order's pass, as a PNG.
 *
 * The admin screen needs to show the admin the same code the customer holds --
 * to reprint it, or to send it over WhatsApp when the email did not arrive. It
 * cannot use the public /api/preorders/qr/[token] route for that, because it
 * has no token: mapPreorder never hands one to the browser, and putting one
 * there just to draw a picture would leak a live payment secret into an
 * admin's browser history and dev tools.
 *
 * So the lookup happens here instead. Admin only. It renders the pass at any
 * stage, spent or expired included, because the pass is not only a payment
 * instrument -- scanning a spent one still reports where the pre-order stands,
 * and an admin re-sending it to a customer mid-wait is a legitimate thing to
 * want. Whether a payment can currently be made through it is the pre-orders
 * screen's job to say.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ preorderId: string }> }) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { preorderId } = await props.params;

    const { data, error } = await supabaseAdmin
      .from('preorders')
      .select('balance_token')
      .eq('preorder_id', preorderId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Pre-order not found' }, { status: 404 });
    }
    // Only pre-orders placed before passes existed have no token.
    if (!data.balance_token) {
      return NextResponse.json({ error: 'This pre-order has no pass' }, { status: 404 });
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
