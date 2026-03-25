import { Express } from "express";
import authRoutes from "./authRoutes";
import crowdRoutes from "./crowdRoutes";
import bookingRoutes from "./bookingRoutes";
import chatRoutes from "./chatRoutes";
import adminRoutes from "./adminRoutes";
import phase2Routes from "./phase2Routes";
import phase3Routes from "./phase3Routes";

export function registerRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/crowd", crowdRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/admin", adminRoutes);
  // Phase 2 Features: Festival, Weather, Routes, Parking
  app.use("/api/v2", phase2Routes);
  // Phase 3 Features: Emergency, Medical, Lost & Found
  app.use("/api/v3", phase3Routes);
}
