import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Limit file size to 15MB
    const MAX_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine correct content type & extension (supporting HEIC, PNG, JPG, WebP, PDF, etc.)
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const contentType = file.type || (fileExt === 'pdf' ? 'application/pdf' : `image/${fileExt}`);

    // Try uploading to Supabase Storage buckets
    const bucketsToTry = ['payment-proofs', 'product-images'];

    for (const bucketName of bucketsToTry) {
      try {
        // Ensure bucket exists with public access
        await supabaseAdmin.storage.createBucket(bucketName, { public: true }).catch(() => {});

        const fileName = `proof-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabaseAdmin
            .storage
            .from(bucketName)
            .getPublicUrl(uploadData.path);

          if (publicUrlData?.publicUrl) {
            console.log(`✅ Screenshot uploaded to Supabase Storage (${bucketName}):`, publicUrlData.publicUrl);
            return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
          }
        } else {
          console.warn(`⚠️ Upload to ${bucketName} failed:`, uploadError?.message);
        }
      } catch (bErr: any) {
        console.warn(`⚠️ Bucket ${bucketName} exception:`, bErr.message);
      }
    }

    // Safe Fallback: Generate clean Data URI for any file format
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64Data}`;

    console.log(`✅ File converted to Data URI fallback (${(file.size / 1024).toFixed(1)} KB)`);
    return NextResponse.json({ success: true, url: dataUri });

  } catch (error: any) {
    console.error('❌ Universal Upload API Error:', error.message);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
