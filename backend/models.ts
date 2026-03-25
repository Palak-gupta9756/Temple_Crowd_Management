import mongoose, { Schema, Document } from "mongoose";

// ============ MONGOOSE INTERFACES ============

// Phase 3: Lost & Found Interfaces
export interface ILostItem extends Document {
  templeId: string;
  category: "bag" | "wallet" | "phone" | "jewelry" | "document" | "keys" | "footwear" | "clothing" | "other";
  description: string;
  color?: string;
  brand?: string;
  reportedAt: Date;
  foundAt?: string;
  imageUrl?: string;
  status: "lost" | "found" | "claimed" | "expired";
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  finderName?: string;
  finderPhone?: string;
  claimDetails?: {
    claimedAt: Date;
    claimedBy: string;
    verificationMethod: string;
  };
  additionalDetails?: string;
}

export interface IFoundItem extends Document {
  templeId: string;
  category: "bag" | "wallet" | "phone" | "jewelry" | "document" | "keys" | "footwear" | "clothing" | "other";
  description: string;
  color?: string;
  foundLocation: string;
  foundAt: Date;
  imageUrl?: string;
  status: "awaiting-claim" | "claimed" | "donated" | "disposed";
  finderName?: string;
  finderPhone?: string;
  storedAt: string;
  expiryDate: Date;
  claimDetails?: {
    claimedAt: Date;
    claimedBy: string;
    claimedByPhone: string;
    verificationMethod: string;
  };
  additionalDetails?: string;
}

export interface IPanicAlert extends Document {
  templeId: string;
  alertType: "panic" | "medical" | "fire" | "crowd" | "suspicious";
  location: string;
  coordinates?: { x: number; y: number };
  reporterName?: string;
  reporterPhone?: string;
  description?: string;
  status: "active" | "responding" | "resolved" | "false-alarm";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  resolvedAt?: Date;
  responseNotes?: string;
}

export interface IMedicalRequest extends Document {
  templeId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  contactPhone: string;
  location: string;
  coordinates?: { x: number; y: number };
  emergencyType: "cardiac" | "breathing" | "injury" | "fainting" | "heat-stroke" | "other";
  description: string;
  status: "pending" | "dispatched" | "treating" | "resolved" | "hospital-transfer";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  respondedAt?: Date;
  resolvedAt?: Date;
  responseNotes?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  createdAt: Date;
}

export interface ICrowdData extends Document {
  templeId: string;
  templeName: string;
  currentWaitTime: number;
  status: string;
  visitorCount: number;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  sessionId: string;
  role: string;
  content: string;
  timestamp: Date;
}

export interface IBooking extends Document {
  userId: string;
  templeId: string;
  templeName: string;
  darshanType: string;
  visitDate: string;
  timeSlot: string;
  numberOfDevotees: number;
  purpose: string;
  priestName?: string;
  devotees: Array<{
    name: string;
    age: number;
    gender: string;
    photoUrl: string;
    idProof: {
      idType: string;
      idNumber: string;
      idFileUrl: string;
    };
  }>;
  bookingStatus: string;
  qrCode?: string;
  createdAt: Date;
}

// ============ MONGOOSE SCHEMAS ============

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, maxlength: 100 },
  phone: { type: String, required: true, maxlength: 15 },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["user", "admin"] },
  createdAt: { type: Date, default: Date.now },
});

