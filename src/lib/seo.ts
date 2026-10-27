import { cache } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { siteUrl } from '@/data/site';
import { BUSINESS, ORDER_POLICY } from '@/data/legal';

// ---------------------------------------------------------------------------
// Server-side product reads for metadata, the sitemap and structured data.
//
// The product pages themselves are client components that load the catalogue
// through ProductContext, so nothing they render reaches a crawler's first
// HTML. These helpers read the same products table directly, on the server,
// so titles, canonical links and Product JSON-LD are in the initial response.
// ---------------------------------------------------------------------------

export interface SeoProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  longDescription: string;
  image: string;
  stock: number;
  preorderEnabled: boolean;
}

export interface RatingSummary {
  average: number;
  count: number;
}

function mapRow(row: any): SeoProduct {
  return {
    id: Number(row.id),
    name: row.name,
    price: Number(row.price),
    description: row.description || '',
    longDescription: row.long_description || '',
    image: row.image || '',
    stock: Number(row.stock || 0),
    preorderEnabled: Boolean(row.preorder_enabled),
  };
}

/** One product, or null when the id is unknown or the read fails. */
export const getSeoProduct = cache(async (id: number): Promise<SeoProduct | null> => {
  if (!Number.isFinite(id)) return null;
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data);
});

/** Every product, for the sitemap. Empty on a failed read rather than throwing. */
export async function listSeoProducts(): Promise<SeoProduct[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('id', { ascending: true });
  if (error || !data) return [];
  return data.map(mapRow);
}

/**
 * Approved reviews only — the same set ReviewSection shows on the page.
 * Google requires AggregateRating to match ratings visible to the shopper.
 */
export const getRatingSummary = cache(async (productId: number): Promise<RatingSummary> => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');
  if (error || !data || data.length === 0) return { average: 0, count: 0 };
  const total = data.reduce((s, r: any) => s + Number(r.rating), 0);
  return { average: Math.round((total / data.length) * 10) / 10, count: data.length };
});

/** Turns a site-relative image path into an absolute URL; leaves absolute URLs alone. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** "7 days" -> 7. Falls back to 7 if the policy text stops being a plain day count. */
function days(value: string): number {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 7;
}

/** "2–4 working days" -> [2, 4]. */
function dayRange(value: string): [number, number] {
  const nums = value.match(/\d+/g)?.map(Number) ?? [];
  return [nums[0] ?? 1, nums[1] ?? nums[0] ?? 1];
}

/**
 * schema.org Product + Offer for one product.
 *
 * Shipping is quoted at the prepaid rate (free), which is the price shown on
 * the page; COD adds a fee at checkout. AggregateRating is included only when
 * there are approved, on-page reviews.
 */
export function productJsonLd(product: SeoProduct, images: string[], rating: RatingSummary) {
  const url = `${siteUrl()}/products/${product.id}`;
  const [handlingMin, handlingMax] = dayRange(ORDER_POLICY.dispatch);
  const [, transitMax] = dayRange(ORDER_POLICY.deliveryRemote);
  const [transitMin] = dayRange(ORDER_POLICY.deliveryMajorCities);

  const availability =
    product.stock > 0
      ? 'https://schema.org/InStock'
      : product.preorderEnabled
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.longDescription || product.description,
    image: images.map(absoluteUrl),
    sku: String(product.id),
    brand: { '@type': 'Brand', name: BUSINESS.brandName },
    url,
    offers: {
      '@type': 'Offer',
      url,
      price: product.price,
      priceCurrency: 'PKR',
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: BUSINESS.brandName },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'PKR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: handlingMin, maxValue: handlingMax, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: transitMin, maxValue: transitMax, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: days(ORDER_POLICY.returnWindow),
        returnMethod: 'https://schema.org/ReturnByMail',
        merchantReturnLink: `${siteUrl()}/shipping-returns`,
      },
    },
    ...(rating.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.average,
        reviewCount: rating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

/** Serialises JSON-LD for a <script> tag without letting "</script>" in data close it early. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
