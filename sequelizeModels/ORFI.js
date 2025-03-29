import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ORFI = sequelize.define(
  "ORFI",
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Projects",
        key: "id",
      },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "ORFI",
    timestamps: true,
    indexes: [
      {
        name: "projectId_idx",
        using: "BTREE",
        fields: [{ name: "projectId" }],
      },
    ],
  }
);

// // Define associations
// ORFI.belongsTo(sequelize.models.Users, {
//   foreignKey: "assignedTo",
//   as: "assignedUser",
// });

export default ORFI;
