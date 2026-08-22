import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Uploaded file must be an image' }, { status: 400 });
    }

    // Limit file size to 10MB
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // List available Supabase Storage buckets
    let targetBucket = 'payment-proofs';
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      if (buckets && buckets.length > 0) {
        const hasProofs = buckets.some(b => b.name === 'payment-proofs');
        const hasProductImages = buckets.some(b => b.name === 'product-images');
        if (hasProofs) {
          targetBucket = 'payment-proofs';
        } else if (hasProductImages) {
          targetBucket = 'product-images';
        } else {
          // Attempt to create payment-proofs bucket if none exist
          await supabaseAdmin.storage.createBucket('payment-proofs', { public: true }).catch(() => {});
          targetBucket = 'payment-proofs';
        }
      } else {
        await supabaseAdmin.storage.createBucket('payment-proofs', { public: true }).catch(() => {});
      }
    } catch (bErr) {
      console.warn('⚠️ Bucket check warning:', bErr);
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `screenshot-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(targetBucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Supabase Storage upload error:', uploadError.message);
      // Try fallback to product-images if payment-proofs bucket failed
      if (targetBucket !== 'product-images') {
        const fallbackUpload = await supabaseAdmin
          .storage
          .from('product-images')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!fallbackUpload.error && fallbackUpload.data) {
          const { data: fallbackUrlData } = supabaseAdmin
            .storage
            .from('product-images')
            .getPublicUrl(fallbackUpload.data.path);

          if (fallbackUrlData?.publicUrl) {
            console.log('✅ Payment screenshot saved to product-images fallback bucket:', fallbackUrlData.publicUrl);
            return NextResponse.json({ success: true, url: fallbackUrlData.publicUrl });
          }
        }
      }
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from(targetBucket)
      .getPublicUrl(uploadData.path);

    if (!publicUrlData?.publicUrl) {
      return NextResponse.json({ error: 'Could not obtain public image URL' }, { status: 500 });
    }

    console.log('✅ Payment screenshot uploaded successfully to Supabase Storage:', publicUrlData.publicUrl);
    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });

  } catch (error: any) {
    console.error('❌ Upload API Error:', error.message);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
