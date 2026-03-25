/**
 * Phase 3 Routes - Safety & Emergency Features
 * All routes prefixed with /api/v3/
 */

import { Router } from "express";
import { phase3Controller } from "../controllers/phase3Controller";

const router = Router();

// ============ EMERGENCY INFO ROUTES ============

// GET /api/v3/emergency/first-aid - Get all first-aid stations
router.get("/emergency/first-aid", phase3Controller.getAllFirstAidStations);

// GET /api/v3/emergency/first-aid/nearest/:templeId - Get nearest first-aid for a temple
router.get("/emergency/first-aid/nearest/:templeId", phase3Controller.findNearestFirstAid);

// GET /api/v3/emergency/contacts - Get emergency contacts
router.get("/emergency/contacts", phase3Controller.getTempleEmergencyContacts);

// GET /api/v3/emergency/safe-zones - Get safe zones/assembly points
router.get("/emergency/safe-zones", phase3Controller.getTempleSafeZones);

// GET /api/v3/emergency/thresholds/:templeId? - Get crowd thresholds
router.get("/emergency/thresholds/:templeId?", phase3Controller.getTempleCrowdThresholds);

// GET /api/v3/emergency/info/:templeId - Get complete emergency info for a temple
router.get("/emergency/info/:templeId", phase3Controller.getCompleteEmergencyInfo);

// ============ PANIC ALERT ROUTES ============

// POST /api/v3/alerts/panic - Send a panic/emergency alert
router.post("/alerts/panic", phase3Controller.sendPanicAlert);

// GET /api/v3/alerts/panic - Get all panic alerts (admin)
router.get("/alerts/panic", phase3Controller.getPanicAlerts);

// PATCH /api/v3/alerts/panic/:alertId - Update alert status
router.patch("/alerts/panic/:alertId", phase3Controller.updateAlertStatus);

// ============ LOST & FOUND ROUTES ============

// GET /api/v3/lost-found/lost - Get all lost items
router.get("/lost-found/lost", phase3Controller.getReportedLostItems);

// GET /api/v3/lost-found/found - Get all found items
router.get("/lost-found/found", phase3Controller.getReportedFoundItems);

// GET /api/v3/lost-found/item/:itemId - Get item details
router.get("/lost-found/item/:itemId", phase3Controller.getItemDetails);

// POST /api/v3/lost-found/lost - Report a lost item
router.post("/lost-found/lost", phase3Controller.submitLostItemReport);

// POST /api/v3/lost-found/found - Report a found item
router.post("/lost-found/found", phase3Controller.submitFoundItemReport);

// POST /api/v3/lost-found/claim/:itemId - Claim a found item
router.post("/lost-found/claim/:itemId", phase3Controller.claimItem);

// GET /api/v3/lost-found/search - Search lost & found items
router.get("/lost-found/search", phase3Controller.searchLostFound);

// GET /api/v3/lost-found/stats - Get statistics
router.get("/lost-found/stats", phase3Controller.getLostFoundStatistics);

// GET /api/v3/lost-found/offices - Get lost & found office info
router.get("/lost-found/offices", phase3Controller.getLostFoundOfficeInfo);

// ============ MEDICAL ASSISTANCE ROUTES ============

// POST /api/v3/medical/request - Request medical assistance
router.post("/medical/request", phase3Controller.requestMedicalAssistance);

// GET /api/v3/medical/requests - Get all medical requests (admin)
router.get("/medical/requests", phase3Controller.getMedicalRequests);

// PATCH /api/v3/medical/request/:requestId - Update request status
router.patch("/medical/request/:requestId", phase3Controller.updateMedicalRequestStatus);

// ============ ADMIN ROUTES ============

// PATCH /api/v3/admin/lost-found/lost/:itemId/status - Update lost item status
router.patch("/admin/lost-found/lost/:itemId/status", phase3Controller.adminUpdateLostItemStatus);

// DELETE /api/v3/admin/lost-found/lost/:itemId - Delete lost item
router.delete("/admin/lost-found/lost/:itemId", phase3Controller.adminDeleteLostItem);

// PATCH /api/v3/admin/lost-found/found/:itemId/status - Update found item status
router.patch("/admin/lost-found/found/:itemId/status", phase3Controller.adminUpdateFoundItemStatus);

// DELETE /api/v3/admin/lost-found/found/:itemId - Delete found item
router.delete("/admin/lost-found/found/:itemId", phase3Controller.adminDeleteFoundItem);

// DELETE /api/v3/admin/alerts/:alertId - Delete panic alert
router.delete("/admin/alerts/:alertId", phase3Controller.adminDeletePanicAlert);

// DELETE /api/v3/admin/medical/:requestId - Delete medical request
router.delete("/admin/medical/:requestId", phase3Controller.adminDeleteMedicalRequest);

// GET /api/v3/emergency/first-aid/:templeId - Get first-aid stations for a temple
router.get("/emergency/first-aid/:templeId", phase3Controller.getFirstAidStationsByTemple);

// GET /api/v3/emergency/contacts/:templeId - Get emergency contacts for a temple
router.get("/emergency/contacts/:templeId", phase3Controller.getEmergencyContactsByTemple);

// GET /api/v3/emergency/safe-zones/:templeId - Get safe zones for a temple
router.get("/emergency/safe-zones/:templeId", phase3Controller.getSafeZonesByTemple);

export default router;
