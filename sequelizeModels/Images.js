import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import ImageTags from "./ImageTags.js";
import Folders from "./Folders.js";

const Images = sequelize.define(
  "Images",
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Projects",
        key: "id",
      },
    },
    imageName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
    },
    folderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Folders",
        key: "id",
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "Images",
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "id" }],
      },
      {
        name: "projectId",
        using: "BTREE",
        fields: [{ name: "projectId" }],
      },
      {
        name: "folderId",
        using: "BTREE",
        fields: [{ name: "folderId" }],
      },
    ],
  }
);

Images.hasMany(ImageTags, { as: "ImageTags", foreignKey: "imageId" });
Images.belongsTo(Folders, { as: "Folder", foreignKey: "folderId" }); 

export default Images;
