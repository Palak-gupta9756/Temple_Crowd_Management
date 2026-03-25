import { z } from "zod";

// ============ AUTH SCHEMAS ============

// Zod schema for user registration
export const insertUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  phone: z.string().max(15),
  password: z.string().min(6).max(100),
});

// Zod schema for login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;

// ============ CROWD DATA SCHEMAS ============
export const insertCrowdDataSchema = z.object({
  templeId: z.string().max(50),
  templeName: z.string().max(100),
  currentWaitTime: z.number().int(),
  status: z.string().max(20),
  visitorCount: z.number().int(),
});

// Face detection crowd capture schema
export const faceDetectionSchema = z.object({
  templeId: z.string().max(50),
  faceCount: z.number().int().min(0),
  cameraId: z.string().max(50).optional(),
  timestamp: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type FaceDetectionData = z.infer<typeof faceDetectionSchema>;

export const insertChatHistorySchema = z.object({
  sessionId: z.string().max(100),
  role: z.string().max(20),
  content: z.string(),
});

export const insertBookingSchema = z.object({
  userId: z.string().max(50),
  templeId: z.string().max(50),
  templeName: z.string().max(100),
  darshanType: z.enum(["General", "Special", "VIP"]),
  visitDate: z.string().max(20),
  timeSlot: z.string().max(50),
  numberOfDevotees: z.number().int().min(1),
  purpose: z.enum(["Darshan", "Puja", "Abhishekam", "Donation"]),
  priestName: z.string().max(100).optional(),
  devotees: z.array(z.object({
    name: z.string().max(100),
    age: z.number().int().min(0).max(150),
    gender: z.enum(["Male", "Female", "Other"]),
    photoUrl: z.string(), // Base64 images can be very long
    idProof: z.object({
      idType: z.enum(["Aadhaar", "Passport", "Voter ID"]),
      idNumber: z.string().max(50),
      idFileUrl: z.string(), // Base64 images can be very long
    }),
  })).min(1),
  bookingStatus: z.enum(["Pending", "Confirmed", "Cancelled"]).default("Pending"),
  qrCode: z.string().optional(),
});

// TypeScript types
export type InsertCrowdData = z.infer<typeof insertCrowdDataSchema>;
export type InsertChatHistory = z.infer<typeof insertChatHistorySchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
