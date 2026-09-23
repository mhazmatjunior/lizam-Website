import { redirect } from "next/navigation";

/**
 * The balance payment used to live on its own page here, reached from a QR
 * code. Pre-orders are now completed with a coupon code on the ordinary
 * checkout page, so old links just land there.
 *
 * This redirect stays so the links in payment emails already sent keep going
 * somewhere useful.
 */
export default function LegacyBalancePayPage() {
  redirect("/checkout");
}
