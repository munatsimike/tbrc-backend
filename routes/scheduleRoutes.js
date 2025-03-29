import express from "express";
import {
  // createSchedule,
  getAllSchedules,
  getSchedulesByProject,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "../controllers/schedulesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";

const router = express.Router();

// // Create a new schedule
// router.post("/", createSchedule);

// Get all schedules
router.get("/", authMiddleware, deobfuscateMiddleware, getAllSchedules);

// Get all budget phases by project
router.get(
  "/project/:id",
  authMiddleware,
  deobfuscateMiddleware,
  getSchedulesByProject
);

// Get a schedule by ID
router.get("/:id", authMiddleware, deobfuscateMiddleware, getScheduleById);

// Update a schedule by ID
router.put("/:id", authMiddleware, deobfuscateMiddleware, updateSchedule);

// Delete a schedule by ID
router.delete("/:id", authMiddleware, deobfuscateMiddleware, deleteSchedule);

export default router;
