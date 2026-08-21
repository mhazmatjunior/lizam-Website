import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';

const BUCKET = 'review-photos';
const ALLOWED = ['approved', 'rejected', 'pending'];

/** PATCH — admin only: approve or reject a review. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: `status must be one of ${ALLOWED.join(', ')}` }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', Number(id))
      .select('id, status')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    console.log(`⭐ Review ${id} -> ${status}`);
    return NextResponse.json({ success: true, review: data });
  } catch (error: any) {
    console.error('❌ Review update error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE — admin only: remove a review and its photos for good.
 *
 * Rejecting hides a review but keeps it (and its photos) on record. Deleting is
 * for content that should not be retained at all, so the stored files go too.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { id } = await params;

    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('photo_paths')
      .eq('id', Number(id))
      .maybeSingle();

    const paths: string[] = review?.photo_paths || [];
    if (paths.length) {
      await supabaseAdmin.storage.from(BUCKET).remove(paths);
    }

    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', Number(id));
    if (error) throw error;

    console.log(`🗑️ Review ${id} deleted (${paths.length} photo(s) removed)`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Review delete error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
