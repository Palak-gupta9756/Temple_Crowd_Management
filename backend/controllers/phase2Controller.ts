/**
 * Phase 2 Controller - Festival, Weather, Routes, Parking
 * Handles all Phase 2 feature endpoints
 */

import { Request, Response } from "express";
import {
  festivals,
  getFestivalsForTemple,
  getUpcomingFestivals,
  getFestivalOnDate,
  getCrowdMultiplierForDate,
  getTempleFestivalsInRange,
} from "../data/festivals";
import {
  getCurrentWeather,
  getWeatherCrowdMultiplier,
  getWeatherAdvisory,
  getWeatherForecast,
} from "../services/weatherService";
import {
  templeMapData,
  getTempleZones,
  getTempleRoutes,
  getOptimalRoute,
  getTempleMapData,
} from "../data/templeRoutes";
import {
  getParkingLotsForTemple,
  getParkingLotById,
  getBestParking,
  getParkingSummary,
  hasAvailableSpots,
  updateParkingOccupancy,
  simulateParkingChanges,
} from "../data/parking";

export const phase2Controller = {
  // ============ FESTIVAL ENDPOINTS ============

  /**
   * Get all festivals
   */
  getAllFestivals: async (_req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: festivals,
        count: festivals.length,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch festivals" });
    }
  },

  /**
   * Get festivals for a specific temple
   */
  getTempleFestivals: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const templeFestivals = getFestivalsForTemple(templeId);
      res.json({
        success: true,
        templeId,
        data: templeFestivals,
        count: templeFestivals.length,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch temple festivals" });
    }
  },

  /**
   * Get upcoming festivals (next N days)
   */
  getUpcomingFestivals: async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const upcoming = getUpcomingFestivals(days);
      res.json({
        success: true,
        data: upcoming,
        count: upcoming.length,
        daysAhead: days,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch upcoming festivals" });
    }
  },

  /**
   * Check festival on a specific date
   */
  checkFestivalDate: async (req: Request, res: Response) => {
    try {
      const { date, templeId } = req.query;
      const checkDate = date ? new Date(date as string) : new Date();
      const festival = getFestivalOnDate(checkDate, templeId as string);
      const crowdMultiplier = templeId
        ? getCrowdMultiplierForDate(checkDate, templeId as string)
        : 1.0;

      res.json({
        success: true,
        date: checkDate.toISOString().split("T")[0],
        templeId: templeId || "all",
        hasFestival: !!festival,
        festival,
        crowdMultiplier,
        crowdImpact:
          crowdMultiplier > 3
            ? "extreme"
            : crowdMultiplier > 2
            ? "high"
            : crowdMultiplier > 1.5
            ? "moderate"
            : "normal",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to check festival date" });
    }
  },

  /**
   * Get festivals in date range for a temple
   */
  getFestivalsInRange: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const startDate = new Date(req.query.start as string || new Date());
      const endDate = new Date(req.query.end as string || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));

      const rangeFestivals = getTempleFestivalsInRange(templeId, startDate, endDate);
      res.json({
        success: true,
        templeId,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        data: rangeFestivals,
        count: rangeFestivals.length,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch festivals in range" });
    }
  },

  // ============ WEATHER ENDPOINTS ============

  /**
   * Get current weather for a temple
   */
  getTempleWeather: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const weather = getCurrentWeather(templeId);
      const crowdMultiplier = getWeatherCrowdMultiplier(templeId);
      const advisory = getWeatherAdvisory(templeId);

      res.json({
        success: true,
        templeId,
        weather,
        crowdMultiplier: Math.round(crowdMultiplier * 100) / 100,
        advisory,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch weather",
      });
    }
  },

  /**
   * Get weather forecast for planning
   */
  getWeatherForecast: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const days = parseInt(req.query.days as string) || 5;
      const forecast = getWeatherForecast(templeId, days);

      res.json({
        success: true,
        templeId,
        ...forecast,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch forecast",
      });
    }
  },

  /**
   * Get combined prediction (crowd + weather + festival)
   */
  getCombinedPrediction: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();

      const weather = getCurrentWeather(templeId);
      const weatherMultiplier = getWeatherCrowdMultiplier(templeId);
      const festivalMultiplier = getCrowdMultiplierForDate(date, templeId);
      const festival = getFestivalOnDate(date, templeId);
      const advisory = getWeatherAdvisory(templeId);

      // Combined multiplier
      const combinedMultiplier = weatherMultiplier * festivalMultiplier;

      // Generate recommendation
      let recommendation = "";
      if (combinedMultiplier > 4) {
        recommendation = "Extreme crowds expected. Consider visiting another day or book VIP darshan.";
      } else if (combinedMultiplier > 2.5) {
        recommendation = "High crowds expected. Visit early morning (before 7 AM) for shorter queues.";
      } else if (combinedMultiplier > 1.5) {
        recommendation = "Moderate crowds expected. Good day for visit with some waiting time.";
      } else if (combinedMultiplier < 0.6) {
        recommendation = "Lower than usual crowds. Great opportunity for peaceful darshan!";
      } else {
        recommendation = "Normal crowd levels expected. Standard visit recommended.";
      }

      res.json({
        success: true,
        templeId,
        date: date.toISOString().split("T")[0],
        weather: {
          condition: weather.condition,
          temperature: weather.temperature,
          feelsLike: weather.feelsLike,
        },
        festival: festival
          ? {
              name: festival.name,
              significance: festival.significance,
              multiplier: festival.crowdMultiplier,
            }
          : null,
        multipliers: {
          weather: Math.round(weatherMultiplier * 100) / 100,
          festival: festivalMultiplier,
          combined: Math.round(combinedMultiplier * 100) / 100,
        },
        advisory: advisory.advisory,
        visitSuitability: advisory.visitSuitability,
        recommendation,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate prediction",
      });
    }
  },

  // ============ ROUTE ENDPOINTS ============

  /**
   * Get temple map data (zones + routes)
   */
  getTempleMap: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const mapData = getTempleMapData(templeId);

      if (!mapData) {
        return res.status(404).json({
          success: false,
          message: "Temple not found",
        });
      }

      res.json({
        success: true,
        data: mapData,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch temple map" });
    }
  },

  /**
   * Get temple zones
   */
  getTempleZones: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const zones = getTempleZones(templeId);

      res.json({
        success: true,
        templeId,
        zones,
        count: zones.length,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch zones" });
    }
  },

  /**
   * Get temple routes
   */
  getTempleRoutes: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const routes = getTempleRoutes(templeId);

      res.json({
        success: true,
        templeId,
        routes,
        count: routes.length,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch routes" });
    }
  },

  /**
   * Get optimal route based on preferences
   */
  getOptimalRoute: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const { accessible, hasTime, isVip } = req.query;

      const route = getOptimalRoute(templeId, {
        accessible: accessible === "true",
        hasTime: hasTime === "true",
        isVip: isVip === "true",
      });

      if (!route) {
        return res.status(404).json({
          success: false,
          message: "No suitable route found",
        });
      }

      // Get zone details for the route
      const zones = getTempleZones(templeId);
      const routeZones = route.zones.map((zoneId) => {
        const zone = zones.find((z) => z.id === zoneId);
        return zone || { id: zoneId, name: "Unknown Zone" };
      });

      res.json({
        success: true,
        templeId,
        route: {
          ...route,
          zoneDetails: routeZones,
        },
        preferences: { accessible, hasTime, isVip },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to find optimal route" });
    }
  },

  // ============ PARKING ENDPOINTS ============

  /**
   * Get parking lots for a temple
   */
  getParkingLots: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      
      // Simulate some parking changes for realism
      simulateParkingChanges();
      
      const lots = getParkingLotsForTemple(templeId);
      const summary = getParkingSummary(templeId);

      res.json({
        success: true,
        templeId,
        summary,
        lots,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch parking lots" });
    }
  },

  /**
   * Get a specific parking lot
   */
  getParkingLot: async (req: Request, res: Response) => {
    try {
      const { lotId } = req.params;
      const lot = getParkingLotById(lotId);

      if (!lot) {
        return res.status(404).json({
          success: false,
          message: "Parking lot not found",
        });
      }

      const availableSpots = lot.totalSpots - lot.occupiedSpots;
      const occupancyPercentage = Math.round((lot.occupiedSpots / lot.totalSpots) * 100);

      res.json({
        success: true,
        lot: {
          ...lot,
          availableSpots,
          occupancyPercentage,
          status:
            occupancyPercentage > 90
              ? "full"
              : occupancyPercentage > 70
              ? "filling"
              : "available",
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch parking lot" });
    }
  },

  /**
   * Get best parking recommendation
   */
  getBestParking: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const vehicleType = (req.query.vehicle as "two-wheeler" | "car" | "bus") || "car";

      const bestLot = getBestParking(templeId, vehicleType);

      if (!bestLot) {
        return res.status(404).json({
          success: false,
          message: "No available parking found",
        });
      }

      res.json({
        success: true,
        templeId,
        vehicleType,
        recommendation: {
          ...bestLot,
          availableSpots: bestLot.totalSpots - bestLot.occupiedSpots,
          estimatedWalkTime: Math.ceil(bestLot.distanceFromTemple / 80), // 80m per minute walking
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to get parking recommendation" });
    }
  },

  /**
   * Check parking availability
   */
  checkParkingAvailability: async (req: Request, res: Response) => {
    try {
      const { lotId } = req.params;
      const spotsNeeded = parseInt(req.query.spots as string) || 1;

      const available = hasAvailableSpots(lotId, spotsNeeded);
      const lot = getParkingLotById(lotId);

      res.json({
        success: true,
        lotId,
        spotsNeeded,
        available,
        currentAvailable: lot ? lot.totalSpots - lot.occupiedSpots : 0,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to check availability" });
    }
  },

  /**
   * Update parking occupancy (for sensors/manual update)
   */
  updateParkingOccupancy: async (req: Request, res: Response) => {
    try {
      const { lotId } = req.params;
      const { change } = req.body; // +1 for entry, -1 for exit

      if (typeof change !== "number") {
        return res.status(400).json({
          success: false,
          message: "Change value required (positive for entry, negative for exit)",
        });
      }

      const updated = updateParkingOccupancy(lotId, change);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Parking lot not found",
        });
      }

      const lot = getParkingLotById(lotId);

      res.json({
        success: true,
        lotId,
        change,
        newOccupancy: lot?.occupiedSpots,
        available: lot ? lot.totalSpots - lot.occupiedSpots : 0,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to update parking" });
    }
  },

  /**
   * Get parking summary for all temples
   */
  getAllParkingSummary: async (_req: Request, res: Response) => {
    try {
      const templeIds = ["somnath", "dwarka", "ambaji", "pavagadh"];
      const summaries = templeIds.map((id) => ({
        templeId: id,
        ...getParkingSummary(id),
      }));

      res.json({
        success: true,
        data: summaries,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch parking summaries" });
    }
  },
};

export default phase2Controller;
