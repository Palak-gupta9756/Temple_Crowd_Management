import "dotenv/config";
import { connectDB, disconnectDB } from "./db";
import { CrowdData } from "./models";

// Generate historical data for past year
async function seedHistoricalData() {
  const temples = [
    { id: "somnath", name: "Somnath" },
    { id: "dwarka", name: "Dwarka" },
    { id: "ambaji", name: "Ambaji" },
    { id: "pavagadh", name: "Pavagadh" },
  ];

  try {
    await connectDB();
    console.log("Seeding historical crowd data...");

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    for (const temple of temples) {
      // Generate data for each day in the past year
      for (let day = 0; day < 365; day++) {
        const date = new Date(oneYearAgo);
        date.setDate(date.getDate() + day);

        // Generate 4-6 data points per day (morning, noon, afternoon, evening)
        const pointsPerDay = 4 + Math.floor(Math.random() * 3);
        
        for (let point = 0; point < pointsPerDay; point++) {
          const hour = 6 + Math.floor((point / pointsPerDay) * 14); // 6 AM to 8 PM
          const timestamp = new Date(date);
          timestamp.setHours(hour, Math.floor(Math.random() * 60), 0);

          // Weekend and festival days have higher crowds
          const dayOfWeek = timestamp.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const baseMultiplier = isWeekend ? 1.5 : 1.0;
          
          // Peak hours (9-11 AM, 5-7 PM) have more visitors
          const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 19);
          const hourMultiplier = isPeakHour ? 1.3 : 0.8;

          // Base visitor counts per temple
          const baseVisitors: Record<string, number> = {
            somnath: 300,
            dwarka: 600,
            ambaji: 200,
            pavagadh: 800,
          };

          const visitorCount = Math.round(
            baseVisitors[temple.id] * baseMultiplier * hourMultiplier * (0.8 + Math.random() * 0.4)
          );

          // Calculate wait time based on visitor count
          const waitTime = Math.round(visitorCount / 50 + Math.random() * 20);

          // Determine status
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
      }
      console.log(`✓ Seeded historical data for ${temple.name}`);
      
      // Generate recent data (last 48 hours) for immediate graph display
      console.log(`  Generating recent data (last 48 hours) for ${temple.name}...`);
      const recentHours = 48;
      for (let hourOffset = recentHours; hourOffset >= 0; hourOffset--) {
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
    }

    console.log("✓ Historical data seeded successfully");
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding historical data:", error);
    await disconnectDB();
    process.exit(1);
  }
}

seedHistoricalData();

