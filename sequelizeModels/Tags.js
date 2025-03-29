import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import ImageTags from "./ImageTags.js";

const Tags = sequelize.define(
  "Tags",
  {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    tagName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "Tags",
    timestamps: false,
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

Tags.hasMany(ImageTags, { as: "ImageTags", foreignKey: "tagId" });

export default Tags;
