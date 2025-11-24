import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  location: varchar("location", { length: 255 }), // User's city/location for store detection
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const shoppingLists = mysqlTable("shopping_lists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = typeof shoppingLists.$inferInsert;

export const shoppingItems = mysqlTable("shopping_items", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unit: varchar("unit", { length: 50 }),
  notes: text("notes"),
  isPurchased: int("isPurchased").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShoppingItem = typeof shoppingItems.$inferSelect;
export type InsertShoppingItem = typeof shoppingItems.$inferInsert;

export const itemPrices = mysqlTable("item_prices", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("itemId").notNull(),
  storeName: varchar("storeName", { length: 255 }).notNull(),
  price: int("price").notNull(), // Store price in cents to avoid decimal issues
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type ItemPrice = typeof itemPrices.$inferSelect;
export type InsertItemPrice = typeof itemPrices.$inferInsert;

// Update users table to include language and location
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }),
  latitude: int("latitude"),
  longitude: int("longitude"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

export const listHistory = mysqlTable("list_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  listId: int("listId"),
  name: varchar("name", { length: 255 }).notNull(),
  itemCount: int("itemCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ListHistory = typeof listHistory.$inferSelect;
export type InsertListHistory = typeof listHistory.$inferInsert;

export const sharedLists = mysqlTable("shared_lists", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(),
  shareToken: varchar("shareToken", { length: 64 }).notNull().unique(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type SharedList = typeof sharedLists.$inferSelect;
export type InsertSharedList = typeof sharedLists.$inferInsert;