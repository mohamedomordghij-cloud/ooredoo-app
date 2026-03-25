import express from "express";
import { getDatacenters, getDatacenter, createDatacenter, updateDatacenter, deleteDatacenter } from "../controllers/datacenterController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDatacenters);
router.get("/:id", protect, getDatacenter);
router.post("/", protect, authorize("administrator"), createDatacenter);
router.put("/:id", protect, authorize("administrator"), updateDatacenter);
router.delete("/:id", protect, authorize("administrator"), deleteDatacenter);

export default router;
