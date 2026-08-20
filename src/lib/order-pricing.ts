import { supabaseAdmin } from '@/lib/supabase';
import { deliveryFee, type PaymentMethod } from '@/data/pricing';

export interface OrderLineInput {
  id: number;
  quantity: number;
}

export interface PricedOrder {
  subtotal: number;
  delivery: number;
  total: number;
  /** "7TH OCT x1, VELVET ROSE x2" — for the order's product column. */
  summary: string;
}

const VALID_METHODS: PaymentMethod[] = ['safepay', 'bank_transfer', 'cod_standard', 'cod_founder'];

/**
 * Price an order from product ids and quantities, using prices read from the
 * database rather than anything the browser sent.
 *
 * The client used to pass `amount` straight into the order row, which meant a
 * stale saved cart charged an old price, and a crafted request could set any
 * amount at all. Everything here is recomputed server-side.
 *
 * Throws on an empty cart, an unknown product, or a delivery destination the
 * chosen method does not cover.
 */
export async function priceOrder(
  items: OrderLineInput[],
  method: string,
  city: string
): Promise<PricedOrder> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty');
  }
  if (!VALID_METHODS.includes(method as PaymentMethod)) {
    throw new Error(`Unknown payment method: ${method}`);
  }

  const ids = [...new Set(items.map((i) => Number(i.id)).filter(Number.isFinite))];
  if (ids.length === 0) throw new Error('No valid product ids supplied');

  const { data: rows, error } = await supabaseAdmin
    .from('products')
    .select('id, name, price')
    .in('id', ids);

  if (error) throw new Error(`Could not read product prices: ${error.message}`);

  const byId = new Map((rows || []).map((r: any) => [Number(r.id), r]));

  let subtotal = 0;
  const parts: string[] = [];

  for (const item of items) {
    const id = Number(item.id);
    const qty = Math.floor(Number(item.quantity));
    if (!Number.isFinite(qty) || qty <= 0) throw new Error(`Invalid quantity for product ${id}`);
    if (qty > 100) throw new Error(`Quantity too large for product ${id}`);

    const product = byId.get(id);
    if (!product) throw new Error(`Product ${id} is no longer available`);

    subtotal += Number(product.price) * qty;
    parts.push(`${product.name} x${qty}`);
  }

  const delivery = deliveryFee(method as PaymentMethod, city || '');
  if (delivery === null) {
    throw new Error(`Delivery is not available in ${city || 'that city'} for this method`);
  }

  return {
    subtotal,
    delivery,
    total: subtotal + delivery,
    summary: parts.join(', '),
  };
}
