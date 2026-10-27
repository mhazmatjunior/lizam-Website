import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Fragrances",
  description: "Shop Raanae fragrances, including 7th October. Nationwide delivery across Pakistan, with free delivery when you pay online.",
  alternates: { canonical: "/products" },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
