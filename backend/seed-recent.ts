import "dotenv/config";
import { connectDB, disconnectDB } from "./db";
import { CrowdData } from "./models";

// Generate recent data (last 48 hours) for immediate graph display
async function seedRecentData() {
  const temples = [
    { id: "somnath", name: "Somnath" },
    { id: "dwarka", name: "Dwarka" },
    { id: "ambaji", name: "Ambaji" },
    { id: "pavagadh", name: "Pavagadh" },
  ];

  try {
    await connectDB();
    console.log("Seeding recent crowd data (last 48 hours)...");

    const now = new Date();

    for (const temple of temples) {
      // Generate data for last 48 hours, one point per hour
      for (let hourOffset = 48; hourOffset >= 0; hourOffset--) {
        const timestamp = new Date(now);
        timestamp.setHours(timestamp.getHours() - hourOffset);
        timestamp.setMinutes(Math.floor(Math.random() * 60), 0);
        
        // Skip if outside temple hours (6 AM - 9 PM)
        const hour = timestamp.getHours();
        if (hour < 6 || hour > 21) continue;
        
        const dayOfWeek = timestamp.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const baseMultiplier = isWeekend ? 1.5 : 1.0;
        
        const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 19);
        const hourMultiplier = isPeakHour ? 1.3 : 0.8;
        
        const baseVisitors: Record<string, number> = {
          somnath: 300,
          dwarka: 600,
          ambaji: 200,
          pavagadh: 800,
        };
        
        const visitorCount = Math.round(
          baseVisitors[temple.id] * baseMultiplier * hourMultiplier * (0.8 + Math.random() * 0.4)
        );
        
        const waitTime = Math.round(visitorCount / 50 + Math.random() * 20);
        
        let status: string;
        if (visitorCount < 400) status = "Low";
        else if (visitorCount < 800) status = "Moderate";
        else if (visitorCount < 1200) status = "High";
        else status = "Very High";
        
        await new CrowdData({
          templeId: temple.id,
          templeName: temple.name,
          currentWaitTime: waitTime,
          status,
          visitorCount,
          timestamp,
        }).save();
      }
      console.log(`✓ Seeded recent data for ${temple.name}`);
    }

    console.log("✓ Recent data seeded successfully");
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding recent data:", error);
    await disconnectDB();
    process.exit(1);
  }
}

seedRecentData();

