// ---------------------------------------------------------------------------
// Provinces and cities for the checkout address.
//
// These are picked from a list rather than typed for a concrete reason: founder
// delivery is priced by city name (see src/data/pricing.ts), and free text lets
// a customer write "Lahroe" or "LHR", which would silently fail the price
// lookup and block their order. Every city the founder covers must appear here
// spelled the way pricing.ts expects.
// ---------------------------------------------------------------------------

export interface Province {
  name: string;
  cities: string[];
}

export const PK_PROVINCES: Province[] = [
  {
    name: "Punjab",
    cities: [
      "Bahawalpur",
      "Dera Ghazi Khan",
      "Faisalabad",
      "Gujranwala",
      "Gujrat",
      "Jhang",
      "Jhelum",
      "Kasur",
      "Lahore",
      "Multan",
      "Okara",
      "Rahim Yar Khan",
      "Rawalpindi",
      "Sahiwal",
      "Sargodha",
      "Sheikhupura",
      "Sialkot",
    ],
  },
  {
    name: "Sindh",
    cities: [
      "Hyderabad",
      "Karachi",
      "Larkana",
      "Mirpur Khas",
      "Nawabshah",
      "Sukkur",
    ],
  },
  {
    name: "Khyber Pakhtunkhwa",
    cities: [
      "Abbottabad",
      "Dera Ismail Khan",
      "Kohat",
      "Mardan",
      "Mingora (Swat)",
      "Peshawar",
    ],
  },
  {
    name: "Balochistan",
    cities: ["Gwadar", "Khuzdar", "Quetta", "Turbat"],
  },
  {
    name: "Islamabad Capital Territory",
    cities: ["Islamabad"],
  },
  {
    name: "Gilgit-Baltistan",
    cities: ["Gilgit", "Skardu"],
  },
  {
    name: "Azad Jammu & Kashmir",
    cities: ["Mirpur (AJK)", "Muzaffarabad"],
  },
];

/** Cities for a province name, or an empty list when none is chosen yet. */
export function citiesFor(province: string): string[] {
  return PK_PROVINCES.find((p) => p.name === province)?.cities ?? [];
}

/** The province a city belongs to, so an existing address can preselect it. */
export function provinceForCity(city: string): string | null {
  const hit = PK_PROVINCES.find((p) => p.cities.includes(city));
  return hit ? hit.name : null;
}
