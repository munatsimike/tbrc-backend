import express from "express";
import {
  getAllORFIs,
  getORFIById,
  createORFI,
  updateORFI,
  deleteORFI,
  getORFIByProject,
} from "../controllers/orfiController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, deobfuscateMiddleware, getAllORFIs);
router.get("/:id", authMiddleware, deobfuscateMiddleware, getORFIById);
router.get(
  "/project/:id",
  authMiddleware,
  deobfuscateMiddleware,
  getORFIByProject
);
router.post("/", authMiddleware, deobfuscateMiddleware, createORFI);
router.put("/:id", authMiddleware, deobfuscateMiddleware, updateORFI);
router.delete("/:id", authMiddleware, deobfuscateMiddleware, deleteORFI);

export default router;
