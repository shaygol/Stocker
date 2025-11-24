/**
 * Price comparison utilities for the shopping list app
 */

export interface StorePrice {
  storeName: string;
  price: number; // in dollars
}

export interface ItemComparison {
  itemId: number;
  itemName: string;
  quantity: number;
  unit?: string;
  prices: StorePrice[];
}

export interface StoreSummary {
  storeName: string;
  totalCost: number;
  itemCount: number;
  averageItemPrice: number;
}

export interface ComparisonStats {
  cheapestStore: string;
  cheapestPrice: number;
  mostExpensiveStore: string;
  mostExpensivePrice: number;
  averagePrice: number;
  savings: number;
  savingsPercent: number;
}

/**
 * Calculate comparison statistics for a single item
 */
export function calculateItemStats(prices: StorePrice[]): ComparisonStats {
  if (prices.length === 0) {
    return {
      cheapestStore: "-",
      cheapestPrice: 0,
      mostExpensiveStore: "-",
      mostExpensivePrice: 0,
      averagePrice: 0,
      savings: 0,
      savingsPercent: 0,
    };
  }

  const sortedByPrice = [...prices].sort((a, b) => a.price - b.price);
  const cheapest = sortedByPrice[0];
  const mostExpensive = sortedByPrice[sortedByPrice.length - 1];
  const average = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
  const savings = mostExpensive.price - cheapest.price;
  const savingsPercent = (savings / mostExpensive.price) * 100;

  return {
    cheapestStore: cheapest.storeName,
    cheapestPrice: cheapest.price,
    mostExpensiveStore: mostExpensive.storeName,
    mostExpensivePrice: mostExpensive.price,
    averagePrice: average,
    savings,
    savingsPercent,
  };
}

/**
 * Calculate total cost by store for multiple items
 */
export function calculateStoreTotals(
  items: ItemComparison[],
  stores: string[]
): Record<string, StoreSummary> {
  const totals: Record<string, StoreSummary> = {};

  stores.forEach((store) => {
    let totalCost = 0;
    let itemCount = 0;

    items.forEach((item) => {
      const storePrice = item.prices.find((p) => p.storeName === store);
      if (storePrice) {
        totalCost += storePrice.price * item.quantity;
        itemCount++;
      }
    });

    totals[store] = {
      storeName: store,
      totalCost,
      itemCount,
      averageItemPrice: itemCount > 0 ? totalCost / itemCount : 0,
    };
  });

  return totals;
}

/**
 * Find the cheapest store for a given list of items
 */
export function findCheapestStore(
  storeTotals: Record<string, StoreSummary>
): { store: string; cost: number } | null {
  const entries = Object.entries(storeTotals);
  if (entries.length === 0) return null;

  let cheapest = entries[0];
  for (let i = 1; i < entries.length; i++) {
    if (entries[i][1].totalCost < cheapest[1].totalCost) {
      cheapest = entries[i];
    }
  }

  return {
    store: cheapest[0],
    cost: cheapest[1].totalCost,
  };
}

/**
 * Find the most expensive store
 */
export function findMostExpensiveStore(
  storeTotals: Record<string, StoreSummary>
): { store: string; cost: number } | null {
  const entries = Object.entries(storeTotals);
  if (entries.length === 0) return null;

  let mostExpensive = entries[0];
  for (let i = 1; i < entries.length; i++) {
    if (entries[i][1].totalCost > mostExpensive[1].totalCost) {
      mostExpensive = entries[i];
    }
  }

  return {
    store: mostExpensive[0],
    cost: mostExpensive[1].totalCost,
  };
}

/**
 * Calculate potential savings
 */
export function calculateSavings(
  storeTotals: Record<string, StoreSummary>
): { amount: number; percent: number } {
  const cheapest = findCheapestStore(storeTotals);
  const mostExpensive = findMostExpensiveStore(storeTotals);

  if (!cheapest || !mostExpensive) {
    return { amount: 0, percent: 0 };
  }

  const amount = mostExpensive.cost - cheapest.cost;
  const percent = (amount / mostExpensive.cost) * 100;

  return { amount, percent };
}

/**
 * Format price as currency
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Format percentage
 */
export function formatPercent(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

/**
 * Get color for price indicator
 */
export function getPriceColor(
  price: number,
  min: number,
  max: number
): "green" | "yellow" | "red" {
  const range = max - min;
  const position = price - min;
  const percent = range > 0 ? position / range : 0;

  if (percent < 0.33) return "green";
  if (percent < 0.67) return "yellow";
  return "red";
}
