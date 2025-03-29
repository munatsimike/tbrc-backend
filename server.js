import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import budgetPhasesRoutes from "./routes/budgetPhasesRoutes.js";
import budgetInvoicesRoutes from "./routes/budgetInvoicesRoutes.js";
import invoiceFilesRoutes from "./routes/invoiceFilesRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import orfiRoutes from "./routes/orfiRoutes.js";
import orfiFilesRoutes from "./routes/orfiFilesRoutes.js";
import fileUploadRoutes from "./routes/fileUploadRoutes.js";
// const sequelize = require('./database'); // Import the Sequelize connection
// const initModels = require('./sequelizeModels/init-models'); // Import the init-models function
import sequelize from "./config/database.js";
import initModels from "./sequelizeModels/init-models.js";
import cors from "cors"; 
import { config } from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config();
console.log("DATABASE_URL : ", process.env.DATABASE_URL);
const app = express();


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = (diff[0] * 1e9 + diff[1]) / 1e6; // time in ms
    console.log(`${req.method} ${req.url} took ${time} ms`);
  });
  next();
});
// Routes
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/users", userRoutes);
app.use("/images", imageRoutes);
app.use("/api/budget-phases", budgetPhasesRoutes);
app.use("/api/budget-invoices", budgetInvoicesRoutes);
app.use("/api/invoice-files", invoiceFilesRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/folders", folderRoutes);
app.use("/orfi", orfiRoutes);
app.use("/api/orfiFiles", orfiFilesRoutes);
// Start server

app.use("/file", fileUploadRoutes);
//

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const PORT = process.env.PORT || 3000;

  //Sync models with the database and start the server
  sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port 3000");
   });
 });

/**
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});*/
