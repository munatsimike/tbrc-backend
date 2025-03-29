import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ImageTags = sequelize.define(
  "ImageTags",
  {
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Images",
        key: "id",
      },
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Tags",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "ImageTags",
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "imageId" }, { name: "tagId" }],
      },
      {
        name: "tagId",
        using: "BTREE",
        fields: [{ name: "tagId" }],
      },
    ],
  }
);

export default ImageTags;
