import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { sniffImage } from '@/lib/file-type';

const BUCKET = 'review-photos';
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_BODY_CHARS = 2000;
const MAX_NAME_CHARS = 60;

/**
 * Coarse per-visitor marker, used only to stop one person rating the same
 * product over and over. Hashed so no raw IP is stored, and deliberately not
 * treated as an identity — it is best-effort spam friction, nothing more.
 */
function visitorFingerprint(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const ua = req.headers.get('user-agent') || '';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32);
}

/**
 * GET — public: approved reviews for one product, plus the rating summary.
 *       admin:  ?status=pending returns the moderation queue.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const productId = searchParams.get('productId');

    // Anything other than the public "approved for this product" view is an
    // admin request: unapproved content must never be readable by visitors.
    if (statusFilter && statusFilter !== 'approved') {
      if (!(await isAdminRequest())) {
        return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
      }

      let q = supabaseAdmin
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') q = q.eq('status', statusFilter);

      const { data, error } = await q;
      if (error) throw error;
      return NextResponse.json({ reviews: (data || []).map(mapReview) });
    }

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('product_id', Number(productId))
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];
    const count = rows.length;
    const average = count
      ? Math.round((rows.reduce((s, r: any) => s + r.rating, 0) / count) * 10) / 10
      : 0;

    // Star distribution, for the bar chart beside the average.
    const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const r of rows as any[]) distribution[String(r.rating)]++;

    return NextResponse.json({
      reviews: rows.map(mapReview),
      summary: { average, count, distribution },
    });
  } catch (error: any) {
    console.error('❌ Reviews read error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST — public submission. Multipart, because photos come with it.
 *
 * Unauthenticated by necessity (shoppers have no accounts), so everything
 * lands as `pending` and nothing reaches the site until an admin approves it.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const productId = Number(form.get('productId'));
    const rating = Number(form.get('rating'));
    const authorName = String(form.get('authorName') || '').trim();
    const title = String(form.get('title') || '').trim();
    const body = String(form.get('body') || '').trim();
    const orderId = String(form.get('orderId') || '').trim();

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'A product is required' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Please choose a rating from 1 to 5 stars' }, { status: 400 });
    }
    if (!authorName) {
      return NextResponse.json({ error: 'Your name is required' }, { status: 400 });
    }
    if (authorName.length > MAX_NAME_CHARS) {
      return NextResponse.json({ error: 'That name is too long' }, { status: 400 });
    }
    if (body.length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: 'Your review is too long' }, { status: 400 });
    }

    // The product must exist — otherwise the foreign key would reject the row
    // with a much less helpful message.
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: 'That product does not exist' }, { status: 404 });
    }

    // Optional proof of purchase. A wrong order number is not fatal: the review
    // still goes through, just without the badge.
    let isVerified = false;
    if (orderId) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('order_id, status')
        .eq('order_id', orderId)
        .maybeSingle();

      isVerified = Boolean(order && ['paid', 'shipped'].includes(order.status));
    }

    const fingerprint = visitorFingerprint(req);

    // Photos: validated by content, not by filename or the declared MIME type.
    const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `At most ${MAX_PHOTOS} photos` }, { status: 400 });
    }

    const paths: string[] = [];
    for (const file of files) {
      if (file.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: 'Each photo must be under 5 MB' }, { status: 413 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const kind = sniffImage(new Uint8Array(buffer.subarray(0, 16)));
      if (!kind) {
        return NextResponse.json({ error: 'Photos must be JPG, PNG or WEBP' }, { status: 415 });
      }

      const path = `${productId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${kind.ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: kind.mime, upsert: false });

      if (upErr) {
        // Remove anything already stored so a retry does not leak orphans.
        if (paths.length) await supabaseAdmin.storage.from(BUCKET).remove(paths);
        console.error('❌ Review photo upload failed:', upErr.message);
        return NextResponse.json({ error: 'Could not save your photo' }, { status: 500 });
      }
      paths.push(path);
    }

    const { data: created, error } = await supabaseAdmin
      .from('reviews')
      .insert([{
        product_id: productId,
        author_name: authorName,
        rating,
        title: title || null,
        body: body || null,
        photo_paths: paths,
        order_id: orderId || null,
        is_verified: isVerified,
        status: 'pending',
        fingerprint,
      }])
      .select('id')
      .single();

    if (error) {
      if (paths.length) await supabaseAdmin.storage.from(BUCKET).remove(paths);

      // The partial unique index on (product_id, fingerprint).
      if (error.code === '23505' || /duplicate key/i.test(error.message)) {
        return NextResponse.json(
          { error: 'You have already reviewed this product' },
          { status: 409 }
        );
      }
      throw error;
    }

    console.log(`⭐ Review ${created.id} submitted for product ${productId} (${rating}/5)`);
    return NextResponse.json({ success: true, verified: isVerified });
  } catch (error: any) {
    console.error('❌ Review submit error:', error.message);
    return NextResponse.json({ error: 'Could not submit your review' }, { status: 500 });
  }
}

/** Shapes a row for the client. Photo paths become proxy URLs, never raw paths. */
function mapReview(r: any) {
  return {
    id: r.id,
    productId: r.product_id,
    authorName: r.author_name,
    rating: r.rating,
    title: r.title,
    body: r.body,
    photos: (r.photo_paths || []).map((_: string, i: number) => `/api/reviews/photo?review=${r.id}&i=${i}`),
    photoCount: (r.photo_paths || []).length,
    isVerified: r.is_verified,
    status: r.status,
    orderId: r.order_id,
    createdAt: r.created_at,
  };
}
