// ---------------------------------------------------------------------------
// Product facts for 7TH OCT: the single source for what the home page and the
// product page say about the scent, its strength and how it wears.
//
// These used to be typed separately on each page and had drifted apart --
// longevity read "12+ hours", "12 upto 15 hours" and "15 to 20 hours" on the
// same site, and concentration "40% oil" next to "Parfum Intense". Every
// claim now lives here once.
//
// Rules (from the developer brief's content contract):
//   - longevity is qualified wording based on wear testing, never a promise
//     that holds on every skin and climate;
//   - concentration is the exact, defensible classification, backed by
//     formulation proof kept internally;
//   - anything not yet confirmed by the client is null, and the pages hide it.
//
// AWAITING CLIENT: concentration, sizeMl, and a tested longevity figure.
// ---------------------------------------------------------------------------

export interface ProductFacts {
  /** One plain-language sensory line, no "luxury" filler. */
  promise: string;
  /** Fragrance family, from the formulation. */
  family: string;
  /** Who it is positioned for. */
  audience: string;
  /** Short label for compact spots (home facts list). */
  longevityShort: string;
  /** Full, qualified longevity statement. */
  longevity: string;
  /** How strong it reads -- descriptive, not a concentration class. */
  intensity: string;
  /** Exact concentration classification, e.g. "Extrait de Parfum". Null until confirmed. */
  concentration: string | null;
  /** Bottle size in ml. Null until confirmed. */
  sizeMl: number | null;
  /** Two to four realistic moments to wear it. */
  useCases: string[];
}

export const PRODUCT_FACTS: Record<number, ProductFacts> = {
  71099: {
    promise:
      "Crisp apple and davana open onto rose and cedarwood, then settle into warm vanilla, tonka and patchouli.",
    family: "Woody gourmand, with sweet and powdery accords",
    audience: "Unisex, for him and her",
    longevityShort: "Long-lasting",
    longevity: "Long-lasting. How long it stays depends on your skin, the climate and how much you apply.",
    intensity: "Rich and intense",
    concentration: null,
    sizeMl: null,
    useCases: ["Evenings and dinners", "Weddings and celebrations", "Cooler months", "Everyday, with a light hand"],
  },
};

// ---------------------------------------------------------------------------
// Product details from the brand's design handoff (web source, Nov 2026),
// shown on the product page and, for the composition, on the home page too.
// Owner-confirmed or descriptive only: nothing here is a size, concentration
// or safety claim.
// ---------------------------------------------------------------------------

/** The three layers of the scent, each with a short description. */
export const COMPOSITION = [
  {
    id: "first",
    label: "01 / Top notes",
    title: "Crisp apple. Rich davana.",
    body: "A bright, expressive introduction. Crisp apple meets the distinctive richness of davana, opening the story with contrast.",
  },
  {
    id: "heart",
    label: "02 / Heart notes",
    title: "Rose. Cedarwood. Osmanthus.",
    body: "Damask rose and osmanthus unfold against cedarwood, bringing floral nuance and a composed woody character to the heart.",
  },
  {
    id: "trail",
    label: "03 / Base notes",
    title: "Vanilla. Tonka. Patchouli.",
    body: "Vanilla absolute and tonka bean meet the earthy depth of patchouli. A warm, textured close to a personal story.",
  },
];

/**
 * The three points under the product on the home page, as the client asked
 * (Nov 2026): unisex, how long it lasts, projection.
 *
 * PLACEHOLDER WORDING: to be replaced with the text from Umar's website
 * document. Longevity stays qualified (no hour figure) until wear testing
 * confirms one -- see `longevity` above.
 */
export const HOME_HIGHLIGHTS = [
  { title: "Unisex", body: "Made for him and her." },
  { title: "Long-lasting", body: "Stays with you through the day; how long depends on your skin, the climate and how much you apply." },
  { title: "Strong projection", body: "A confident, noticeable presence from the first spray." },
];

/** "About this fragrance" facts for the product page. */
export const PRODUCT_DETAILS: Array<[label: string, value: string]> = [
  ["The house", "Raanae, Pakistan"],
  ["First release", "7 October 2026"],
  ["Inspiration", "Dignity & resilience"],
  ["Collection", "Chapter 01"],
];

/** The bottle, as an object. */
export const BOTTLE = {
  intro:
    "The weight of dark glass. The fine lines of the cap. A precise spray. 7th October is designed as an object of presence before the fragrance even touches skin.",
  points: [
    { title: "A fine, even mist.", body: "Controlled application. A quiet ritual." },
    { title: "Black. Gold. Intentional.", body: "A tactile finish made to feel substantial." },
  ],
};

/** How to apply and care for the fragrance. */
export const CARE = [
  "Apply lightly to pulse points and let the fragrance settle without rubbing.",
  "Store the bottle away from direct sunlight and heat.",
  "Avoid contact with eyes and irritated skin; stop use if irritation occurs.",
];

export function factsFor(productId: number): ProductFacts | null {
  return PRODUCT_FACTS[productId] ?? null;
}
