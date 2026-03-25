/**
 * Weather Service for Temple Crowd Predictions
 * Integrates weather data to adjust crowd forecasts
 */

interface WeatherData {
  templeId: string;
  temperature: number; // Celsius
  condition: "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "hot";
  humidity: number; // percentage
  rainProbability: number; // percentage
  windSpeed: number; // km/h
  feelsLike: number;
  forecast: DailyForecast[];
}

interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  rainProbability: number;
}

// Temple coordinates for weather lookups
const templeCoordinates: Record<string, { lat: number; lon: number; city: string }> = {
  somnath: { lat: 20.888, lon: 70.401, city: "Veraval" },
  dwarka: { lat: 22.238, lon: 68.968, city: "Dwarka" },
  ambaji: { lat: 24.333, lon: 72.851, city: "Ambaji" },
  pavagadh: { lat: 22.466, lon: 73.511, city: "Pavagadh" }
};

/**
 * Weather-based crowd adjustment factors
 */
const weatherCrowdFactors: Record<string, number> = {
  sunny: 1.0,        // Normal crowds
  cloudy: 1.1,       // Slightly more (pleasant weather)
  rainy: 0.4,        // Much fewer visitors
  stormy: 0.2,       // Minimal visitors
  foggy: 0.7,        // Reduced visibility, fewer visitors
  hot: 0.8           // Too hot, fewer visitors
};

/**
 * Temperature-based crowd adjustment
 */
function getTemperatureFactor(temp: number): number {
  if (temp < 15) return 0.7;      // Too cold
  if (temp >= 15 && temp < 25) return 1.2;  // Pleasant - more visitors
  if (temp >= 25 && temp < 32) return 1.0;  // Normal
  if (temp >= 32 && temp < 38) return 0.8;  // Hot
  if (temp >= 38) return 0.5;     // Very hot - fewer visitors
  return 1.0;
}

/**
 * Simulated weather data (in production, replace with actual API)
 * Uses realistic patterns for Gujarat region
 */
export function getCurrentWeather(templeId: string): WeatherData {
  const coords = templeCoordinates[templeId];
  if (!coords) {
    throw new Error(`Unknown temple: ${templeId}`);
  }

  // Simulate realistic weather for Gujarat (March climate)
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();
  
  // Base temperatures by season (Gujarat)
  const seasonalTemp: Record<number, { min: number; max: number }> = {
    0: { min: 12, max: 28 },  // Jan
    1: { min: 14, max: 31 },  // Feb
    2: { min: 19, max: 36 },  // Mar
    3: { min: 24, max: 40 },  // Apr
    4: { min: 27, max: 42 },  // May
    5: { min: 27, max: 38 },  // Jun (monsoon starts)
    6: { min: 26, max: 34 },  // Jul (monsoon)
    7: { min: 25, max: 32 },  // Aug (monsoon)
    8: { min: 24, max: 34 },  // Sep
    9: { min: 22, max: 36 },  // Oct
    10: { min: 17, max: 32 }, // Nov
    11: { min: 13, max: 28 }  // Dec
  };

  const seasonal = seasonalTemp[month] || { min: 20, max: 32 };
  
  // Calculate current temperature based on hour
  const tempRange = seasonal.max - seasonal.min;
  const hourFactor = Math.sin((hour - 6) * Math.PI / 12); // Peak at 14:00
  const baseTemp = seasonal.min + tempRange * (0.5 + 0.5 * Math.max(0, hourFactor));
  
  // Add some randomness
  const temperature = Math.round(baseTemp + (Math.random() - 0.5) * 4);
  
  // Determine condition based on season and randomness
  let condition: WeatherData["condition"] = "sunny";
  let rainProbability = 5;
  
  if (month >= 5 && month <= 8) {
    // Monsoon season
    const rand = Math.random();
    if (rand < 0.3) {
      condition = "rainy";
      rainProbability = 70 + Math.floor(Math.random() * 25);
    } else if (rand < 0.5) {
      condition = "cloudy";
      rainProbability = 40 + Math.floor(Math.random() * 20);
    } else {
      condition = "cloudy";
      rainProbability = 20 + Math.floor(Math.random() * 20);
    }
  } else if (month >= 3 && month <= 5) {
    // Summer
    condition = temperature > 38 ? "hot" : "sunny";
    rainProbability = 5;
  } else if (month === 11 || month <= 1) {
    // Winter - occasional fog
    if (hour < 9 && Math.random() < 0.3) {
      condition = "foggy";
    }
  }

  const humidity = condition === "rainy" ? 80 + Math.floor(Math.random() * 15) :
                   condition === "cloudy" ? 60 + Math.floor(Math.random() * 20) :
                   30 + Math.floor(Math.random() * 25);

  const windSpeed = Math.floor(5 + Math.random() * 20);
  const feelsLike = temperature + (humidity > 70 ? 3 : 0) - (windSpeed > 15 ? 2 : 0);

  // Generate 5-day forecast
  const forecast: DailyForecast[] = [];
  for (let i = 1; i <= 5; i++) {
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + i);
    
    const dayTemp = seasonal.min + Math.random() * tempRange;
    const conditionRand = Math.random();
    let dayCondition = "sunny";
    let dayRain = 5;
    
    if (month >= 5 && month <= 8) {
      if (conditionRand < 0.4) {
        dayCondition = "rainy";
        dayRain = 60 + Math.floor(Math.random() * 30);
      } else if (conditionRand < 0.7) {
        dayCondition = "cloudy";
        dayRain = 30 + Math.floor(Math.random() * 20);
      }
    }

    forecast.push({
      date: futureDate.toISOString().split('T')[0],
      minTemp: Math.round(seasonal.min + (Math.random() - 0.5) * 4),
      maxTemp: Math.round(seasonal.max + (Math.random() - 0.5) * 4),
      condition: dayCondition,
      rainProbability: dayRain
    });
  }

  return {
    templeId,
    temperature,
    condition,
    humidity,
    rainProbability,
    windSpeed,
    feelsLike,
    forecast
  };
}

