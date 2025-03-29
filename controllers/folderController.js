import Folders from "../sequelizeModels/Folders.js";
import Images from "../sequelizeModels/Images.js";
import Tags from "../sequelizeModels/Tags.js";
import { deobfuscateId, obfuscateId, obfuscateUserId } from "./helpers/obfuscation.js";
import * as imageModel from "../models/imageModel.js";
import sequelize from "../config/database.js";



// Get all folders
export const getAllFolders = async (req, res) => {
  try {
    const folders = await Folders.findAll({ raw: true });
    const obfuscatedFolders = folders.map((folder) => ({
      ...folder,
      projectId: obfuscateId(folder.projectId),
      id: obfuscateId(folder.id),
    }));
    res.json(obfuscatedFolders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get folders by project ID
export const getFoldersByProject = async (req, res) => {
  try {
    const { id } = req.params;
    let folders = [];
    if (req.user.isSuperUser) {
      console.log("Superuser fetching all folders");
      folders = await Folders.findAll({
        where: { projectId: id },
        raw: true, // Fetch raw data
      });
    } else {
      folders = await Folders.findAll({
        where: { projectId: id, isDeleted: 0 },
        raw: true, // Fetch raw data
      });
    }
    let message = "Folders found for this project.";
    if (!folders.length) {
      message = "No folders found for this project.";
    }
    const obfuscatedFolders = folders.map((folder) => ({
      ...folder,
      id: obfuscateId(folder.id),
      projectId: obfuscateId(folder.projectId),
    }));
    res.json(obfuscatedFolders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single folder by ID
export const getFolderById = async (req, res) => {
  try {
    const folder = await Folders.findByPk(req.params.id, { raw: true });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    const obfuscatedFolder = {
      ...folder,
      id: obfuscateId(folder.id),
      projectId: obfuscateId(folder.projectId),
    };
    res.json(obfuscatedFolder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new folder
export const createFolder = async (req, res) => {
  try {
    var { name, description, projectId } = req.body;
    projectId = deobfuscateId(projectId);

    const newFolder = await Folders.create({
      name,
      description,
      projectId,
    });
    const obfuscatedFolder = {
      ...newFolder.get({ plain: true }), // Convert Sequelize instance to plain object
      id: obfuscateId(newFolder.id),
      projectId: obfuscateId(newFolder.projectId),
    };
    res.status(201).json(obfuscatedFolder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a folder
export const updateFolder = async (req, res) => {
  try {
    const { name, description } = req.body;
    const folderId = req.params.id; // Assumed to be deobfuscated
    const folder = await Folders.findByPk(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    folder.name = name;
    folder.description = description;
    await folder.save(); // Save updated folder
    const obfuscatedFolder = {
      ...folder.get({ plain: true }), // Convert Sequelize instance to plain object
      id: obfuscateId(folder.id),
      projectId: obfuscateId(folder.projectId),
    };
    res.json(obfuscatedFolder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const restoreFolder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log("Deleting folder with ID:", req.params.id);
    const folder = await Folders.findByPk(req.params.id, { raw: true, transaction }); // Fetch raw data
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    folder.isDeleted = 0;
    await Folders.update(folder, { where: { id: req.params.id } , transaction}); // Update with raw data
    await Images.update( {isDeleted: 0}, { where: { folderId: req.params.id }, transaction });
    transaction.commit();
    folder.id = obfuscateId(folder.id);
    res.status(204).send({ id: folder.id });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    
  }
};

// Delete a folder (set isDeleted to 1)
export const deleteFolder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log("Deleting folder with ID:", req.params.id);
    const folder = await Folders.findByPk(req.params.id, { raw: true, transaction }); // Fetch raw data
    if (!folder) {
      await transaction.rollback();
      return res.status(404).json({ message: "Folder not found" });
    }
    folder.isDeleted = 1;
    await Folders.update(folder, { where: { id: req.params.id }, transaction }); // Update with raw data
    await Images.update( {isDeleted: 1}, { where: { folderId: req.params.id }, transaction });
    transaction.commit();
    folder.id = obfuscateId(folder.id);
    res.status(204).send({ id: folder.id });
  } catch (error) {
    await transaction.rollback();
    console.log("Error deleting folder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getImagesByFolder = async (req, res) => {
  try {
    const { id } = req.params; // Assumed to be deobfuscated
    var { page = 1, limit = 1000, tagIds } = req.query; // Default to page 1 and limit 1000 if not provided
    var tagIdArray = tagIds ? tagIds.split(",") : [];
    tagIdArray = tagIdArray.map((tagId) => deobfuscateId(tagId));
    console.log("body: ", {
      user: req.user,
      folderId: id,
      page,
      limit,
      tagIdArray,
    });
    const imageResponse = await imageModel.getImagesForFolder({
      user: req.user,
      folderId: id,
      page,
      limit,
      tagIds: tagIdArray,
    });
    // Obfuscate the IDs of the images
    const obfuscatedImages = imageResponse.images.map((image) => ({
      ...image,
      id: obfuscateUserId(image.id),
    }));
    res.json({
      ...imageResponse,
      images: obfuscatedImages,
    });

    //   const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided
    //   const offset = (page - 1) * limit;

    //   const { count, rows: images } = await Images.findAndCountAll({
    //     where: { folderId: req.params.id, isDeleted: 0 },
    //     order: [["createdAt", "DESC"]],
    //     offset: parseInt(offset),
    //     limit: parseInt(limit),
    //     raw: true, // Fetch raw data
    //     include: [
    //       {
    //         model: Tags,
    //         as: 'tags',
    //         through: { attributes: [] }, // Exclude the join table attributes
    //       },
    //     ],
    //   });

    //   res.json({
    //     totalItems: count,
    //     totalPages: Math.ceil(count / limit),
    //     currentPage: parseInt(page),
    //     images,
    //   });
  } catch (error) {
    console.log("Error fetching images:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
