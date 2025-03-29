import * as userModel from "../models/userModel.js";
import Projects from "../sequelizeModels/Projects.js";
import sequelize from "../config/database.js";
import db from "../config/db.js";
import sgMail from "@sendgrid/mail";
import { config } from "dotenv";
import Users from "../sequelizeModels/Users.js";
import BudgetPhases from "../sequelizeModels/BudgetPhases.js";
import Schedule from "../sequelizeModels/Schedule.js";
import ScheduleBudget from "../sequelizeModels/ScheduleBudget.js";
import ProjectUsers from "../sequelizeModels/ProjectUsers.js";
import bcrypt from "bcryptjs";
import {
  obfuscateArray,
  obfuscateId,
  deobfuscateId,
} from "./helpers/obfuscation.js"; // Import obfuscateId


export const userExists = async (req, res) => {
  try {
    const { username } = req.body;
    console.log("Check user exists:",req.body);
    const user = await userModel.getUserByUsername(username);

    if (!user) {
      res.json({ exists: false });
    } else {
      res.json({ exists: true });
    }

    
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create and Assign User API
export const createAndAssignUser = async (req, res) => {
  try {
    const authUser = req.user;

    // Extract user and project data from the request body
    let {
      username,
      name = "",
      password,
      email = "",
      phone_number = "",
      address = "",
      avatar = "",
      projectId, // The project the user is being assigned to
      role = "manager", // Role in the project
      phase,
      budget,
      startdate,
      total_duration,
      progress,
    } = req.body;

    // Check if the user already exists
    const userExists = await userModel.getUserByUsername(username);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    projectId = deobfuscateId(projectId); // Deobfuscate the project ID

    // Ensure required fields are provided
    if (!username || !password || !projectId || !role) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a unique avatar URL if provided
    let avatarUrl = avatar;

    // Begin a Sequelize transaction
    const transaction = await sequelize.transaction();

    try {
      // Insert the user into the Users table
      const user = await Users.create(
        {
          username,
          name,
          password: hashedPassword,
          email,
          phone_number,
          address,
          avatar: avatarUrl,
          isActivated: true,
        },
        { transaction }
      );

      const userId = user.id;

      // Create Budget Phase
      const phaseResponse = await BudgetPhases.create(
        {
          phase,
          project_id: projectId,
          user_id: userId,
          budget,
          initial_budget: budget,
        },
        { transaction }
      );

      // Assign the user to the project with the provided role
      const projectUser = await ProjectUsers.findOne(
        { where: { project_id: projectId, user_id: userId } },
        { transaction }
      );

      if (!projectUser) {
        await ProjectUsers.create(
          {
            project_id: projectId,
            user_id: userId,
            role,
          },
          { transaction }
        );
      }

      // Create Schedule
      const scheduleResponse = await Schedule.create(
        {
          phase,
          startdate,
          total_duration,
          progress,
        },
        { transaction }
      );

      // Create ScheduleBudget Relation
      await ScheduleBudget.create(
        {
          scheduleid: scheduleResponse.id,
          budgetPhaseid: phaseResponse.id,
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      // Obfuscate user ID before sending the response
      const obfuscatedUserId = obfuscateId(userId);

      // Send the verification email
      const msg = {
        to: username,
        from: "anne@thebrassringcollective.com",
        subject: "Verify your email",
        text: `Welcome to The Brass Ring Collective!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50;">Welcome to The Brass Ring Collective!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for registering with us. ${authUser.name} has created and activated an account for you.</p>
            <p style="text-align: center;">
              <p>Username: ${username}</p>
              <p>Password: ${password}</p>
            </p>
            <p>Contact the administrator if you face difficulties logging in.</p>
            <p>Thank you,<br>The Teqie Team</p>
          </div>
        `,
      };

      try {
        await sgMail.send(msg);
      } catch (error) {
        console.error("Error sending verification email:", error);
        return res
          .status(500)
          .json({ message: "Error sending verification email." });
      }

      // Send success response
      res.status(201).json({
        message: "User created and assigned successfully.",
        userId: obfuscatedUserId,
        projectId: obfuscateId(projectId),
        role,
      });
    } catch (error) {
      // Rollback the transaction if an error occurs
      await transaction.rollback();
      console.error("Error during transaction:", error);
      res.status(500).json({ message: "Failed to create and assign user." });
    }
  } catch (error) {
    console.error("Error creating and assigning user:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const createUser = async (req, res) => {
  try {
    const authUser = req.user;
    

    // Extract user and project data from the request body
    var {
      username,
      name='',
      password,
      email ='',
      phone_number='',
      address='',
      avatar='',
    } = req.body;
    // Ensure required fields are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const userExists = await userModel.getUserByUsername(username);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a unique avatar URL if provided
    let avatarUrl = avatar;

    // Begin a database transaction
    const transaction = await db.getConnection();

    try {
      await transaction.beginTransaction();
      const msg = {
        to: username,
        from: "anne@thebrassringcollective.com", // **VERIFIED** sender
        subject: "Your Account has been created",
        text: `Welcome to The Brass Ring Collective!`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50;">Welcome to The Brass Ring Collective!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with us. ${authUser.name} have created an activated account for you.</p>
          <p style="text-align: center;">
            <p>Username: ${username}</p>
            <p>Password: ${password}</p>
          </p>
          <p>Contact the administrator if your face difficulties in logging in</p>
          
          <p>Thank you,<br>The Teqie Team</p>
        </div>
      `,}
      // Insert the user into the Users table
      const [userResult] = await transaction.execute(
        `INSERT INTO Users (username, name, password, email, phone_number, address, avatar, isActivated,createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`, // Assuming the created user is not a SuperUser
        [username, name, hashedPassword, email, phone_number, address, avatarUrl]
      );

      const userId = userResult.insertId;

      // Assign the user to the project with the provided role
     
      // Commit the transaction
      await transaction.commit();

      // Obfuscate user ID before sending the response
      const obfuscatedUserId = obfuscateId(userId);

      try {
        await sgMail.send(msg);
      
      } catch (error) {
        res.status(500).json({ message: "Error sending verification email." });
        console.log("Error sending verification email:", error);
      }
      // Send success response
      res.status(201).json({
        message: "User created and assigned successfully.",
        userId: obfuscatedUserId,
      });
    } catch (error) {
      // Rollback the transaction if an error occurs
      await transaction.rollback();
      console.error("Error during transaction:", error);
      res.status(500).json({ message: "Failed to create and assign user.", error });
    } finally {
      // Release the database connection
      await transaction.release();
    }
  } catch (error) {
    console.error("Error creating and assigning user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    if (!req.user.isSuperUser) {
      return res.status(403).json({ message: "You are not authorized to access this resource as you are not a superuser." });
    }

    const [users] = await db.execute(
      `SELECT id, username, email, phone_number, name, address, avatar, isSuperUser, createdAt, updatedAt, isDeleted, isActivated FROM Users`
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Obfuscate IDs in the response
    const obfuscatedUsers = obfuscateArray(users);

    res.json(obfuscatedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUsersByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.execute(
      `SELECT 
        u.id, u.email, u.username, u.phone_number, u.isSuperUser, pu.role, pu.assigned_at, u.name, u.avatar
       FROM 
        Users u
       INNER JOIN 
        ProjectUsers pu ON u.id = pu.user_id
       WHERE 
        pu.project_id = ?
       ORDER BY pu.assigned_at DESC`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for this project" });
    }

    // Obfuscate IDs in the response
    const obfuscatedUsers = obfuscateArray(users);


    res.json(obfuscatedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    // Obfuscate ID in the response
    const obfuscatedUser = {
      ...userWithoutPassword,
      id: obfuscateId(user.id)
    };

    res.json(obfuscatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAuthUserDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    // Obfuscate ID in the response
    const obfuscatedUser = {
      ...userWithoutPassword,
      id: obfuscateId(user.id)
    };

    res.json(obfuscatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userModel.getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Obfuscate ID in the response
    const obfuscatedUser = {
      ...user,
      id: obfuscateId(user.id)
    };

    res.json(obfuscatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const blockUnblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDeleted } = req.body;
    if (!req.user.isSuperUser) {
      return res.status(403).json({ message: "You cannot Update user" });
    }
    const [result] = await db.execute('UPDATE Users SET isDeleted = ? WHERE id = ?', [isDeleted, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Only the user themselves or SuperUser can update the profile
export const updateUserProfile = async (req, res) => {
  try {
    const authUser = req.user;
    const {
      username,
      name,
      password,
      email,
      phone_number,
      address,
      avatar,
      isSuperUser,
      isActivated,
    } = req.body;

    const { id } = req.params;

    // Check if the user is allowed to update the profile
    if (!authUser.isSuperUser && authUser.id != id) {
      return res.status(403).json({ message: "You cannot update someone else's profile." });
    }

    // Start building the update query dynamically
    let query = `UPDATE Users SET `;
    const queryParams = [];

    if (username) {
      query += `username = ?, `;
      queryParams.push(username);
    }

    if (name) {
      query += `name = ?, `;
      queryParams.push(name);
    }

    if (email) {
      query += `email = ?, `;
      queryParams.push(email);
    }

    if (phone_number) {
      query += `phone_number = ?, `;
      queryParams.push(phone_number);
    }

    if (address) {
      query += `address = ?, `;
      queryParams.push(address);
    }

    if (avatar) {
      query += `avatar = ?, `;
      queryParams.push(avatar);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `password = ?, `;
      queryParams.push(hashedPassword);
    }

    // Update isSuperUser only if provided
    if (typeof isSuperUser !== "undefined") {
      query += `isSuperUser = ?, `;
      queryParams.push(isSuperUser);
    }

    // Update isActivated only if provided
    if (typeof isActivated !== "undefined") {
      query += `isActivated = ?, `;
      queryParams.push(isActivated);
    }

    // Remove the trailing comma and space
    query = query.slice(0, -2);

    query += ` WHERE id = ?`;
    queryParams.push(id);

    // Execute the query
    await db.execute(query, queryParams);

    // Fetch the updated user details
    const [updatedUser] = await db.execute(
      `SELECT id, username, email, phone_number, name, address, avatar, isSuperUser FROM Users WHERE id = ?`,
      [id]
    );

    // Obfuscate ID in the response
    const obfuscatedUser = {
      ...updatedUser[0],
      id: obfuscateId(updatedUser[0].id)
    };

    res.json(obfuscatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user;

    // Only superusers can delete other users
    if (!authUser.isSuperUser) {
      return res.status(403).json({ message: "You do not have permission to delete users." });
    }

    const [result] = await db.execute(
      `UPDATE Users SET isDeleted = 1 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found or already deleted." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Additional functionalities can be added here if needed
// For example: updating user information, deleting a user, etc.

export { getUserById, getUsersByProject, getUsers };
