import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
import Images from "../sequelizeModels/Images.js";
import ImageTags from "../sequelizeModels/ImageTags.js";
import Tags from "../sequelizeModels/Tags.js";
import ProjectUsers from "../sequelizeModels/ProjectUsers.js";
import db from "../config/db.js";
import { getRole, getRoleForFolder } from "../controllers/helpers/role.js";

// Get all images related to projects the user has access to
export const getImages = async (user) => {
  if (user.isSuperUser) {
    const [rows] = await db.query(
      "SELECT pi.*, GROUP_CONCAT(t.tagName) AS tags FROM Images pi " +
      "LEFT JOIN ImageTags it ON pi.id = it.imageId LEFT JOIN Tags t ON" + 
      "it.tagId = t.id WHERE pi.isDeleted = FALSE GROUP BY pi.id"
    );
    return rows;
  } else {
    const [rows] = await db.query(
      `
      SELECT pi.*, GROUP_CONCAT(t.tagName) AS tags
      FROM Images pi
      LEFT JOIN ImageTags it ON pi.id = it.imageId
      LEFT JOIN Tags t ON it.tagId = t.id
      JOIN ProjectUsers pu ON pi.projectId = pu.project_id
      WHERE pu.user_id = ? AND pi.isDeleted = FALSE
      GROUP BY pi.id
    `,
      [user.id]
    );
    return rows;
  }
};

