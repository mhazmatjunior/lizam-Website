import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';

const BUCKET = 'review-photos';

/**
 * GET /api/reviews/photo?review=12&i=0
 *
 * Serves one photo from a review by redirecting to a short-lived signed link.
 *
 * The bucket is private on purpose. Review photos are unmoderated when they
 * arrive, so a public bucket would host whatever someone uploaded until it was
 * rejected. This route is the gate: an approved review's photos are visible to
 * anyone, a pending or rejected review's photos only to an admin reviewing the
 * queue.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reviewId = Number(searchParams.get('review'));
    const index = Number(searchParams.get('i') ?? 0);

    if (!Number.isFinite(reviewId) || !Number.isFinite(index) || index < 0) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .select('status, photo_paths')
      .eq('id', reviewId)
      .maybeSingle();

    if (error || !review) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Not yet approved: only an admin may look.
    if (review.status !== 'approved' && !(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const path = (review.photo_paths || [])[index];
    if (!path) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, 600); // 10 minutes

    if (signErr || !signed) {
      return NextResponse.json({ error: 'Could not load image' }, { status: 500 });
    }

    // 302 rather than streaming: the bytes come straight from Supabase's CDN,
    // so this route stays cheap no matter how many photos a page shows.
    return NextResponse.redirect(signed.signedUrl, {
      status: 302,
      headers: {
        // Safe to cache briefly, but well inside the signed link's lifetime.
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (err: any) {
    console.error('❌ Review photo error:', err.message);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
