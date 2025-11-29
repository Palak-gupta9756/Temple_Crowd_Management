import { db } from "./db";
import { 
  crowdData, 
  chatHistory, 
  bookings,
  type InsertCrowdData,
  type CrowdData,
  type InsertChatHistory,
  type ChatHistory,
  type InsertBooking,
  type Booking
} from "@shared/schema";
import { desc, eq, and, gte } from "drizzle-orm";

export interface IStorage {
  // Crowd Management
  getCrowdDataByTemple(templeId: string): Promise<CrowdData | undefined>;
  getAllCrowdData(): Promise<CrowdData[]>;
  updateCrowdData(data: InsertCrowdData): Promise<CrowdData>;
  getCrowdHistory(templeId: string, hoursAgo: number): Promise<CrowdData[]>;
  
  // Chat
  saveChatMessage(message: InsertChatHistory): Promise<ChatHistory>;
  getChatHistory(sessionId: string, limit?: number): Promise<ChatHistory[]>;
  
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByTemple(templeId: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
}

export class DatabaseStorage implements IStorage {
  // Crowd Management
  async getCrowdDataByTemple(templeId: string): Promise<CrowdData | undefined> {
    const result = await db
      .select()
      .from(crowdData)
      .where(eq(crowdData.templeId, templeId))
      .orderBy(desc(crowdData.timestamp))
      .limit(1);
    return result[0];
  }

  async getAllCrowdData(): Promise<CrowdData[]> {
    const latest = await db
      .select()
      .from(crowdData)
      .orderBy(desc(crowdData.timestamp));
    
    // Get only the latest entry for each temple
    const temples = new Map<string, CrowdData>();
    for (const entry of latest) {
      if (!temples.has(entry.templeId)) {
        temples.set(entry.templeId, entry);
      }
    }
    return Array.from(temples.values());
  }

  async updateCrowdData(data: InsertCrowdData): Promise<CrowdData> {
    const result = await db
      .insert(crowdData)
      .values(data)
      .returning();
    return result[0];
  }

  async getCrowdHistory(templeId: string, hoursAgo: number): Promise<CrowdData[]> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hoursAgo);
    
    return await db
      .select()
      .from(crowdData)
      .where(
        and(
          eq(crowdData.templeId, templeId),
          gte(crowdData.timestamp, cutoff)
        )
      )
      .orderBy(crowdData.timestamp);
  }

  // Chat
  async saveChatMessage(message: InsertChatHistory): Promise<ChatHistory> {
    const result = await db
      .insert(chatHistory)
      .values(message)
      .returning();
    return result[0];
  }

  async getChatHistory(sessionId: string, limit: number = 20): Promise<ChatHistory[]> {
    return await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.sessionId, sessionId))
      .orderBy(chatHistory.timestamp)
      .limit(limit);
  }

  // Bookings
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return result[0];
  }

  async getBookingsByTemple(templeId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.templeId, templeId))
      .orderBy(desc(bookings.createdAt));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));
  }
}

export const storage = new DatabaseStorage();
