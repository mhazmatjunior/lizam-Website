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
    price: 3999,
    priceFormatted: 'Rs 3,999',
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
    price: 7999,
    priceFormatted: 'Rs 7,999',
    cities: ['Islamabad', 'Rawalpindi'],
    aliases: {
      'isb': 'Islamabad',
      'pindi': 'Rawalpindi',
      'rwp': 'Rawalpindi'
    }
  },
  {
    tier: 3,
    price: 10999,
    priceFormatted: 'Rs 10,999',
    cities: ['Multan', 'Bahawalpur'],
    aliases: {
      'bhawalpur': 'Bahawalpur',
      'bwp': 'Bahawalpur',
      'mux': 'Multan'
    }
  },
  {
    tier: 4,
    price: 12999,
    priceFormatted: 'Rs 12,999',
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
