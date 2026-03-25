import { Router } from "express";
import { bookingController } from "../controllers/bookingController";

const router = Router();

router.post("/", bookingController.create as any);
router.get("/", bookingController.getAll as any);
router.get("/all", bookingController.getAll as any);
router.get("/temple/:templeId", bookingController.getByTemple as any);
router.patch("/:id/status", bookingController.updateStatus as any);

export default router;
