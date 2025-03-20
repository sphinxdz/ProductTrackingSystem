import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Product caliber schema
export const calibers = pgTable("calibers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const insertCaliberSchema = createInsertSchema(calibers).omit({
  id: true,
});

export type Caliber = typeof calibers.$inferSelect;
export type InsertCaliber = z.infer<typeof insertCaliberSchema>;

// Store schema
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  location: text("location"),
  manager: text("manager"),
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  storeId: integer("store_id").notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

// Tool schema
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  maxDailyConsumption: decimal("max_daily_consumption").notNull(),
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
});

export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  caliberId: integer("caliber_id").notNull(),
  description: text("description"),
  unit: text("unit").notNull().default("kg"),
  stock: decimal("stock").notNull().default("0"),
  storeId: integer("store_id").notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Consumption schema
export const consumptions = pgTable("consumptions", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  clientId: integer("client_id").notNull(),
  productId: integer("product_id").notNull(),
  toolId: integer("tool_id").notNull(),
  quantity: decimal("quantity").notNull(),
  storeId: integer("store_id").notNull(),
});

export const insertConsumptionSchema = createInsertSchema(consumptions).omit({
  id: true,
  date: true,
});

export type Consumption = typeof consumptions.$inferSelect;
export type InsertConsumption = z.infer<typeof insertConsumptionSchema>;

// Alert schema
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  type: text("type").notNull(), // 'critical', 'warning', 'info'
  message: text("message").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  entityType: text("entity_type").notNull(), // 'product', 'tool', 'store', etc.
  entityId: integer("entity_id").notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  date: true,
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  type: text("type").notNull(), // 'order', 'consumption', 'alert', etc.
  message: text("message").notNull(),
  entityType: text("entity_type"), // 'product', 'tool', 'store', 'client' etc.
  entityId: integer("entity_id"),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  date: true,
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Dashboard statistics type
export type DashboardStats = {
  totalProducts: number;
  totalClients: number;
  totalTools: number;
  dailyConsumption: string;
  productIncrease: string;
  clientIncrease: string;
  toolIncrease: string;
  consumptionDecrease: string;
};

// Consumption by store type
export type ConsumptionByStore = {
  storeId: number;
  storeName: string;
  consumption: number;
};

// Consumption by caliber type
export type ConsumptionByCaliber = {
  caliberId: number;
  caliberName: string;
  consumption: number;
  percentage: number;
  color: string;
};
