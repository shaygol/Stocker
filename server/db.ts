import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, shoppingLists, InsertShoppingList, shoppingItems, InsertShoppingItem, itemPrices, InsertItemPrice, stores, InsertStore, listHistory, InsertListHistory, sharedLists, InsertSharedList } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLocation(userId: number, location: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ location }).where(eq(users.id, userId));
}

// Shopping List Queries
export async function getUserShoppingLists(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shoppingLists).where(eq(shoppingLists.userId, userId)).orderBy(desc(shoppingLists.updatedAt));
}

export async function getShoppingListById(listId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(shoppingLists).where(and(eq(shoppingLists.id, listId), eq(shoppingLists.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createShoppingList(data: InsertShoppingList) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(shoppingLists).values(data);
}

export async function updateShoppingList(listId: number, userId: number, data: Partial<InsertShoppingList>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(shoppingLists).set(data).where(and(eq(shoppingLists.id, listId), eq(shoppingLists.userId, userId)));
}

export async function deleteShoppingList(listId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete all items first
  await db.delete(shoppingItems).where(eq(shoppingItems.listId, listId));
  // Then delete the list
  await db.delete(shoppingLists).where(and(eq(shoppingLists.id, listId), eq(shoppingLists.userId, userId)));
}

// Shopping Item Queries
export async function getListItems(listId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shoppingItems).where(eq(shoppingItems.listId, listId)).orderBy(shoppingItems.createdAt);
}

export async function createShoppingItem(data: InsertShoppingItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(shoppingItems).values(data);
}

export async function updateShoppingItem(itemId: number, data: Partial<InsertShoppingItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(shoppingItems).set(data).where(eq(shoppingItems.id, itemId));
}

export async function deleteShoppingItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete associated prices first
  await db.delete(itemPrices).where(eq(itemPrices.itemId, itemId));
  // Then delete the item
  await db.delete(shoppingItems).where(eq(shoppingItems.id, itemId));
}

// Item Price Queries
export async function getItemPrices(itemId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(itemPrices).where(eq(itemPrices.itemId, itemId)).orderBy(itemPrices.recordedAt);
}

export async function addItemPrice(data: InsertItemPrice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(itemPrices).values(data);
}


// Store Queries
export async function getStoresByCountry(country: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stores).where(eq(stores.country, country));
}

export async function getStoresByCity(city: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stores).where(eq(stores.city, city));
}

export async function createStore(data: InsertStore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(stores).values(data);
}

// List History Queries
export async function getUserListHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listHistory).where(eq(listHistory.userId, userId)).orderBy(desc(listHistory.createdAt));
}

export async function addToListHistory(data: InsertListHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(listHistory).values(data);
}

// Shared List Queries
export async function createSharedList(data: InsertSharedList) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(sharedLists).values(data);
}

export async function getSharedListByToken(shareToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sharedLists).where(eq(sharedLists.shareToken, shareToken)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
