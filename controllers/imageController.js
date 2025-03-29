import * as imageModel from "../models/imageModel.js";
import {
  obfuscateId,
  obfuscateUserId,
  deobfuscateId,
} from "./helpers/obfuscation.js";
import { getRole } from "./helpers/role.js";

// Get all images
const getAllImages = async (req, res) => {
  try {
    const images = await imageModel.getImages(req.user);

    // Obfuscate the IDs of the images
    const obfuscatedImages = images.map((image) => ({
      ...image,
      id: obfuscateUserId(image.id),
    }));

    res.json(obfuscatedImages);
  } catch (error) {
    console.log("Error fetching images:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all images for superuser with pagination and filtering
export const getAllForSuperuser = async (req, res) => {
  try {
    var { page = 1, limit = 1000, tagIds, isDeleted, projectId } = req.query;
    if(projectId) projectId = deobfuscateId(projectId);
    var tagIdArray = tagIds ? tagIds.split(",") : [];
    tagIdArray = tagIdArray.map((tagId) => deobfuscateId(tagId));
    console.log("isDeleted: ", isDeleted);
    const imageResponse = await imageModel.getImagesPaginated({
      user: req.user,
      page,
      limit,
      tagIds: tagIdArray,
      isDeleted,
      projectId,
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
  } catch (error) {
    console.log("Error fetching images:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single image by ID
const getImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await imageModel.getImageById(id, req.user);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    image.id = obfuscateId(image.id);

    res.json(image);
  } catch (error) {
    console.log("Error fetching image:", error);

    res.status(500).json({ message: "Server error" });
  }
};

// Create a new image
const createImage = async (req, res) => {
try {
  const { name, url, projectId, folderId, tags, description } = req.body;
  const { id } = req.user;

  // Deobfuscate projectId and folderId
  const deobfuscatedProjectId = deobfuscateId(projectId);
  const deobfuscatedFolderId = deobfuscateId(folderId);

  if (!name || !url || !projectId) {
    return res
      .status(400)
      .json({ error: "Name, URL, and project ID are required." });
  }

  const image = await imageModel.createImage({
    name,
    url,
    projectId: deobfuscatedProjectId,
    tags,
    userId: id,
    folderId: deobfuscatedFolderId,
    description,
  });

  image.id = obfuscateId(image.id);
  res.status(201).json({ image, message: "Image created successfully." });
} catch (error) {
  console.log("Error creating image:", error);
  res.status(500).json({ message: "Server error" });
}
};

// Update an image by ID
const updateImage = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const image = await imageModel.updateImageById({
      id: parseInt(req.params.id),
      name,
      description,
      tags,
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found." });
    }

    image.id = obfuscateId(image.id);
    res.json(image);
  } catch (error) {
    console.log("Error updating image:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Restore an image by ID
export const restoreImage = async (req, res) => {
  try {
    const success = await imageModel.restoreImageById(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Image not found." });
    }
    res.status(204).send();
  } catch (error) {
    console.log("Error restoring image:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an image by ID
const deleteImage = async (req, res) => {
try {
  const success = await imageModel.deleteImageById(parseInt(req.params.id));
  if (!success) {
    return res.status(404).json({ error: "Image not found." });
  }
  res.status(204).send();
} catch (error) {
  console.log("Error deleting image:", error);
  res.status(500).json({ message: "Server error" });
}
};

// Get all tags
export const getAllTags = async (req, res) => {
  try {
    const tagsRecords = await imageModel.getAllTags();
    const tags = tagsRecords.map((tag) => ({
      ...tag,
      id: obfuscateId(tag.id),
    }));
    res.json(tags);
  } catch (error) {
    console.log("Error fetching tags:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getAllImages, getImage, createImage, updateImage, deleteImage };
