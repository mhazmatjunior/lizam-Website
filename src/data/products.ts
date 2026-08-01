export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  longDescription: string;
  notes: {
    top: string;
    heart: string;
    base: string;
    [key: string]: string;
  };
  image: string;
  stock: number;
  characteristics?: {
    intensity: string;
    profile: string;
    longevity: string;
  };
  usps?: Array<{
    title: string;
    description: string;
  }>;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "NOCTURNAL OUD",
    price: 18500,
    category: "Obsidian",
    description: "A deep, mysterious journey into the heart of the night.",
    longDescription: "The Obsidian Edition: Nocturnal Oud is an invitation to the shadows. It opens with the piercing clarity of Saffron before descending into a heart of smoky Leather and Rose. The dry-down is an eternal echo of Cambodian Oud and Sandalwood—a scent designed for those who find power in the moonlight.",
    notes: {
      top: "Saffron, Cardamom",
      heart: "Leather, Bulgarian Rose",
      base: "Cambodian Oud, Sandalwood"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 42,
  },
  {
    id: 2,
    name: "VELVET ROSE",
    price: 16000,
    category: "Floral",
    description: "The elegance of a midnight bloom, captured in glass.",
    longDescription: "A masterclass in floral architecture. Velvet Rose reimagines the classic bloom as a structured, metallic masterpiece. Fresh Bergamot gives way to a dense, velvet heart of Damask Rose, eventually settling into a rare and salty Ambergris base. It is the scent of a flower that never fades.",
    notes: {
      top: "Bergamot, Lychee",
      heart: "Damask Rose, Incense",
      base: "Ambergris, Musk"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 28,
  },
  {
    id: 3,
    name: "OBSIDIAN VII",
    price: 24500,
    category: "Obsidian",
    description: "Our rarest infusion. Pure, architectural, unmatched.",
    longDescription: "The pinnacle of Raanae's olfactory engineering. Obsidian VII is a scent without compromise. It utilizes a cold-distillation process to preserve the raw, mineral edge of Iris Root. Combined with high-altitude Incense and aged Sandalwood, it creates an aura of unreachable sophistication.",
    notes: {
      top: "Mineral Accord, Incense",
      heart: "Iris Root, Violet Leaf",
      base: "White Sandalwood, Papyrus"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 35,
  },
  {
    id: 4,
    name: "SILVER BIRCH",
    price: 14000,
    category: "Woody",
    description: "Clean, crisp, and revitalizing like a morning forest.",
    longDescription: "Inspired by the architectural lines of a winter forest. Silver Birch is a sharp, vertical scent. It cuts through the air with Juniper and cold Citron, leading to a heart of Silver Birch wood. The foundation of Oakmoss and Cedar provides a grounded, timeless finish.",
    notes: {
      top: "Juniper Berry, Citron",
      heart: "Silver Birch, Lavender",
      base: "Oakmoss, White Cedar"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 64,
  },
  {
    id: 5,
    name: "PURE MUSK",
    price: 12500,
    category: "Musk",
    description: "A second skin of warmth and subtle attraction.",
    longDescription: "Minimalism in a bottle. Pure Musk is designed to enhance the natural scent of the wearer. It is a soft, tactile experience—opening with White Pepper and Cotton Bloom for a clean, laundered feel, before blooming into a translucent and magnetic White Musk.",
    notes: {
      top: "White Pepper, Cotton Bloom",
      heart: "Transparent Jasmine",
      base: "White Musk, Ambrette"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 85,
  },
  {
    id: 6,
    name: "EMERALD VETIVER",
    price: 15500,
    category: "Woody",
    description: "Earthy depth meeting the vibrance of fresh greens.",
    longDescription: "A collision of earth and air. Emerald Vetiver celebrates the raw power of the root. Zesty Citron provides an immediate spark, which transitions into a deep, grassy Vetiver. The base of Cedarwood ensures a lasting, masculine, and sophisticated trail.",
    notes: {
      top: "Citron, Pink Pepper",
      heart: "Haitian Vetiver, Sage",
      base: "Cedarwood, Patchouli"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 48,
  },
  {
    id: 7,
    name: "GLACIER WATER",
    price: 13500,
    category: "Musk",
    description: "The arctic chill meeting a warm horizon.",
    longDescription: "An exploration of temperature. Glacier Water opens with a freezing blast of Sea Salt and Aldehydes, mimicking the crisp air of the polar reaches. As it warms on the skin, a soft Ambrette and Musk base emerges, creating a beautiful and unexpected contrast.",
    notes: {
      top: "Sea Salt, Aldehydes",
      heart: "Ozone Accord, Lily",
      base: "Ambrette, Crisp Musk"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 31,
  },
  {
    id: 8,
    name: "GOLDEN AMBER",
    price: 21000,
    category: "Obsidian",
    description: "Liquid gold. Warm, resinous, and deeply opulent.",
    longDescription: "The scent of heat and luxury. Golden Amber is a dense, resinous potion. Labdanum and Benzoin create a heart that glows like molten gold, while Vanilla Bean and Tonka provide a creamy, addictive finish. It is the ultimate expression of warmth.",
    notes: {
      top: "Cistus Labdanum, Plum",
      heart: "Siam Benzoin, Amber",
      base: "Vanilla Bean, Roasted Tonka"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 55,
  },
  {
    id: 9,
    name: "DESERT WIND",
    price: 17500,
    category: "Woody",
    description: "The spicy heat of the dunes and shifting sands.",
    longDescription: "A nomadic journey through fire and dust. Desert Wind captures the kinetic energy of the Sahara. Cardamom and Cinnamon provide a spicy, arid opening, while Guaiac Wood and Incense evoke the smell of distant fires under a vast, star-filled sky.",
    notes: {
      top: "Cardamom, Cinnamon",
      heart: "Guaiac Wood, Juniper",
      base: "Smoky Incense, Leather"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/theme-image5.png",
    stock: 26,
  },
  {
    id: 71099,
    name: "7TH OCT (Pre-Order)",
    price: 18500,
    category: "Signature Collection",
    description: "A captivating, ultra-long lasting signature scent of resistance and pride. No Harmful Effects and No Side Effects.",
    longDescription: "Crafted with clean, skin-friendly natural oil formulations, this fragrance represents a story of resistance. Combining a captivating, long-lasting performance with exquisite gourmand and woody notes, it represents luxury designed for confidence, with No Harmful Effects and No Side Effects.",
    notes: {
      top: "Crisp Apple, Rich Davana",
      heart: "Elegant Damask Rose, Earthy Cedarwood, Exotic Osmanthus",
      base: "Deep Vanilla Absolute, Warm Tonka Bean, Grounding Patchouli"
    },
    image: "https://ybhzcrqaxtglysnpxcmd.supabase.co/storage/v1/object/public/product-images/SlideShow/Slide%20Image%205.webp",
    stock: 100,
    characteristics: {
      intensity: "Parfum Intense",
      profile: "A captivating blend of Woody, Gourmand, Sweet, and Powdery accords",
      longevity: "Exceptional 15 to 20 Hours of lasting performance"
    },
    usps: [
      {
        title: "15 to 20 Hours Ultra-Long Lasting",
        description: "Formulated at a high concentration to keep you smelling effortless all day and night."
      },
      {
        title: "Clean & Safe Formulation",
        description: "Crafted with zero harmful chemicals, ensuring a premium scent experience without compromise."
      },
      {
        title: "Skin-Friendly (No Side Effects)",
        description: "Carefully blended with non-irritating ingredients so you can wear your signature scent with complete confidence."
      }
    ]
  }
];
