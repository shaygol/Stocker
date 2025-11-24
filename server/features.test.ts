import { describe, expect, it } from "vitest";
import { parseListText, generateShareToken, getStoresForLocation, calculatePriceComparison } from "./utils";

describe("List Parsing", () => {
  it("parses newline-separated items", () => {
    const text = "Milk\nBread\nEggs\nButter";
    const items = parseListText(text);
    expect(items).toEqual(["Milk", "Bread", "Eggs", "Butter"]);
  });

  it("parses comma-separated items", () => {
    const text = "Milk, Bread, Eggs, Butter";
    const items = parseListText(text);
    expect(items).toEqual(["Milk", "Bread", "Eggs", "Butter"]);
  });

  it("removes bullet points", () => {
    const text = "• Milk\n• Bread\n• Eggs\n• Butter";
    const items = parseListText(text);
    expect(items).toEqual(["Milk", "Bread", "Eggs", "Butter"]);
  });

  it("removes numbered lists", () => {
    const text = "1. Milk\n2. Bread\n3. Eggs\n4. Butter";
    const items = parseListText(text);
    expect(items).toEqual(["Milk", "Bread", "Eggs", "Butter"]);
  });

  it("handles mixed delimiters", () => {
    const text = "Milk, Bread\nEggs; Butter";
    const items = parseListText(text);
    expect(items).toEqual(["Milk", "Bread", "Eggs", "Butter"]);
  });

  it("returns empty array for empty text", () => {
    const items = parseListText("");
    expect(items).toEqual([]);
  });

  it("filters out empty items", () => {
    const text = "Milk\n\n\nBread\n\nEggs";
    const items = parseListText(text);
    expect(items).toEqual(["Milk", "Bread", "Eggs"]);
  });
});

describe("Share Token Generation", () => {
  it("generates a unique token", () => {
    const token1 = generateShareToken();
    const token2 = generateShareToken();
    expect(token1).not.toBe(token2);
  });

  it("generates a token of reasonable length", () => {
    const token = generateShareToken();
    expect(token.length).toBeGreaterThan(20);
  });

  it("generates alphanumeric tokens", () => {
    const token = generateShareToken();
    expect(/^[a-z0-9]+$/.test(token)).toBe(true);
  });
});

describe("Store Location Detection", () => {
  it("returns stores for US", () => {
    const stores = getStoresForLocation("US");
    expect(stores).toContain("Walmart");
    expect(stores).toContain("Target");
    expect(stores.length).toBeGreaterThan(0);
  });

  it("returns stores for Israel", () => {
    const stores = getStoresForLocation("IL");
    expect(stores).toContain("Rami Levy");
    expect(stores).toContain("Mega");
    expect(stores.length).toBeGreaterThan(0);
  });

  it("returns city-specific stores when provided", () => {
    const stores = getStoresForLocation("IL", "Tel Aviv");
    expect(stores).toContain("Rami Levy");
  });

  it("returns default stores for unknown city", () => {
    const stores = getStoresForLocation("IL", "Unknown City");
    expect(stores).toContain("Rami Levy");
  });

  it("returns US stores for unknown country", () => {
    const stores = getStoresForLocation("XX");
    expect(stores).toContain("Walmart");
  });
});

describe("Price Comparison", () => {
  it("calculates price statistics correctly", () => {
    const prices = [
      { storeName: "Store A", price: 1000 }, // $10
      { storeName: "Store B", price: 1500 }, // $15
      { storeName: "Store C", price: 1200 }, // $12
    ];
    
    const comparison = calculatePriceComparison("Milk", prices);
    
    expect(comparison.itemName).toBe("Milk");
    expect(comparison.cheapestStore).toBe("Store A");
    expect(comparison.cheapestPrice).toBe(10);
    expect(comparison.mostExpensiveStore).toBe("Store B");
    expect(comparison.mostExpensivePrice).toBe(15);
    expect(comparison.averagePrice).toBeCloseTo(12.33, 1);
  });

  it("handles single price", () => {
    const prices = [{ storeName: "Store A", price: 1000 }];
    const comparison = calculatePriceComparison("Milk", prices);
    
    expect(comparison.cheapestStore).toBe("Store A");
    expect(comparison.mostExpensiveStore).toBe("Store A");
    expect(comparison.cheapestPrice).toBe(10);
    expect(comparison.mostExpensivePrice).toBe(10);
  });

  it("creates price by store mapping", () => {
    const prices = [
      { storeName: "Store A", price: 1000 },
      { storeName: "Store B", price: 1500 },
    ];
    
    const comparison = calculatePriceComparison("Milk", prices);
    
    expect(comparison.pricesByStore["Store A"]).toBe(10);
    expect(comparison.pricesByStore["Store B"]).toBe(15);
  });
});
