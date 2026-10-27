import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { newOrderId } from '@/lib/order-id';
import { priceOrder, type PricedOrder } from '@/lib/order-pricing';
import { sanitizeAttribution } from '@/lib/attribution';
import { sendOrderConfirmationEmail } from '@/lib/email';

// ---------------------------------------------------------------------------
// Creating orders, shared by /api/orders (COD and bank transfer) and
// /api/checkout (Safepay).
//
// Nothing about money or status is taken from the browser: the order is
// priced from product ids and quantities, and the status follows from the
// payment method. In particular no shopper request can create a "paid" order;
// only a verified Safepay return or webhook does that (markSafepayPaid).
// ---------------------------------------------------------------------------

/** A problem with what the shopper sent; reported back as a 400. */
export class OrderInputError extends Error {}

const ATTRIBUTION_COLUMNS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'attribution'];

/**
 * Inserts an order row. If the attribution columns are missing (migration 010
 * not run), retries once without them, so campaign data never blocks an order.
 * Mutates `row` to drop those keys, which keeps later fallback retries clean.
 */
async function insertOrder(row: any) {
  let result = await supabaseAdmin.from('orders').insert([row]).select('*').single();
  if (result.error && ATTRIBUTION_COLUMNS.some((c) => result.error!.message.includes(c))) {
    console.warn('⚠️ Order attribution columns missing; run migration 010. Saving without them.');
    for (const c of ATTRIBUTION_COLUMNS) delete row[c];
    result = await supabaseAdmin.from('orders').insert([row]).select('*').single();
  }
  return result;
}

/**
 * Status a new order starts in. A receipt uploaded at checkout (bank transfer,
 * or the COD advance) waits for an admin to verify it; plain COD is collected
 * at the door; anything else -- an online payment not yet confirmed -- is
 * pending.
 */
function initialStatus(paymentMethod: string, screenshot: string | null): string {
  if (screenshot) return 'unverified';
  if (paymentMethod === 'cod_standard') return 'cashondelivery';
  return 'pending';
}

export interface CreatedOrder {
  orderId: string;
  order: any;
  priced: PricedOrder;
}

/**
 * Validates, prices and saves an order from a checkout request body.
 *
 * `beforeInsert` runs after pricing and before the row is written; whatever it
 * returns is merged into the row. Safepay uses it to open the payment for the
 * server-priced total and store the tracker on the order.
 */
