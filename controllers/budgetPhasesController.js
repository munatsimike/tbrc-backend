import BudgetPhases from "../sequelizeModels/BudgetPhases.js";
import Schedule from "../sequelizeModels/Schedule.js";
import ScheduleBudget from "../sequelizeModels/ScheduleBudget.js";
import BudgetInvoices from "../sequelizeModels/BudgetInvoices.js";
import ProjectUsers from "../sequelizeModels/ProjectUsers.js";

import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import { getRole } from "./helpers/role.js";
import { obfuscateId, obfuscateArray,deobfuscateId } from "./helpers/obfuscation.js";

export const getAllBudgetPhases = async (req, res) => {
  try {
    const phases = await BudgetPhases.findAll();
    res.json(obfuscateArray(phases));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBudgetPhasesByProject = async (req, res) => {
  try {
    const project_id = req.params.id;
    if (!project_id) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    console.log("Getting project: ", project_id);
    const role = await getRole(req.user.id, project_id);
    if (!req.user.isSuperUser) {
      if (!role) {
        return res
          .status(403)
          .json({
            message:
              "You do not have access to see the budget for this project ",
          });
      }
    }

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

    var phases = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { project_id: project_id },
    });
    res.json(obfuscateArray(phases));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBudgetPhaseById = async (req, res) => {
  try {
    var phase = await BudgetPhases.findByPk(req.params.id, { raw: true });
    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }
    phase.id = obfuscateId(phase.id);
    res.json(phase);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createBudgetPhase = async (req, res) => {
  var { phase, project_id, startdate, total_duration, progress,
    //
    user_id,budget
   } = req.body;

  if (!phase || !project_id || !startdate || !total_duration || !progress || !user_id || !budget) {
    return res.status(400).json({ error: "All fields are required." });
  }
  project_id =  deobfuscateId(project_id);
  user_id = deobfuscateId(user_id);
  try {
    // Create Budget Phase
    const phaseResponse = await BudgetPhases.create({
      phase,
      project_id,
      user_id,
      budget,
      initial_budget: budget,
    });

    const projectUser = await ProjectUsers.findOne({
      where: { project_id, user_id: user_id },
    });
    if (!projectUser) {
        await ProjectUsers.create({
          project_id: project_id,
          user_id: user_id,
          role: "manager",
        });
    }


    // Create Schedule
    const scheduleResponse = await Schedule.create({
      phase,
      startdate,
      total_duration,
      progress,
    });

    // Create ScheduleBudget Relation
    await ScheduleBudget.create({
      scheduleid: scheduleResponse.id,
      budgetPhaseid: phaseResponse.id,
    });

    res.status(201).json({
      phaseResponse,
      scheduleResponse,
      message: "Phase and Schedule created successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateBudgetPhase = async (req, res) => {
  const {
    phase,
    //
    user_id,
    budget,
  } = req.body;
  try {
    const phaseResponse = await BudgetPhases.findByPk(req.params.id);
    if (!phaseResponse) {
      return res.status(404).json({ message: "Phase not found" });
    }
    phaseResponse.phase = phase;
    if(user_id){
      phaseResponse.user_id = deobfuscateId(user_id);
    }
    phaseResponse.budget = budget;
    await phaseResponse.save();
    res.json({ phase, message: "Phase updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteBudgetPhase = async (req, res) => {
  const phaseId = req.params.id;

  if (!phaseId) {
    return res.status(400).json({ message: "Phase ID is required." });
  }

  try {
    // Mark the budget phase as deleted
    await sequelize.query(
      `UPDATE BudgetPhases 
       SET isDeleted = 1 
       WHERE id = :phaseId`,
      {
        replacements: { phaseId },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    // Mark related schedules as deleted via ScheduleBudget table
    await sequelize.query(
      `UPDATE Schedule 
       SET isDeleted = 1 
       WHERE id IN (
         SELECT scheduleid 
         FROM ScheduleBudget 
         WHERE budgetPhaseid = :phaseId
       )`,
      {
        replacements: { phaseId },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    // Mark related budget invoices as deleted
    await sequelize.query(
      `UPDATE BudgetInvoices 
       SET isDeleted = 1 
       WHERE budget_id = :phaseId`,
      {
        replacements: { phaseId },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    // Mark related invoice files as deleted
    await sequelize.query(
      `UPDATE InvoiceFiles 
       SET isDeleted = 1 
       WHERE invoice_id IN (
         SELECT id 
         FROM BudgetInvoices 
         WHERE budget_id = :phaseId
       )`,
      {
        replacements: { phaseId },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting budget phase:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getBudgetTree = async (req, res) => {
  const projectId = req.params.id;

  try {
    // Query to get BudgetPhases, Schedule, BudgetInvoices, and InvoiceFiles
const query = `
    SELECT 
      bp.id AS id, 
      bp.phase AS phase, 
      bp.project_id AS projectId, 
      COALESCE(SUM(bi.amount), 0) AS totalAmount, 
      COALESCE(SUM(bi.paid), 0) AS totalPaid,
      bp.user_id AS user_id,
      bp.budget AS budget,
      u.username AS assignedToUsername,
      u.name AS assignedToName,
      u.avatar AS assignedToAvatar,
      s.id AS scheduleid,
      s.startdate, 
      s.total_duration, 
      s.progress, 
      CASE
          WHEN COUNT(bi.id) = 0 THEN JSON_ARRAY()
          ELSE JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', bi.id,
              'amount', bi.amount,
              'paid', bi.paid,
              'isDeleted', bi.isDeleted,
              'assignedToUsername', bu.username,
              'assignedToName', bu.name,
              'assignedToAvatar', bu.avatar,
              'files', (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'invoiceFileId', inf.id,
                    'fileName', inf.fileName,
                    'isDeleted', inf.isDeleted,
                    'url', inf.url
                  )
                )
                FROM InvoiceFiles inf
                WHERE inf.invoice_id = bi.id AND inf.isDeleted = 0
              )
            )
          )
      END AS invoices
    FROM 
      BudgetPhases bp
    LEFT JOIN 
      ScheduleBudget sb ON sb.budgetPhaseId = bp.id
    LEFT JOIN 
      Schedule s ON s.id = sb.scheduleid
    LEFT JOIN 
      BudgetInvoices bi ON bi.budget_id = bp.id AND bi.isDeleted = 0
    LEFT JOIN 
      Users bu ON bi.assignedTo = bu.id
    LEFT JOIN 
      Users u ON bp.user_id = u.id
    WHERE 
      bp.project_id = :projectId AND bp.isDeleted = 0
    GROUP BY 
      bp.id, bp.phase, bp.project_id, s.id, u.username, u.name, u.avatar
  `;


    console.log("Fetching budget tree for project:", projectId);
    const replacements = { projectId };

    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    // Obfuscate all relevant IDs in the result
    const obfuscatedResults = results.map((result) => ({
      ...result,
      id: obfuscateId(result.id), // Obfuscate phase ID
      projectId: obfuscateId(result.projectId), // Obfuscate project ID
      scheduleid: result.scheduleid ? obfuscateId(result.scheduleid) : null, // Obfuscate schedule ID
      user_id: result.user_id? obfuscateId(result.user_id) : null, // Obfuscate user ID
      invoices: result.invoices
        ? result.invoices.map((invoice) => ({
            ...invoice,
            id: obfuscateId(invoice.id), // Obfuscate invoice ID
            files: invoice.files
              ? invoice.files.map((file) => ({
                  ...file,
                  invoiceFileId: obfuscateId(file.invoiceFileId), // Obfuscate file ID
                }))
              : [],
          }))
        : [],
    }));

    console.log("Results:", obfuscatedResults);
    res.json({
      results: obfuscatedResults,
      message: "Phase updated successfully.",
    });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
