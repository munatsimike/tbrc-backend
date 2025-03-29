import express from "express";
import * as imageController from "../controllers/imageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";
const router = express.Router();

// Route to get all images
router.get("/", authMiddleware, deobfuscateMiddleware, imageController.getAllImages);
router.get("/tags", authMiddleware, deobfuscateMiddleware, imageController.getAllTags);
router.get("/super/search", authMiddleware, deobfuscateMiddleware, imageController.getAllForSuperuser);

// Route to get a single image by ID
router.get("/:id", authMiddleware, deobfuscateMiddleware, imageController.getImage);

// Route to create a new image
router.post("/", authMiddleware, imageController.createImage);
router.put(
  "/restore/:id",
  authMiddleware,
  deobfuscateMiddleware,
  imageController.restoreImage
);

// Route to update an existing image by ID
router.put("/:id", authMiddleware, deobfuscateMiddleware, imageController.updateImage);

// Route to soft delete an image by ID
router.delete("/:id", authMiddleware, deobfuscateMiddleware, imageController.deleteImage);

export default router;
