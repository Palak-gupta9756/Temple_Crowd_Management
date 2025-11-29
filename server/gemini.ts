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
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
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

    return response.text || "Unable to predict at this time.";
  } catch (error) {
    console.error("Gemini Trend Analysis Error:", error);
    return "Prediction currently unavailable.";
  }
}
