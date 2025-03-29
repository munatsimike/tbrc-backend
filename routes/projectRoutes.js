import express from "express";
import * as projectController from "../controllers/projectController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, projectController.getAllProjects);
router.get("/deleted", authMiddleware, projectController.getAllDeletedProjects);

router.get("/:id", authMiddleware, deobfuscateMiddleware, projectController.getProject);
router.get(
  "/dashboard/:id",
  authMiddleware,
  deobfuscateMiddleware,
  projectController.getProjectDashboard
);
router.post("/", authMiddleware, projectController.createProject);
router.post("/assign", authMiddleware, projectController.assignProject);
router.post("/update_access", authMiddleware, projectController.updateAccessLevel);
router.post("/unassign", authMiddleware, projectController.unassignProject);
router.put("/:id", authMiddleware, deobfuscateMiddleware, projectController.updateProject);
router.delete("/:id", authMiddleware, deobfuscateMiddleware, projectController.deleteProject);
router.put("/restore/:id", authMiddleware, deobfuscateMiddleware, projectController.restoreProject);


export default router;
