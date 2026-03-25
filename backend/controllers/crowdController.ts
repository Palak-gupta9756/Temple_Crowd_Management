import { Request, Response } from "express";
import { storage } from "../storage";
import { predictionService } from "../services/predictionService";
import { insertCrowdDataSchema, faceDetectionSchema } from "../shared/schema";
import { temples } from "../data/temples";

export const crowdController = {
  // Get all crowd data
  async getAll(req: Request, res: Response) {
    try {
      const data = await storage.getAllCrowdData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching crowd data:", error);
      res.status(500).json({ error: "Failed to fetch crowd data" });
    }
  },

  // Get crowd data by temple
  async getByTemple(req: Request, res: Response) {
    try {
      const { templeId } = req.params;
      const data = await storage.getCrowdDataByTemple(templeId);
      if (!data) {
        return res.status(404).json({ error: "Temple not found" });
      }
      res.json(data);
    } catch (error) {
      console.error("Error fetching temple crowd data:", error);
      res.status(500).json({ error: "Failed to fetch temple data" });
    }
  },

  // Get crowd history
  async getHistory(req: Request, res: Response) {
    try {
      const { templeId } = req.params;
      const hours = parseInt(req.query.hours as string) || 12;
      const history = await storage.getCrowdHistory(templeId, hours);
      res.json(history);
    } catch (error) {
      console.error("Error fetching crowd history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  },

  // Get prediction
  async getPrediction(req: Request, res: Response) {
    try {
      const { templeId } = req.params;
      const prediction = await predictionService.predictBestTime(templeId, 6);
      res.json({ prediction });
    } catch (error) {
      console.error("Error generating prediction:", error);
      res.status(500).json({ error: "Failed to generate prediction" });
    }
  },

  // Get predicted crowd level
  async getPredictedLevel(req: Request, res: Response) {
    try {
      const { templeId } = req.params;
      const targetHour = req.query.hour ? parseInt(req.query.hour as string) : undefined;
      const prediction = await predictionService.predictCrowdLevel(templeId, targetHour);
      res.json(prediction);
    } catch (error) {
      console.error("Error predicting crowd level:", error);
      res.status(500).json({ error: "Failed to predict crowd level" });
    }
  },

  // Predict for specific date
  async predictForDate(req: Request, res: Response) {
    try {
      const { templeId } = req.params;
      const dateStr = req.query.date as string;

      if (!dateStr) {
        return res.status(400).json({ error: "Date parameter required (YYYY-MM-DD)" });
      }

      const targetDate = new Date(dateStr);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const prediction = await predictionService.predictForDate(templeId, targetDate);
      res.json(prediction);
    } catch (error) {
      console.error("Error predicting for date:", error);
      res.status(500).json({ error: "Failed to predict for date" });
    }
  },

  // Update crowd data
  async update(req: Request, res: Response) {
    try {
      const validated = insertCrowdDataSchema.parse(req.body);
      const data = await storage.updateCrowdData(validated);
      res.json(data);
    } catch (error) {
      console.error("Error updating crowd data:", error);
      res.status(400).json({ error: "Invalid crowd data" });
    }
  },

  // Handle face detection data from camera/sensors
  async handleFaceDetection(req: Request, res: Response) {
    try {
      const validated = faceDetectionSchema.parse(req.body);
      const { templeId, faceCount, cameraId, confidence } = validated;

      // Get temple details
      const temple = temples.find(t => t.id === templeId);
      if (!temple) {
        return res.status(404).json({ error: "Temple not found" });
      }

      // Calculate status based on face count
      let status: string;
      let waitTime: number;

      if (faceCount <= 50) {
        status = "low";
        waitTime = Math.floor(faceCount * 0.5); // ~30 sec per person
      } else if (faceCount <= 150) {
        status = "moderate";
        waitTime = Math.floor(faceCount * 0.8); // ~48 sec per person
      } else if (faceCount <= 300) {
        status = "high";
        waitTime = Math.floor(faceCount * 1.2); // ~72 sec per person
      } else {
        status = "extreme";
        waitTime = Math.floor(faceCount * 1.5); // ~90 sec per person
      }

      // Update crowd data in storage
      const crowdData = await storage.updateCrowdData({
        templeId,
        templeName: temple.name,
        currentWaitTime: waitTime,
        status,
        visitorCount: faceCount,
      });

      res.json({
        success: true,
        data: {
          templeId,
          templeName: temple.name,
          detectedFaces: faceCount,
          crowdStatus: status,
          estimatedWaitTime: waitTime,
          cameraId: cameraId || "default",
          confidence: confidence || 1.0,
          timestamp: crowdData.timestamp,
        },
      });
    } catch (error) {
      console.error("Error processing face detection:", error);
      res.status(400).json({ error: "Invalid face detection data" });
    }
  },

  // Handle batch face detection from multiple cameras
  async handleBatchFaceDetection(req: Request, res: Response) {
    try {
      const { detections } = req.body;

      if (!Array.isArray(detections)) {
        return res.status(400).json({ error: "detections must be an array" });
      }

      const results = [];

      for (const detection of detections) {
        const validated = faceDetectionSchema.parse(detection);
        const { templeId, faceCount, cameraId, confidence } = validated;

        const temple = temples.find(t => t.id === templeId);
        if (!temple) continue;

        let status: string;
        let waitTime: number;

        if (faceCount <= 50) {
          status = "low";
          waitTime = Math.floor(faceCount * 0.5);
        } else if (faceCount <= 150) {
          status = "moderate";
          waitTime = Math.floor(faceCount * 0.8);
        } else if (faceCount <= 300) {
          status = "high";
          waitTime = Math.floor(faceCount * 1.2);
        } else {
          status = "extreme";
          waitTime = Math.floor(faceCount * 1.5);
        }

        const crowdData = await storage.updateCrowdData({
          templeId,
          templeName: temple.name,
          currentWaitTime: waitTime,
          status,
          visitorCount: faceCount,
        });

        results.push({
          templeId,
          templeName: temple.name,
          detectedFaces: faceCount,
          crowdStatus: status,
          estimatedWaitTime: waitTime,
          cameraId: cameraId || "default",
          confidence: confidence || 1.0,
          timestamp: crowdData.timestamp,
        });
      }

      res.json({
        success: true,
        processed: results.length,
        results,
      });
    } catch (error) {
      console.error("Error processing batch face detection:", error);
      res.status(400).json({ error: "Invalid batch detection data" });
    }
  },
};
