import { Router } from "express";
import { crowdController } from "../controllers/crowdController";

const router = Router();

router.get("/all", crowdController.getAll as any);
router.get("/:templeId", crowdController.getByTemple as any);
router.get("/:templeId/history", crowdController.getHistory as any);
router.get("/:templeId/prediction", crowdController.getPrediction as any);
router.get("/:templeId/predicted-level", crowdController.getPredictedLevel as any);
router.get("/:templeId/predict-date", crowdController.predictForDate as any);
router.post("/update", crowdController.update as any);
router.post("/face-detect", crowdController.handleFaceDetection as any);
router.post("/face-detect/batch", crowdController.handleBatchFaceDetection as any);

export default router;
