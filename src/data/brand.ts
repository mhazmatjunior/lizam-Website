// ---------------------------------------------------------------------------
// Brand-level copy, shared by every product.
//
// These are claims about RAANAE, not facts about one perfume, so they live here
// rather than being duplicated into each database row. A product may still
// override them by setting its own `usps` -- see BRAND_USPS usage in
// src/app/products/[id]/page.tsx.
// ---------------------------------------------------------------------------

export const USP_EYEBROW = "Our USP";
export const USP_HEADING = "What Makes Us Different?";

export const USP_INTRO =
  "We believe luxury fragrances should be as gentle on your skin as they are memorable to your senses. Here’s why our perfumes stand out:";

export const BRAND_USPS: Array<{ title: string; description: string }> = [
  {
    title: "15 to 20 Hours Ultra-Long Lasting",
    description:
      "Formulated at a high concentration to keep you smelling effortless all day and night.",
  },
  {
    title: "Clean & Safe Formulation",
    description:
      "Crafted with zero harmful chemicals, ensuring a premium scent experience without compromise.",
  },
  {
    title: "Skin-Friendly (No Side Effects)",
    description:
      "Carefully blended with non-irritating ingredients so you can wear your signature scent with complete confidence.",
  },
];

// ---------------------------------------------------------------------------
// Default scent characteristics.
//
// Unlike the USPs above, these are product facts rather than brand claims --
// `profile` in particular describes 7TH OCT's accords. They live here so the
// section renders for every product without database work, but any product
// that actually smells different SHOULD override them from the admin
// Inventory form (Scent Characteristics), which writes to the product row.
//
// If a second fragrance is added and nobody sets its characteristics, it will
// inherit 7TH OCT's profile -- which would be wrong. Worth remembering.
// ---------------------------------------------------------------------------

export const CHARACTERISTICS_HEADING = "Scent Characteristics";

export const DEFAULT_CHARACTERISTICS = {
  intensity: "Parfum Intense",
  profile: "A captivating blend of Woody, Gourmand, Sweet, and Powdery accords",
  longevity: "Exceptional 15 to 20 Hours of lasting performance",
};

// ---------------------------------------------------------------------------
// Product page gallery.
//
// Client-supplied images for the product page, shown in order with the dots
// under the frame acting as the picker.
//
// The filenames really do read "imagee" — that is how they arrived, and these
// paths must match the files in public/product-img exactly.
// ---------------------------------------------------------------------------

export const PRODUCT_GALLERY: string[] = [
  "/product-img/Product%20page%20imagee%201.webp",
  "/product-img/Product%20page%20imagee%202.webp",
  "/product-img/Product%20page%20imagee%203.webp",
];
