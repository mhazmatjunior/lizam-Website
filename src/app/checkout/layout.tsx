import type { Metadata } from "next";

// Checkout and order-result pages are per-customer; keep them out of search.
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
