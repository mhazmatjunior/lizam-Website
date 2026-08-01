import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';

// GET - Retrieve all products, auto-seeding if empty
export async function GET() {
  try {
    // Fetch products sorted by ID ascending
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    // Auto-seed table if no products exist
    if (!products || products.length === 0) {
      console.log('🌱 Database products table is empty. Auto-seeding initial collections...');
      
      const formattedProducts = INITIAL_PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        long_description: p.longDescription,
        image: p.image,
        stock: p.stock,
        notes: p.notes
      }));

      const { data: seededProducts, error: seedError } = await supabaseAdmin
        .from('products')
        .insert(formattedProducts)
        .select('*');

      if (seedError) {
        console.error('❌ Auto-seeding failed:', seedError.message);
        // Fallback to in-memory INITIAL_PRODUCTS
        return NextResponse.json({ products: INITIAL_PRODUCTS });
      }

      // Map back to camelCase frontend schema
      const mapped = (seededProducts || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        longDescription: p.long_description,
        image: p.image,
        stock: p.stock,
        notes: p.notes
      }));

      return NextResponse.json({ products: mapped });
    }

    // Map database snake_case to frontend camelCase Schema
    const mappedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description,
      longDescription: p.long_description,
      image: p.image,
      stock: p.stock,
      notes: p.notes
    }));

    return NextResponse.json({ products: mappedProducts });
  } catch (error: any) {
    console.error('❌ Products Fetch Error:', error.message);
    // Safe fallback to memory so site doesn't crash if tables aren't created yet
    return NextResponse.json({ products: INITIAL_PRODUCTS, warning: 'Database fallback active' });
  }
}

// POST - Create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, price, category, description, longDescription, image, stock, notes } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const { data: newProduct, error } = await supabaseAdmin
      .from('products')
      .insert([
        {
          name,
          price,
          category: category || 'Signature Collection',
          description: description || '',
          long_description: longDescription || '',
          image: image || '/placeholder.png',
          stock: stock || 0,
          notes: notes || { top: '', heart: '', base: '' }
        }
      ])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const mapped = {
      id: newProduct.id,
      name: newProduct.name,
      price: newProduct.price,
      category: newProduct.category,
      description: newProduct.description,
      longDescription: newProduct.long_description,
      image: newProduct.image,
      stock: newProduct.stock,
      notes: newProduct.notes
    };

    return NextResponse.json({ success: true, product: mapped });
  } catch (error: any) {
    console.error('❌ Product Insert Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
