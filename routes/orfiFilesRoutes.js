import express from "express";
import {
  getAllORFIFiles,
  getORFIFilesByORFI,
  createORFIFiles,
  updateORFIFiles,
  deleteORFIFiles,
} from "../controllers/orfiFilesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, deobfuscateMiddleware, getAllORFIFiles);
router.get(
  "/orfi/:id",
  authMiddleware,
  deobfuscateMiddleware,
  getORFIFilesByORFI
);
router.post("/", authMiddleware, deobfuscateMiddleware, createORFIFiles);
router.put("/:id", authMiddleware, deobfuscateMiddleware, updateORFIFiles);
router.delete("/:id", authMiddleware, deobfuscateMiddleware, deleteORFIFiles);

export default router;
