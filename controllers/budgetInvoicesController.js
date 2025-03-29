import db from "../config/db.js";
import { obfuscateId, obfuscateArray, deobfuscateId } from "./helpers/obfuscation.js";

// Get all BudgetInvoices
export const getAllBudgetInvoices = async (req, res) => {
  try {
    const [invoices] = await db.execute(`
      SELECT BudgetInvoices.*, Users.username AS assignedToUsername
      FROM BudgetInvoices
      LEFT JOIN Users ON BudgetInvoices.assignedTo = Users.id
      WHERE BudgetInvoices.isDeleted = 0
    `);

    res.json(obfuscateArray(invoices));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get BudgetInvoices by Budget ID
export const getBudgetInvoicesByBudget = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Budget ID is required." });
    }

    const [invoices] = await db.execute(
      `
      SELECT BudgetInvoices.*, Users.username AS assignedToUsername,
      Users.name AS assignedToName, Users.avatar AS assignedToAvatar
      FROM BudgetInvoices
      LEFT JOIN Users ON BudgetInvoices.assignedTo = Users.id
      WHERE BudgetInvoices.budget_id = ? AND BudgetInvoices.isDeleted = 0
    `,
      [id]
    );

    res.json(obfuscateArray(invoices));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get BudgetInvoice by ID
export const getBudgetInvoiceById = async (req, res) => {
  try {
    const [invoice] = await db.execute(
      `
      SELECT BudgetInvoices.*, Users.username AS assignedToUsername
      FROM BudgetInvoices
      LEFT JOIN Users ON BudgetInvoices.assignedTo = Users.id
      WHERE BudgetInvoices.id = ? AND BudgetInvoices.isDeleted = 0
    `,
      [req.params.id]
    );

    if (invoice.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice[0].id = obfuscateId(invoice[0].id);
    res.json(invoice[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new BudgetInvoice
export const createBudgetInvoice = async (req, res) => {
  try {
    var { budget_id, assignedTo, date, amount, paid } = req.body;
    budget_id = deobfuscateId(budget_id);
    // assignedTo = deobfuscateId(assignedTo);
    assignedTo = req.user.id; // Assign the logged in user to the invoice for now as vendor is taken from the parent budget
    const [result] = await db.execute(
      `
      INSERT INTO BudgetInvoices (budget_id, assignedTo, date, amount, paid)
      VALUES (?, ?, ?, ?, ?)
    `,
      [budget_id, assignedTo, date, amount, paid]
    );

    const [invoice] = await db.execute(
      `
      SELECT BudgetInvoices.*, Users.username AS assignedToUsername
      FROM BudgetInvoices
      LEFT JOIN Users ON BudgetInvoices.assignedTo = Users.id
      WHERE BudgetInvoices.id = ? AND BudgetInvoices.isDeleted = 0
    `,
      [result.insertId]
    );

    invoice[0].id = obfuscateId(invoice[0].id);
    res.status(201).json({
      invoice: invoice[0],
      message: "Invoice created successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing BudgetInvoice
export const updateBudgetInvoice = async (req, res) => {
  try {
    var { budget_id, assignedTo, date, amount, paid } = req.body;
    const invoiceId = req.params.id;
    budget_id = deobfuscateId(budget_id);
    // assignedTo = deobfuscateId(assignedTo);
    assignedTo = req.user.id; // Assign the logged in user to the invoice for now as vendor is taken from the parent budget
    const [result] = await db.execute(
      `
      UPDATE BudgetInvoices
      SET budget_id = ?, assignedTo = ?, date = ?, amount = ?, paid = ?
      WHERE id = ? AND isDeleted = 0
    `,
      [budget_id, assignedTo, date, amount, paid, invoiceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const [updatedInvoice] = await db.execute(
      `
      SELECT BudgetInvoices.*, Users.username AS assignedToUsername
      FROM BudgetInvoices
      LEFT JOIN Users ON BudgetInvoices.assignedTo = Users.id
      WHERE BudgetInvoices.id = ? AND BudgetInvoices.isDeleted = 0
    `,
      [invoiceId]
    );

    updatedInvoice[0].id = obfuscateId(updatedInvoice[0].id);
    res.json({
      invoice: updatedInvoice[0],
      message: "Invoice updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a BudgetInvoice
export const deleteBudgetInvoice = async (req, res) => {
  try {
    const invoiceID = req.params.id;

    // Soft delete the invoice
    const invoiceResult = await db.execute(
      `
      UPDATE BudgetInvoices SET isDeleted = 1
      WHERE id = ?
    `,
      [invoiceID]
    );

    if (invoiceResult[0].affectedRows === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Soft delete associated invoice files
    const invoiceFilesResult = await db.execute(
      `
      UPDATE InvoiceFiles SET isDeleted = 1
      WHERE invoice_id = ?
    `,
      [invoiceID]
    );

    res.json({ message: "Deleted Invoice successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