/**
 * Get weather-adjusted crowd multiplier
 */
export function getWeatherCrowdMultiplier(templeId: string): number {
  const weather = getCurrentWeather(templeId);
  const conditionFactor = weatherCrowdFactors[weather.condition] || 1.0;
  const tempFactor = getTemperatureFactor(weather.temperature);
  
  // Combine factors (weighted average)
  return (conditionFactor * 0.6 + tempFactor * 0.4);
}

/**
 * Get weather advisory for visitors
 */
export function getWeatherAdvisory(templeId: string): {
  advisory: string;
  recommendations: string[];
  visitSuitability: "excellent" | "good" | "moderate" | "poor";
} {
  const weather = getCurrentWeather(templeId);
  const recommendations: string[] = [];
  let advisory = "";
  let visitSuitability: "excellent" | "good" | "moderate" | "poor" = "good";

  // Temperature advisories
  if (weather.temperature > 38) {
    advisory = "Extreme heat warning! ";
    recommendations.push("Carry plenty of water (at least 2 liters)");
    recommendations.push("Visit during early morning (before 9 AM) or evening (after 5 PM)");
    recommendations.push("Wear light cotton clothing and sunscreen");
    recommendations.push("Take regular breaks in shaded areas");
    visitSuitability = "moderate";
  } else if (weather.temperature > 35) {
    advisory = "Hot weather expected. ";
    recommendations.push("Stay hydrated and carry water");
    recommendations.push("Consider early morning visit for cooler temperatures");
    visitSuitability = "good";
  } else if (weather.temperature < 15) {
    advisory = "Cool morning expected. ";
    recommendations.push("Carry warm clothing, especially for early morning darshan");
  }

  // Rain advisories
  if (weather.condition === "rainy" || weather.rainProbability > 60) {
    advisory += "Rain expected. ";
    recommendations.push("Carry umbrella or raincoat");
    recommendations.push("Wear waterproof footwear");
    recommendations.push("Keep electronics in waterproof bags");
    recommendations.push("Temple floors may be slippery - walk carefully");
    visitSuitability = weather.condition === "stormy" ? "poor" : "moderate";
  } else if (weather.rainProbability > 30) {
    advisory += "Chance of rain. ";
    recommendations.push("Keep an umbrella handy");
  }

  // Fog advisories (Pavagadh is on a hill)
  if (weather.condition === "foggy") {
    advisory += "Foggy conditions. ";
    if (templeId === "pavagadh") {
      recommendations.push("Ropeway may have limited visibility");
      recommendations.push("Drive carefully on hill roads");
    }
    visitSuitability = "moderate";
  }

  // General recommendations based on suitability
  if (visitSuitability === "good") {
    if (recommendations.length === 0) {
      advisory = "Pleasant weather for darshan. ";
      recommendations.push("Good weather for your visit!");
    }
  }

  return {
    advisory: advisory.trim() || "Weather conditions are normal for darshan.",
    recommendations,
    visitSuitability
  };
}

/**
 * Get weather forecast for planning visits
 */
export function getWeatherForecast(templeId: string, days: number = 5): {
  current: WeatherData;
  bestDays: string[];
  forecast: DailyForecast[];
} {
  const current = getCurrentWeather(templeId);
  
  // Find best days to visit (lowest rain probability, moderate temperature)
  const sortedForecast = [...current.forecast].sort((a, b) => {
    const aScore = a.rainProbability + Math.abs(a.maxTemp - 28) * 2;
    const bScore = b.rainProbability + Math.abs(b.maxTemp - 28) * 2;
    return aScore - bScore;
  });

  const bestDays = sortedForecast.slice(0, 2).map(f => f.date);

  return {
    current,
    bestDays,
    forecast: current.forecast.slice(0, days)
  };
}
