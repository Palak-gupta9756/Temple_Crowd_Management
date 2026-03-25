/**
 * Phase 2 Routes - Festival, Weather, Routes, Parking APIs
 */

import { Router } from "express";
import { phase2Controller } from "../controllers/phase2Controller";

const router = Router();

// ============ FESTIVAL ROUTES ============
router.get("/festivals", phase2Controller.getAllFestivals);
router.get("/festivals/upcoming", phase2Controller.getUpcomingFestivals);
router.get("/festivals/check", phase2Controller.checkFestivalDate);
router.get("/festivals/temple/:templeId", phase2Controller.getTempleFestivals);
router.get("/festivals/temple/:templeId/range", phase2Controller.getFestivalsInRange);

// ============ WEATHER ROUTES ============
router.get("/weather/:templeId", phase2Controller.getTempleWeather);
router.get("/weather/:templeId/forecast", phase2Controller.getWeatherForecast);
router.get("/weather/:templeId/prediction", phase2Controller.getCombinedPrediction);

// ============ ROUTE OPTIMIZATION ROUTES ============
router.get("/routes/:templeId/map", phase2Controller.getTempleMap);
router.get("/routes/:templeId/zones", phase2Controller.getTempleZones);
router.get("/routes/:templeId/paths", phase2Controller.getTempleRoutes);
router.get("/routes/:templeId/optimal", phase2Controller.getOptimalRoute);

// ============ PARKING ROUTES ============
router.get("/parking", phase2Controller.getAllParkingSummary);
router.get("/parking/:templeId", phase2Controller.getParkingLots);
router.get("/parking/:templeId/best", phase2Controller.getBestParking);
router.get("/parking/lot/:lotId", phase2Controller.getParkingLot);
router.get("/parking/lot/:lotId/check", phase2Controller.checkParkingAvailability);
router.post("/parking/lot/:lotId/update", phase2Controller.updateParkingOccupancy);

export default router;
