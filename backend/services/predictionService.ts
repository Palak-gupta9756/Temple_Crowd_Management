import { storage } from "../storage";

interface HistoricalDataPoint {
  timestamp: Date;
  visitorCount: number;
  hour: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
}

/**
 * ML-based prediction service using historical data patterns
 * No external API required - uses statistical analysis
 */
export class CrowdPredictionService {
  /**
   * Analyze historical patterns and predict best visit times
   */
  async predictBestTime(templeId: string, hoursAhead: number = 6): Promise<string> {
    try {
      // Get historical data (last 30 days for better patterns)
      const history = await storage.getCrowdHistory(templeId, 720); // 30 days
      
      if (history.length === 0) {
        return "Insufficient historical data. Generally, early mornings (6-8 AM) and late evenings (after 7 PM) see fewer crowds.";
      }

      // Analyze patterns
      const patterns = this.analyzePatterns(history);
      
      // Get current time
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();
      
      // Predict next few hours
      const predictions: Array<{ hour: number; predictedVisitors: number; timeLabel: string }> = [];
      
      for (let h = 0; h < hoursAhead; h++) {
        const futureHour = (currentHour + h) % 24;
        const futureDay = (currentDay + Math.floor((currentHour + h) / 24)) % 7;
        
        const predicted = this.predictHourlyVisitors(
          futureHour,
          futureDay,
          patterns,
          history
        );
        
        const timeLabel = this.formatHour(futureHour);
        predictions.push({
          hour: futureHour,
          predictedVisitors: predicted,
          timeLabel
        });
      }

      // Find the best time (lowest predicted visitors)
      predictions.sort((a, b) => a.predictedVisitors - b.predictedVisitors);
      const bestTime = predictions[0];
      const worstTime = predictions[predictions.length - 1];

      // Generate human-readable prediction
      const avgVisitors = patterns.hourlyAverage.reduce((sum, h) => sum + h.avg, 0) / patterns.hourlyAverage.length;
      const currentData = history[history.length - 1];
      const currentVisitors = currentData?.visitorCount || avgVisitors;

      // Format prediction more concisely
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      
      let prediction = "";
      
      // Determine trend
      const trend = bestTime.predictedVisitors < currentVisitors * 0.85 ? "decrease" :
                   bestTime.predictedVisitors > currentVisitors * 1.15 ? "increase" : "stable";

      if (trend === "decrease") {
        prediction = `Crowd expected to **decrease**. Best time: **${bestTime.timeLabel}** (~${Math.round(bestTime.predictedVisitors)} visitors). Avoid ${worstTime.timeLabel} (peak: ~${Math.round(worstTime.predictedVisitors)}).`;
      } else if (trend === "increase") {
        prediction = `Crowd expected to **increase**. Visit now or wait until **${bestTime.timeLabel}** (~${Math.round(bestTime.predictedVisitors)} visitors).`;
      } else {
        prediction = `Crowd levels **stable**. Best time: **${bestTime.timeLabel}** (~${Math.round(bestTime.predictedVisitors)} visitors). Peak: ${worstTime.timeLabel} (~${Math.round(worstTime.predictedVisitors)}).`;
      }

      // Add concise insights
      const offPeakHours = patterns.hourlyAverage
        .filter(h => h.avg < avgVisitors * 0.8)
        .map(h => this.formatHour(h.hour))
        .slice(0, 2);

      if (offPeakHours.length > 0) {
        prediction += ` Less crowded: ${offPeakHours.join(", ")}.`;
      }

      if (patterns.weekendMultiplier > 1.3 && !isWeekend) {
        prediction += ` Weekends: +${Math.round((patterns.weekendMultiplier - 1) * 100)}% visitors.`;
      }

      return prediction;
    } catch (error) {
      console.error("Prediction error:", error);
      return "Unable to generate prediction at this time. Generally, early mornings (6-8 AM) and late evenings (after 7 PM) see fewer crowds.";
    }
  }

  /**
   * Analyze historical data to extract patterns
   */
  private analyzePatterns(history: any[]): {
    hourlyAverage: Array<{ hour: number; avg: number; count: number }>;
    weekdayAverage: number;
    weekendAverage: number;
    weekendMultiplier: number;
    trend: number; // positive = increasing, negative = decreasing
  } {
    const hourlyData: Record<number, number[]> = {};
    let weekdayTotal = 0;
    let weekdayCount = 0;
    let weekendTotal = 0;
    let weekendCount = 0;

    // Group by hour
    history.forEach(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(entry.visitorCount);

      if (isWeekend) {
        weekendTotal += entry.visitorCount;
        weekendCount++;
      } else {
        weekdayTotal += entry.visitorCount;
        weekdayCount++;
      }
    });

    // Calculate hourly averages
    const hourlyAverage = Object.entries(hourlyData).map(([hour, visitors]) => ({
      hour: parseInt(hour),
      avg: visitors.reduce((a, b) => a + b, 0) / visitors.length,
      count: visitors.length
    })).sort((a, b) => a.hour - b.hour);

