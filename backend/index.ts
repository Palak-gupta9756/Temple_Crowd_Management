import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import { connectDB } from "./config/database";
import { registerRoutes } from "./routes";
import { logger } from "./middleware";

const app = express();
const httpServer = createServer(app);

// CORS for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Body parsers with increased limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Session middleware
app.use(
  session({
    name: "templeflow.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// Logger middleware
app.use(logger as any);

(async () => {
  await connectDB();

  // Register all routes
  registerRoutes(app);

  // Error handler
  app.use(((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  }) as any);

  const startPort = parseInt(process.env.PORT || "3000", 10);
  
  const startServer = (port: number, maxRetries = 5) => {
    httpServer.listen(port, () => {
      console.log(`✓ Backend server running on port ${port}`);
    });

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && maxRetries > 0) {
        console.log(`⚠ Port ${port} in use, trying ${port + 1}...`);
        httpServer.close();
        startServer(port + 1, maxRetries - 1);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  };

  startServer(startPort);

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n⏹ Shutting down server...");
    httpServer.close(() => {
      console.log("✓ Server closed");
      process.exit(0);
    });
    // Force exit after 5 seconds
    setTimeout(() => process.exit(0), 5000);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();
