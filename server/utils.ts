/**
 * Utility functions for shopping list processing
 */

/**
 * Parse a pasted list text into individual items
 * Handles various formats: comma-separated, newline-separated, bullet points, etc.
 */
export function parseListText(text: string): string[] {
  if (!text || !text.trim()) return [];

  // Split by common delimiters
  let items = text
    .split(/[\n,;]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Remove bullet points, dashes, and numbers at the start
  items = items.map((item) => {
    return item
      .replace(/^[-•*]\s*/, "") // Remove bullet points
      .replace(/^\d+[\.\)]\s*/, "") // Remove numbered lists
      .replace(/^[\[\(]\s*/, "") // Remove brackets
      .trim();
  });

  // Filter out empty items
  return items.filter((item) => item.length > 0);
}

/**
 * Generate a unique share token for a shopping list
 */
export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Store database with major retailers by country/region
 * This is a sample dataset - in production, this would be more comprehensive
 */
export const STORE_DATABASE: Record<string, Record<string, string[]>> = {
  US: {
    default: ["Walmart", "Target", "Costco", "Whole Foods", "Kroger", "Safeway"],
    CA: ["Whole Foods", "Trader Joe's", "Sprouts", "Safeway"],
    TX: ["HEB", "Walmart", "Target"],
    NY: ["Whole Foods", "Trader Joe's", "Key Food"],
  },
  IL: {
    default: ["Rami Levy", "Tiv Taam", "Mega", "Yochananof", "Osher Ad"],
    "Tel Aviv": ["Rami Levy", "Tiv Taam", "Mega"],
    Jerusalem: ["Rami Levy", "Mega", "Yochananof"],
  },
  GB: {
    default: ["Tesco", "Sainsbury's", "Asda", "Morrisons", "Waitrose"],
  },
  DE: {
    default: ["Edeka", "Rewe", "Aldi", "Lidl", "Kaufland"],
  },
  FR: {
    default: ["Carrefour", "Auchan", "Leclerc", "Monoprix", "Casino"],
  },
};

/**
 * Get available stores for a given location
 * @param country - Country code (e.g., 'US', 'IL', 'GB')
 * @param city - City name (optional)
 * @returns Array of store names available in that location
 */
export function getStoresForLocation(country: string, city?: string): string[] {
  const countryData = STORE_DATABASE[country];
  if (!countryData) {
    return STORE_DATABASE.US?.default || [];
  }

  if (city && countryData[city]) {
    return countryData[city];
  }

  return countryData.default || [];
}

/**
 * Detect country from location coordinates or IP
 * This is a simplified version - in production, use a proper geolocation service
 */
export function detectCountryFromLocation(latitude?: number, longitude?: number): string {
  // Simplified detection based on coordinates
  if (latitude !== undefined && longitude !== undefined) {
    // Israel coordinates: ~31.5°N, ~34.5°E
    if (latitude >= 29 && latitude <= 34 && longitude >= 33 && longitude <= 36) {
      return "IL";
    }
    // US coordinates
    if (latitude >= 24 && latitude <= 50 && longitude >= -125 && longitude <= -66) {
      return "US";
    }
    // UK coordinates
    if (latitude >= 50 && latitude <= 59 && longitude >= -8 && longitude <= 2) {
      return "GB";
    }
    // Germany coordinates
    if (latitude >= 47 && latitude <= 55 && longitude >= 6 && longitude <= 15) {
      return "DE";
    }
    // France coordinates
    if (latitude >= 42 && latitude <= 51 && longitude >= -5 && longitude <= 8) {
      return "FR";
    }
  }

  return "US"; // Default to US
}

/**
 * Calculate price comparison statistics
 */
export interface PriceComparison {
  itemName: string;
  cheapestStore: string;
  cheapestPrice: number;
  mostExpensiveStore: string;
  mostExpensivePrice: number;
  averagePrice: number;
  pricesByStore: Record<string, number>;
}

export function calculatePriceComparison(
  itemName: string,
  prices: Array<{ storeName: string; price: number }>
): PriceComparison {
  const pricesByStore: Record<string, number> = {};
  const priceValues: number[] = [];

  prices.forEach(({ storeName, price }) => {
    pricesByStore[storeName] = price / 100; // Convert from cents to dollars
    priceValues.push(price);
  });

  const sortedPrices = priceValues.sort((a, b) => a - b);
  const cheapestPrice = sortedPrices[0] / 100;
  const mostExpensivePrice = sortedPrices[sortedPrices.length - 1] / 100;
  const averagePrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length / 100;

  const cheapestEntry = prices.find((p) => p.price === sortedPrices[0]);
  const mostExpensiveEntry = prices.find((p) => p.price === sortedPrices[sortedPrices.length - 1]);

  return {
    itemName,
    cheapestStore: cheapestEntry?.storeName || "",
    cheapestPrice,
    mostExpensiveStore: mostExpensiveEntry?.storeName || "",
    mostExpensivePrice,
    averagePrice,
    pricesByStore,
  };
}
