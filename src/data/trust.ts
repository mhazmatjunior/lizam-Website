// ---------------------------------------------------------------------------
// The trust strip shown beside Add to Bag on the home and product pages.
//
// Each line restates a policy, so it is built from the same values the
// policy pages and checkout use -- change a figure there and this follows.
// Keep it to four short points: it sits next to the purchase decision and
// must read at a glance.
// ---------------------------------------------------------------------------

import { ORDER_POLICY } from "./legal";
import { COD_ADVANCE, ONLINE_DISCOUNT_PERCENT } from "./pricing";

export type TrustIcon = "truck" | "card" | "cash" | "return";

export interface TrustPoint {
  icon: TrustIcon;
  title: string;
  detail: string;
  /** Policy page that backs the claim, linked from the point. */
  href?: string;
}

export const TRUST_POINTS: TrustPoint[] = [
  {
    icon: "truck",
    title: "Nationwide delivery",
    detail: `Dispatched in ${ORDER_POLICY.dispatch}`,
    href: "/shipping-returns",
  },
  {
    icon: "card",
    title: "Pay online, save",
    detail: `${ONLINE_DISCOUNT_PERCENT}% off + free delivery`,
  },
  {
    icon: "cash",
    title: "Cash on delivery",
    detail: `Rs ${COD_ADVANCE.toLocaleString()} advance to book`,
  },
  {
    icon: "return",
    title: `${ORDER_POLICY.returnWindow} returns`,
    detail: "On sealed, unused orders",
    href: "/shipping-returns",
  },
];
