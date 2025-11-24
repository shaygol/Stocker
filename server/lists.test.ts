import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Shopping Lists", () => {
  it("creates a new shopping list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lists.create({
      name: "Test Groceries",
      description: "Weekly shopping",
    });

    expect(Array.isArray(result)).toBe(true);
    const createdList = result.find((list) => list.name === "Test Groceries");
    expect(createdList).toBeDefined();
    expect(createdList?.description).toBe("Weekly shopping");
  });

  it("retrieves all shopping lists for a user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const lists = await caller.lists.getAll();
    expect(Array.isArray(lists)).toBe(true);
  });

  it("creates and retrieves a specific list by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const allLists = await caller.lists.create({
      name: "Test List for Retrieval",
      description: "Test description",
    });

    const createdList = allLists.find((list) => list.name === "Test List for Retrieval");
    expect(createdList).toBeDefined();

    if (createdList) {
      const retrievedList = await caller.lists.getById({ id: createdList.id });
      expect(retrievedList).toBeDefined();
      expect(retrievedList?.name).toBe("Test List for Retrieval");
    }
  });
});

describe("Shopping Items", () => {
  it("adds an item to a shopping list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const allLists = await caller.lists.create({
      name: "List for Items Test",
    });

    const list = allLists.find((l) => l.name === "List for Items Test");
    expect(list).toBeDefined();

    if (list) {
      const items = await caller.items.create({
        listId: list.id,
        name: "Milk",
        quantity: 2,
        unit: "gallons",
      });

      expect(Array.isArray(items)).toBe(true);
      const createdItem = items.find((item) => item.name === "Milk");
      expect(createdItem).toBeDefined();
      expect(createdItem?.quantity).toBe(2);
      expect(createdItem?.unit).toBe("gallons");
    }
  });

  it("retrieves items for a specific list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const allLists = await caller.lists.create({
      name: "List for Item Retrieval",
    });

    const list = allLists.find((l) => l.name === "List for Item Retrieval");
    expect(list).toBeDefined();

    if (list) {
      await caller.items.create({
        listId: list.id,
        name: "Bread",
        quantity: 1,
      });

      const items = await caller.items.getByListId({ listId: list.id });
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    }
  });

  it("updates an item's purchased status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const allLists = await caller.lists.create({
      name: "List for Update Test",
    });

    const list = allLists.find((l) => l.name === "List for Update Test");
    expect(list).toBeDefined();

    if (list) {
      const items = await caller.items.create({
        listId: list.id,
        name: "Eggs",
        quantity: 12,
      });

      const item = items.find((i) => i.name === "Eggs");
      expect(item).toBeDefined();

      if (item) {
        const updatedItems = await caller.items.update({
          id: item.id,
          listId: list.id,
          isPurchased: 1,
        });

        const updatedItem = updatedItems.find((i) => i.id === item.id);
        expect(updatedItem?.isPurchased).toBe(1);
      }
    }
  });
});

describe("Price Tracking", () => {
  it("adds price information for an item", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const allLists = await caller.lists.create({
      name: "List for Price Test",
    });

    const list = allLists.find((l) => l.name === "List for Price Test");
    expect(list).toBeDefined();

    if (list) {
      const items = await caller.items.create({
        listId: list.id,
        name: "Apples",
        quantity: 5,
      });

      const item = items.find((i) => i.name === "Apples");
      expect(item).toBeDefined();

      if (item) {
        const prices = await caller.prices.add({
          itemId: item.id,
          storeName: "Walmart",
          price: 399, // $3.99 in cents
          currency: "USD",
        });

        expect(Array.isArray(prices)).toBe(true);
        const addedPrice = prices.find((p) => p.storeName === "Walmart");
        expect(addedPrice).toBeDefined();
        expect(addedPrice?.price).toBe(399);
      }
    }
  });

  it("retrieves prices for an item", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const allLists = await caller.lists.create({
      name: "List for Price Retrieval",
    });

    const list = allLists.find((l) => l.name === "List for Price Retrieval");
    expect(list).toBeDefined();

    if (list) {
      const items = await caller.items.create({
        listId: list.id,
        name: "Bananas",
        quantity: 1,
      });

      const item = items.find((i) => i.name === "Bananas");
      expect(item).toBeDefined();

      if (item) {
        await caller.prices.add({
          itemId: item.id,
          storeName: "Target",
          price: 299,
          currency: "USD",
        });

        const prices = await caller.prices.getByItemId({ itemId: item.id });
        expect(Array.isArray(prices)).toBe(true);
        expect(prices.length).toBeGreaterThan(0);
      }
    }
  });
});
