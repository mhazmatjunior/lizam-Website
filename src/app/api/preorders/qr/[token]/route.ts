import { NextRequest, NextResponse } from 'next/server';
import { balancePaymentUrl } from '@/lib/preorder';
import { qrPng } from '@/lib/qr';

export const runtime = 'nodejs';

/** 32 random bytes, hex encoded -- exactly what newBalanceToken() produces. */
const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

/**
 * GET - The QR code for a balance-payment link, as a PNG.
 *
 * Public and unauthenticated, because the thing fetching it is the customer's
 * email client, which carries no session of ours.
 *
 * It deliberately performs no database lookup. The image is a picture of
 * /checkout?preorder=<token> and nothing else, so a request here confirms
 * nothing about whether that pre-order exists, reveals none of the customer's
 * details, and produces a code the pay route then refuses exactly as it would
 * refuse the pasted link. The hex check is what stops the route being pointed
 * at anything that is not one of our own tokens.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await props.params;

    if (!TOKEN_PATTERN.test(token)) {
      return NextResponse.json({ error: 'Invalid payment link' }, { status: 400 });
    }

    const png = qrPng(balancePaymentUrl(token), { scale: 8, margin: 4 });

    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(png.length),
        // A new token means a new URL, so this image never changes. Cache it
        // in the recipient's own client, but keep it out of shared caches:
        // the token is the whole secret.
        'Cache-Control': 'private, max-age=31536000, immutable',
        'Content-Disposition': 'inline; filename="raanae-preorder-qr.png"',
        // Nothing here should be framed, sniffed or indexed.
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error: any) {
    console.error('❌ Pre-order QR render error:', error.message);
    return NextResponse.json({ error: 'Could not render the QR code' }, { status: 500 });
  }
}
