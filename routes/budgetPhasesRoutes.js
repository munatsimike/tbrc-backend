import express from "express";
import {
  getAllBudgetPhases,
  getBudgetPhaseById,
  createBudgetPhase,
  updateBudgetPhase,
  deleteBudgetPhase,
  getBudgetPhasesByProject,
  getBudgetTree,
} from "../controllers/budgetPhasesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";


const router = express.Router();

router.get("/", authMiddleware, getAllBudgetPhases);
router.get(
  "/project/:id",
  authMiddleware,
  deobfuscateMiddleware,
  getBudgetPhasesByProject
);
router.get(
  "/project/:id/tree",
  authMiddleware,
  deobfuscateMiddleware,
  getBudgetTree
);

router.get("/:id", authMiddleware, deobfuscateMiddleware, getBudgetPhaseById);
router.post("/", authMiddleware, createBudgetPhase);
router.put("/:id", authMiddleware, deobfuscateMiddleware, updateBudgetPhase);
router.delete("/:id", authMiddleware, deobfuscateMiddleware, deleteBudgetPhase);

export default router;
