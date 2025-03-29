import Sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const BudgetPhases = Sequelize.define(
  "BudgetPhases",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phase: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Projects",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    budget: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    initial_budget: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "BudgetPhases",
    timestamps: false,
  }
);

export default BudgetPhases;
