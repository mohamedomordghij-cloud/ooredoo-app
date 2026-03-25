import express from "express";
import { getUsers, updateUserRole, deleteUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("administrator"), getUsers);
router.put("/:id/role", protect, authorize("administrator"), updateUserRole);
router.delete("/:id", protect, authorize("administrator"), deleteUser);

export default router;
