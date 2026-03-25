import { Request, Response } from "express";
import { storage } from "../storage";
import { insertUserSchema, loginSchema } from "../shared/schema";

export const authController = {
  // Register new user
  async register(req: Request, res: Response) {
    try {
      const validated = insertUserSchema.parse(req.body);

      const existingUser = await storage.findUserByEmail(validated.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await storage.createUser(validated);
      req.session.userId = (user as any)._id.toString();

      res.status(201).json({
        id: (user as any)._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  },

  // Login user
  async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);

      const user = await storage.findUserByEmail(validated.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValid = await storage.validatePassword(user, validated.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = (user as any)._id.toString();

      res.json({
        id: (user as any)._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid login data" });
    }
  },

  // Get current user
  async me(req: Request, res: Response) {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ user: null });
      }

      const user = await storage.findUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ user: null });
      }

      res.json({
        id: (user as any)._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Failed to check authentication" });
    }
  },

  // Logout user
  logout(req: Request, res: Response) {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  },
};