export async function createOrder(
  body: any,
  opts: {
    beforeInsert?: (priced: PricedOrder, orderId: string) => Promise<Record<string, unknown>>;
  } = {}
): Promise<CreatedOrder> {
  const { name, email, phone, address, items, payment_method, payment_sub_method } = body ?? {};
  const payment_screenshot: string | null = body?.payment_screenshot || null;

  if (!name || !email || !phone || !address) {
    throw new OrderInputError('All customer fields are required');
  }

  let priced: PricedOrder;
  try {
    priced = await priceOrder(items, payment_method);
  } catch (err: any) {
    throw new OrderInputError(`${err.message}. Please refresh the page and try again.`);
  }
  if (body.amount !== undefined && Number(body.amount) !== priced.total) {
    console.warn(`⚠️ Order total from browser (${body.amount}) differs from server price (${priced.total}); charging server price.`);
  }

  const orderId = newOrderId();

  const insertObj: any = {
    order_id: orderId,
    name,
    email,
    phone,
    address,
    product: priced.summary,
    amount: priced.total,
    currency: 'PKR',
    status: initialStatus(payment_method, payment_screenshot),
    tracker: null,
    payment_method,
    payment_sub_method: payment_sub_method || null,
    payment_proof_url: payment_screenshot,
    payment_screenshot,
    delivery_fee: priced.delivery,
  };

  // Campaign attribution. The flat columns take the last campaign touch,
  // falling back to the first visit when there was only one.
  const attribution = sanitizeAttribution(body.attribution);
  if (attribution) {
    const touch = attribution.last ?? attribution.first ?? {};
    insertObj.utm_source = touch.utm_source ?? null;
    insertObj.utm_medium = touch.utm_medium ?? null;
    insertObj.utm_campaign = touch.utm_campaign ?? null;
    insertObj.utm_content = touch.utm_content ?? null;
    insertObj.attribution = attribution;
  }

  if (opts.beforeInsert) Object.assign(insertObj, await opts.beforeInsert(priced, orderId));

  let { data: newOrder, error } = await insertOrder(insertObj);

  if (error) {
    console.warn('⚠️ Standard insert failed, retrying with compatible fallback keys...', error.message);
    // Fallback: strip extended columns if DB schema hasn't migrated yet
    delete insertObj.payment_sub_method;
    delete insertObj.payment_screenshot;
    delete insertObj.delivery_fee;

    // Compact metadata tag encoding to fit safely within PostgreSQL VARCHAR(255) limits
    let metaTag = `[m:${payment_method}`;
    if (payment_sub_method) metaTag += `|s:${payment_sub_method}`;
    if (payment_screenshot) metaTag += `|ss:${encodeURIComponent(payment_screenshot)}`;
    metaTag += `]`;

    insertObj.product = `${insertObj.product} ${metaTag}`;

    const retryResult = await insertOrder(insertObj);

    if (retryResult.error) {
      // Ultimate fallback: if product string is still too long, store ONLY screenshot URL tag
      const compactTag = `[ss:${encodeURIComponent(payment_screenshot || '')}]`;
      insertObj.product = `${insertObj.product.slice(0, 100)} ${compactTag}`;
      delete insertObj.payment_method;
      const ultimateResult = await insertOrder(insertObj);

      if (ultimateResult.error) throw ultimateResult.error;
      newOrder = ultimateResult.data;
    } else {
      newOrder = retryResult.data;
    }
  }

  return { orderId, order: newOrder, priced };
}

/** Sends the order confirmation email; failures are logged, never thrown. */
export async function sendConfirmation(order: any) {
  try {
    await sendOrderConfirmationEmail({
      orderId: order.order_id,
      name: order.name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      product: order.product,
      amount: order.amount,
      paymentMethod: order.payment_method || 'safepay',
    });
  } catch (err: any) {
    console.error('❌ Failed to send order confirmation email:', err.message);
  }
}

/**
 * True when `sig` is Safepay's signature for `tracker`: HMAC-SHA256 of the
 * tracker under the merchant secret, as @sfpy/node-sdk's verify.signature
 * computes it. Only Safepay holds the secret, and it signs the tracker only
 * when redirecting a customer who completed payment.
 */
export function isValidSafepaySignature(tracker: string, sig: string): boolean {
  const secret = process.env.SAFEPAY_SECRET;
  if (!secret || !tracker || !sig) return false;
  const expected = crypto.createHmac('sha256', secret).update(tracker).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Marks a Safepay order paid, once. Moves only from pending (or cancelled --
 * the customer may have hit "back" from Safepay before paying in another tab)
 * so a repeated redirect or webhook does not resend the email. Returns the
 * updated order, or null when nothing changed.
 */
export async function markSafepayPaid(match: { orderId?: string; tracker?: string }) {
  let q = supabaseAdmin
    .from('orders')
    .update({ status: 'paid', updated_at: new Date().toISOString() })
    .in('status', ['pending', 'cancelled']);
  if (match.orderId) q = q.eq('order_id', match.orderId);
  else if (match.tracker) q = q.eq('payment_reference', match.tracker);
  else return null;

  const { data, error } = await q.select('*').maybeSingle();
  if (error) {
    console.error('❌ Could not mark Safepay order paid:', error.message);
    return null;
  }
  if (data) {
    console.log(`💰 Order ${data.order_id} marked PAID (Safepay verified)`);
    await sendConfirmation(data);
  }
  return data;
}
