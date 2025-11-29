import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithGemini, analyzeCrowdTrend } from "./gemini";
import { insertBookingSchema, insertChatHistorySchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Crowd Management APIs
  app.get("/api/crowd/all", async (req, res) => {
    try {
      const data = await storage.getAllCrowdData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching crowd data:", error);
      res.status(500).json({ error: "Failed to fetch crowd data" });
    }
  });

  app.get("/api/crowd/:templeId", async (req, res) => {
    try {
      const { templeId } = req.params;
      const data = await storage.getCrowdDataByTemple(templeId);
      if (!data) {
        return res.status(404).json({ error: "Temple not found" });
      }
      res.json(data);
    } catch (error) {
      console.error("Error fetching temple crowd data:", error);
      res.status(500).json({ error: "Failed to fetch temple data" });
    }
  });

  app.get("/api/crowd/:templeId/history", async (req, res) => {
    try {
      const { templeId } = req.params;
      const hours = parseInt(req.query.hours as string) || 12;
      const history = await storage.getCrowdHistory(templeId, hours);
      res.json(history);
    } catch (error) {
      console.error("Error fetching crowd history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/crowd/:templeId/prediction", async (req, res) => {
    try {
      const { templeId } = req.params;
      const history = await storage.getCrowdHistory(templeId, 12);
      
      const formattedData = history.map(h => ({
        time: h.timestamp.toISOString(),
        visitors: h.visitorCount
      }));
      
      const prediction = await analyzeCrowdTrend(templeId, formattedData);
      res.json({ prediction });
    } catch (error) {
      console.error("Error generating prediction:", error);
      res.status(500).json({ error: "Failed to generate prediction" });
    }
  });

  // AI Chat APIs
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId required" });
      }

      // Get conversation history
      const history = await storage.getChatHistory(sessionId, 10);
      const conversationHistory = history.map(h => ({
        role: h.role,
        content: h.content
      }));

      // Save user message
      await storage.saveChatMessage({
        sessionId,
        role: "user",
        content: message
      });

      // Get AI response
      const aiResponse = await chatWithGemini(message, conversationHistory);

      // Save AI response
      await storage.saveChatMessage({
        sessionId,
        role: "assistant",
        content: aiResponse
      });

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.get("/api/chat/:sessionId/history", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const history = await storage.getChatHistory(sessionId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Booking APIs
  app.post("/api/bookings", async (req, res) => {
    try {
      const validated = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validated);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking error:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  app.get("/api/bookings/temple/:templeId", async (req, res) => {
    try {
      const { templeId } = req.params;
      const bookings = await storage.getBookingsByTemple(templeId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  return httpServer;
}
