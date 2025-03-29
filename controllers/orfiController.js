import ORFI from "../sequelizeModels/ORFI.js";
import ORFIFiles from "../sequelizeModels/ORFIFiles.js";
import Users from "../sequelizeModels/Users.js"; // Import Users model
import db from "../config/db.js";
import { deobfuscateId, obfuscateId } from "./helpers/obfuscation.js"; // Import obfuscateId

// Get all ORFIs with assigned user names
export const getAllORFIs = async (req, res) => {
  try {
    const [orfis] = await db.execute(`
      SELECT ORFI.*, Users.username AS assignedUserName
      FROM ORFI
      LEFT JOIN Users ON ORFI.assignedTo = Users.id
      WHERE ORFI.isDeleted = 0
    `);

    // Obfuscate IDs in the response
    const obfuscatedORFIs = orfis.map((orfi) => ({
      ...orfi,
      id: obfuscateId(orfi.id),
      assignedTo: obfuscateId(orfi.assignedTo),
      projectId: obfuscateId(orfi.projectId),
    }));

    res.json(obfuscatedORFIs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get ORFI by ID with assigned user username
export const getORFIById = async (req, res) => {
  try {
    const [orfis] = await db.execute(
      `
      SELECT ORFI.*, Users.username AS assignedUserName
      FROM ORFI
      LEFT JOIN Users ON ORFI.assignedTo = Users.id
      WHERE ORFI.id = ? AND ORFI.isDeleted = 0
    `,
      [req.params.id]
    );

    if (orfis.length === 0) {
      return res.status(404).json({ message: "ORFI not found" });
    }

    // Obfuscate ID in the response
    const obfuscatedORFI = {
      ...orfis[0],
      id: obfuscateId(orfis[0].id),
      assignedTo: obfuscateId(orfis[0].assignedTo),
      projectId: obfuscateId(orfis[0].projectId),
    };

    res.json(obfuscatedORFI);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new ORFI
export const createORFI = async (req, res) => {
  try {
    var { assignedTo, question, dueDate, resolved, projectId } = req.body;
    assignedTo = deobfuscateId(assignedTo);
    projectId = deobfuscateId(projectId);
    const now = new Date();

    const [result] = await db.execute(
      `
      INSERT INTO ORFI (assignedTo, question, dueDate, resolved, projectId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [assignedTo, question, dueDate, resolved, projectId, now, now]
    );

    const [orfis] = await db.execute(
      `
      SELECT ORFI.*, Users.username AS assignedUserName
      FROM ORFI
      LEFT JOIN Users ON ORFI.assignedTo = Users.id
      WHERE ORFI.id = ? AND ORFI.isDeleted = 0
    `,
      [result.insertId]
    );

    // Obfuscate ID in the response
    const obfuscatedORFI = {
      ...orfis[0],
      id: obfuscateId(orfis[0].id),
      assignedTo: obfuscateId(orfis[0].assignedTo),
      projectId: obfuscateId(orfis[0].projectId),
    };

    res.status(201).json(obfuscatedORFI);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update an existing ORFI
export const updateORFI = async (req, res) => {
  try {
    var { assignedTo, question, dueDate, resolved, projectId } = req.body;
    const orfiId = req.params.id;
    assignedTo = deobfuscateId(assignedTo);
    projectId = deobfuscateId(projectId);
    const now = new Date();

    const [result] = await db.execute(
      `
      UPDATE ORFI
      SET assignedTo = ?, question = ?, dueDate = ?, resolved = ?, projectId = ?, updatedAt = ?
      WHERE id = ? AND isDeleted = 0
    `,
      [assignedTo, question, dueDate, resolved, projectId, now, orfiId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "ORFI not found or already deleted" });
    }

    const [orfis] = await db.execute(
      `
      SELECT ORFI.*, Users.username AS assignedUserName
      FROM ORFI
      LEFT JOIN Users ON ORFI.assignedTo = Users.id
      WHERE ORFI.id = ? AND ORFI.isDeleted = 0
    `,
      [orfiId]
    );

    // Obfuscate ID in the response
    const obfuscatedORFI = {
      ...orfis[0],
      id: obfuscateId(orfis[0].id),
      assignedTo: obfuscateId(orfis[0].assignedTo),
      projectId: obfuscateId(orfis[0].projectId),
    };

    res.json(obfuscatedORFI);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an ORFI (Soft Delete)
export const deleteORFI = async (req, res) => {
  try {
    const orfiId = req.params.id;

    // Soft delete ORFI
    const [orfiResult] = await db.execute(
      `
      UPDATE ORFI
      SET isDeleted = 1
      WHERE id = ?
    `,
      [orfiId]
    );

    if (orfiResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "ORFI not found or already deleted" });
    }

    // Soft delete associated ORFIFiles
    await db.execute(
      `
      UPDATE ORFIFiles
      SET isDeleted = 1
      WHERE orfi_id = ?
    `,
      [orfiId]
    );

    res.json({ message: "ORFI and associated files deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get ORFIs by project ID with assigned user names
export const getORFIByProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const [orfis] = await db.execute(
      `
      SELECT ORFI.*, Users.username AS assignedUserName, Users.name AS assignedName, Users.avatar AS assignedAvatar
      FROM ORFI
      LEFT JOIN Users ON ORFI.assignedTo = Users.id
      WHERE ORFI.projectId = ? AND ORFI.isDeleted = 0
    `,
      [projectId]
    );

    // Obfuscate IDs in the response
    const obfuscatedORFIs = orfis.map((orfi) => ({
      ...orfi,
      id: obfuscateId(orfi.id),
      assignedTo: obfuscateId(orfi.assignedTo),
      projectId: obfuscateId(orfi.projectId),
    }));

    res.json(obfuscatedORFIs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
