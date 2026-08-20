import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { PROOF_MAX_BYTES } from '@/data/bank-details';

const BUCKET = 'payment-proofs';

// Signature checks, so a renamed .exe cannot be passed off as a screenshot.
// Extension is never trusted — only the leading bytes of the file itself.
const SIGNATURES: Array<{ ext: string; mime: string; test: (b: Uint8Array) => boolean }> = [
  { ext: 'jpg', mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: 'png',
    mime: 'image/png',
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    ext: 'webp',
    mime: 'image/webp',
    test: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    ext: 'pdf',
    mime: 'application/pdf',
    test: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
];

function sniff(bytes: Uint8Array) {
  return SIGNATURES.find((s) => s.test(bytes)) || null;
}

/**
 * POST — customer uploads their payment screenshot plus the bank reference.
 *
 * Deliberately unauthenticated: the buyer has no account. Access is therefore
 * constrained by the order's own state rather than by a session — the order
 * must exist, be a bank transfer, and still be awaiting its first proof.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('*') // '*' on purpose: the proof columns may not exist yet
      .eq('order_id', orderId)
      .single();

    if (findError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.payment_method !== 'bank_transfer') {
      return NextResponse.json(
        { error: 'This order was not placed as a bank transfer' },
        { status: 400 }
      );
    }

    // Only accept a proof while one is still owed. Prevents a stranger who
    // guesses an order ID from overwriting a verified payment, and stops the
    // endpoint being reused as open file storage.
    if (order.payment_proof_url) {
      return NextResponse.json(
        { error: 'A payment proof has already been uploaded for this order' },
        { status: 409 }
      );
    }
    if (!['pending', 'proof_rejected'].includes(order.status)) {
      return NextResponse.json(
        { error: `This order is already ${order.status} and cannot accept a proof` },
        { status: 409 }
      );
    }

    const form = await req.formData();
    const file = form.get('file');
    const reference = String(form.get('reference') || '').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file was uploaded' }, { status: 400 });
    }
    if (!reference) {
      return NextResponse.json(
        { error: 'The bank transaction reference is required' },
        { status: 400 }
      );
    }
    if (reference.length > 100) {
      return NextResponse.json({ error: 'Reference is too long' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'The file is empty' }, { status: 400 });
    }
    if (file.size > PROOF_MAX_BYTES) {
      return NextResponse.json(
        { error: 'File is larger than 5 MB. Please upload a smaller screenshot.' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = sniff(new Uint8Array(buffer.subarray(0, 16)));
    if (!kind) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP or PDF files are accepted' },
        { status: 415 }
      );
    }

    // Random suffix so the storage path cannot be guessed from the order ID.
    const suffix = crypto.randomUUID().slice(0, 8);
    const path = `${orderId}/${Date.now()}-${suffix}.${kind.ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: kind.mime, upsert: false });

    if (uploadError) {
      console.error('❌ Proof upload failed:', uploadError.message);
      return NextResponse.json(
        { error: 'Could not save the file. Please try again.' },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_proof_url: path,
        payment_reference: reference,
        status: 'awaiting_verification',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    if (updateError) {
      // Roll back the stored file so a retry is not blocked by the 409 above.
      await supabaseAdmin.storage.from(BUCKET).remove([path]);
      console.error('❌ Proof record failed:', updateError.message);
      return NextResponse.json(
        { error: 'Could not record the payment. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`🧾 Payment proof received for ${orderId} (ref ${reference})`);
    return NextResponse.json({ success: true, status: 'awaiting_verification' });
  } catch (error: any) {
    console.error('❌ Proof route error:', error.message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

/**
 * GET — admin only. Returns a short-lived signed link to the stored proof.
 * The bucket is private, so this is the only way to view it.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    if (!(await isAdminRequest())) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
    }

    const { orderId } = await params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !order?.payment_proof_url) {
      return NextResponse.json({ error: 'No proof on file' }, { status: 404 });
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(order.payment_proof_url, 300); // valid 5 minutes

    if (signError || !signed) {
      return NextResponse.json({ error: 'Could not open the file' }, { status: 500 });
    }

    return NextResponse.json({
      url: signed.signedUrl,
      reference: order.payment_reference ?? null,
    });
  } catch (error: any) {
    console.error('❌ Proof fetch error:', error.message);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
