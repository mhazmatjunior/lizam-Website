// ---------------------------------------------------------------------------
// Delivery pricing. Single source of truth for what a customer pays on top of
// the product price. The product price itself lives in the database.
//
// The rule is: pay the full amount up front and delivery is free; pay at the
// door and delivery costs Rs 200. Bank transfer is also payment in advance,
// so it gets free delivery too.
//
// Hand delivery by the founder used to be a third option, priced by city.
// It has been withdrawn. Orders placed under it keep the payment_method
// 'cod_founder' and are still labelled in the admin and on receipts — see
// src/data/payment-labels.ts — but it can no longer be chosen at checkout,
// so nothing here needs to price it.
// ---------------------------------------------------------------------------

export type PaymentMethod = 'safepay' | 'bank_transfer' | 'cod_standard';

/** Delivery charged when the customer pays cash at the door. */
export const COD_DELIVERY_FEE = 200;

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
