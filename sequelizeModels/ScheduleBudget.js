import Sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const ScheduleBudget = Sequelize.define(
  "ScheduleBudget",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    scheduleid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Schedule",
        key: "id",
      },
    },
    budgetPhaseid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "BudgetPhases",
        key: "id",
      },
    },
  },
  {
    tableName: "ScheduleBudget",
    timestamps: false,
  }
);

export default ScheduleBudget;
