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

export function factsFor(productId: number): ProductFacts | null {
  return PRODUCT_FACTS[productId] ?? null;
}
