import { Request, Response } from "express";
import { storage } from "../storage";
import { chatWithGemini } from "../services/geminiService";

export const chatController = {
  // Send chat message
  async sendMessage(req: Request, res: Response) {
    try {
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId required" });
      }

      // Get conversation history
      const history = await storage.getChatHistory(sessionId, 10);
      const conversationHistory = history.map((h) => ({
        role: h.role,
        content: h.content,
      }));

      // Save user message
      await storage.saveChatMessage({
        sessionId,
        role: "user",
        content: message,
      });

      // Get AI response
      const aiResponse = await chatWithGemini(message, conversationHistory);

      // Save AI response
      await storage.saveChatMessage({
        sessionId,
        role: "assistant",
        content: aiResponse,
      });

      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  },

  // Get chat history
  async getHistory(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const history = await storage.getChatHistory(sessionId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  },
};
