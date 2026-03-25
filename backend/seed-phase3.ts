/**
 * Seed script for Phase 3 data - Lost & Found, Panic Alerts, Medical Requests
 * Run with: npx tsx seed-phase3.ts
 */

import "dotenv/config";
import { connectDB, disconnectDB } from "./config/database";
import { LostItem, FoundItem, PanicAlert, MedicalRequest } from "./models";

const sampleLostItems = [
  {
    templeId: "somnath",
    category: "wallet",
    description: "Brown leather wallet with some cash and cards",
    color: "Brown",
    brand: "Woodland",
    status: "lost",
    reporterName: "Ramesh Patel",
    reporterPhone: "+91-9876543210",
    reporterEmail: "ramesh@email.com",
    additionalDetails: "Lost near Narasimha temple area around 4 PM"
  },
  {
    templeId: "dwarka",
    category: "phone",
    description: "Samsung Galaxy S21, Blue color, with black case",
    color: "Blue",
    brand: "Samsung",
    status: "lost",
    reporterName: "Priya Sharma",
    reporterPhone: "+91-9988776655",
    additionalDetails: "Lost while climbing the 56 steps"
  },
  {
    templeId: "ambaji",
    category: "bag",
    description: "Black laptop bag with personal documents",
    color: "Black",
    brand: "Wildcraft",
    status: "lost",
    reporterName: "Vijay Kumar",
    reporterPhone: "+91-9123456789",
    additionalDetails: "Contains important office documents"
  },
  {
    templeId: "pavagadh",
    category: "jewelry",
    description: "Gold mangalsutra with black beads",
    color: "Gold",
    status: "lost",
    reporterName: "Meena Ben",
    reporterPhone: "+91-9567890123",
    additionalDetails: "Lost near the temple prasad counter"
  }
];

const sampleFoundItems = [
  {
    templeId: "somnath",
    category: "bag",
    description: "Red color small ladies handbag",
    color: "Red",
    foundLocation: "Main Temple Premises",
    status: "awaiting-claim",
    storedAt: "Lost & Found Office",
    expiryDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    additionalDetails: "Contains some makeup items and a small purse"
  },
  {
    templeId: "ambaji",
    category: "jewelry",
    description: "Gold chain - lightweight",
    color: "Gold",
    foundLocation: "Near Gabbar Ropeway",
    status: "awaiting-claim",
    storedAt: "Temple Trust Office",
    expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    finderName: "Security Staff",
    additionalDetails: "Found during evening cleaning"
  },
  {
    templeId: "pavagadh",
    category: "footwear",
    description: "Pair of Bata Chappals, black with blue straps",
    color: "Black",
    foundLocation: "Shoe Rack Area",
    status: "awaiting-claim",
    storedAt: "Ropeway Office",
    expiryDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    additionalDetails: "Size 8 approximately"
  },
  {
    templeId: "dwarka",
    category: "keys",
    description: "Car keys with Honda keychain",
    color: "Silver",
    foundLocation: "Temple Parking Area",
    status: "awaiting-claim",
    storedAt: "Security Office",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    finderName: "Parking Attendant",
    additionalDetails: "Found near parking slot B-12"
  },
  {
    templeId: "somnath",
    category: "phone",
    description: "iPhone 13 with cracked screen",
    color: "Black",
    foundLocation: "Beach Area",
    status: "awaiting-claim",
    storedAt: "Lost & Found Office",
    expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    additionalDetails: "Phone is locked, battery at 45%"
  }
];

const samplePanicAlerts = [
  {
    templeId: "somnath",
    alertType: "medical",
    location: "Main Temple Hall",
    reporterName: "Temple Guard",
    reporterPhone: "+91-9876543210",
    description: "Elderly person feeling dizzy",
    status: "resolved",
    priority: "high",
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    responseNotes: "Medical team attended, person recovered after rest"
  },
  {
    templeId: "dwarka",
    alertType: "crowd",
    location: "56 Steps Area",
    reporterName: "Volunteer",
    reporterPhone: "+91-9988776655",
    description: "Overcrowding on steps, people unable to move",
    status: "resolved",
    priority: "critical",
    resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    responseNotes: "Crowd managed by security, entry temporarily paused"
  }
];

const sampleMedicalRequests = [
  {
    templeId: "ambaji",
    patientName: "Suresh Bhai",
    patientAge: 65,
    patientGender: "Male",
    contactPhone: "+91-9123456789",
    location: "Gabbar Hill Ropeway Exit",
    emergencyType: "fainting",
    description: "Patient fainted after ropeway ride, possibly due to heat",
    status: "resolved",
    priority: "high",
    resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    responseNotes: "Patient given water and glucose, recovered after 20 minutes"
  },
  {
    templeId: "pavagadh",
    patientName: "Baby (Child)",
    patientAge: 5,
    patientGender: "Female",
    contactPhone: "+91-9567890123",
    location: "Temple Steps - Middle Section",
    emergencyType: "injury",
    description: "Child fell on steps, minor injury on knee",
    status: "resolved",
    priority: "medium",
    resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    responseNotes: "First aid provided, bandage applied"
  }
];

async function seedPhase3Data() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing data
    await LostItem.deleteMany({});
    await FoundItem.deleteMany({});
    await PanicAlert.deleteMany({});
    await MedicalRequest.deleteMany({});
    console.log("Cleared existing Phase 3 data");

    // Insert sample data
    const lostItems = await LostItem.insertMany(sampleLostItems);
    console.log(`✓ Inserted ${lostItems.length} lost items`);

    const foundItems = await FoundItem.insertMany(sampleFoundItems);
    console.log(`✓ Inserted ${foundItems.length} found items`);

    const alerts = await PanicAlert.insertMany(samplePanicAlerts);
    console.log(`✓ Inserted ${alerts.length} panic alerts`);

    const medicalRequests = await MedicalRequest.insertMany(sampleMedicalRequests);
    console.log(`✓ Inserted ${medicalRequests.length} medical requests`);

    console.log("\n✅ Phase 3 data seeded successfully!");
    console.log("\nSummary:");
    console.log(`- Lost Items: ${lostItems.length}`);
    console.log(`- Found Items: ${foundItems.length}`);
    console.log(`- Panic Alerts: ${alerts.length}`);
    console.log(`- Medical Requests: ${medicalRequests.length}`);

  } catch (error) {
    console.error("Error seeding Phase 3 data:", error);
  } finally {
    await disconnectDB();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  }
}

seedPhase3Data();
