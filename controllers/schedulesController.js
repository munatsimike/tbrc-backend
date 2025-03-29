import Schedule from "../sequelizeModels/Schedule.js";
import { getRole } from "./helpers/role.js";
import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import { obfuscateId } from "./helpers/obfuscation.js"; // Import obfuscateId

// Get schedules by project
export const getSchedulesByProject = async (req, res) => {
  try {
    const project_id = req.params.id;
    if (!project_id) {
      return res.status(400).json({ message: "Project ID is required." });
    }
    const role = await getRole(req.user.id, project_id);
    if (!req.user.isSuperUser && !role) {
      return res
        .status(403)
        .json({ message: "You do not have access to this project" });
    }

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

    const phases = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { project_id: project_id },
    });

    // Obfuscate IDs in the response
    const obfuscatedPhases = phases.map((phase) => ({
      ...phase,
      id: obfuscateId(phase.id),
      project_id: obfuscateId(phase.project_id),
    }));

    res.json(obfuscatedPhases);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll();
    // Obfuscate IDs in the response
    const obfuscatedSchedules = schedules.map((schedule) => ({
      ...schedule.toJSON(),
      id: obfuscateId(schedule.id),
    }));

    res.json(obfuscatedSchedules);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Obfuscate ID in the response
    const obfuscatedSchedule = {
      ...schedule.toJSON(),
      id: obfuscateId(schedule.id),
    };

    res.json(obfuscatedSchedule);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a schedule by ID
export const updateSchedule = async (req, res) => {
  try {
    const { startdate, total_duration, progress } = req.body;

    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    schedule.startdate = startdate;
    schedule.total_duration = total_duration;
    schedule.progress = progress;

    await schedule.save();

    res.json({ schedule, message: "Schedule updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a schedule by ID
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    await schedule.update(
      {
        isDeleted: true,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
