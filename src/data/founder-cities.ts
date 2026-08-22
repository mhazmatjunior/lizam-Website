export interface FounderCityTier {
  tier: number;
  price: number;
  priceFormatted: string;
  cities: string[];
  aliases: Record<string, string>;
}

export const FOUNDER_DELIVERY_TIERS: FounderCityTier[] = [
  {
    tier: 1,
    price: 4000,
    priceFormatted: 'Rs 4,000',
    cities: ['Lahore', 'Gujranwala', 'Sialkot', 'Gujrat', 'Jhelum', 'Faisalabad'],
    aliases: {
      'lhr': 'Lahore',
      'jehlum': 'Jhelum',
      'gwa': 'Gujranwala',
      'fsd': 'Faisalabad',
      'skt': 'Sialkot'
    }
  },
  {
    tier: 2,
    price: 8000,
    priceFormatted: 'Rs 8,000',
    cities: ['Islamabad', 'Rawalpindi'],
    aliases: {
      'isb': 'Islamabad',
      'pindi': 'Rawalpindi',
      'rwp': 'Rawalpindi'
    }
  },
  {
    tier: 3,
    price: 7000,
    priceFormatted: 'Rs 7,000',
    cities: ['Multan', 'Bahawalpur'],
    aliases: {
      'bhawalpur': 'Bahawalpur',
      'bwp': 'Bahawalpur',
      'mux': 'Multan'
    }
  },
  {
    tier: 4,
    price: 10000,
    priceFormatted: 'Rs 10,000',
    cities: ['Karachi', 'Rahim Yar Khan'],
    aliases: {
      'khi': 'Karachi',
      'rahim yaar khan': 'Rahim Yar Khan',
      'rahimyar khan': 'Rahim Yar Khan',
      'ryk': 'Rahim Yar Khan'
    }
  }
];

export function getFounderDeliveryInfo(userCity: string) {
  if (!userCity || !userCity.trim()) return null;
  const normalized = userCity.toLowerCase().trim();

  for (const tierObj of FOUNDER_DELIVERY_TIERS) {
    // Direct city name match
    for (const city of tierObj.cities) {
      if (normalized === city.toLowerCase() || normalized.includes(city.toLowerCase())) {
        return { matchedCity: city, price: tierObj.price, priceFormatted: tierObj.priceFormatted, tier: tierObj.tier };
      }
    }
    // Alias match
    for (const [alias, targetCity] of Object.entries(tierObj.aliases)) {
      if (normalized === alias || normalized.includes(alias)) {
        return { matchedCity: targetCity, price: tierObj.price, priceFormatted: tierObj.priceFormatted, tier: tierObj.tier };
      }
    }
  }

  return null;
}
