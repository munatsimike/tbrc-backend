import express from "express";
import {
  getAllBudgetInvoices,
  getBudgetInvoiceById,
  createBudgetInvoice,
  updateBudgetInvoice,
  deleteBudgetInvoice,
  getBudgetInvoicesByBudget,
} from "../controllers/budgetInvoicesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deobfuscateMiddleware } from "../middlewares/obfuscationMiddleware.js";


const router = express.Router();

router.get("/", authMiddleware, getAllBudgetInvoices);
router.get(
  "/budget/:id",
  authMiddleware,
  deobfuscateMiddleware,
  getBudgetInvoicesByBudget
);
router.get("/:id", authMiddleware, deobfuscateMiddleware, getBudgetInvoiceById);
router.post("/", authMiddleware, createBudgetInvoice);
router.put("/:id", authMiddleware, deobfuscateMiddleware, updateBudgetInvoice);
router.delete(
  "/:id",
  authMiddleware,
  deobfuscateMiddleware,
  deleteBudgetInvoice
);

export default router;
