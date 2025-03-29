import express from "express";
import {
  getAllFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
  getImagesByFolder,
  getFoldersByProject,
  restoreFolder
} from "../controllers/folderController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, getAllFolders);
router.get("/:id", authMiddleware, deobfuscateMiddleware, getFolderById);
router.post("/", authMiddleware, createFolder);
router.put("/:id", authMiddleware, deobfuscateMiddleware,updateFolder);
router.put("/restore/:id", authMiddleware, deobfuscateMiddleware, restoreFolder);
router.delete("/:id", authMiddleware, deobfuscateMiddleware, deleteFolder);
router.get("/:id/images", authMiddleware, deobfuscateMiddleware, getImagesByFolder);
router.get("/projects/:id", authMiddleware, deobfuscateMiddleware, getFoldersByProject);


export default router;
