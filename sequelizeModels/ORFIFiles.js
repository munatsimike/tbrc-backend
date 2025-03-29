import Sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const ORFIFiles = Sequelize.define(
  "ORFIFiles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orfi_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ORFI",
        key: "id",
      },
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "ORFIFiles",
    timestamps: false,
  }
);

export default ORFIFiles;
