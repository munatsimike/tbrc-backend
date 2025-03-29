// database.js
import {Sequelize} from "sequelize";
import { config } from "dotenv";
config();
console.log("DB_HOST", process.env.DB_HOST);
// Define the connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    // logging: (msg) => console.log('Query:', msg),
    // benchmark: true,
  }
);

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

export default sequelize;
// module.exports = sequelize;
