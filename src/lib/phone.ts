// ---------------------------------------------------------------------------
// Pakistani mobile numbers, for checkout.
//
// Couriers call or text the customer before a COD delivery, so the number has
// to be a reachable mobile. Shoppers type it every way imaginable --
// "0300 1234567", "+92 300-1234567", "923001234567", "0092 300 1234567" -- so
// rather than dictate a format, accept them all and store one: "0300 1234567".
//
// Shared by the checkout form (instant feedback) and createOrder (the check
// that counts), so the two cannot disagree.
// ---------------------------------------------------------------------------

export const PHONE_HINT = "Enter a Pakistani mobile number, e.g. 0300 1234567";

/** "0300 1234567" for a valid Pakistani mobile number, otherwise null. */
export function normalizePkMobile(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let digits = raw.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;

  if (digits.startsWith("0092")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("92") && digits.length === 12) digits = "0" + digits.slice(2);
  else if (digits.startsWith("3") && digits.length === 10) digits = "0" + digits;

  // Mobile numbers: 03 + operator code + 7 digits = 11 digits.
  if (!/^03\d{9}$/.test(digits)) return null;
  return `${digits.slice(0, 4)} ${digits.slice(4)}`;
}

/** Provinces and territories, for the checkout dropdown. */
export const PK_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
] as const;
