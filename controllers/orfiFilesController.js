import db from "../config/db.js";
import { obfuscateId, deobfuscateId, obfuscateArray } from "./helpers/obfuscation.js";

// Get all ORFIFiles
export const getAllORFIFiles = async (req, res) => {
  try {
    const [files] = await db.execute(`
      SELECT * FROM ORFIFiles
      WHERE isDeleted = 0
    `);

    // Obfuscate IDs before returning
    const obfuscatedFiles = files.map((file) => ({
      ...file,
      id: obfuscateId(file.id),
      orfi_id: obfuscateId(file.orfi_id),
    }));

    res.json(obfuscatedFiles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get ORFIFiles by ORFI
export const getORFIFilesByORFI = async (req, res) => {
  try {
    const orfiId = req.params.id;
    const [files] = await db.execute(
      `
      SELECT * FROM ORFIFiles
      WHERE orfi_id = ? AND isDeleted = 0
    `,
      [orfiId]
    );

    // Obfuscate IDs before returning
    const obfuscatedFiles = files.map((file) => ({
      ...file,
      id: obfuscateId(file.id),
      orfi_id: obfuscateId(file.orfi_id),
    }));

    res.json(obfuscatedFiles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create ORFIFiles
export const createORFIFiles = async (req, res) => {
  try {
    var { orfi_id, fileName, description, url } = req.body;
    orfi_id = deobfuscateId(orfi_id);
    const [result] = await db.execute(
      `
      INSERT INTO ORFIFiles (orfi_id, fileName, description, url)
      VALUES (?, ?, ?, ?)
    `,
      [orfi_id, fileName, description, url]
    );

    const [file] = await db.execute(
      `
      SELECT * FROM ORFIFiles
      WHERE id = ? AND isDeleted = 0
    `,
      [result.insertId]
    );

    // Obfuscate IDs before returning
    const obfuscatedFile = {
      ...file[0],
      id: obfuscateId(file[0].id),
      orfi_id: obfuscateId(file[0].orfi_id),
    };

    res.status(201).json(obfuscatedFile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update ORFIFiles
export const updateORFIFiles = async (req, res) => {
  try {
    const { fileName, description } = req.body;
    const orfiFileId = req.params.id;

    const [result] = await db.execute(
      `
      UPDATE ORFIFiles
      SET fileName=?, description = ?
      WHERE id = ? AND isDeleted = 0
    `,
      [fileName, description, orfiFileId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "File not found or already deleted" });
    }

    const [updatedFile] = await db.execute(
      `
      SELECT * FROM ORFIFiles
      WHERE id = ? AND isDeleted = 0
    `,
      [orfiFileId]
    );

    // Obfuscate IDs before returning
    const obfuscatedFile = {
      ...updatedFile[0],
      id: obfuscateId(updatedFile[0].id),
      orfi_id: obfuscateId(updatedFile[0].orfi_id),
    };

    res.json(obfuscatedFile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete ORFIFiles (Soft Delete)
export const deleteORFIFiles = async (req, res) => {
  try {
    const orfiFileId = req.params.id;

    const [result] = await db.execute(
      `
      UPDATE ORFIFiles
      SET isDeleted = 1
      WHERE id = ?
    `,
      [orfiFileId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "File not found or already deleted" });
    }

    res.json({ message: "File deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
