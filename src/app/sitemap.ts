import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";
import { listSeoProducts } from "@/lib/seo";

// Rebuilt hourly so a product added in the admin appears without a redeploy.
export const revalidate = 3600;

const STATIC_PATHS: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/products", priority: 0.8 },
  { path: "/contact", priority: 0.5 },
  { path: "/shipping-returns", priority: 0.4 },
  { path: "/terms", priority: 0.2 },
  { path: "/privacy", priority: 0.2 },
  { path: "/complaints", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await listSeoProducts();

  return [
    ...STATIC_PATHS.map(({ path, priority }) => ({ url: `${base}${path}`, priority })),
    ...products.map((p) => ({ url: `${base}/products/${p.id}`, priority: 0.9 })),
  ];
}
