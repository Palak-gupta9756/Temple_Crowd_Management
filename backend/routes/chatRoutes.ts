import { Router } from "express";
import { chatController } from "../controllers/chatController";

const router = Router();

router.post("/", chatController.sendMessage as any);
router.get("/:sessionId/history", chatController.getHistory as any);

export default router;
