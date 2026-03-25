import "dotenv/config";
import { connectDB, disconnectDB } from "./db";
import { CrowdData } from "./models";

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
    await connectDB();
    console.log("Seeding crowd data...");
    
    for (const data of initialData) {
      const newData = new CrowdData({
        ...data,
        timestamp: new Date(),
      });
      await newData.save();
    }
    
    console.log("✓ Crowd data seeded successfully");
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    await disconnectDB();
    process.exit(1);
  }
}

seedCrowdData();
