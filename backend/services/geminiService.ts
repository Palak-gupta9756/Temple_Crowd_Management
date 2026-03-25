import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// Using Gemini Developer API Key (not Vertex AI)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `You are Yatra Sahayak, a helpful spiritual guide for pilgrims visiting temples in Gujarat, India.

You assist with:
- Somnath Mahadev Temple (Prabhas Patan, Veraval) - First of 12 Jyotirlingas
- Dwarkadhish Temple (Dwarka) - Dedicated to Lord Krishna
- Ambaji Mata Temple (Banaskantha) - Major Shakti Peeth
- Kalika Mata Temple (Pavagadh Hill, Panchmahal) - Shakti Peeth on hilltop

Provide information about:
- Temple timings, aarti schedules
- Current crowd status and wait times
- Best times to visit
- Nearby accommodations (Dharamshalas, guest houses)
- Historical and spiritual significance
- Travel routes and connectivity
- Special festivals and events

Always be:
- Respectful and use greetings like "Jay Somnath", "Jay Dwarkadhish", "Jai Mata Di"
- Concise but informative
- Helpful with practical travel advice
- Culturally sensitive

Keep responses under 150 words unless asked for detailed information.`;

export async function chatWithGemini(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  try {
    // Build conversation contents for Gemini
    const contents = conversationHistory.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 500,
      },
      contents: contents,
    });

    return response.text || "I apologize, I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Handle quota exceeded error
    if (error?.status === 429 || error?.message?.includes("quota")) {
      return "I'm currently experiencing high demand. Please try again in a minute. In the meantime, I can tell you that early mornings (6-8 AM) and late evenings (after 7 PM) are generally less crowded at most temples.";
    }
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

// Fallback prediction based on data patterns
function generateFallbackPrediction(
  templeId: string,
  historicalData: Array<{ time: string; visitors: number }>
): string {
  if (historicalData.length === 0) {
    return "Insufficient data for prediction. Generally, early mornings (6-8 AM) and late evenings (after 7 PM) see fewer crowds.";
  }

  if (historicalData.length === 1) {
    return "With limited data, it's hard to predict. Typically, temple crowds are lower during midday (1-3 PM) and late evening hours.";
  }

  // Find the time with lowest visitors
  const sorted = [...historicalData].sort((a, b) => a.visitors - b.visitors);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  
  const avgVisitors = historicalData.reduce((sum, d) => sum + d.visitors, 0) / historicalData.length;
  const currentVisitors = historicalData[historicalData.length - 1]?.visitors || avgVisitors;

  // Analyze patterns
  const hourPatterns: Record<number, number[]> = {};
  historicalData.forEach(d => {
    const hour = new Date(d.time).getHours();
    if (!hourPatterns[hour]) hourPatterns[hour] = [];
    hourPatterns[hour].push(d.visitors);
  });

  // Find hours with consistently lower crowds
  const hourAverages: Array<{ hour: number; avg: number }> = [];
  Object.entries(hourPatterns).forEach(([hour, visitors]) => {
    const avg = visitors.reduce((a, b) => a + b, 0) / visitors.length;
    hourAverages.push({ hour: parseInt(hour), avg });
  });

  hourAverages.sort((a, b) => a.avg - b.avg);
  const bestHours = hourAverages.slice(0, 2).map(h => {
    const period = h.hour < 12 ? `${h.hour} AM` : h.hour === 12 ? "12 PM" : `${h.hour - 12} PM`;
    return period;
  });

  if (currentVisitors > avgVisitors) {
    return `Crowd is currently above average. Best times to visit: ${bestHours.join(" or ")}. Crowds typically decrease during these hours.`;
  } else {
    return `Current crowd is manageable. For even lower crowds, consider visiting around ${bestHours[0] || "midday"}.`;
  }
}

export async function analyzeCrowdTrend(
  templeId: string,
  historicalData: Array<{ time: string; visitors: number }>
): Promise<string> {
  try {
    const dataString = JSON.stringify(historicalData);
    const prompt = `Based on this crowd data for ${templeId} temple: ${dataString}
    
Provide a brief prediction (max 50 words) about when the crowd will be lowest in the next few hours.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    return response.text || generateFallbackPrediction(templeId, historicalData);
  } catch (error: any) {
    console.error("Gemini Trend Analysis Error:", error);
    // If quota exceeded or API error, use fallback prediction
    if (error?.status === 429 || error?.message?.includes("quota")) {
      console.log("Using fallback prediction due to API quota limit");
      return generateFallbackPrediction(templeId, historicalData);
    }
    return generateFallbackPrediction(templeId, historicalData);
  }
}
