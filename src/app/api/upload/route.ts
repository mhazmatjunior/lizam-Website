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

    // Try uploading to Supabase Storage bucket 'payment-proofs' first
    try {
      const fileName = `screenshot-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${file.name.split('.').pop() || 'jpg'}`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('payment-proofs')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabaseAdmin
          .storage
          .from('payment-proofs')
          .getPublicUrl(uploadData.path);

        if (publicUrlData?.publicUrl) {
          console.log('✅ Payment screenshot uploaded to Supabase Storage:', publicUrlData.publicUrl);
          return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
        }
      }
    } catch (storageErr: any) {
      console.warn('⚠️ Supabase Storage upload skipped/failed, using base64 data URI fallback:', storageErr.message);
    }

    // Fallback: Convert to clean Base64 Data URI if storage bucket is not configured
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64Data}`;

    console.log(`✅ Payment screenshot converted to Base64 URI (${(file.size / 1024).toFixed(1)} KB)`);
    return NextResponse.json({ success: true, url: dataUri });

  } catch (error: any) {
    console.error('❌ Upload API Error:', error.message);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
