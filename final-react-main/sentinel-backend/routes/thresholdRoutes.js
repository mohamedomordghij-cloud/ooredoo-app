import express from "express";
import { getThresholds, createThreshold, updateThreshold, deleteThreshold } from "../controllers/thresholdController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getThresholds);
router.post("/", protect, authorize("administrator", "superviseur"), createThreshold);
router.put("/:id", protect, authorize("administrator", "superviseur"), updateThreshold);
router.delete("/:id", protect, authorize("administrator"), deleteThreshold);

export default router;
