import { DataTypes } from "sequelize";
import _ImageTags from "./ImageTags.js";
import _ProjectImages from "./Images.js";
import _ProjectUsers from "./ProjectUsers.js";
import _Projects from "./Projects.js";
import _Tags from "./Tags.js";
import _Users from "./Users.js";
import Schedule from "./Schedule.js";
import BudgetPhases from "./BudgetPhases.js";
import BudgetInvoices from "./BudgetInvoices.js";
import InvoiceFiles from "./InvoiceFiles.js";
import ScheduleBudget from "./ScheduleBudget.js";

export function initModels(sequelize) {
  const ImageTags = _ImageTags(sequelize, DataTypes);
  const Images = _ProjectImages(sequelize, DataTypes);
  const ProjectUsers = _ProjectUsers(sequelize, DataTypes);
  const Projects = _Projects(sequelize, DataTypes);
  const Tags = _Tags(sequelize, DataTypes);
  const Users = _Users(sequelize, DataTypes);

  // Set up associations for the newly added models
  Schedule.hasMany(ScheduleBudget, { foreignKey: "scheduleid" });
  BudgetPhases.hasMany(ScheduleBudget, { foreignKey: "budgetPhaseid" });

  BudgetPhases.hasMany(BudgetInvoices, { foreignKey: "budget_id" });
  BudgetInvoices.hasMany(InvoiceFiles, { foreignKey: "invoice_id" });

  ScheduleBudget.belongsTo(Schedule, { foreignKey: "scheduleid" });
  ScheduleBudget.belongsTo(BudgetPhases, {
    foreignKey: "budgetPhaseid",
  });

  BudgetInvoices.belongsTo(BudgetPhases, { foreignKey: "budget_id" });
  InvoiceFiles.belongsTo(BudgetInvoices, { foreignKey: "invoice_id" });

  // Existing associations
  Images.belongsToMany(Tags, {
    as: "tagId_Tags",
    through: ImageTags,
    foreignKey: "imageId",
    otherKey: "tagId",
  });
  Projects.belongsToMany(Users, {
    as: "user_id_Users",
    through: ProjectUsers,
    foreignKey: "project_id",
    otherKey: "user_id",
  });
  Tags.belongsToMany(Images, {
    as: "imageId_ProjectImages",
    through: ImageTags,
    foreignKey: "tagId",
    otherKey: "imageId",
  });
  Users.belongsToMany(Projects, {
    as: "project_id_Projects",
    through: ProjectUsers,
    foreignKey: "user_id",
    otherKey: "project_id",
  });

  // Individual belongsTo and hasMany associations
  ImageTags.belongsTo(Images, { as: "image", foreignKey: "imageId" });
  Images.hasMany(ImageTags, { as: "ImageTags", foreignKey: "imageId" });
  Images.belongsTo(Projects, { as: "project", foreignKey: "projectId" });
  Projects.hasMany(Images, {
    as: "Images",
    foreignKey: "projectId",
  });
  ProjectUsers.belongsTo(Projects, { as: "project", foreignKey: "project_id" });
  Projects.hasMany(ProjectUsers, {
    as: "ProjectUsers",
    foreignKey: "project_id",
  });
  ImageTags.belongsTo(Tags, { as: "tag", foreignKey: "tagId" });
  Tags.hasMany(ImageTags, { as: "ImageTags", foreignKey: "tagId" });
  ProjectUsers.belongsTo(Users, { as: "user", foreignKey: "user_id" });
  Users.hasMany(ProjectUsers, { as: "ProjectUsers", foreignKey: "user_id" });

  return {
    ImageTags,
    Images,
    ProjectUsers,
    Projects,
    Tags,
    Users,
    Schedule,
    ScheduleBudget,
    BudgetPhases,
    BudgetInvoices,
    InvoiceFiles,
  };
}

export default initModels;
