import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import ProjectUsers from "./ProjectUsers.js";

const Projects = sequelize.define(
  "Projects",
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
    },
    thumbnailUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "Projects",
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "id" }],
      },
    ],
  }
);

Projects.hasMany(ProjectUsers, { foreignKey: "project_id" });
// ProjectUsers.belongsTo(Projects, { foreignKey: "project_id" });

export default Projects;
