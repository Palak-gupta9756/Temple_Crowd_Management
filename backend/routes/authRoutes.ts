import { Router } from "express";
import { authController } from "../controllers/authController";

const router = Router();

router.post("/register", authController.register as any);
router.post("/login", authController.login as any);
router.get("/me", authController.me as any);
router.post("/logout", authController.logout as any);

export default router;
