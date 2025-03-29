import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ProjectUsers = sequelize.define(
  "ProjectUsers",
  {
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Projects",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    role: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "ProjectUsers",
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "project_id" }, { name: "user_id" }],
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [{ name: "user_id" }],
      },
    ],
  }
);

export default ProjectUsers;
