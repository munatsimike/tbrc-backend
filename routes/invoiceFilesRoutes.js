import express from "express";
import {
  getAllInvoiceFiles,
  getInvoiceFileById,
  createInvoiceFile,
  updateInvoiceFile,
  deleteInvoiceFile,
  getInvoiceFilesByInvoiceId,
  superUserInvoiceFilesWithFilters,
  restoreInvoiceFile,
} from "../controllers/invoiceFilesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllInvoiceFiles);
router.get("/super/search", authMiddleware, superUserInvoiceFilesWithFilters);

router.get(
  "/budget-invoice/:id",
  authMiddleware,
  deobfuscateMiddleware,
  getInvoiceFilesByInvoiceId
);
router.get("/:id", authMiddleware, deobfuscateMiddleware, getInvoiceFileById);
router.post("/", authMiddleware, createInvoiceFile);
router.put("/:id", authMiddleware, deobfuscateMiddleware, updateInvoiceFile);
router.put("/restore/:id", authMiddleware, deobfuscateMiddleware, restoreInvoiceFile);

router.delete("/:id", authMiddleware, deobfuscateMiddleware, deleteInvoiceFile);

export default router;
