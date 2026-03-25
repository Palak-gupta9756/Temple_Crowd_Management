import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Extend Express Request to include session
declare module "express" {
  interface Request {
    session: {
      userId?: string;
      destroy: (callback?: (err?: Error) => void) => void;
      save: (callback?: (err?: Error) => void) => void;
    };
    user?: any;
  }
}

// Check if user is authenticated
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await storage.findUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
};

// Optional auth - doesn't fail if not authenticated
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session?.userId) {
      const user = await storage.findUserById(req.session.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    next();
  }
};
