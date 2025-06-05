import BudgetPhases from "../sequelizeModels/BudgetPhases.js";
import Schedule from "../sequelizeModels/Schedule.js";
import ScheduleBudget from "../sequelizeModels/ScheduleBudget.js";
import BudgetInvoices from "../sequelizeModels/BudgetInvoices.js";
import ProjectUsers from "../sequelizeModels/ProjectUsers.js";

import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import { getRole } from "./helpers/role.js";
import { obfuscateId, obfuscateArray,deobfuscateId } from "./helpers/obfuscation.js";

export const getBudgetPhasesByProject = async (req, res) => {
  try {
    const project_id = req.params.id;

    if (!project_id) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    console.log("Getting project: ", project_id);

    // Check role
    const role = await getRole(req.user.id, project_id);
    if (!req.user.isSuperUser) {
      if (!role) {
        return res.status(403).json({
          message: "You do not have access to see the budget for this project ",
        });
      }
    }

    // Query
    const query = `
      SELECT 
        bc.id, 
        bc.phase, 
        bc.project_id, 
        COALESCE(SUM(bi.amount), 0) AS totalAmount, 
        COALESCE(SUM(bi.paid), 0) AS totalPaid,
        bc.user_id,
        u.username AS assignedToUsername,
        u.name AS assignedToName,
        u.avatar AS assignedToAvatar,
        bc.budget,
        bc.initial_budget
      FROM 
        BudgetPhases bc
      LEFT JOIN 
        BudgetInvoices bi 
      ON 
        bc.id = bi.budget_id
        AND bi.isDeleted = 0
      LEFT JOIN 
        Users u
      ON 
        bc.user_id = u.id
      WHERE 
        bc.project_id = :project_id
        AND bc.isDeleted = 0
      GROUP BY 
        bc.id, bc.phase, bc.project_id, u.username, u.name, u.avatar;
    `;

    // Deobfuscate project_id for query
    var phases = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { project_id: deobfuscateId(project_id) }, // ✅ safe change here
    });

    // Obfuscate project_id in response
    const obfuscatedPhases = phases.map(phase => ({
      ...phase,
      project_id: obfuscateId(phase.project_id), // ✅ safe change here
    }));

    // Return result
    res.json(obfuscatedPhases);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};