export const getImagesPaginated = async ({ user, page = 1, limit = 10, tagIds = [], projectId=null, isDeleted = false }) => {
  const offset = (page - 1) * limit;
  // if(!user.isSuperUser){
  //   return res
  //   .status(403)
  //   .json({ message: "Super User Access only" });
  // }
  // Base query for counting images
  isDeleted = Boolean(isDeleted);

  console.log("isDeleted2: ", isDeleted);
  console.log("projectId: ", projectId);
  let countQuery = `
    SELECT COUNT(DISTINCT pi.id) as count
    FROM Images pi
    LEFT JOIN ImageTags it ON pi.id = it.imageId
    WHERE pi.isDeleted = ?
  `;
  const countReplacements = [isDeleted];

  // Base query for fetching images
  let imagesQuery = `
    SELECT pi.*, p.name as projectName, p.id as projectId, COALESCE(JSON_ARRAYAGG(t.tagName), '[]') AS tags
    FROM Images pi
    Left JOIN Projects p ON pi.projectId = p.id
    LEFT JOIN ImageTags it ON pi.id = it.imageId
    LEFT JOIN Tags t ON it.tagId = t.id
    WHERE pi.isDeleted = ?
  `;
  const imagesReplacements = [isDeleted];

  // Add project ID filter if provided
  if (projectId) {
    countQuery += ` AND pi.projectId = ?`;
    imagesQuery += ` AND pi.projectId = ?`;
    countReplacements.push(projectId);
    imagesReplacements.push(projectId);
  }

  // Add tag filter if tagIds are provided
  if (tagIds.length > 0) {
    const tagPlaceholders = tagIds.map(() => '?').join(',');
    countQuery += ` AND it.tagId IN (${tagPlaceholders})`;
    imagesQuery += ` AND it.tagId IN (${tagPlaceholders})`;
    countReplacements.push(...tagIds);
    imagesReplacements.push(...tagIds);
  }

  // Complete the images query
  imagesQuery += `
    GROUP BY pi.id
    ORDER BY pi.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  imagesReplacements.push(limit, offset);

  try {
    // Query to get the total count of images
    const [countRows] = await sequelize.query(countQuery, { replacements: countReplacements });
    const totalItems = countRows[0].count;
    const totalPages = Math.ceil(totalItems / limit);

    // Query to get the paginated images
    const [rows] = await sequelize.query(imagesQuery, { replacements: imagesReplacements.map(Number) });
    const images = rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
  
    // Fetch all tags for each image
    const imageIds = images.map(image => image.id);
    if (imageIds.length > 0) {
      const [allTagsRows] = await db.query(
        `
        SELECT it.imageId, t.tagName
        FROM ImageTags it
        JOIN Tags t ON it.tagId = t.id
        WHERE it.imageId IN (${imageIds.map(() => '?').join(',')})
        `,
        imageIds
      );
  
      const tagsMap = allTagsRows.reduce((acc, row) => {
        if (!acc[row.imageId]) {
          acc[row.imageId] = [];
        }
        acc[row.imageId].push(row.tagName);
        return acc;
      }, {});
  
      images.forEach(image => {
        image.tags = tagsMap[image.id] || [];
      });
    }
    return {
      totalItems,
      totalPages,
      currentPage: page,
      images,
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    throw new Error('Error fetching images');
  }
};
export const getImagesForFolder = async ({ user, folderId, page = 1, limit = 10, tagIds = [] }) => {
  const offset = (page - 1) * limit;

  //TODO: Add a check to see if the user has access to the folder
  const role = await getRoleForFolder(user.id, folderId);
  if (!user.isSuperUser && !role) {
    return res
      .status(403)
      .json({ message: "You do not have access to this project" });
  }
  console.log("Role is: ", role);
// Base query for counting images
  let countQuery = `
    SELECT COUNT(DISTINCT pi.id) as count
    FROM Images pi
    LEFT JOIN ImageTags it ON pi.id = it.imageId
    WHERE  pi.isDeleted = FALSE AND pi.folderId = ?
  `;
  const countReplacements = [folderId];

  // Base query for fetching images
  let imagesQuery = `
    SELECT pi.*, COALESCE(JSON_ARRAYAGG(t.tagName), '[]') AS tags
    FROM Images pi
    LEFT JOIN ImageTags it ON pi.id = it.imageId
    LEFT JOIN Tags t ON it.tagId = t.id
   
    WHERE pi.isDeleted = FALSE AND pi.folderId = ?
  `;
  const imagesReplacements = [folderId];

  // Add tag filter if tagIds are provided
  if (tagIds.length > 0) {
    const tagPlaceholders = tagIds.map(() => '?').join(',');
    countQuery += ` AND it.tagId IN (${tagPlaceholders})`;
    imagesQuery += ` AND it.tagId IN (${tagPlaceholders})`;
    countReplacements.push(...tagIds);
    imagesReplacements.splice(2, 0, ...tagIds); // Insert tagIds before limit and offset
  }

  // Complete the images query
  imagesQuery += `
    GROUP BY pi.id
    ORDER BY pi.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  imagesReplacements.push(limit, offset);
 
  // Query to get the total count of images
  const [countRows] = await db.query(countQuery, countReplacements);
  const totalItems = countRows[0].count;
  const totalPages = Math.ceil(totalItems / limit);

  // Query to get the paginated images
  const [rows] = await db.query(imagesQuery, imagesReplacements.map(Number));
 
  // Ensure tags is a valid JSON array
  const images = rows.map(row => ({
    ...row,
    tags: JSON.parse(row.tags || '[]')
  }));

  // Fetch all tags for each image
  const imageIds = images.map(image => image.id);
  if (imageIds.length > 0) {
    const [allTagsRows] = await db.query(
      `
      SELECT it.imageId, t.tagName
      FROM ImageTags it
      JOIN Tags t ON it.tagId = t.id
      WHERE it.imageId IN (${imageIds.map(() => '?').join(',')})
      `,
      imageIds
    );

    const tagsMap = allTagsRows.reduce((acc, row) => {
      if (!acc[row.imageId]) {
        acc[row.imageId] = [];
      }
      acc[row.imageId].push(row.tagName);
      return acc;
    }, {});

    images.forEach(image => {
      image.tags = tagsMap[image.id] || [];
    });
  }

  return {
    totalItems,
    totalPages,
    currentPage: page,
    images,
  };
};
// Get a single image by ID if the user has access
export const getImageById = async (id, user) => {
  if (user.superuser) {
    const [rows] = await db.query(
      "SELECT pi.*, GROUP_CONCAT(t.tagName) AS tags FROM Images pi LEFT JOIN ImageTags it ON pi.id = it.imageId LEFT JOIN Tags t ON it.tagId = t.id WHERE pi.id = ? AND pi.isDeleted = FALSE GROUP BY pi.id",
      [id]
    );
    return rows[0];
  } else {
    const [rows] = await db.query(
      `
      SELECT pi.*, GROUP_CONCAT(t.tagName) AS tags
      FROM Images pi
      LEFT JOIN ImageTags it ON pi.id = it.imageId
      LEFT JOIN Tags t ON it.tagId = t.id
      JOIN ProjectUsers pu ON pi.projectId = pu.project_id
      WHERE pi.id = ? AND pu.user_id = ? AND pi.isDeleted = FALSE
      GROUP BY pi.id
    `,
      [id, user.id]
    );
    return rows[0];
  }
};

