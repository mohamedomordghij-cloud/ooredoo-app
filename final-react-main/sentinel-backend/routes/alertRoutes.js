import express from "express";
import { getAlerts, createAlert, acknowledgeAlert, resolveAlert } from "../controllers/alertController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAlerts);
router.post("/", protect, createAlert);
router.patch("/:id/acknowledge", protect, acknowledgeAlert);
router.patch("/:id/resolve", protect, authorize("administrator", "superviseur", "technicien"), resolveAlert);

export default router;
