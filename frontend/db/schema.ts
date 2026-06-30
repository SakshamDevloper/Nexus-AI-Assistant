import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const memories = pgTable("memories", {
  id: serial().primaryKey(),
  key: text().notNull().unique(),
  value: text().notNull(),
  type: text().notNull().default("preference"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial().primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text(),
  name: text(),
  picture: text(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login").notNull().defaultNow(),
});

export const chatEvents = pgTable("chat_events", {
  id: serial().primaryKey(),
  role: text().notNull(),
  content: text().notNull(),
  tokenCount: integer("token_count"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
