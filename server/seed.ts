import { db } from "./db";
import { crowdData } from "@shared/schema";

// Seed initial crowd data for all temples
async function seedCrowdData() {
  const initialData = [
    {
      templeId: "somnath",
      templeName: "Somnath",
      currentWaitTime: 15,
      status: "Low",
      visitorCount: 350,
    },
    {
      templeId: "dwarka",
      templeName: "Dwarka",
      currentWaitTime: 45,
      status: "Moderate",
      visitorCount: 780,
    },
    {
      templeId: "ambaji",
      templeName: "Ambaji",
      currentWaitTime: 10,
      status: "Low",
      visitorCount: 280,
    },
    {
      templeId: "pavagadh",
      templeName: "Pavagadh",
      currentWaitTime: 90,
      status: "High",
      visitorCount: 1200,
    },
  ];

  try {
    console.log("Seeding crowd data...");
    for (const data of initialData) {
      await db.insert(crowdData).values(data);
    }
    console.log("✓ Crowd data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedCrowdData();