const CrowdDataSchema = new Schema<ICrowdData>({
  templeId: { type: String, required: true, maxlength: 50 },
  templeName: { type: String, required: true, maxlength: 100 },
  currentWaitTime: { type: Number, required: true },
  status: { type: String, required: true, maxlength: 20 },
  visitorCount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatHistorySchema = new Schema<IChatHistory>({
  sessionId: { type: String, required: true, maxlength: 100 },
  role: { type: String, required: true, maxlength: 20 },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const BookingSchema = new Schema<IBooking>({
  userId: { type: String, required: true, maxlength: 50 },
  templeId: { type: String, required: true, maxlength: 50 },
  templeName: { type: String, required: true, maxlength: 100 },
  darshanType: { 
    type: String, 
    required: true, 
    enum: ["General", "Special", "VIP"] 
  },
  visitDate: { type: String, required: true, maxlength: 20 },
  timeSlot: { type: String, required: true, maxlength: 50 },
  numberOfDevotees: { type: Number, required: true, min: 1 },
  purpose: { 
    type: String, 
    required: true, 
    enum: ["Darshan", "Puja", "Abhishekam", "Donation"] 
  },
  priestName: { type: String, maxlength: 100 },
  devotees: [{
    name: { type: String, required: true, maxlength: 100 },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    photoUrl: { type: String, required: true }, // Base64 images can be very long
    idProof: {
      idType: { type: String, required: true, enum: ["Aadhaar", "Passport", "Voter ID"] },
      idNumber: { type: String, required: true, maxlength: 50 },
      idFileUrl: { type: String, required: true }, // Base64 images can be very long
    },
  }],
  bookingStatus: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Cancelled"], 
    default: "Pending" 
  },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ============ MONGOOSE MODELS ============

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const CrowdData = mongoose.models.CrowdData || mongoose.model<ICrowdData>("CrowdData", CrowdDataSchema);
export const ChatHistory = mongoose.models.ChatHistory || mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
export const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

// ============ PHASE 3 SCHEMAS ============

const LostItemSchema = new Schema<ILostItem>({
  templeId: { type: String, required: true, maxlength: 50 },
  category: { 
    type: String, 
    required: true, 
    enum: ["bag", "wallet", "phone", "jewelry", "document", "keys", "footwear", "clothing", "other"]
  },
  description: { type: String, required: true, maxlength: 500 },
  color: { type: String, maxlength: 50 },
  brand: { type: String, maxlength: 100 },
  reportedAt: { type: Date, default: Date.now },
  foundAt: { type: String, maxlength: 200 },
  imageUrl: { type: String },
  status: { 
    type: String, 
    enum: ["lost", "found", "claimed", "expired"], 
    default: "lost" 
  },
  reporterName: { type: String, required: true, maxlength: 100 },
  reporterPhone: { type: String, required: true, maxlength: 20 },
  reporterEmail: { type: String, maxlength: 100 },
  finderName: { type: String, maxlength: 100 },
  finderPhone: { type: String, maxlength: 20 },
  claimDetails: {
    claimedAt: { type: Date },
    claimedBy: { type: String, maxlength: 100 },
    verificationMethod: { type: String, maxlength: 100 }
  },
  additionalDetails: { type: String, maxlength: 1000 }
});

const FoundItemSchema = new Schema<IFoundItem>({
  templeId: { type: String, required: true, maxlength: 50 },
  category: { 
    type: String, 
    required: true, 
    enum: ["bag", "wallet", "phone", "jewelry", "document", "keys", "footwear", "clothing", "other"]
  },
  description: { type: String, required: true, maxlength: 500 },
  color: { type: String, maxlength: 50 },
  foundLocation: { type: String, required: true, maxlength: 200 },
  foundAt: { type: Date, default: Date.now },
  imageUrl: { type: String },
  status: { 
    type: String, 
    enum: ["awaiting-claim", "claimed", "donated", "disposed"], 
    default: "awaiting-claim" 
  },
  finderName: { type: String, maxlength: 100 },
  finderPhone: { type: String, maxlength: 20 },
  storedAt: { type: String, required: true, maxlength: 200 },
  expiryDate: { type: Date, required: true },
  claimDetails: {
    claimedAt: { type: Date },
    claimedBy: { type: String, maxlength: 100 },
    claimedByPhone: { type: String, maxlength: 20 },
    verificationMethod: { type: String, maxlength: 100 }
  },
  additionalDetails: { type: String, maxlength: 1000 }
});

const PanicAlertSchema = new Schema<IPanicAlert>({
  templeId: { type: String, required: true, maxlength: 50 },
  alertType: { 
    type: String, 
    required: true, 
    enum: ["panic", "medical", "fire", "crowd", "suspicious"]
  },
  location: { type: String, required: true, maxlength: 200 },
  coordinates: {
    x: { type: Number },
    y: { type: Number }
  },
  reporterName: { type: String, maxlength: 100 },
  reporterPhone: { type: String, maxlength: 20 },
  description: { type: String, maxlength: 500 },
  status: { 
    type: String, 
    enum: ["active", "responding", "resolved", "false-alarm"], 
    default: "active" 
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high", "critical"], 
    default: "high" 
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  responseNotes: { type: String, maxlength: 1000 }
});

const MedicalRequestSchema = new Schema<IMedicalRequest>({
  templeId: { type: String, required: true, maxlength: 50 },
  patientName: { type: String, required: true, maxlength: 100 },
  patientAge: { type: Number, min: 0, max: 150 },
  patientGender: { type: String, enum: ["Male", "Female", "Other"], maxlength: 10 },
  contactPhone: { type: String, required: true, maxlength: 20 },
  location: { type: String, required: true, maxlength: 200 },
  coordinates: {
    x: { type: Number },
    y: { type: Number }
  },
  emergencyType: { 
    type: String, 
    required: true, 
    enum: ["cardiac", "breathing", "injury", "fainting", "heat-stroke", "other"]
  },
  description: { type: String, required: true, maxlength: 1000 },
  status: { 
    type: String, 
    enum: ["pending", "dispatched", "treating", "resolved", "hospital-transfer"], 
    default: "pending" 
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high", "critical"], 
    default: "high" 
  },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
  resolvedAt: { type: Date },
  responseNotes: { type: String, maxlength: 1000 }
});

// Create indexes for better query performance
LostItemSchema.index({ templeId: 1, status: 1 });
LostItemSchema.index({ category: 1 });
FoundItemSchema.index({ templeId: 1, status: 1 });
FoundItemSchema.index({ category: 1 });
PanicAlertSchema.index({ templeId: 1, status: 1 });
MedicalRequestSchema.index({ templeId: 1, status: 1 });

// ============ PHASE 3 MODELS ============

export const LostItem = mongoose.models.LostItem || mongoose.model<ILostItem>("LostItem", LostItemSchema);
export const FoundItem = mongoose.models.FoundItem || mongoose.model<IFoundItem>("FoundItem", FoundItemSchema);
export const PanicAlert = mongoose.models.PanicAlert || mongoose.model<IPanicAlert>("PanicAlert", PanicAlertSchema);
export const MedicalRequest = mongoose.models.MedicalRequest || mongoose.model<IMedicalRequest>("MedicalRequest", MedicalRequestSchema);
