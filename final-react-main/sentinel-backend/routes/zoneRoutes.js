import express from "express";
import { getZones, getZone, createZone, updateZone, deleteZone } from "../controllers/zoneController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getZones);
router.get("/:id", protect, getZone);
router.post("/", protect, authorize("administrator", "superviseur"), createZone);
router.put("/:id", protect, authorize("administrator", "superviseur"), updateZone);
router.delete("/:id", protect, authorize("administrator"), deleteZone);

export default router;
