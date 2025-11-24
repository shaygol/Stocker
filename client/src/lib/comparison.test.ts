import { describe, expect, it } from "vitest";
import {
  calculateItemStats,
  calculateStoreTotals,
  findCheapestStore,
  findMostExpensiveStore,
  calculateSavings,
  formatPrice,
  formatPercent,
  getPriceColor,
} from "./comparison";

describe("Price Comparison Utilities", () => {
  describe("calculateItemStats", () => {
    it("calculates statistics for item prices", () => {
      const prices = [
        { storeName: "Store A", price: 10 },
        { storeName: "Store B", price: 15 },
        { storeName: "Store C", price: 12 },
      ];

      const stats = calculateItemStats(prices);

      expect(stats.cheapestStore).toBe("Store A");
      expect(stats.cheapestPrice).toBe(10);
      expect(stats.mostExpensiveStore).toBe("Store B");
      expect(stats.mostExpensivePrice).toBe(15);
      expect(stats.averagePrice).toBeCloseTo(12.33, 1);
      expect(stats.savings).toBe(5);
      expect(stats.savingsPercent).toBeCloseTo(33.33, 1);
    });

    it("handles empty prices array", () => {
      const stats = calculateItemStats([]);

      expect(stats.cheapestStore).toBe("-");
      expect(stats.cheapestPrice).toBe(0);
      expect(stats.mostExpensiveStore).toBe("-");
      expect(stats.mostExpensivePrice).toBe(0);
      expect(stats.averagePrice).toBe(0);
      expect(stats.savings).toBe(0);
      expect(stats.savingsPercent).toBe(0);
    });

    it("handles single price", () => {
      const prices = [{ storeName: "Store A", price: 10 }];

      const stats = calculateItemStats(prices);

      expect(stats.cheapestStore).toBe("Store A");
      expect(stats.mostExpensiveStore).toBe("Store A");
      expect(stats.savings).toBe(0);
    });
  });

  describe("calculateStoreTotals", () => {
    it("calculates total costs by store", () => {
      const items = [
        {
          itemId: 1,
          itemName: "Milk",
          quantity: 2,
          prices: [
            { storeName: "Store A", price: 3 },
            { storeName: "Store B", price: 4 },
          ],
        },
        {
          itemId: 2,
          itemName: "Bread",
          quantity: 1,
          prices: [
            { storeName: "Store A", price: 2 },
            { storeName: "Store B", price: 2.5 },
          ],
        },
      ];

      const totals = calculateStoreTotals(items, ["Store A", "Store B"]);

      expect(totals["Store A"].totalCost).toBe(8); // (3*2) + (2*1)
      expect(totals["Store B"].totalCost).toBe(10.5); // (4*2) + (2.5*1)
      expect(totals["Store A"].itemCount).toBe(2);
      expect(totals["Store B"].itemCount).toBe(2);
    });

    it("handles missing prices for some stores", () => {
      const items = [
        {
          itemId: 1,
          itemName: "Milk",
          quantity: 1,
          prices: [{ storeName: "Store A", price: 3 }],
        },
      ];

      const totals = calculateStoreTotals(items, ["Store A", "Store B"]);

      expect(totals["Store A"].totalCost).toBe(3);
      expect(totals["Store B"].totalCost).toBe(0);
      expect(totals["Store B"].itemCount).toBe(0);
    });
  });

  describe("findCheapestStore", () => {
    it("finds the cheapest store", () => {
      const storeTotals = {
        "Store A": { storeName: "Store A", totalCost: 50, itemCount: 5, averageItemPrice: 10 },
        "Store B": { storeName: "Store B", totalCost: 45, itemCount: 5, averageItemPrice: 9 },
        "Store C": { storeName: "Store C", totalCost: 55, itemCount: 5, averageItemPrice: 11 },
      };

      const cheapest = findCheapestStore(storeTotals);

      expect(cheapest?.store).toBe("Store B");
      expect(cheapest?.cost).toBe(45);
    });

    it("returns null for empty totals", () => {
      const cheapest = findCheapestStore({});

      expect(cheapest).toBeNull();
    });
  });

  describe("findMostExpensiveStore", () => {
    it("finds the most expensive store", () => {
      const storeTotals = {
        "Store A": { storeName: "Store A", totalCost: 50, itemCount: 5, averageItemPrice: 10 },
        "Store B": { storeName: "Store B", totalCost: 45, itemCount: 5, averageItemPrice: 9 },
        "Store C": { storeName: "Store C", totalCost: 55, itemCount: 5, averageItemPrice: 11 },
      };

      const mostExpensive = findMostExpensiveStore(storeTotals);

      expect(mostExpensive?.store).toBe("Store C");
      expect(mostExpensive?.cost).toBe(55);
    });
  });

  describe("calculateSavings", () => {
    it("calculates potential savings", () => {
      const storeTotals = {
        "Store A": { storeName: "Store A", totalCost: 50, itemCount: 5, averageItemPrice: 10 },
        "Store B": { storeName: "Store B", totalCost: 45, itemCount: 5, averageItemPrice: 9 },
        "Store C": { storeName: "Store C", totalCost: 55, itemCount: 5, averageItemPrice: 11 },
      };

      const savings = calculateSavings(storeTotals);

      expect(savings.amount).toBe(10); // 55 - 45
      expect(savings.percent).toBeCloseTo(18.18, 1); // (10/55)*100
    });

    it("returns zero savings for empty totals", () => {
      const savings = calculateSavings({});

      expect(savings.amount).toBe(0);
      expect(savings.percent).toBe(0);
    });
  });

  describe("formatPrice", () => {
    it("formats price as currency", () => {
      expect(formatPrice(10)).toBe("$10.00");
      expect(formatPrice(10.5)).toBe("$10.50");
      expect(formatPrice(0.99)).toBe("$0.99");
    });
  });

  describe("formatPercent", () => {
    it("formats percentage with one decimal", () => {
      expect(formatPercent(33.333)).toBe("33.3%");
      expect(formatPercent(50)).toBe("50.0%");
      expect(formatPercent(0)).toBe("0.0%");
    });
  });

  describe("getPriceColor", () => {
    it("returns green for low prices", () => {
      expect(getPriceColor(10, 10, 30)).toBe("green");
      expect(getPriceColor(15, 10, 30)).toBe("green");
    });

    it("returns yellow for medium prices", () => {
      expect(getPriceColor(20, 10, 30)).toBe("yellow");
    });

    it("returns red for high prices", () => {
      expect(getPriceColor(25, 10, 30)).toBe("red");
      expect(getPriceColor(30, 10, 30)).toBe("red");
    });

    it("handles zero range", () => {
      expect(getPriceColor(10, 10, 10)).toBe("green");
    });
  });
});
