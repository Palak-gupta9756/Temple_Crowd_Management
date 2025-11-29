import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const crowdData = pgTable("crowd_data", {
  id: serial("id").primaryKey(),
  templeId: varchar("temple_id", { length: 50 }).notNull(),
  templeName: varchar("temple_name", { length: 100 }).notNull(),
  currentWaitTime: integer("current_wait_time").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  visitorCount: integer("visitor_count").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  templeId: varchar("temple_id", { length: 50 }).notNull(),
  templeName: varchar("temple_name", { length: 100 }).notNull(),
  visitorName: varchar("visitor_name", { length: 100 }).notNull(),
  visitorPhone: varchar("visitor_phone", { length: 15 }).notNull(),
  visitorEmail: varchar("visitor_email", { length: 100 }),
  visitDate: varchar("visit_date", { length: 20 }).notNull(),
  timeSlot: varchar("time_slot", { length: 50 }).notNull(),
  numberOfVisitors: integer("number_of_visitors").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrowdDataSchema = createInsertSchema(crowdData).omit({
  id: true,
  timestamp: true,
});

export const insertChatHistorySchema = createInsertSchema(chatHistory).omit({
  id: true,
  timestamp: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export type InsertCrowdData = z.infer<typeof insertCrowdDataSchema>;
export type CrowdData = typeof crowdData.$inferSelect;

export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type ChatHistory = typeof chatHistory.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
