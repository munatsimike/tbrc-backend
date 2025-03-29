import db from "../config/db.js";
import { obfuscateId, deobfuscateId } from "./helpers/obfuscation.js";

// Get all InvoiceFiles
export const getAllInvoiceFiles = async (req, res) => {
  try {
    const [files] = await db.execute(`
      SELECT * FROM InvoiceFiles
      WHERE isDeleted = 0
    `);
    res.json(
      files.map((file) => ({
        ...file,
        id: obfuscateId(file.id),
        invoice_id: obfuscateId(file.invoice_id),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get InvoiceFiles with filters and pagination
export const superUserInvoiceFilesWithFilters = async (req, res) => {
  try {
    const { projectId, isDeleted = 0, page = 1, limit = 10 } = req.query;
    let deobfuscatedProjectId = projectId;
    if (projectId) {
      deobfuscatedProjectId = deobfuscateId(projectId);
    }
    if (!req.user.isSuperUser) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action." });
    }

    const offset = (page - 1) * limit;

    let countQuery = `
    SELECT COUNT(*) as count 
    FROM InvoiceFiles
    JOIN BudgetInvoices ON InvoiceFiles.invoice_id = BudgetInvoices.id
    JOIN BudgetPhases ON BudgetInvoices.budget_id = BudgetPhases.id
    JOIN Projects ON BudgetPhases.project_id = Projects.id
    WHERE InvoiceFiles.isDeleted = ?
  `;
    const countReplacements = [isDeleted];

    let query = `
    SELECT InvoiceFiles.*, Projects.id as projectId, Projects.name as projectName
    FROM InvoiceFiles
    JOIN BudgetInvoices ON InvoiceFiles.invoice_id = BudgetInvoices.id
    JOIN BudgetPhases ON BudgetInvoices.budget_id = BudgetPhases.id
    JOIN Projects ON BudgetPhases.project_id = Projects.id
    WHERE InvoiceFiles.isDeleted = ?
  `;
    const replacements = [isDeleted];

    if (projectId) {
      countQuery += ` AND Projects.id = ?`;
      query += ` AND Projects.id = ?`;
      countReplacements.push(deobfuscatedProjectId);
      replacements.push(deobfuscatedProjectId);
    }

    query += ` 
    ORDER BY InvoiceFiles.createdAt DESC
    LIMIT ${limit} OFFSET ${offset}`;

    const [countRows] = await db.execute(countQuery, countReplacements);
    const totalItems = countRows[0].count;
    const totalPages = Math.ceil(totalItems / limit);

    const [files] = await db.execute(query, replacements);
    res.json({
      totalItems,
      totalPages,
      currentPage: parseInt(page, 10),
      files: files.map((file) => ({
        ...file,
        id: obfuscateId(file.id),
        invoice_id: obfuscateId(file.invoice_id),
      })),
    });
  } catch (error) {
    console.error("Error fetching invoice files:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get InvoiceFiles by Invoice ID
export const getInvoiceFilesByInvoiceId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Invoice ID is required." });
    }
    const [files] = await db.execute(
      `
      SELECT * FROM InvoiceFiles
      WHERE invoice_id = ? AND isDeleted = 0
    `,
      [id]
    );
    res.json(
      files.map((file) => ({
        ...file,
        id: obfuscateId(file.id),
        invoice_id: obfuscateId(file.invoice_id),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get InvoiceFile by ID
export const getInvoiceFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const [file] = await db.execute(
      `
      SELECT * FROM InvoiceFiles
      WHERE id = ? AND isDeleted = 0
    `,
      [id]
    );

    if (file.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json({
      ...file[0],
      id: obfuscateId(file[0].id),
      invoice_id: obfuscateId(file[0].invoice_id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new InvoiceFile
export const createInvoiceFile = async (req, res) => {
  try {
    let { invoice_id, fileName, description, url } = req.body;
    invoice_id = deobfuscateId(invoice_id);

    const [result] = await db.execute(
      `
      INSERT INTO InvoiceFiles (invoice_id, fileName, description, url)
      VALUES (?, ?, ?, ?)
    `,
      [invoice_id, fileName, description, url]
    );

    const [file] = await db.execute(
      `
      SELECT * FROM InvoiceFiles
      WHERE id = ? AND isDeleted = 0
    `,
      [result.insertId]
    );

    res.status(201).json({
      file: {
        ...file[0],
        id: obfuscateId(file[0].id),
        invoice_id: obfuscateId(file[0].invoice_id),
      },
      message: "File created successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing InvoiceFile
export const updateInvoiceFile = async (req, res) => {
  try {
    const { fileName, description, url } = req.body;
    const fileId = req.params.id;

    const [result] = await db.execute(
      `
      UPDATE InvoiceFiles
      SET fileName = ?, description = ?
      WHERE id = ? AND isDeleted = 0
    `,
      [fileName, description, fileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const [updatedFile] = await db.execute(
      `
      SELECT * FROM InvoiceFiles
      WHERE id = ? AND isDeleted = 0
    `,
      [fileId]
    );

    res.json({
      file: {
        ...updatedFile[0],
        id: obfuscateId(updatedFile[0].id),
        invoice_id: obfuscateId(updatedFile[0].invoice_id),
      },
      message: "File updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Restore an InvoiceFile
export const restoreInvoiceFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const [result] = await db.execute(
      `
      UPDATE InvoiceFiles SET isDeleted = 0
      WHERE id = ?
    `,
      [fileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ message: "Restored file successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an InvoiceFile
export const deleteInvoiceFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const [result] = await db.execute(
      `
      UPDATE InvoiceFiles SET isDeleted = 1
      WHERE id = ?
    `,
      [fileId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ message: "Deleted file successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
