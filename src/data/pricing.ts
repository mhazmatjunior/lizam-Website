// ---------------------------------------------------------------------------
// Delivery pricing. Single source of truth for what a customer pays on top of
// the product price. The product price itself lives in the database.
//
// The rule is: pay the full amount up front and delivery is free; pay at the
// door and a Rs 400 COD charge is added (Rs 3200 online vs Rs 3600 COD for the
// current product, advertised as "10% off + free delivery" for paying online).
// Bank transfer is also payment in advance, so it gets free delivery too.
//
// A COD order is booked with a fixed Rs 300 advance; the rest of the total is
// paid in cash at the door.
//
// Hand delivery by the founder used to be a third option, priced by city.
// It has been withdrawn. Orders placed under it keep the payment_method
// 'cod_founder' and are still labelled in the admin and on receipts — see
// src/data/payment-labels.ts — but it can no longer be chosen at checkout,
// so nothing here needs to price it.
// ---------------------------------------------------------------------------

export type PaymentMethod = 'safepay' | 'bank_transfer' | 'cod_standard';

/** Charge added when the customer pays cash at the door. */
export const COD_DELIVERY_FEE = 400;

/** Paid in advance to book a COD order; the rest is collected in cash. */
export const COD_ADVANCE = 300;

/** The online-payment saving, as advertised. Copy only -- not applied to prices. */
export const ONLINE_DISCOUNT_PERCENT = 10;

/** Delivery charge for a given payment method. */
export function deliveryFee(method: PaymentMethod): number {
  switch (method) {
    case 'safepay':
    case 'bank_transfer':
      return 0; // paid in advance -> free delivery
    case 'cod_standard':
      return COD_DELIVERY_FEE;
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
  }
}