    const weekdayAvg = weekdayCount > 0 ? weekdayTotal / weekdayCount : 0;
    const weekendAvg = weekendCount > 0 ? weekendTotal / weekendCount : 0;
    const weekendMultiplier = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 1;

    // Calculate trend (simple linear regression on recent data)
    const recentData = history.slice(-48); // Last 48 data points
    let trend = 0;
    if (recentData.length > 1) {
      const first = recentData[0].visitorCount;
      const last = recentData[recentData.length - 1].visitorCount;
      trend = (last - first) / recentData.length;
    }

    return {
      hourlyAverage,
      weekdayAverage: weekdayAvg,
      weekendAverage: weekendAvg,
      weekendMultiplier,
      trend
    };
  }

  /**
   * Predict visitors for a specific hour using patterns
   */
  private predictHourlyVisitors(
    hour: number,
    dayOfWeek: number,
    patterns: ReturnType<typeof this.analyzePatterns>,
    history: any[]
  ): number {
    // Get base prediction from hourly average
    const hourPattern = patterns.hourlyAverage.find(h => h.hour === hour);
    let baseVisitors = hourPattern?.avg || patterns.hourlyAverage.reduce((sum, h) => sum + h.avg, 0) / patterns.hourlyAverage.length;

    // Apply weekend multiplier
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend && patterns.weekendMultiplier > 1) {
      baseVisitors *= patterns.weekendMultiplier;
    }

    // Apply trend (if data shows increasing/decreasing pattern)
    if (Math.abs(patterns.trend) > 0.1) {
      baseVisitors += patterns.trend * 2; // Scale trend
    }

    // Add some randomness based on historical variance
    const hourData = patterns.hourlyAverage.find(h => h.hour === hour);
    if (hourData && hourData.count > 5) {
      // Use standard deviation approximation
      const variance = 0.15; // 15% variance
      const randomFactor = 1 + (Math.random() - 0.5) * variance * 2;
      baseVisitors *= randomFactor;
    }

    return Math.max(0, Math.round(baseVisitors));
  }

  /**
   * Format hour to readable time
   */
  private formatHour(hour: number): string {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  }

  /**
   * Predict crowd level for a specific date
   */
  async predictForDate(templeId: string, targetDate: Date): Promise<{
    level: "Low" | "Moderate" | "High" | "Very High";
    predictedVisitors: number;
    isWeekend: boolean;
    confidence: number;
  }> {
    try {
      const history = await storage.getCrowdHistory(templeId, 720); // 30 days
      if (history.length === 0) {
        return { 
          level: "Moderate", 
          predictedVisitors: 500, 
          isWeekend: targetDate.getDay() === 0 || targetDate.getDay() === 6,
          confidence: 0 
        };
      }

      const patterns = this.analyzePatterns(history);
      const dayOfWeek = targetDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Predict for peak hour (typically 10 AM or 6 PM)
      const peakHour = 10; // Morning peak
      const predictedVisitors = this.predictHourlyVisitors(peakHour, dayOfWeek, patterns, history);

      let level: "Low" | "Moderate" | "High" | "Very High";
      if (predictedVisitors < 400) level = "Low";
      else if (predictedVisitors < 800) level = "Moderate";
      else if (predictedVisitors < 1200) level = "High";
      else level = "Very High";

      const confidence = Math.min(0.95, 0.5 + (history.length / 100) * 0.45);

      return { level, predictedVisitors, isWeekend, confidence };
    } catch (error) {
      console.error("Date prediction error:", error);
      return { 
        level: "Moderate", 
        predictedVisitors: 500, 
        isWeekend: targetDate.getDay() === 0 || targetDate.getDay() === 6,
        confidence: 0 
      };
    }
  }

  /**
   * Get crowd level prediction (Low/Moderate/High/Very High)
   */
  async predictCrowdLevel(templeId: string, targetHour?: number): Promise<{
    level: "Low" | "Moderate" | "High" | "Very High";
    predictedVisitors: number;
    confidence: number;
  }> {
    try {
      const history = await storage.getCrowdHistory(templeId, 168); // 7 days
      if (history.length === 0) {
        return { level: "Moderate", predictedVisitors: 500, confidence: 0 };
      }

      const patterns = this.analyzePatterns(history);
      const now = new Date();
      const hour = targetHour ?? now.getHours();
      const dayOfWeek = now.getDay();

      const predictedVisitors = this.predictHourlyVisitors(hour, dayOfWeek, patterns, history);

      let level: "Low" | "Moderate" | "High" | "Very High";
      if (predictedVisitors < 400) level = "Low";
      else if (predictedVisitors < 800) level = "Moderate";
      else if (predictedVisitors < 1200) level = "High";
      else level = "Very High";

      // Confidence based on data availability
      const confidence = Math.min(0.95, 0.5 + (history.length / 100) * 0.45);

      return { level, predictedVisitors, confidence };
    } catch (error) {
      console.error("Crowd level prediction error:", error);
      return { level: "Moderate", predictedVisitors: 500, confidence: 0 };
    }
  }
}

export const predictionService = new CrowdPredictionService();
