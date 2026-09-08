/**
 * Human labels for the payment_method values stored on orders.
 *
 * Shared so the admin list, the order detail and the printed delivery receipt
 * all read the same. Covers both the current values and older ones still
 * present on historical orders.
 */
export const PAYMENT_LABELS: Record<string, string> = {
  // Current
  online: "Online Payment",
  online_manual: "Manual Transfer (Bank / Wallet)",
  cod: "Cash on Delivery",
  founder: "Hand Delivered by Founder",

  // Older values kept for orders placed before the rename
  safepay: "Online Payment (Safepay)",
  bank_transfer: "Bank Transfer / Wallet (manual)",
  cod_standard: "Cash on Delivery (Standard)",
  cod_founder: "Cash on Delivery (Founder Delivery)",
};

export const paymentLabel = (method?: string | null) =>
  (method && PAYMENT_LABELS[method]) || method || "Unknown";
