import express from "express";
import {
  getUserById,
  getUsersByProject,
  getUserByUsername,
  getAuthUserDetails,
  updateUserProfile,
  getUsers,
  deleteUser,
  createAndAssignUser,
  createUser,
  userExists,
  blockUnblockUser
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";

const router = express.Router();

// Route to get user information
router.post("/create-and-assign", authMiddleware, deobfuscateMiddleware, createAndAssignUser);
router.post("/create", authMiddleware, deobfuscateMiddleware, createUser);

router.get("/", authMiddleware,deobfuscateMiddleware, getUsers);
router.post("/exists", authMiddleware,deobfuscateMiddleware, userExists);

router.get("/me", authMiddleware, deobfuscateMiddleware, getAuthUserDetails);
router.put("/:id", authMiddleware, deobfuscateMiddleware, updateUserProfile);
router.put("/block/:id", authMiddleware, deobfuscateMiddleware, blockUnblockUser);
router.delete("/:id", authMiddleware, deobfuscateMiddleware, deleteUser);

router.get("/:id", authMiddleware, deobfuscateMiddleware, getUserById);
router.get(
  "/project/:id",
  authMiddleware,
  deobfuscateMiddleware,
  getUsersByProject
);
router.get(
  "/search/:username",
  authMiddleware,
  deobfuscateMiddleware,
  getUserByUsername
);

// Additional routes can be added here if needed
// For example: updating user information, deleting a user, etc.

export default router;
