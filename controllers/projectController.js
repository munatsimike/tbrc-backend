import * as projectModel from "../models/projectModel.js";
import { obfuscateId, deobfuscateId } from "./helpers/obfuscation.js";
import { getRole } from "./helpers/role.js";
import Users from "../sequelizeModels/Users.js";
import db from "../config/db.js";
import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";

const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel.getProjects(req.user);
    const obfuscatedProjects = projects.map((project) => ({
      ...project,
      id: obfuscateId(project.id),
      role: project["ProjectUsers.role"],
    }));
    res.json(obfuscatedProjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDeletedProjects = async (req, res) => {
  try {
    if (req.user.isSuperUser) {
      const projects = await projectModel.getDeletedProjects(req.user);
      console.log("Projects: ", projects);
      const obfuscatedProjects = projects.map((project) => ({
        ...project,
        id: obfuscateId(project.id),
        role: project["ProjectUsers.role"],
      }));
      res.json(obfuscatedProjects);
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to view deleted projects." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectById(id, req.user);
    if (!project) {
      return res.status(404).json({ message: "Project with access not found" });
    }
    project.id = obfuscateId(project.id);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectDashboard = async (req, res) => {
  try {
    const projectId = req.params.id; // Use directly from params

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    if (!req.user.isSuperUser) {
      const role = await getRole(req.user.id, projectId);
      if (!role) {
        return res
          .status(403)
          .json({ message: "You do not have access to this project" });
      }
    }

    const [orfis, budgetPhases, schedules] = await Promise.all([
      getORFIByProjectInternal(projectId),
      getBudgetPhasesByProjectInternal(projectId),
      getSchedulesByProjectInternal(projectId),
    ]);

    // Helper function to calculate the totals
    const calculateTotals = (orfis, budgetPhases, schedules) => {
      // ORFIs total
      const totalOrfis = orfis.length;
      const resolvedOrfis = orfis.filter((orfi) => orfi.resolved === 1).length;

      // Budget total
      const totalAmount = budgetPhases.reduce(
        (acc, phase) => acc + phase.totalAmount,
        0
      );
      const totalPaid = budgetPhases.reduce(
        (acc, phase) => acc + phase.totalPaid,
        0
      );

      // Schedule total progress and total duration
      const totalScheduleProgress = schedules.reduce(
        (acc, schedule) => acc + schedule.progress,
        0
      );
      const totalDuration = schedules.reduce(
        (acc, schedule) => acc + schedule.total_duration,
        0
      );

      return {
        totalOrfis: totalOrfis,
        resolvedOrfis: resolvedOrfis,
        totalAmount: totalAmount,
        totalPaid: totalPaid,
        totalScheduleProgress: totalScheduleProgress,
        totalDuration: totalDuration, // Total duration of all schedules
      };
    };

    // Calculate the totals
    const totals = calculateTotals(orfis, budgetPhases, schedules);

    // Combine the data into one response along with the totals
    const combinedData = {
      orfis: orfis,
      budgetPhases: budgetPhases,
      schedules: schedules,
      totals: totals, // Add the totals to the response
    };

    res.json(combinedData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Internal function to get ORFIs by project (similar to your existing function)
const getORFIByProjectInternal = async (projectId) => {
  const [orfis] = await db.execute(
    `
      SELECT ORFI.*, Users.username AS assignedUserName, Users.name AS assignedName, Users.avatar AS assignedAvatar
      FROM ORFI
      LEFT JOIN Users ON ORFI.assignedTo = Users.id
      WHERE ORFI.projectId = ? AND ORFI.isDeleted = 0
    `,
    [projectId]
  );
  return orfis;
};

// Internal function to get Budget Phases by project (similar to your existing function)
const getBudgetPhasesByProjectInternal = async (projectId) => {
  const query = `
    SELECT 
      bc.id, 
      bc.phase, 
      bc.project_id, 
      COALESCE(SUM(bi.amount), 0) AS totalAmount, 
      COALESCE(SUM(bi.paid), 0) AS totalPaid
    FROM 
      BudgetPhases bc
    LEFT JOIN 
      BudgetInvoices bi 
    ON 
      bc.id = bi.budget_id
      AND bi.isDeleted = 0
    WHERE 
      bc.project_id = :project_id
      AND bc.isDeleted = 0
    GROUP BY 
      bc.id, bc.phase, bc.project_id
  `;

  const phases = await sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT,
    replacements: { project_id: projectId },
  });
  return phases;
};

// Internal function to get Schedules by project (similar to your existing function)
const getSchedulesByProjectInternal = async (projectId) => {
  const query = `
    SELECT 
      s.id,  
      s.startdate, 
      s.total_duration, 
      s.progress, 
      bc.project_id,
      bc.phase
    FROM 
      Schedule s
    INNER JOIN 
      ScheduleBudget sb 
    ON 
      s.id = sb.scheduleid
      AND
      s.isDeleted = 0
    INNER JOIN 
      BudgetPhases bc 
    ON 
      sb.budgetPhaseid = bc.id
    WHERE 
      bc.project_id = :project_id
  `;

  const schedules = await sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT,
    replacements: { project_id: projectId },
  });
  return schedules;
};

const createProject = async (req, res) => {
  const { name, description, address, thumbnailUrl } = req.body;
  const { id } = req.user;
  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Name and description are required." });
  }

  try {
    const project = await projectModel.createProject({
      name,
      description,
      id,
      address,
      thumbnailUrl,
    });
    project.id = obfuscateId(project.id);
    res.status(201).json({ project, message: "Project created successfully." });
  } catch (error) {
    console.log("Error from createProject: ", error);
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  const { name, description, address, thumbnailUrl } = req.body;
  const { id } = req.user;
  const projectID = req.params.id; // Use directly from params

  try {
    const callerProjectRole = await getRole(id, projectID);

    if (!req.user.isSuperUser && callerProjectRole !== "manager") {
      return res.status(403).json({
        message: "You are not authorized to update this project",
        role: callerProjectRole,
      });
    }

    const project = await projectModel.updateProjectById({
      id: parseInt(projectID),
      name,
      description,
      address,
      thumbnailUrl,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    project.id = obfuscateId(project.id);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignProject = async (req, res) => {
  const { project_id, username, role } = req.body;
  const { id } = req.user;
  const deobfuscatedProjectId = deobfuscateId(project_id);

  try {
    const callerProjectRole = await getRole(id, deobfuscatedProjectId);

    if (!req.user.isSuperUser && callerProjectRole !== "manager") {
      return res.status(403).json({
        message: "You do not have access to this project",
        role: callerProjectRole,
      });
    }

    if (!username || !project_id || !role) {
      return res
        .status(400)
        .json({ message: "Email, role, and project_id  are required." });
    }

    const project = await projectModel.assignProject(
      deobfuscatedProjectId,
      username,
      role
    );
    // project.id = obfuscateId(project.id);
    res.status(201).json({ message: "Project assigned successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAccessLevel = async (req, res) => {
  const { project_id, username, role } = req.body;
  const { id } = req.user;
  const deobfuscatedProjectId = deobfuscateId(project_id);

  try {
    const callerProjectRole = await getRole(id, deobfuscatedProjectId);

    if (!req.user.isSuperUser && callerProjectRole !== "manager") {
      return res.status(403).json({
        message: "You are not authorized to change the role of this user",
        role: callerProjectRole,
      });
    }

    if (!username || !project_id || !role) {
      return res
        .status(400)
        .json({ message: "Email, role, and project ID are required." });
    }

    const authUser = await Users.findByPk(id);
    if (authUser.username === username) {
      return res
        .status(400)
        .json({ message: "You cannot update your own access level." });
    }

    const project = await projectModel.updateAccessLevel(
      deobfuscatedProjectId,
      username,
      role
    );
    // console.log("Project21323: ", project);
    // project.id = obfuscateId(project.id);
    res.status(201).json({ message: "Project access updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unassignProject = async (req, res) => {
  const { project_id, username, user_id } = req.body;
  const authUserId = req.user.id;
  const deobfuscatedProjectId = deobfuscateId(project_id);
  const defObfuscatedUserId = deobfuscateId(user_id);
  try {
    const callerProjectRole = await getRole(authUserId, deobfuscatedProjectId);

    if (!req.user.isSuperUser && callerProjectRole !== "manager") {
      return res.status(403).json({
        message: "You are not authorized to unassign this user",
        role: callerProjectRole,
      });
    }

    if (!username || !project_id) {
      return res
        .status(400)
        .json({ message: "Email and project ID are required." });
    }

    const authUser = await Users.findByPk(authUserId);
    if (authUser.username === username) {
      return res
        .status(400)
        .json({ message: "You cannot unassign yourself from a project." });
    }

    const query = `
          SELECT 
            COUNT(*) AS usage_count
          FROM 
            (
              SELECT bi.assignedTo 
              FROM BudgetInvoices bi
              JOIN BudgetPhases bp ON bi.budget_id = bp.id
              WHERE bi.assignedTo = ? AND bp.project_id = ? AND
              bi.isDeleted = 0
              UNION ALL
              SELECT assignedTo FROM ORFI WHERE assignedTo = ? AND projectId = ?
              AND isDeleted = 0
            ) AS user_references;
        `;
    const [results] = await db.execute(query, [
      defObfuscatedUserId,
      deobfuscatedProjectId,
      defObfuscatedUserId,
      deobfuscatedProjectId,
    ]);
    const { usage_count } = results[0];
    console.log("Usage count: ", results);
    if (usage_count > 0) {
      return res
        .status(400)
        .json({
          code: "USER_ALREADY_ASSIGNED",
          message:
            "The Team Member is already assigned to at least one Invoice or ORFI in this project.",
        });
    }
    const project = await projectModel.unassignProject({
      project_id: deobfuscatedProjectId,
      username,
    });
    // project.id = obfuscateId(project.id);
    res
      .status(201)
      .json({ message: "User unassigned from project successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projectID = req.params.id; // Use directly from params
    const query = `UPDATE Projects SET isDeleted = 1 WHERE id = ?`;
    const [result] = await db.execute(query, [projectID]);
    if (!result) {
      return res.status(404).json({ error: "Project not found." });
    }
    res.json({ message: "Project deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restoreProject = async (req, res) => {
  try {
    const projectID = req.params.id; // Use directly from params
    const query = `UPDATE Projects SET isDeleted = 0 WHERE id = ?`;
    const [result] = await db.execute(query, [projectID]);
    if (!result) {
      return res.status(404).json({ error: "Project not found." });
    }
    res.json({ message: "Project deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllProjects,
  getProject,
  getProjectDashboard,
  createProject,
  updateProject,
  deleteProject,
  assignProject,
  unassignProject,
  updateAccessLevel,
  getAllDeletedProjects,
  restoreProject,
};
