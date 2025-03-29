import Projects from "../sequelizeModels/Projects.js";
import ProjectUsers from "../sequelizeModels/ProjectUsers.js";
import Users from "../sequelizeModels/Users.js";
import Sequelize from "../config/database.js";
import db from "../config/db.js";

const getProjects = async (user) => {
  try {
    if (user.isSuperUser) {
      const projects = await Projects.findAll({
        raw: true,
        where: { isDeleted: 0 },
        attributes: { include: [[Sequelize.literal("'superuser'"), "role"]] },
      });
      return projects;
    } else {
      const projects = await Projects.findAll({
        raw: true,
        where: { isDeleted: 0 },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: ProjectUsers,
            where: { user_id: user.id },
            attributes: ["role"],
          },
        ],
      });
      return projects;
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

const getDeletedProjects = async (user) => {
  try {
    if (user.isSuperUser) {
      const projects = await Projects.findAll({
        raw: true,
        where: { isDeleted: 1 },
        attributes: { include: [[Sequelize.literal("'superuser'"), "role"]] },
      });
      return projects;
    } else {
        return [];
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
export const updateAccessLevel = async (project_id, username, role) => {
  try {
    // Check if the user exists
    const user = await Users.findOne({ where: { username } });

    if (!user) {
      throw new Error("User with this username does not exist.");
    }

    // Check if the project exists
    const project = await Projects.findByPk(project_id);

    if (!project) {
      throw new Error("Project does not exist.");
    }

    // Check if the project-user relation exists
    const projectUser = await ProjectUsers.findOne({
      where: { project_id, user_id: user.id },
    });

    if (!projectUser) {
      throw new Error("User is not assigned to this project.");
    }

    // Update the access level
    projectUser.role = role;
    await projectUser.save();

    return {
      message: "Access level updated successfully.",
      project_id,
      user_id: user.id,
      role,
    };
  } catch (error) {
    console.error("Error updating access level:", error);
    throw error;
  }
};
const getProjectById = async (id, user) => {
  try {
    let query = "";
    let values = [];
    if (user.isSuperUser) {
      // Query for superuser
      query = `
      SELECT p.*, 'superuser' AS role
      FROM Projects p
      WHERE p.id = ?
    `;
      values = [id];
    } else {
      // Query for non-superuser
      query = `
      SELECT p.*, pu.role
      FROM Projects p
      JOIN ProjectUsers pu ON p.id = pu.project_id
      WHERE p.id = ? AND pu.user_id = ? AND p.isDeleted = 0
    `;
      values = [id, user.id];
    }



    const [rows] = await db.execute(query, values);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    throw error;
  }
};

export const createProject = async ({
  name,
  description,
  id,
  thumbnailUrl,
  address,
}) => {
  const transaction = await Sequelize.transaction();

  try {
    const project = await Projects.create({ name, description, thumbnailUrl, address },
      { transaction }
    );
    await ProjectUsers.create({
      project_id: project.id,
      user_id: id,
      role: "manager",
    },
    { transaction });
    await transaction.commit();

    return project.toJSON();
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// Unassign a user from a project
export const unassignProject = async ({ project_id, username }) => {
  try {
    // Check if the user exists
    const user = await Users.findOne({ where: { username } });

    if (!user) {
      throw new Error("User with this email does not exist.");
    }

    // Check if the project exists
    const project = await Projects.findByPk(project_id);

    if (!project) {
      throw new Error("Project does not exist.");
    }

    // Check if the project-user relation exists
    const projectUser = await ProjectUsers.findOne({
      where: { project_id, user_id: user.id },
    });

    if (!projectUser) {
      throw new Error("User is not assigned to this project.");
    }

    // Remove the project-user relation
    await projectUser.destroy();

    return {
      message: "User unassigned from project successfully.",
      project_id,
      user_id: user.id,
    };
  } catch (error) {
    console.error("Error unassigning project:", error);
    throw error;
  }
};

export const assignProject = async (project_id, username, role) => {
  try {
    // Find the user ID by email
    const user = await Users.findOne({ where: { username } });

    if (!user) {
      throw new Error("User with this email does not exist.");
    }

    // Check if the project exists
    const project = await Projects.findByPk(project_id);

    if (!project) {
      throw new Error("Project does not exist.");
    }

    // Check if the project-user relation exists
    const projectUser = await ProjectUsers.findOne({
      where: { project_id, user_id: user.id },
    });

    if (projectUser) {
      // Update the role if the relation exists
      await projectUser.update({ role });
    } else {
      // Insert a new relation if it doesn't exist
      await ProjectUsers.create({
        project_id,
        user_id: user.id,
        role,
      });
    }

    return {
      id: project_id,
      user_id: user.id,
      role,
      updated_at: new Date(),
    };
  } catch (error) {
    console.error("Error assigning project:", error);
    throw error;
  }
};

// Update project by ID
export const updateProjectById = async ({id, name, description, address, thumbnailUrl}) => {
  try {
    const [updated] = await Projects.update(
      { name, description, 
        address, thumbnailUrl,
        updatedAt: Sequelize.literal("CURRENT_TIMESTAMP") },
      { where: { id } }
    );
    if (updated) {
      return { id, name, description, updated_at: new Date() };
    }
    return null;
  } catch (error) {
    console.error("Error updating project by ID:", error);
    throw error;
  }
};

export { getProjects, getProjectById, getDeletedProjects };
