/**
 * Phase 3 Controller - Safety & Emergency Features
 * Handles emergency alerts, medical facilities, lost & found
 * Now with MongoDB persistence
 */

import { Request, Response } from "express";
import {
  getFirstAidStations,
  getEmergencyContacts,
  getSafeZones,
  getCrowdThreshold,
  getNearestFirstAid,
  allFirstAidStations,
  allEmergencyContacts,
  allSafeZones,
  crowdThresholds
} from "../data/emergency";
import {
  getLostFoundOffice,
  lostFoundOffices,
  categoryLabels
} from "../data/lostFound";
import { LostItem, FoundItem, PanicAlert, MedicalRequest } from "../models";

export const phase3Controller = {
  // ============ EMERGENCY DATA ============

  getAllFirstAidStations: async (_req: Request, res: Response) => {
    try {
      const { templeId } = _req.query;
      
      if (templeId && typeof templeId === "string") {
        const stations = getFirstAidStations(templeId);
        res.json({ success: true, data: stations, templeId });
      } else {
        res.json({ success: true, data: allFirstAidStations });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch first-aid stations" });
    }
  },

  findNearestFirstAid: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      
      if (!templeId) {
        res.status(400).json({ success: false, error: "Temple ID is required" });
        return;
      }
      
      const station = getNearestFirstAid(templeId);
      
      if (!station) {
        res.status(404).json({ success: false, error: "No first-aid station found for this temple" });
        return;
      }
      
      res.json({ success: true, data: station, templeId });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to find nearest first-aid station" });
    }
  },

  getTempleEmergencyContacts: async (_req: Request, res: Response) => {
    try {
      const { templeId } = _req.query;
      
      if (templeId && typeof templeId === "string") {
        const contacts = getEmergencyContacts(templeId);
        res.json({ success: true, data: contacts, templeId });
      } else {
        res.json({ success: true, data: allEmergencyContacts });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch emergency contacts" });
    }
  },

  getTempleSafeZones: async (_req: Request, res: Response) => {
    try {
      const { templeId } = _req.query;
      
      if (templeId && typeof templeId === "string") {
        const zones = getSafeZones(templeId);
        res.json({ success: true, data: zones, templeId });
      } else {
        res.json({ success: true, data: allSafeZones });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch safe zones" });
    }
  },

  getTempleCrowdThresholds: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      
      if (!templeId) {
        res.json({ success: true, data: crowdThresholds });
        return;
      }
      
      const threshold = getCrowdThreshold(templeId);
      
      if (!threshold) {
        res.status(404).json({ success: false, error: "No threshold data for this temple" });
        return;
      }
      
      res.json({ success: true, data: threshold, templeId });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch crowd thresholds" });
    }
  },

  getCompleteEmergencyInfo: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      
      if (!templeId) {
        res.status(400).json({ success: false, error: "Temple ID is required" });
        return;
      }
      
      const info = {
        templeId,
        firstAidStations: getFirstAidStations(templeId),
        emergencyContacts: getEmergencyContacts(templeId),
        safeZones: getSafeZones(templeId),
        crowdThreshold: getCrowdThreshold(templeId),
        lostFoundOffice: getLostFoundOffice(templeId)
      };
      
      res.json({ success: true, data: info });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch emergency info" });
    }
  },

  // ============ PANIC ALERTS (MongoDB) ============

  sendPanicAlert: async (req: Request, res: Response) => {
    try {
      const { templeId, alertType, location, coordinates, reporterName, reporterPhone, description, priority } = req.body;
      
      if (!templeId || !alertType || !location || !reporterPhone) {
        res.status(400).json({ 
          success: false, 
          error: "Required fields: templeId, alertType, location, reporterPhone" 
        });
        return;
      }
      
      const alert = new PanicAlert({
        templeId,
        alertType,
        location,
        coordinates,
        reporterName,
        reporterPhone,
        description,
        priority: priority || "high",
        status: "active"
      });
      
      await alert.save();
      
      res.status(201).json({ 
        success: true, 
        data: alert,
        message: "Emergency alert has been sent to temple control room",
        helpIsOnTheWay: true,
        estimatedResponse: "2-5 minutes"
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to send panic alert" });
    }
  },

  getPanicAlerts: async (_req: Request, res: Response) => {
    try {
      const { templeId, status } = _req.query;
      
      const filter: any = {};
      if (templeId && typeof templeId === "string") filter.templeId = templeId;
      if (status && typeof status === "string") filter.status = status;
      
      const alerts = await PanicAlert.find(filter).sort({ createdAt: -1 });
      
      res.json({ success: true, data: alerts });
    } catch (error) {
      console.error("Error fetching panic alerts:", error);
      res.status(500).json({ success: false, error: "Failed to fetch panic alerts" });
    }
  },

  updateAlertStatus: async (req: Request, res: Response) => {
    try {
      const { alertId } = req.params;
      const { status, responseNotes } = req.body;
      
      if (!["active", "responding", "resolved", "false-alarm"].includes(status)) {
        res.status(400).json({ success: false, error: "Invalid status" });
        return;
      }
      
      const updateData: any = { status };
      if (status === "resolved") updateData.resolvedAt = new Date();
      if (responseNotes) updateData.responseNotes = responseNotes;
      
      const alert = await PanicAlert.findByIdAndUpdate(alertId, updateData, { new: true });
      
      if (!alert) {
        res.status(404).json({ success: false, error: "Alert not found" });
        return;
      }
      
      res.json({ success: true, data: alert });
    } catch (error) {
      console.error("Error updating alert:", error);
      res.status(500).json({ success: false, error: "Failed to update alert status" });
    }
  },

  // ============ LOST & FOUND (MongoDB) ============

  getReportedLostItems: async (_req: Request, res: Response) => {
    try {
      const { templeId, category, status } = _req.query;
      
      const filter: any = {};
      if (templeId && typeof templeId === "string") filter.templeId = templeId;
      if (category && typeof category === "string") filter.category = category;
      if (status && typeof status === "string") filter.status = status;
      
      const items = await LostItem.find(filter).sort({ reportedAt: -1 });
      
      res.json({ success: true, data: items, total: items.length });
    } catch (error) {
      console.error("Error fetching lost items:", error);
      res.status(500).json({ success: false, error: "Failed to fetch lost items" });
    }
  },

  getReportedFoundItems: async (_req: Request, res: Response) => {
    try {
      const { templeId, category, status } = _req.query;
      
      const filter: any = {};
      if (templeId && typeof templeId === "string") filter.templeId = templeId;
      if (category && typeof category === "string") filter.category = category;
      if (status && typeof status === "string") filter.status = status;
      
      const items = await FoundItem.find(filter).sort({ foundAt: -1 });
      
      res.json({ success: true, data: items, total: items.length });
    } catch (error) {
      console.error("Error fetching found items:", error);
      res.status(500).json({ success: false, error: "Failed to fetch found items" });
    }
  },

  getItemDetails: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      
      const lostItem = await LostItem.findById(itemId);
      if (lostItem) {
        res.json({ success: true, data: lostItem, itemType: "lost" });
        return;
      }
      
      const foundItem = await FoundItem.findById(itemId);
      if (foundItem) {
        res.json({ success: true, data: foundItem, itemType: "found" });
        return;
      }
      
      res.status(404).json({ success: false, error: "Item not found" });
    } catch (error) {
      console.error("Error fetching item details:", error);
      res.status(500).json({ success: false, error: "Failed to fetch item details" });
    }
  },

  submitLostItemReport: async (req: Request, res: Response) => {
    try {
      const { 
        templeId, category, description, color, brand, 
        reporterName, reporterPhone, reporterEmail, additionalDetails, imageUrl
      } = req.body;
      
      if (!templeId || !category || !description || !reporterName || !reporterPhone) {
        res.status(400).json({ 
          success: false, 
          error: "Required fields: templeId, category, description, reporterName, reporterPhone" 
        });
        return;
      }
      
      const newItem = new LostItem({
        templeId,
        category,
        description,
        color,
        brand,
        reporterName,
        reporterPhone,
        reporterEmail,
        additionalDetails,
        imageUrl,
        status: "lost"
      });
      
      await newItem.save();
      
      const office = getLostFoundOffice(templeId);
      
      res.status(201).json({ 
        success: true, 
        data: newItem,
        message: "Lost item reported successfully. Our team will contact you if found.",
        contactOffice: office
      });
    } catch (error) {
      console.error("Error reporting lost item:", error);
      res.status(500).json({ success: false, error: "Failed to report lost item" });
    }
  },

  submitFoundItemReport: async (req: Request, res: Response) => {
    try {
      const { 
        templeId, category, description, color, foundLocation, 
        finderName, finderPhone, storedAt, additionalDetails, imageUrl
      } = req.body;
      
      if (!templeId || !category || !description || !foundLocation || !storedAt) {
        res.status(400).json({ 
          success: false, 
          error: "Required fields: templeId, category, description, foundLocation, storedAt" 
        });
        return;
      }
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      const newItem = new FoundItem({
        templeId,
        category,
        description,
        color,
        foundLocation,
        finderName,
        finderPhone,
        storedAt,
        additionalDetails,
        imageUrl,
        expiryDate,
        status: "awaiting-claim"
      });
      
      await newItem.save();
      
      res.status(201).json({ 
        success: true, 
        data: newItem,
        message: "Found item registered. Owner may claim within 30 days."
      });
    } catch (error) {
      console.error("Error reporting found item:", error);
      res.status(500).json({ success: false, error: "Failed to report found item" });
    }
  },

  claimItem: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const { claimedBy, claimedByPhone, verificationMethod } = req.body;
      
      if (!claimedBy || !claimedByPhone || !verificationMethod) {
        res.status(400).json({ 
          success: false, 
          error: "Required fields: claimedBy, claimedByPhone, verificationMethod" 
        });
        return;
      }
      
      const item = await FoundItem.findOneAndUpdate(
        { _id: itemId, status: "awaiting-claim" },
        { 
          status: "claimed",
          claimDetails: {
            claimedAt: new Date(),
            claimedBy,
            claimedByPhone,
            verificationMethod
          }
        },
        { new: true }
      );
      
      if (!item) {
        res.status(404).json({ success: false, error: "Item not found or already claimed" });
        return;
      }
      
      res.json({ 
        success: true, 
        data: item,
        message: "Item claimed successfully. Please collect from the office."
      });
    } catch (error) {
      console.error("Error claiming item:", error);
      res.status(500).json({ success: false, error: "Failed to claim item" });
    }
  },

  searchLostFound: async (_req: Request, res: Response) => {
    try {
      const { query, templeId } = _req.query;
      
      if (!query || typeof query !== "string") {
        res.status(400).json({ success: false, error: "Search query is required" });
        return;
      }
      
      const searchRegex = new RegExp(query, "i");
      const filter: any = {
        $or: [
          { description: searchRegex },
          { category: searchRegex },
          { color: searchRegex },
          { brand: searchRegex }
        ]
      };
      
      if (templeId && typeof templeId === "string") {
        filter.templeId = templeId;
      }
      
      const [lost, found] = await Promise.all([
        LostItem.find(filter).sort({ reportedAt: -1 }),
        FoundItem.find(filter).sort({ foundAt: -1 })
      ]);
      
      res.json({ 
        success: true, 
        data: { lost, found },
        totalLost: lost.length,
        totalFound: found.length
      });
    } catch (error) {
      console.error("Error searching items:", error);
      res.status(500).json({ success: false, error: "Failed to search items" });
    }
  },

  getLostFoundStatistics: async (_req: Request, res: Response) => {
    try {
      const { templeId } = _req.query;
      
      const filter: any = {};
      if (templeId && typeof templeId === "string") {
        filter.templeId = templeId;
      }
      
      const [
        totalLost,
        totalFound,
        lostByStatus,
        foundByStatus,
        lostByCategory,
        foundByCategory
      ] = await Promise.all([
        LostItem.countDocuments(filter),
        FoundItem.countDocuments(filter),
        LostItem.aggregate([
          { $match: filter },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        FoundItem.aggregate([
          { $match: filter },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        LostItem.aggregate([
          { $match: filter },
          { $group: { _id: "$category", count: { $sum: 1 } } }
        ]),
        FoundItem.aggregate([
          { $match: filter },
          { $group: { _id: "$category", count: { $sum: 1 } } }
        ])
      ]);
      
      res.json({ 
        success: true, 
        data: {
          totalLost,
          totalFound,
          lostByStatus: Object.fromEntries(lostByStatus.map((s: any) => [s._id, s.count])),
          foundByStatus: Object.fromEntries(foundByStatus.map((s: any) => [s._id, s.count])),
          lostByCategory: Object.fromEntries(lostByCategory.map((c: any) => [c._id, c.count])),
          foundByCategory: Object.fromEntries(foundByCategory.map((c: any) => [c._id, c.count])),
          categories: categoryLabels
        }
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ success: false, error: "Failed to fetch statistics" });
    }
  },

  getLostFoundOfficeInfo: async (_req: Request, res: Response) => {
    try {
      const { templeId } = _req.query;
      
      if (templeId && typeof templeId === "string") {
        const office = getLostFoundOffice(templeId);
        if (!office) {
          res.status(404).json({ success: false, error: "Office not found for this temple" });
          return;
        }
        res.json({ success: true, data: office });
      } else {
        res.json({ success: true, data: lostFoundOffices });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch office info" });
    }
  },

  // ============ MEDICAL ASSISTANCE (MongoDB) ============

  requestMedicalAssistance: async (req: Request, res: Response) => {
    try {
      const { 
        templeId, emergencyType, patientName, patientAge, patientGender,
        description, location, coordinates, contactPhone, priority 
      } = req.body;
      
      if (!templeId || !emergencyType || !patientName || !description || !location || !contactPhone) {
        res.status(400).json({ 
          success: false, 
          error: "Required: templeId, emergencyType, patientName, description, location, contactPhone" 
        });
        return;
      }
      
      const request = new MedicalRequest({
        templeId,
        emergencyType,
        patientName,
        patientAge,
        patientGender,
        description,
        location,
        coordinates,
        contactPhone,
        priority: priority || "high",
        status: "pending"
      });
      
      await request.save();
      
      const nearestStation = getNearestFirstAid(templeId);
      
      res.status(201).json({ 
        success: true, 
        data: request,
        message: "Medical assistance request received",
        nearestFirstAid: nearestStation,
        estimatedResponse: priority === "critical" ? "1-3 minutes" : "3-5 minutes"
      });
    } catch (error) {
      console.error("Error requesting medical assistance:", error);
      res.status(500).json({ success: false, error: "Failed to request medical assistance" });
    }
  },

  getMedicalRequests: async (_req: Request, res: Response) => {
    try {
      const { templeId, status } = _req.query;
      
      const filter: any = {};
      if (templeId && typeof templeId === "string") filter.templeId = templeId;
      if (status && typeof status === "string") filter.status = status;
      
      const requests = await MedicalRequest.find(filter).sort({ createdAt: -1 });
      
      res.json({ success: true, data: requests });
    } catch (error) {
      console.error("Error fetching medical requests:", error);
      res.status(500).json({ success: false, error: "Failed to fetch medical requests" });
    }
  },

  updateMedicalRequestStatus: async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      const { status, responseNotes } = req.body;
      
      const updateData: any = { status };
      if (status === "dispatched") updateData.respondedAt = new Date();
      if (status === "resolved" || status === "hospital-transfer") updateData.resolvedAt = new Date();
      if (responseNotes) updateData.responseNotes = responseNotes;
      
      const request = await MedicalRequest.findByIdAndUpdate(requestId, updateData, { new: true });
      
      if (!request) {
        res.status(404).json({ success: false, error: "Request not found" });
        return;
      }
      
      res.json({ success: true, data: request });
    } catch (error) {
      console.error("Error updating medical request:", error);
      res.status(500).json({ success: false, error: "Failed to update request status" });
    }
  },

  // ============ ADMIN ROUTES (MongoDB) ============

  adminUpdateLostItemStatus: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const { status, foundAt } = req.body;
      
      if (!status) {
        res.status(400).json({ success: false, error: "Status is required" });
        return;
      }
      
      const updateData: any = { status };
      if (foundAt) updateData.foundAt = foundAt;
      
      const updatedItem = await LostItem.findByIdAndUpdate(itemId, updateData, { new: true });
      
      if (!updatedItem) {
        res.status(404).json({ success: false, error: "Item not found" });
        return;
      }
      
      res.json({ success: true, data: updatedItem });
    } catch (error) {
      console.error("Error updating lost item:", error);
      res.status(500).json({ success: false, error: "Failed to update lost item status" });
    }
  },

  adminDeleteLostItem: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      
      const deleted = await LostItem.findByIdAndDelete(itemId);
      
      if (!deleted) {
        res.status(404).json({ success: false, error: "Item not found" });
        return;
      }
      
      res.json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting lost item:", error);
      res.status(500).json({ success: false, error: "Failed to delete lost item" });
    }
  },

  adminUpdateFoundItemStatus: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const { status } = req.body;
      
      if (!status) {
        res.status(400).json({ success: false, error: "Status is required" });
        return;
      }
      
      const updatedItem = await FoundItem.findByIdAndUpdate(itemId, { status }, { new: true });
      
      if (!updatedItem) {
        res.status(404).json({ success: false, error: "Item not found" });
        return;
      }
      
      res.json({ success: true, data: updatedItem });
    } catch (error) {
      console.error("Error updating found item:", error);
      res.status(500).json({ success: false, error: "Failed to update found item status" });
    }
  },

  adminDeleteFoundItem: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      
      const deleted = await FoundItem.findByIdAndDelete(itemId);
      
      if (!deleted) {
        res.status(404).json({ success: false, error: "Item not found" });
        return;
      }
      
      res.json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting found item:", error);
      res.status(500).json({ success: false, error: "Failed to delete found item" });
    }
  },

  adminDeletePanicAlert: async (req: Request, res: Response) => {
    try {
      const { alertId } = req.params;
      
      const deleted = await PanicAlert.findByIdAndDelete(alertId);
      
      if (!deleted) {
        res.status(404).json({ success: false, error: "Alert not found" });
        return;
      }
      
      res.json({ success: true, message: "Alert deleted successfully" });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ success: false, error: "Failed to delete alert" });
    }
  },

  adminDeleteMedicalRequest: async (req: Request, res: Response) => {
    try {
      const { requestId } = req.params;
      
      const deleted = await MedicalRequest.findByIdAndDelete(requestId);
      
      if (!deleted) {
        res.status(404).json({ success: false, error: "Request not found" });
        return;
      }
      
      res.json({ success: true, message: "Request deleted successfully" });
    } catch (error) {
      console.error("Error deleting request:", error);
      res.status(500).json({ success: false, error: "Failed to delete request" });
    }
  },

  // Temple-specific emergency data routes
  getFirstAidStationsByTemple: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const stations = getFirstAidStations(templeId);
      res.json({ success: true, data: stations });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch first aid stations" });
    }
  },

  getEmergencyContactsByTemple: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const contacts = getEmergencyContacts(templeId);
      res.json({ success: true, data: contacts });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch emergency contacts" });
    }
  },

  getSafeZonesByTemple: async (req: Request, res: Response) => {
    try {
      const { templeId } = req.params;
      const zones = getSafeZones(templeId);
      res.json({ success: true, data: zones });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch safe zones" });
    }
  }
};
