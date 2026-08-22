import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const contentType = file.type || 'image/jpeg';
    const fileName = `proof-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Target the verified public storage bucket 'product-images'
    const targetBucket = 'product-images';

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(targetBucket)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from(targetBucket)
        .getPublicUrl(uploadData.path);

      if (publicUrlData?.publicUrl) {
        console.log(`✅ Payment screenshot stored in public bucket (${targetBucket}):`, publicUrlData.publicUrl);
        return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
      }
    }

    console.error('❌ Upload to public bucket failed:', uploadError?.message);
    return NextResponse.json({ error: uploadError?.message || 'Failed to upload screenshot to public storage' }, { status: 500 });

  } catch (error: any) {
    console.error('❌ Universal Upload API Error:', error.message);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
