import type { Metadata } from "next";
import { PRODUCT_GALLERY } from "@/data/brand";
import {
  getRatingSummary,
  getSeoProduct,
  jsonLdScript,
  productJsonLd,
} from "@/lib/seo";

// The page is a client component, so its metadata and structured data are
// produced here, on the server, where crawlers see them in the first response.

type Props = { params: Promise<{ id: string }> };

/** Same images the page's gallery shows (see `gallery` in page.tsx). */
function galleryFor(image: string): string[] {
  return PRODUCT_GALLERY.length ? PRODUCT_GALLERY : [image];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getSeoProduct(Number(id));
  if (!product) {
    return { title: "Fragrance", robots: { index: false, follow: true } };
  }

  const title = `${product.name} Perfume`;
  const description = product.description || product.longDescription.slice(0, 160);
  const url = `/products/${product.id}`;
  const images = galleryFor(product.image).map((src) => ({ url: src, alt: product.name }));

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}

export default async function ProductLayout({
  children,
  params,
}: Props & { children: React.ReactNode }) {
  const { id } = await params;
  const product = await getSeoProduct(Number(id));
  const rating = product ? await getRatingSummary(product.id) : null;

  return (
    <>
      {product && rating && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(productJsonLd(product, galleryFor(product.image), rating)),
          }}
        />
      )}
      {children}
    </>
  );
}
