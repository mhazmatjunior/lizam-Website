import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// PATCH - Update product details or stock level
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;
    const body = await req.json();

    // Map frontend camelCase fields back to database snake_case fields
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.longDescription !== undefined) updateData.long_description = body.longDescription;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data: updatedProduct, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const mapped = {
      id: updatedProduct.id,
      name: updatedProduct.name,
      price: updatedProduct.price,
      category: updatedProduct.category,
      description: updatedProduct.description,
      longDescription: updatedProduct.long_description,
      image: updatedProduct.image,
      stock: updatedProduct.stock,
      notes: updatedProduct.notes
    };

    return NextResponse.json({ success: true, product: mapped });
  } catch (error: any) {
    console.error(`❌ Product Update Error for ID ${params.id}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a product
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`❌ Product Delete Error for ID ${params.id}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