// Create a new image and associate it with tags
export const createImage = async ({
  name,
  url,
  projectId,
  tags,
  folderId,
  description,
}) => {
  const transaction = await sequelize.transaction();
  try {
    tags = tags ? tags : [];
    const image = await Images.create({
      projectId,
      imageName: name,
      imageUrl: url,
      folderId,
      description,
    }, { transaction });

    for (const tag of tags) {
      let tagInstance = await Tags.findOne({ where: { tagName: tag }, transaction });
      if (!tagInstance) {
        tagInstance = await Tags.create({ tagName: tag }, { transaction });
      }
      await ImageTags.create({
        imageId: image.id,
        tagId: tagInstance.id,
      }, { transaction });
    }

    await transaction.commit();

    return {
      id: image.id,
      name: image.imageName,
      url: image.imageUrl,
      tags,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


export const getAllTags = async () => {
  const [rows] = await db.query(
    "SELECT * FROM Tags WHERE isDeleted = FALSE"
  );
  return rows;
};

// Update an image by ID
export const updateImageById = async ({ id, name, description, tags }) => {
  const transaction = await sequelize.transaction();
  try {
    const [affectedRows] = await Images.update(
      { imageName: name, updatedAt: new Date(), description: description },
      { where: { id, isDeleted: false } }
    );
     //first destroy all tags associated with the image
    await ImageTags.destroy({ where: { imageId: id }, transaction });
    tags = tags ? tags : [];
    for (const tag of tags) {
      let tagInstance = await Tags.findOne({
        where: { tagName: tag },
        transaction,
      });
      if (!tagInstance) {
        tagInstance = await Tags.create({ tagName: tag }, { transaction });
      }

     
      const imageTagExists = await ImageTags.findOne({
        where: { imageId: id, tagId: tagInstance.id },
        transaction,
      });

      if (!imageTagExists) {
        await ImageTags.create(
          {
            imageId: id,
            tagId: tagInstance.id,
          },
          { transaction }
        );
      }
    }
    transaction.commit();
    if (affectedRows === 0) {
      return null;
    }

    const updatedImage = await Images.findOne({ where: { id } });
    return {
      id: updatedImage.id,
      name: updatedImage.imageName,
      url: updatedImage.imageUrl,
      tags,
      updatedAt: updatedImage.updatedAt,
      description: updatedImage.description,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Soft delete an image by setting isDeleted to TRUE
export const deleteImageById = async (id) => {
  const [affectedRows] = await Images.update(
    { isDeleted: true },
    { where: { id } }
  );
  return affectedRows > 0;
};

export const restoreImageById = async (id) => {
  const [affectedRows] = await Images.update(
    { isDeleted: false },
    { where: { id } }
  );
  return affectedRows > 0;
};
