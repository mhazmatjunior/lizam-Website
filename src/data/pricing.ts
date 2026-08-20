// ---------------------------------------------------------------------------
// Delivery pricing. Single source of truth for what a customer pays on top of
// the product price. The product price itself lives in the database (Rs 3,600).
//
// From the client's brief (19 Aug):
//   Online (Safepay)        3600  — "Delivery Free if you pay online in advance"
//   Cash on delivery        3800  — delivery Rs 200, paid in advance
//   Hand delivered by founder     — charge varies by city
//
// The rule behind those numbers is: pay the full amount up front and delivery
// is free; pay at the door and delivery costs Rs 200. Bank transfer is also
// payment in advance, so it gets free delivery too.
// ---------------------------------------------------------------------------

export type PaymentMethod = 'safepay' | 'bank_transfer' | 'cod_standard' | 'cod_founder';

/** Delivery charged when the customer pays cash at the door. */
export const COD_DELIVERY_FEE = 200;

/**
 * Founder hand-delivery, priced by region. Keys are lowercase city names as
 * typed by the customer; matching is case-insensitive and ignores spaces.
 */
export const FOUNDER_DELIVERY_ZONES: Array<{ fee: number; cities: string[] }> = [
  { fee: 4000,  cities: ['lahore', 'gujranwala', 'sialkot', 'gujrat', 'jehlum', 'jhelum', 'faisalabad'] },
  { fee: 7000,  cities: ['multan', 'bhawalpur', 'bahawalpur'] },
  { fee: 8000,  cities: ['islamabad', 'pindi', 'rawalpindi'] },
  { fee: 10000, cities: ['karachi', 'rahimyaarkhan', 'rahimyarkhan'] },
];

const normalise = (city: string) => city.toLowerCase().replace(/\s+/g, '');

/** Founder delivery fee for a city, or null when the founder does not cover it. */
export function founderFeeForCity(city: string): number | null {
  const key = normalise(city);
  if (!key) return null;
  const zone = FOUNDER_DELIVERY_ZONES.find((z) => z.cities.includes(key));
  return zone ? zone.fee : null;
}

/** Every city the founder currently delivers to, for display. */
export const FOUNDER_CITIES_LABEL =
  'Lahore, Gujranwala, Sialkot, Gujrat, Jehlum, Faisalabad, Multan, Bhawalpur, Islamabad, Pindi, Karachi, Rahim Yar Khan';

/**
 * Delivery charge for a given payment method.
 * Returns null for founder delivery to an uncovered city, so callers can block
 * the order rather than silently charging nothing.
 */
export function deliveryFee(method: PaymentMethod, city: string): number | null {
  switch (method) {
    case 'safepay':
    case 'bank_transfer':
      return 0; // paid in advance -> free delivery
    case 'cod_standard':
      return COD_DELIVERY_FEE;
    case 'cod_founder':
      return founderFeeForCity(city);
  }
}

/** Short line explaining the charge, shown in the order summary. */
export function deliveryLabel(method: PaymentMethod): string {
  switch (method) {
    case 'safepay':
    case 'bank_transfer':
      return 'Free (paid in advance)';
    case 'cod_standard':
      return 'Cash on delivery';
    case 'cod_founder':
      return 'Hand delivered by the founder';
  }
}
