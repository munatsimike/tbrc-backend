import Sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Schedule = Sequelize.define(
  "Schedule",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    startdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    progress: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "Schedule",
    timestamps: false,
  }
);

export default Schedule;
