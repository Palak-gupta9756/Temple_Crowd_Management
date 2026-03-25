import { Router } from "express";
import { adminController } from "../controllers/adminController";

const router = Router();

router.get("/users", adminController.getAllUsers as any);
router.delete("/users/:id", adminController.deleteUser as any);

export default router;
